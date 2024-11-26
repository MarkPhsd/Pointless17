import { Component,  Output, OnInit,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IItemBasic } from 'src/app/_services/menu/menu.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap} from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BalanceSheetSearchModel, BalanceSheetService, IBalanceSheet, IBalanceSheetPagedResults } from 'src/app/_services/transactions/balance-sheet.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BalanceSheetFilterComponent } from '../balance-sheet-filter/balance-sheet-filter.component';
import { BalanceSheetQuickViewComponent } from '../balance-sheet-quick-view/balance-sheet-quick-view.component';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-balance-sheets',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    AgGridModule,
    BalanceSheetFilterComponent,
  SharedPipesModule],
  templateUrl: './balance-sheets.component.html',
  styleUrls: ['./balance-sheets.component.scss']
})
export class BalanceSheetsComponent implements OnInit, AfterViewInit, OnDestroy {

  toggleListGrid = true // displays list of payments or grid
  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();
  dateRange        : UntypedFormGroup;

  // //search with debounce
  searchItems$              : Subject<BalanceSheetSearchModel> = new Subject();
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
  columnDefs           = [];
  defaultColDef        ;
  frameworkComponents  : any;
  rowSelection         : any;
  rowDataClicked1      = {};
  rowDataClicked2      = {};
  rowData:             any[];
  pageSize                = 20
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
  searchForm      : UntypedFormGroup;
  inputForm       : UntypedFormGroup;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions  = "width: 100%; height: 100%;"
  urlPath:        string;

  id              : number;
  balanceSheet    : IBalanceSheet;

  employees$      :   Observable<IItemBasic[]>;
  paymentMethod$  :   Observable<IBalanceSheet[]>;

  _searchModel    :   Subscription;
  searchModel     :   BalanceSheetSearchModel;
  isAuthorized    :   boolean;
  smallDevice       = false;

  constructor(  private _snackBar               : MatSnackBar,
                private balanceSheetService     : BalanceSheetService,
                private agGridService           : AgGridService,
                private fb                      : UntypedFormBuilder,
                private siteService             : SitesService,
                private productEditButtonService: ProductEditButtonService,
                private agGridFormatingService  : AgGridFormatingService,
                private awsService              : AWSBucketService,
                private userAuthorization       : UserAuthorizationService,
                private router                  : Router,
                private _bottomSheet            : MatBottomSheet,
                private sheetMethodsService     : BalanceSheetMethodsService
              )
  {
    this.initSubscriptions();
    this.initForm();
    this.initAgGrid(this.pageSize);
  }

