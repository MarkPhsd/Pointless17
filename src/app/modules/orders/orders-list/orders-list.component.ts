import { Component, Output, OnInit,
         ViewChild ,ElementRef, EventEmitter,
         OnDestroy, QueryList, ViewChildren, Input, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService, OrdersService, POSOrdersPaged} from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, Subject ,Subscription } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { IPOSOrder, IPOSOrderSearchModel } from 'src/app/_interfaces';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-orders-list',
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
  private gridColumnApi: GridAlignColumnsDirective;
  gridOptions          : any
  urlPath              : string;
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
  searchForm       : FormGroup;
  inputForm        : FormGroup;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions

  isAuthorized   : boolean;

  _searchModel   : Subscription;
  searchModel    : IPOSOrderSearchModel;

  _posOrders     : Subscription;
  posOrders      : IPOSOrder[];
  posOrder       : IPOSOrder;
  id             : number;

  grid           = 'grid-flow'
  _orderBar      : Subscription;
  orderBar       : boolean;

  _menutBar      : Subscription;
  menuBar        : boolean;

  _searchBar     : Subscription;
  searchBar      : boolean;

  itemsPerPage      = 20
  smallDevice : boolean;
  //list height
  @Input() height = "78vh"

  initSubscriptions() {
    this._searchModel = this.orderService.posSearchModel$.subscribe( data => {
        this.searchModel            = data
        if (!this.searchModel) {
          const searchModel       = {} as IPOSOrderSearchModel;
          this.currentPage        = 1
          searchModel.pageNumber  = 1;
          searchModel.pageSize    = 25;
          this.searchModel        = searchModel
        }
        console.log('search model', this.searchModel)
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
              )
  {
    this.initSubscriptions();
    this.initAgGrid(this.pageSize);
    this.initClasses();
  }

  async ngOnInit() {
    this.urlPath            = await this.awsService.awsBucketURL();
    this.rowSelection       = 'multiple'
    this.initAuthorization();
    this.initClasses();
  };

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
  }

  initClasses()  {
    const platForm      = this.platForm;
    if (!this.height) { this.height = "82vh" }
    let height = this.height
    this.gridDimensions = `width: 100%; height: ${height}`
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions = `width: 100%; height: ${height}` }
    if (platForm === 'electron')  { this.gridDimensions = `width: 100%; height: ${height}` }
    if (this.smallDevice) {
      this.gridDimensions = 'width: 100%; height: 68vh;'
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

  ngOnDestroy(): void {
    if (this._searchModel) {
      this._searchModel.unsubscribe()
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
      // minWidth: 100,
    };
    this.columnDefs =  [
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
      {headerName: 'Employee', field: 'employee',     sortable: true,
            width   : 150,
            minWidth: 150,
            maxWidth: 150,
            flex: 2,
      },
      {headerName: 'History', field: 'history', sortable: true,
            visible : false,
            width   : 0,
            minWidth: 0,
            maxWidth: 0,
            // flex: 2,
        },
    ]
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
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
    // console.log('init Search Model from orders-list', searchModel)
    // this.orderService.updateOrderSearchModel(searchModel)
    return searchModel
  }

  refreshSearchAny(event) {
    this.refreshSearch();
  }

  refreshSearch(): Observable<IPOSOrderSearchModel> {
    if (this.params) {
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

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<POSOrdersPaged>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.orderService.getOrderBySearchPaged(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params == undefined) { return }
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }
    if (!params.startRow ||  !params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }
    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
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
              //not applicable to all lists, but leave for ease of use.
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
        this.orderService.setActiveOrder(site, data)
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

