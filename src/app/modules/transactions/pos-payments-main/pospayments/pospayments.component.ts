import { Component, Output, OnInit,
  ViewChild ,ElementRef, EventEmitter, OnDestroy, Input, TemplateRef } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService, AuthenticationService, OrdersService} from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IItemBasic } from 'src/app/_services/menu/menu.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, of, Subject ,Subscription } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi, AgGridEvent } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { IPaymentSearchModel, IPOSPayment, IPOSPaymentsOptimzed, IServiceType, IUser, Paging } from 'src/app/_interfaces';
import { Capacitor } from '@capacitor/core';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { PosPaymentEditComponent } from 'src/app/modules/posorders/pos-payment/pos-payment-edit/pos-payment-edit.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { CommonModule } from '@angular/common';
import { SortSelectorsComponent } from 'src/app/shared/widgets/sort-selectors/sort-selectors.component';
import { AgGridModule } from 'ag-grid-angular';
import { PosPaymentsFilterComponent } from '../pos-payments-filter/pos-payments-filter.component';
function myComparator(value1, value2) {
  if (value1 === null && value2 === null) {
    return 0;
  }
  if (value1 === null) {
    return -1;
  }
  if (value2 === null) {
    return 1;
  }
  return value1 - value2;
}
@Component({
  selector: 'app-pospayments',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SortSelectorsComponent,AgGridModule,PosPaymentsFilterComponent],
  templateUrl: './pospayments.component.html',
  styleUrls: ['./pospayments.component.scss']
})
export class POSPaymentsComponent implements  OnInit,  OnDestroy {


  @ViewChild('summaryView')  summaryView:TemplateRef<any>;
  toggleListGrid = true // displays list of payments or grid
  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  @Input()  height = "80vh"
  searchPhrase:         Subject<any> = new Subject();
  totalItemCount: any;
  totalRecordCount: number;
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();
  summary$
  selectedSummary: any;
  demoMode: boolean;
  action$: Observable<any>;

  demoMode$ = this.siteService.getDemoMode().pipe(switchMap(data => {
    if (data === '424242'){
      this.demoMode = true;
    }
    return of(data)
  }))

  searchItems$              : Subject<IPaymentSearchModel[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  get platForm()         {  return Capacitor.getPlatform(); }
  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }

  _user: Subscription;
  user: IUser;
  //AgGrid
  params               : any;
  private gridApi      : GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions          : any
  columnDefs           = [];
  defaultColDef        ;
  frameworkComponents  : any;
  rowSelection         : any;
  rowDataClicked1      = {};
  rowDataClicked2      = {};
  rowData:             any[];
  pageSize                = 50
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage             = true;
  islastpage              = true;
  value             : any;
  // //This is for the filter Section//
  //search form filters
  searchForm:        UntypedFormGroup;
  inputForm        : UntypedFormGroup;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions
  urlPath:        string;
  summary: any;
  id              : number;
  posPayment      : IPOSPayment;

  employees$      :   Observable<IItemBasic[]>;
  paymentMethod$  :   Observable<IPaymentMethod[]>;
  serviceTypes$   :   Observable<IServiceType[]>;
  _searchModel    :   Subscription;
  searchModel     :   IPaymentSearchModel;
  isAuthorized    :   boolean;

