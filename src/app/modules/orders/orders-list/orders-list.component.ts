import { Component, Output, OnInit,
         ViewChild ,ElementRef, EventEmitter,
         OnDestroy, QueryList, ViewChildren, Input, HostListener } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService, OrdersService, POSOrdersPaged} from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, Subject ,Subscription } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi, AgGridEvent } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { IPOSOrder, IPOSOrderSearchModel } from 'src/app/_interfaces';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AgGridModule } from 'ag-grid-angular';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
  AgGridModule,
  SharedPipesModule],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit,OnDestroy {

  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  // @ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;

  toggleListGrid = true // displays list of payments or grid
  //search with debounce: also requires AfterViewInit()
  // @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  @Input() clientID : number;
  @Input() suspendedOrders: number;

  searchPhrase:         Subject<any> = new Subject();
  // get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  // //search with debounce
  searchItems$              : Subject<IPOSOrderSearchModel[]> = new Subject();
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

  //AgGrid
  params               : any;
  private gridApi      : GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions          : any
  urlPath              : string;
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
  searchForm       : UntypedFormGroup;
  inputForm        : UntypedFormGroup;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions

  isAuthorized   : boolean;

  _searchModel   : Subscription;
  searchModel    : IPOSOrderSearchModel;

  // _posOrders     : Subscription;
  posOrders      : IPOSOrder[];
  posOrder       : IPOSOrder;
  id             : number;

  grid           = 'grid-flow'
  _orderBar      : Subscription;
  orderBar       : boolean;

  _menuBar       : Subscription;
  menuBar        : boolean;

  _searchBar     : Subscription;
  searchBar      : boolean;

  itemsPerPage      = 20
  smallDevice : boolean;
  //list height

  message = ''
  @Input() height = "80vh"

  initSubscriptions() {

    let clientID: number;

    if (this.userAuthorization.user && this.userAuthorization.user.roles === 'user') {
      clientID = this.userAuthorization.user.id;
    }

    if (this.clientID != 0) {
      clientID = this.clientID;
    }

    this._searchModel = this.orderMethodsService.posSearchModel$.subscribe( data => {

        this.searchModel            = data

        // console.log('search model', data?.clientID,  data)
        if (data?.clientID !=0) {  clientID =  data?.clientID  }
        if (data?.suspendedOrder && data.suspendedOrder != 0 )  {this.suspendedOrders = data?.suspendedOrder }

        if (!this.searchModel) {
          const searchModel       = {} as IPOSOrderSearchModel;
          this.currentPage        = 1
          searchModel.pageNumber  = 1;
          searchModel.pageSize    = 50;
          this.searchModel        = searchModel
        }

        if (clientID != 0) {
          this.searchModel.clientID = clientID;
        }

        if (!this.searchModel.completionDate_From) {
          if (this.suspendedOrders != 0) {
            this.searchModel.suspendedOrder = this.suspendedOrders;
          }
        } else {
          if (this.searchModel.completionDate_From) {
            this.searchModel.searchOrderHistory = true;
          }
          this.searchModel.suspendedOrder = 0;
        }

        // console.log(this.searchModel, this.clientID,this.suspendedOrders)

        this.refreshSearch()
        return
      }
    )
  }

  constructor(  private _snackBar               : MatSnackBar,
                private agGridService           : AgGridService,
                private siteService             : SitesService,
                private agGridFormatingService  : AgGridFormatingService,
                private awsService              : AWSBucketService,
                private userAuthorization       : UserAuthorizationService,
                private _bottomSheet            : MatBottomSheet,
                private readonly datePipe       : DatePipe,
                private orderService            : OrdersService,
                public orderMethodsService: OrderMethodsService,

              )
  {
  }

  async ngOnInit() {
    this.initSubscriptions();

    if (this.searchModel) {
      this.initAgGrid(this.searchModel.pageSize);
    } else {
      this.initAgGrid(this.pageSize);
    }
    this.urlPath            = await this.awsService.awsBucketURL();
    this.rowSelection       = 'multiple'
    this.initAuthorization();
    this.initClasses();
  };

  ngOnDestroy(): void {
    if (this._searchModel) {
      this._searchModel.unsubscribe()
    }
    if (this._menuBar) {
      this._menuBar.unsubscribe()
    }
    if (this._orderBar) { this._orderBar.unsubscribe()}
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isManagement //('admin, manager')
  }

  initClasses()  {
    const platForm      = this.platForm;
    if (!this.height) { this.height = "80vh" }
    let height = this.height
    this.gridDimensions = `width: 100%; height: ${height}`
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions = `width: 100%; height: ${height}` }
    if (platForm === 'electron')  { this.gridDimensions = `width: 100%; height: ${height}` }
    if (this.smallDevice) {
      this.gridDimensions = 'width: 100%; height: 80vh;'
    }
  }

  @HostListener("window:resize", [])
    updateItemsPerPage() {
      this.smallDevice = false
      if (window.innerWidth < 768) {
        this.smallDevice = true
      }
      this.initClasses();
  }
  onSortChanged(e: AgGridEvent) {
    e.api.refreshCells();
  }
  //ag-grid
  //standard formating for ag-grid.
  //requires addjustment of column defs, other sections can be left the same.
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
      {headerName: 'Date',     field: 'orderDate', sortable: true,
          cellRenderer: this.agGridService.dateCellRendererUSD,
          width   : 150,
          minWidth: 150,
          maxWidth: 150,
          flex    : 2,
      },
      {headerName: 'Completed',     field: 'completionDate', sortable: true,
          cellRenderer: this.agGridService.dateCellRendererUSD,
          width   : 150,
          minWidth: 150,
          maxWidth: 150,
          flex    : 2,
      },
      {headerName: 'Total',     field: 'total',         sortable: true,
                   cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 150,
                  flex    : 1,
      },
      {headerName: 'Tax',    field: 'taxTotal', sortable: true,
                  cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  // flex: 2,
      },
      {headerName: 'Items',    field: 'itemCount', sortable: true,
            width   : 100,
            minWidth: 100,
            maxWidth: 100,
            // flex: 2,
      },
      {headerName: 'Customer',  field: 'customerName',      sortable: true,
                  width: 100,
                  minWidth: 100,
                  maxWidth: 100,
                  // flex: 1,
      },
      {headerName: 'Type',    field: 'serviceType', sortable: true,
            width   : 100,
            minWidth: 100,
            maxWidth: 100,
            // flex: 2,
      },
      //
      {headerName: 'Employee', field: 'employeeName',     sortable: true,
            width   : 150,
            minWidth: 150,
            maxWidth: 150,
            flex: 2,
      },
      {headerName: 'BalanceID', field: 'reportRunID',     sortable: true,
        width   : 150,
        minWidth: 150,
        maxWidth: 150,
        flex: 2,
      },
      {headerName: 'ZRunID', field: 'zrun',     sortable: true,
            width   : 150,
            minWidth: 150,
            maxWidth: 150,
            flex: 2,
      },
      {headerName: 'POS', field: 'deviceName',     sortable: true,
            width   : 150,
            minWidth: 150,
            maxWidth: 150,
            flex: 2,
      },
      {headerName: 'Orignal ID', field: 'orderID_Temp', sortable: true,
            visible : true,
            width   : 100,
            minWidth: 100,
            maxWidth: 100,
            flex: 2,
      },
      {headerName: 'History', field: 'history', sortable: true,
            visible : false,
            width   : 50,
            minWidth: 50,
            maxWidth: 50,
            flex: 2,
      },
    ]

    if (this.searchModel) {
      this.gridOptions = this.agGridFormatingService.initGridOptions(this.searchModel.pageSize, this.columnDefs);
    } else {
      this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
    }
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
  initSearchModel(): IPOSOrderSearchModel {
    let searchModel        = {} as IPOSOrderSearchModel;
    if (this.searchModel) { searchModel = this.searchModel }
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    return searchModel
  }

  refreshSearchAny(event) {
    this.refreshSearch();
  }

  refreshSearch(): Observable<IPOSOrderSearchModel> {
    if (this.params) {
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
  getRowData(params, startRow: number, endRow: number):  Observable<POSOrdersPaged>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.orderService.getOrderBySearchPaged(site, searchModel)
  }

  //ag-grid standard method
  // async
  async  onGridReady(params: any) {
    // console.log('on grid ready', params)
    if (params == undefined) {
      // console.log('params undefined')
      return
    }
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
    }
    if (!params.startRow ||  !params.endRow) {
      params.startRow = 1
      if (this.searchModel) {
        this.params.endRow       = this.searchModel.pageSize;
      } else {
        this.params.endRow       = this.pageSize;
      }
    }

    let datasource =  {

      getRows: (params: IGetRowsParams) => {
      // console.log('on grid output 3')
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      this.message = '...loading'
      items$.subscribe(data =>
        {
            // console.log('on grid output 4', data.paging, data.results)
            if (!data || !data.paging) { return }
            const resp         =  data.paging
            if (resp) {
              this.isfirstpage   = resp.isFirstPage
              this.islastpage    = resp.isFirstPage
              this.currentPage   = resp.currentPage
              this.numberOfPages = resp.pageCount
              this.recordCount   = resp.recordCount
              if (this.numberOfPages !=0 && this.numberOfPages) {
                this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
              }
            }
            this.message = ''
            if (data.results) {
              //not applicable to all lists, but leave for ease of use.
              let results  =  this.refreshImages(data.results)
              params.successCallback(results)
              this.rowData = results
            }
          }
        );
      }
    };

    if (!datasource)   {
        // console.log('no data source')
        return
    }
    if (!this.gridApi) {
      // console.log('no API')
      return
    }
    // console.log('set Data Source')
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

    let selectedRows       = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow          = this.pageSize;
    let selected           = []

    selectedRows.forEach(function (selectedRow, index) {
      if (index >= maxToShow) { return; }
      if (index > 0) {  selectedRowsString += ', ';  }
        selected.push(selectedRow.id)
        selectedRowsString += selectedRow.name;
    });

    if (selectedRows.length > maxToShow) {
      let othersCount = selectedRows.length - maxToShow;
      selectedRowsString +=
      ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }

    this.selected = selected
    if (selected && selectedRows && selectedRows[0]) {
      const item = selectedRows[0];
      this.id = item.id;
      const history = item.history
      this.editItemWithId(item)
    }
  }

  getItem(id: number, history: boolean) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.orderService.getOrder(site, id.toString(), history).subscribe(data => {
         this.posOrder = data;
        }
      )
    }
  }

  async editItemWithId(order:any) {
    this.setActiveOrder(order)
  }

  async getItemHistory(id: any) {
    const site = this.siteService.getAssignedSite();
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  getLabel(rowData) {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }

  setActiveOrder(order) {
    const site  = this.siteService.getAssignedSite();
    const order$ =  this.orderService.getOrder(site, order.id, order.history )
    order$.subscribe(data =>
      {
        this.orderMethodsService.setActiveOrder(data)
      }
    )
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

}