  async ngOnInit() {
    this.initClasses()
    this.urlPath            = await this.awsService.awsBucketURL();
    this.rowSelection       = 'multiple'
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
    this.updateItemsPerPage(); //run last in this process!
  };

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._searchModel) { this._searchModel.unsubscribe()}
  }

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions = 'width: 100%; height: 100%;'
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }

  initForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
    this.dateRange = new UntypedFormGroup({
      start: new UntypedFormControl(),
      end: new UntypedFormControl()
    });
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.gridDimensions = 'width: 100%; height: 85%;'
    }
  }

  ngAfterViewInit() {
    if (this.input) {
      // console.log('ngAfterViewInit refreshInputHook')
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          const search  = this.input.nativeElement.value
          this.refreshSearch();
        })
      )
      .subscribe();
    }
  }

  initSubscriptions() {
    try {
      this._searchModel = this.sheetMethodsService.balanceSearchModelSheet$.subscribe( data => {
          this.searchModel          = data
          if (!this.searchModel) {
            const searchModel       = {} as BalanceSheetSearchModel;
            this.currentPage        = 1
            searchModel.pageNumber  = 1;
            searchModel.pageSize    = 25;
            this.searchModel        = searchModel
          }
        }
      )
    } catch (error) {
      console.log('init subscription error', error)
    }
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
        field: 'id',
        cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                        onClick: this.editItemWithId.bind(this),
                        label: 'Edit',
                        getLabelFunction: this.getLabel.bind(this),
                        btnClass: 'btn btn-primary btn-sm'
                      },
                      minWidth: 135,
                      maxWidth: 135,
                      flex: 2,
      },
      {headerName: 'ID',     field: 'id',         sortable: true,
          width   : 85,
          minWidth: 85,
          maxWidth: 100,
          flex    : 2,
      },
      {headerName: 'Employee',    field: 'balanceSheetEmployee.lastName', sortable: true,
                    width   : 100,
                    minWidth: 100,
                    maxWidth: 100,
                    flex    : 2,
      },
      {headerName: 'Started On',  field: 'startTime',         sortable: true,
                  cellRenderer: this.agGridService.dateCellRendererUSD,
                  width   : 165,
                  minWidth: 165,
                  maxWidth: 200,
                  flex    : 2,
      },
      {headerName: 'Total',       field: 'salesTotal',      sortable: true,
                  cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width   : 135,
                  minWidth: 135,
                  maxWidth: 135,
                  flex    : 2,
      },
      {headerName: 'Net',     field: 'netSales', sortable: true,
            cellRenderer: this.agGridService.currencyCellRendererUSD,
            width   : 100,
            minWidth: 100,
            maxWidth: 100,
            flex    : 2,
      },
      {headerName: 'Balance',     field: 'overUnderTotal', sortable: true,
                  cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  flex    : 2,
      },
      {headerName: 'DeviceName',  field: 'deviceName', sortable: true,
                  width   : 160,
                  minWidth: 160,
                  maxWidth: 200,
                  flex    : 2,
      },
    ]
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
  }

  listAll(){
    const control = this.itemName
    control.setValue('')
    this.refreshSearch()
  }

  autoSizeAll(skipHeader) {
    try {
      var allColumnIds = [];
      this.gridOptions.columnApi.getAllColumns().forEach(function (column) {
        allColumnIds.push(column.colId);
      });
      this.gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
    } catch (error) {
      console.log(error)
    }
  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initSearchModel(): BalanceSheetSearchModel {
    let searchModel        = {} as BalanceSheetSearchModel;
    if (this.searchModel) {
      searchModel = this.searchModel
    }
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    // console.log('initSearchModel', searchModel)
    this.sheetMethodsService.updateBalanceSearchModel(searchModel)
    return searchModel
  }

  refreshSearchAny(event) {
    this.refreshSearch();
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(): Observable<BalanceSheetSearchModel> {
    this.currentPage         = 1
    const searchModel = this.initSearchModel();
    return this.refreshSearch_sub()
  }

  refreshSearch_sub(): Observable<BalanceSheetSearchModel> {
    if (this.params){
      this.params.startRow     = 1;
      this.params.endRow       = this.pageSize;
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

  //ag-grid standard method.
  // getDataSource(params) {
  //   return {
  //     getRows: (params: IGetRowsParams) => {
  //       const items$ = this.getRowData(params, params.startRow, params.endRow)
  //       items$.subscribe({
  //         next: data =>
  //         {
  //           console.log('data')
  //           if (data.toString() === "Not Authorized.") {
  //             this.siteService.notify('Not authorized','Close', 3000, 'red')
  //             return
  //           }
  //           if (data.paging) {
  //             const resp =  data.paging
  //             this.isfirstpage   = resp.isFirstPage
  //             this.islastpage    = resp.isFirstPage
  //             this.currentPage   = resp.currentPage
  //             this.numberOfPages = resp.pageCount
  //             this.recordCount   = resp.recordCount
  //           }
  //           if (this.numberOfPages !=0 && this.numberOfPages) {
  //             this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
  //           }
  //           if (data.results) {
  //             params.successCallback(data.results)
  //             this.rowData = data.results
  //           }
  //         },
  //         error: err => {
  //             console.log(err)
  //         }
  //       }
  //       );
  //     }
  //   };
  // }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<IBalanceSheetPagedResults>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.balanceSheetService.searchBalanceSheets(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
      this.autoSizeAll(false)
    }
    this.onFirstDataRendered(this.params)

    if (params == undefined) { return }

    if (!params.startRow ||  !params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            console.log('data')
            if (data.toString() === "Not Authorized.") {
              this.siteService.notify('Not authorized for balance sheet audit.','Close', 3000, 'red')
              return
            }

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

            if (data.results) {
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

  onFirstDataRendered (params) {
    try {
      params.api.sizeColumnsToFit()
      // window.setTimeout(() => {
      //   const colIds = params.columnApi.getAllColumns().map(c => c.colId)
      //   params.columnApi.autoSizeColumns(colIds)
      // }, 50)
     } catch (error) {
      console.log(error)
    }
   }

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

  //mutli select method for selection change.
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
    this.id = selectedRows[0].id;
    this.getItem(this.id)

  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.balanceSheetService.getSheet(site, this.id).subscribe(data => {
         this.balanceSheet = data;
         this.quickView(data);
        }
      )
    }
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  getLabel(rowData)
  {

    if(rowData) {
      try {
        return rowData.id
      } catch (error) {
      }
    }
    return 'Edit';
  }

  onBtnClick1(e) {
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    this.rowDataClicked2 = e.rowData;
  }

  async editItemWithId(item:any) {
    if(!item) {
      return
    }
    const id   = item.rowData.id;
    const site = this.siteService.getAssignedSite()
    this.router.navigate(['/balance-sheet-edit', {id:item.rowData.id}]);
  }

  editProduct(e){
    this.productEditButtonService.openProductDialog(e.id)
  }

  editSelectedItems() {
    if (!this.selected) {
      this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
      return
    }
    this.productEditButtonService.editTypes(this.selected)
  }

  onSortByNameAndPrice(sort: string) { }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  filterBottomSheet() {
    this._bottomSheet.open(BalanceSheetFilterComponent);
  }

  quickView(sheet: IBalanceSheet) {
    if (sheet) {
      this.sheetMethodsService.updateBalanceSheet(sheet)
      this._bottomSheet.open(BalanceSheetQuickViewComponent)
    }
  }

}