  initUser() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })
  }

  constructor(  private snackBar                : MatSnackBar,
                private orderService            : OrdersService,
                private pOSPaymentService       : POSPaymentService,
                private agGridService           : AgGridService,
                private fb                      : UntypedFormBuilder,
                private siteService             : SitesService,
                private agGridFormatingService  : AgGridFormatingService,
                private awsService              : AWSBucketService,
                private userAuthorization       : UserAuthorizationService,
                private _bottomSheet            : MatBottomSheet,
                public authenticationService: AuthenticationService,
              )
  {
    this.initSubscriptions();
    this.initForm();
    if (this.searchModel) {
      this.initAgGrid(this.searchModel.pageSize);
      return
    }
    this.initAgGrid(this.pageSize);
  }

  ngOnInit() {
    this.initClasses()
    // this.urlPath            = await this.awsService.awsBucketURL();
    this.rowSelection       = 'multiple'
    this.initAuthorization();
    this.initUser();
  };

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._user) {this._user.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
  }

  initClasses()  {
    const platForm      = this.platForm;
    let height = this.height
    this.gridDimensions = `width: 100%; height: ${height}`
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions = `width: 100%; height: ${height}` }
    if (platForm === 'electron')  { this.gridDimensions = `width: 100%; height: ${height}` }
  }

  initForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
  }

  get summaryEnabled() {
    if (!this.user) {return null}
    if (this.user?.roles === 'admin' || this.user?.roles === 'manager') {
      return this.summaryView
    }
    return null;
  }


  setSortData(event) {
    if (event) {
      if (!this.searchModel) { return }
      this.searchModel.sortBy1 = event?.sort1;
      this.searchModel.sortBy1Asc = event?.sort1Asc;

      this.searchModel.sortBy2 = event?.sort2;
      this.searchModel.sortBy2Asc = event?.sort2Asc;

      this.searchModel.sortBy3 = event?.sort3;
      this.searchModel.sortBy3Asc = event?.sort3Asc;

      this.pOSPaymentService.updateSearchModel(this.searchModel)
      this.refreshResults()
    }
  }

  initSubscriptions() {
    try {
      this._searchModel = this.pOSPaymentService.searchModel$.subscribe( data => {
          this.searchModel            = data
          if (!this.searchModel) {
            const searchModel       = {} as IPaymentSearchModel;
            this.currentPage        = 1
            searchModel.pageNumber  = 1;
            searchModel.pageSize    = 25;
            this.searchModel        = searchModel;
            return
          }
          this.setSummary(this.searchModel )
        }
      )
    } catch (error) {
      console.log('init subscription error', error)
    }
  }

  refreshResults() {
    this.setSummary(this.searchModel)
    this.refreshSearch_sub()
  }

  setSummary(search: IPaymentSearchModel) {
    const item = JSON.parse(JSON.stringify(search))
    item.summaryOnly = true;
    const site = this.siteService.getAssignedSite()
    // this.summary$ = this.pOSPaymentService.searchPayments(site, item)
  }

  editRowSelection(event) {
    this.editItemWithId(event.rowData)
  }

  onSortChanged(e: AgGridEvent) {
    e.api.refreshCells();
  }

  //ag-grid
  //standard formating for ag-grid.
  //requires addjustment of column defs, other sections can be left the same.
  // onClick: this.editRowSelection.bind(this),
  initAgGrid(pageSize: number) {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
    this.defaultColDef = {
      flex: 2,
    };
    this.columnDefs =  [

      {
        headerName: "Row",
        valueGetter: "node.rowIndex + 1"
      },
      {
      field: 'id',
      cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                        onClick: this.editItemFroMButton.bind(this),
                        label: 'Edit',
                        getLabelFunction: this.getLabel.bind(this),
                        btnClass: 'btn btn-primary btn-sm'
                      },
                      minWidth: 125,
                      maxWidth: 125,
                      flex: 2,
      },
      {headerName: 'ID',     field: 'id',         sortable: true,
          width   : 100,
          minWidth: 100,
          maxWidth: 100,
          flex    : 2,
      },
      {headerName: 'Order',     field: 'orderID', sortable: true,
          width   : 100,
          minWidth: 100,
          maxWidth: 100,
          flex    : 2,
      },
      {headerName: 'BalanceID',     field: 'reportRunID', sortable: true,
          width   : 100,
          minWidth: 100,
          maxWidth: 100,
          flex    : 2,
      },
      {headerName: 'ZID',     field: 'zrun', sortable: true,
          width   : 100,
          minWidth: 100,
          maxWidth: 100,
          flex    : 2,
      },
      {headerName: 'Amount',     field: 'amountPaid',         sortable: true,
                   cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 150,
                  flex    : 1,
      },
      {headerName: 'Method',  field: 'paymentMethod.name',      sortable: true,
                  width: 100,
                  minWidth: 100,
                  maxWidth: 100,
                  // flex: 1,
      },
      {headerName: 'Tip Amount',    field: 'tipAmount', sortable: true,
                  cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  // flex: 2,
      },
      //
      {headerName: 'Completed', field: 'completionDate',     sortable: true,
                  cellRenderer: this.agGridService.dateCellRendererUSD,
                  width   : 150,
                  minWidth: 175,
                  maxWidth: 175,
                  flex: 2,
      },
      {headerName: 'Employee',   field: 'employeeName',       sortable: true,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  // flex: 2,
                  },

      {headerName: 'Sale',   field: 'serviceType',       sortable: true,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
              // flex: 2,
              },

      {headerName: 'Received', field: 'amountReceived', sortable: true,
                  cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  // flex: 2,
      },
      {headerName: 'Total', field: 'totalReceived', sortable: true,
              cellRenderer: this.agGridService.currencyCellRendererUSD,
              width   : 100,
              minWidth: 100,
              maxWidth: 100,
              // flex: 2,
      },
      {headerName: 'CardNum', field: 'cardNum', sortable: true,
              cellRenderer: this.agGridService.getRightFourRenderer,
              width   : 100,
              minWidth: 100,
              maxWidth: 100,
              // flex: 2,
      },
      {headerName: 'Auth', field: 'preAuth', sortable: true,
            width   : 100,
            minWidth: 100,
            maxWidth: 100,
            // flex: 2,
      },
      {headerName: 'VoidAmount', field: 'voidAmount', sortable: true,
        width   : 100,
        minWidth: 100,
        maxWidth: 100,
        // flex: 2,
      },
      //       .VoidReason = items.VoidReason,
      // .VoidAmount = items.VoidAmount,
      {headerName: 'Group', field: 'groupNumber', sortable: true,
            width   : 65,
            minWidth: 65,
            maxWidth: 65,
            // flex: 2,
      },
      {headerName: 'Split', field: 'splitPayment', sortable: true,
        width   : 65,
        minWidth: 65,
        maxWidth: 65,
        // flex: 2,
      },
      {
        headerName: "History",
          width:    100,
          minWidth: 100,
          maxWidth: 100,
          flex: 1,
          field: "history",
          comparator: myComparator,
          cellRenderer: function(params) {
              var input = document.createElement('input');
              input.type="checkbox";
              input.checked = params.value;
              input.disabled = false;
              input.addEventListener('click', function (event) {  });
              return input;
          }
      },
    ]
    if (this.searchModel) {
      this.gridOptions = this.agGridFormatingService.initGridOptions(this.searchModel.pageSize, this.columnDefs);
    } else {
      this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
    }
  }


  listAll(){
    const control = this.itemName
    control.setValue('')
    this.refreshSearch()
  }

  autoSizeAll(skipHeader) {
    var allColumnIds = [];
    this.gridOptions.columnApi.getAllColumns().forEach(function (column) {
      allColumnIds.push(column.colId);
    });
    this.gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initSearchModel(): IPaymentSearchModel {
    let searchModel        = {} as IPaymentSearchModel;
    if (this.searchModel) { searchModel = this.searchModel }
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    if (this.itemName.value)  {searchModel.orderID   = this.itemName.value }
    this.pOSPaymentService.updateSearchModel(searchModel)
    return searchModel
  }

  refreshSearchAny(event) {
    this.refreshSearch();
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(): Observable<IPaymentSearchModel[]> {
    this.currentPage         = 1
    const searchModel = this.initSearchModel();
    this.setSummary(searchModel)
    this.selectedSummary= null;
    return this.refreshSearch_sub()
  }

  refreshSearch_sub(): Observable<IPaymentSearchModel[]> {
    if (this.params){
      this.params.startRow     = 1;
      if (this.searchModel) {
        this.params.endRow       = this.searchModel.pageSize;
      } else {
        this.params.endRow       = this.pageSize;
      }
    }
    this.onGridReady(this.params)
    return this._searchItems$
  }

  //this doesn't change the page, but updates the properties for getting data from the server.
  setCurrentPage(startRow: number, endRow: number): number {
    const tempStartRow = this.startRow
    this.startRow      = startRow
    this.endRow        = endRow;
    if (tempStartRow > startRow) { return this.currentPage - 1 }
    if (tempStartRow < startRow) { return this.currentPage + 1 }
    return this.currentPage
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<IPOSPaymentsOptimzed>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()

    console.log('getRowData', params)
    return this.pOSPaymentService.searchPayments(site, searchModel)
  }

  // // ag-grid standard method
  // onGridReady(params: any) {
  //   if (!params) {
  //     console.error('Params are undefined');
  //     return;
  //   }

  //   this.params = params;
  //   if (!this.gridApi) {
  //     this.gridApi = params.api;
  //   }

  //   params.api.sizeColumnsToFit();

  //   if (!params.startRow || !params.endRow) {
  //     params.startRow = 1;
  //     params.endRow = this.searchModel ? this.searchModel.pageSize : this.pageSize;
  //   }

  //   const datasource = {
  //     getRows: (params: IGetRowsParams) => {
  //       console.log('getRows called with params:', params);

  //       const items$ = this.getRowData(params, params.startRow, params.endRow);
  //       items$.subscribe(data => {
  //         const resp = data.paging;
  //         this.summary = data?.summary;
  //         console.log('data', data, data?.summary);

  //         if (resp) {
  //           this.isfirstpage = resp.isFirstPage;
  //           this.islastpage = resp.isLastPage;
  //           this.currentPage = resp.currentPage;
  //           this.numberOfPages = resp.pageCount;
  //           this.recordCount = resp.recordCount;
  //           if (this.numberOfPages) {
  //             this.value = ((this.currentPage / this.numberOfPages) * 100).toFixed(0);
  //           }
  //         }

  //         if (data.results) {
  //           // Not applicable to all lists, but leave for ease of use.
  //           let results = this.refreshImages(data.results);
  //           params.successCallback(results);
  //           this.rowData = results;
  //         }
  //       }, error => {
  //         console.error('Error fetching data:', error);
  //         params.failCallback();
  //       });
  //     }
  //   };

  //   if (!datasource) {
  //     console.error('Datasource is undefined');
  //     return;
  //   }

  //   if (!this.gridApi) {
  //     console.error('Grid API is not working', this.gridApi);
  //     return;
  //   }

  //   console.log('Setting grid API source', datasource, params.startRow, params.endRow);
  //   this.gridApi.setDatasource(datasource);
  //   this.autoSizeAll(true);
  // }


    //ag-grid standard method
    async onGridReady(params: any) {

      // console.log('grid read', params)
      if (params == undefined) { return }

      if (params)  {
        this.params  = params
        this.gridApi = params.api;
        // this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
      }

      if (!params.startRow ||  !params.endRow) {
        params.startRow = 1

        if (this.searchModel) {
          params.endRow = this.searchModel.pageSize
        } else {
          params.endRow = this.pageSize;
        }
      }

      let datasource =  {
        getRows: (params: IGetRowsParams) => {
        const items$ =  this.getRowData(params, params.startRow, params.endRow)
        items$.subscribe(data => {

              let resp     =  data?.paging as Paging
              this.summary =  data?.summary;

              if (!resp) { resp = {} as Paging}

              let alt = data as unknown as any;

              if (alt?.result?.paging) {
                resp =  alt?.result?.paging
              }
              if (alt?.result?.results) {
                resp =  alt?.result?.paging
              }

              if (resp) {
                this.isfirstpage   = resp.isFirstPage
                this.islastpage    = resp.isFirstPage
                this.currentPage   = resp.currentPage
                this.numberOfPages = resp.pageCount
                this.recordCount   = resp.recordCount
                this.totalRecordCount = resp.totalRecordCount

                if (this.numberOfPages !=0 && this.numberOfPages) {
                  this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
                }
              }

              if (data.results) {

                let itemTotal = data?.results;
                // itemTotal.forEach(data => {
                //   data.totalReceived = +data.amountReceived + +data.tipAmount
                // })
                if (alt?.result?.results) {
                  params.successCallback(alt?.result?.results)
                  this.rowData = alt?.result?.results
                  return;
                }
                let results  =  this.refreshImages(data.results)
                params.successCallback(results)
                this.rowData = results
              }

            }
          );
        }
      };

      if (!datasource)   { return }
      if (!this.gridApi) { return }
      this.gridApi.setDatasource(datasource);
      this.autoSizeAll(true)
    }
  //not called on all lists, but leave for functional use.
  refreshImages(data) {
    const urlPath = this.urlPath
    if (urlPath) {
      data.forEach( item =>
        {
          if (item.urlImageMain) {
            const list = item.urlImageMain.split(',')
            if (list[0]) {
              item.imageName = `${urlPath}${list[0]}`
            }
          }
        }
      )
    }
    return data;
  }

  //search method for debounce on form field
  displayFn(search) {
    this.selectItem(search)
    return search;
  }

  //search method for debounce on form field
  selectItem(search){
    if (search) {
      this.currentPage = 1
      this.searchPhrase.next(search)
    }
  }



  onSelectionChanged(event) {
    let selectedRows = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow = this.pageSize;
    let selected = [];

    // Initialize the totals
    let totalAmountPaid = 0;
    let totalTipAmount = 0;
    let totalWithTip = 0;

    selectedRows.forEach(function (selectedRow, index) {
      if (index >= maxToShow) {
        return;
      }

      // Push the selected row ID for further operations
      selected.push(selectedRow.id);

      // Sum the amount paid and tip amount
      totalAmountPaid += selectedRow.amountPaid ? parseFloat(selectedRow.amountPaid) : 0;
      totalTipAmount += selectedRow.tipAmount ? parseFloat(selectedRow.tipAmount) : 0;

      // Calculate total with tip
      totalWithTip = totalAmountPaid + totalTipAmount;

      if (index > 0) {
        selectedRowsString += ', ';
      }
      selectedRowsString += selectedRow.name;
    });

    if (selectedRows.length > maxToShow) {
      let othersCount = selectedRows.length - maxToShow;
      selectedRowsString +=
        ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }

    // Update the selected items
    this.selected = selected;

    // Create the summary object to store the totals
    const summary = {
      totalAmountPaid: totalAmountPaid.toFixed(2),
      totalTipAmount: totalTipAmount.toFixed(2),
      totalWithTip: totalWithTip.toFixed(2),
    };

    // Log or display the summary object
    console.log('Summary:', summary);
    this.selectedSummary = summary;
    if (selected && selectedRows && selectedRows[0]) {
      const item = selectedRows[0];
      this.id = item.id;
      const history = item.history;
      // this.editItemWithId(item);
    }
  }

  deleteSelected() {
    let list = [] as number[];
    this.selected.forEach(item => {

      list.push(item)
      console.log(item)
    })
    console.log(list)
    const site = this.siteService.getAssignedSite()
    this.action$ = this.orderService.removeOrderList(site, list).pipe(switchMap(data => {
      this.siteService.notify('Removed', 'Close', 1000)
      return of (data)
    }))
  }

  getItem(id: number, history: boolean) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.pOSPaymentService.getPOSPayment(site, this.id, history).subscribe(data => {
         this.posPayment = data;
        }
      )
    }
  }


  editItemFroMButton(e) {
    if (!e) {
      // console.log('edit product from grid no data')
      return
    }
    if (e.rowData.id)  {
      // if (this.buttonName === 'Edit') {
        this.editItemWithId(e.rowData);
      //  } else {
        // this.assignItem(e)
      }
  }


  editItemWithId(payment:any) {
    if(!payment) { return }
    if (payment && payment.rowData) {  payment = payment.rowData;}
    this.pOSPaymentService.updatePaymentSubscription(payment)
    this._bottomSheet.open(PosPaymentEditComponent);
  }

  async getItemHistory(id: any) {
    const site = this.siteService.getAssignedSite();
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }

  onBtnClick1(e) {
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    this.rowDataClicked2 = e.rowData;
  }

  onSortByNameAndPrice(sort: string) { }

  notifyEvent(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

