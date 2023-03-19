import { DatePipe } from '@angular/common';
import { Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { employee, IPOSOrder, IServiceType, ISite } from 'src/app/_interfaces';
import { OrdersService, ReportingService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MetrcSalesService } from 'src/app/_services/metrc/metrc-sales.service';
import { Capacitor, Plugins } from '@capacitor/core';
import { METRCSalesReportPaged, PointlessMetrcSales, PointlessMETRCSalesService, PointlessMetrcSearchModel } from 'src/app/_services/metrc/pointless-metrcsales.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IItemBasic } from 'src/app/_services/menu/menu.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription, of } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IPagedList } from 'src/app/_services/system/paging.service';
import { ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { UnparseConfig } from 'ngx-papaparse';

// const fields = ['completeDate','clientType', 'oomp',  'oompb', 'value', 'packageLabel','quantityTotal','unitType',  'value', 'value', 'value', 'value', 'value', 'netTotal','orderID',
//         , 'value', 'value', 'value', , 'value', 'value' , 'value', 'value', 'value' ]

export interface metrcSalesReport {
  completeDate: string;
  clientType: string;
  oomp: string;
  oompb: string;
  idMethod: string;
  packageLabel: string;
  quantityTotal: string;
  uom: string;
  UTHC: string;
  UTHCC: string;
  UTHCUOM: string;
  UnitWeight: string;
  UWUOM: string;
  netTotal: string;
  orderID: string;
  Price: string;
  ExciseTax: string;
  CityTax: string;
  CountyTax: string;
  MunicipalTax: string;
  DiscountAmount: string;
  SubTotal: string;
  SalesTax: string;
}

@Component({
  selector: 'app-pointless-metrcsales',
  templateUrl: './pointless-metrcsales.component.html',
  styleUrls: ['./pointless-metrcsales.component.scss']
})
export class PointlessMETRCSalesComponent implements OnInit , OnDestroy{

  @ViewChild('agGrid2')      agGrid2: any;
  get platForm()         {  return Capacitor.getPlatform(); }
  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }

  dateFrom: string;
  dateTo: string;
  selectedSiteID:        number;
  site$: Observable<ISite>;
  sites$: Observable<ISite[]>;
  site: ISite;
  currentDayRan: boolean;
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

   exceptionMessage: string;
   value             : any;
   totalRecordCount: number;
   searchForm      : FormGroup;
   inputForm       : FormGroup;
   dateRange       : FormGroup;
   selected        : any[];
   selectedRows    : any;
   agtheme         = 'ag-theme-material';
   gridDimensions  = "width: 100%; height: calc(85vh -200px);"
   filterDimensions = 'height: calc(100vh - 200px)'
   urlPath:        string;
   processing      : boolean;
   id              : number;
   employees$      : Observable<IItemBasic[]>;
   buttonName       = 'View'
   searchModel:  PointlessMetrcSearchModel
   _searchModel    :   Subscription;
   isAuthorized    :   boolean;
   smallDevice     = false;
   exceptions      :PointlessMetrcSales[]
   searchPhrase:   Subject<any> = new Subject();
   order$:  Observable<IPOSOrder>;

   searchItems$              : Subject<PointlessMetrcSearchModel> = new Subject();
   _searchItems$ = this.searchPhrase.pipe(
     debounceTime(250),
       distinctUntilChanged(),
       switchMap(searchPhrase =>
         this.refreshSearch()
     )
   )

   clearExceptions(event) { this.exceptions = [] }

   initSubscriptions() {
    try {
      this._searchModel = this.pointlessMetrcSalesReport.searchModel$.subscribe( data => {
        this.currentDayRan = false;
        if (!data) {
          this.exceptions = []
        }
          this.searchModel            = data
          if (!this.searchModel) {
            const searchModel       = {} as PointlessMetrcSearchModel;
            this.currentPage        = 1
            searchModel.pageNumber  = 1;
            searchModel.pageSize    = 20;
            this.searchModel        = searchModel;
            return;
          }

          if (data) {
            if (!this.searchModel.currentDay) {
              this.gridOptions = this.agGridFormatingService.initGridOptions(1000000, this.columnDefs);
            }
            this.refreshSearch_sub()
          }
        }
      )
    } catch (error) {
      console.log('init subscription error', error)
    }
   }

  constructor(
    private readonly datePipe: DatePipe,
    private agGridService: AgGridService,
    private userAuthorization       : UserAuthorizationService,
    private fb                      : FormBuilder,
    private siteService: SitesService,
    private agGridFormatingService  : AgGridFormatingService,
    private reportingServices: ReportingService,
    private orderService: OrdersService,
    private pointlessMetrcSalesReport: PointlessMETRCSalesService,
    private reportingItemsSalesService: ReportingItemsSalesService,
    ) {
    this.initSubscriptions();
    this.initForm();
    this.initColumnDefs(10000);
  }

  ngOnInit(): void {
    this.site = {} as ISite;
    this.sites$ = this.siteService.getSites();
    this.site = this.siteService.getAssignedSite()
    this.initClasses();
    this.updateResize()
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._searchModel) { this._searchModel.unsubscribe()}
    this.exceptions = null;
  }

  initForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
    this.dateRange = new FormGroup({
      startDate: new FormControl(),
      endDate: new FormControl()
    });
  }

  @HostListener("window:resize", [])
  updateResize() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.gridDimensions = 'width: 100%; height: calc(100vh - 200px);'
    }
    this.filterDimensions = 'height: calc(100vh - 200px)'
    this.gridDimensions =  'width: 100%;  height: calc(100vh - 200px);'
    if (this.exceptions && this.exceptions.length>0) {
      this.gridDimensions =  'width: 100%;  height: calc(100vh - 350px);'
      this.filterDimensions = 'height: calc(100vh - 350px)'
    }
  }

  initClasses()  {
    const platForm = this.platForm;
    this.gridDimensions =  'width: 100%;  height: calc(100vh - 200px);'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%;  height: calc(100vh - 200px);'}
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%;  height: calc(100vh - 200px);'}
  }

  initColumnDefs(pageSize: number) {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100
    };
    this.columnDefs =  [
      {
        field: 'orderID',
        cellRenderer: "btnCellRenderer",
                      cellRendererParams: {
                        onClick: this.editProductFromGrid.bind(this),
                        label: this.getLabel.bind(this),
                        getLabelFunction: this.getLabel.bind(this),
                        btnClass: 'btn btn-primary btn-sm'
                      },
                      minWidth: 125,
                      maxWidth: 125,
                      flex: 2,
      },
      {headerName: 'Sale Date',  sortable: true,
                    field: 'completeDate',
        width:    155,
        minWidth: 155,
        maxWidth: 225,
        flex: 2,
        valueFormatter: ({ value }) => this.datePipe.transform(value, 'short')
      },

      {headerName: 'Client Type', field: 'clientType', sortable: true,
        width:    155,
        minWidth: 155,
        maxWidth: 225,
        flex: 2,
      },
      {headerName: 'Patient License', field: 'oomp', sortable: true, cellClass: 'number-cell',
        width:    155,
        minWidth: 155,
        maxWidth: 225,
        flex: 2,
      },
      {headerName: 'Caregiver License', field: 'oompb', sortable: true,
        width:    155,
        minWidth: 155,
        maxWidth: 225,
        flex: 2,
      },
      {headerName: 'Identification Method', field: 'value', sortable: true,
        width:    155,
        minWidth: 155,
        maxWidth: 225,
        flex: 2,
      },
      {headerName: 'Package Label', field: 'packageLabel', sortable: true,
      width:    155,
      minWidth: 155,
      maxWidth: 225,
      flex: 2,
      },
      {headerName: 'Quantity', field: 'quantityTotal', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'UOM', field: 'unitType', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'UTHC%', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'UTHCC', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,},
      {headerName: 'UTHCUOM', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'Unit Weight', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'UWUOM', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'TotalAmount', field: 'netTotal', sortable: true,
        width:    155,
        minWidth: 155,
        maxWidth: 225,
        flex: 2,
        cellRenderer: this.agGridService.currencyCellRendererUSD},
      {headerName: 'Invoice#', field: 'orderID', sortable: true,
        width:    155,
        minWidth: 155,
        maxWidth: 225,
        flex: 2,
      },
      {headerName: 'Price', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'ExciseTax', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'CityTax', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'CountyTax', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'MunicipalTax', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'DiscountAmount', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'SubTotal', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
      },
      {headerName: 'SalesTax', field: 'value', sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,},

      {headerName: 'History', field: 'history', sortable: true,
        hide: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,},
    ]
  }

  initSearchModel() {
    let searchModel        = {} as PointlessMetrcSearchModel;
    if (this.searchModel) {
      searchModel = this.searchModel
    }
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage;
    this.pointlessMetrcSalesReport.updateSearchModel(searchModel)
    return searchModel
  }

  refreshSearch(): Observable<PointlessMetrcSearchModel> {
    return this.refreshSearch_sub();
  }

  refreshSearchByZRUN(event) {
    if (!event) {  return;  }
    this.exceptions = []
    this.searchModel.zRUN = event.zrun;
    this.refreshSearch();
  }

  refreshSearchAny(event) {
    if (!event) {  return;  }
    this.exceptions = []
    this.currentPage = 1;
    this.refreshSearch();
  }

  refreshSearch_sub(): Observable<PointlessMetrcSearchModel> {
    if (this.params){
      this.params.startRow     = 1;
      this.params.endRow       = this.pageSize;
    }
    this.onGridReady(this.params);
    return this._searchItems$;
  }

  //this doesn't change the page, but updates the properties for getting data from the server.
  setCurrentPage(startRow: number, endRow: number): number {
    const tempStartRow = this.startRow;
    this.startRow      = startRow;
    this.endRow        = endRow;
    if (tempStartRow > startRow) { return this.currentPage - 1 };
    if (tempStartRow < startRow) { return this.currentPage + 1 };
    return this.currentPage;
  }

  getRowData(params, startRow: number, endRow: number):  Observable<METRCSalesReportPaged>  {
    const site                = this.siteService.getAssignedSite()
    if (this.searchModel && this.searchModel.currentDay) {
      if (this.currentDayRan) {
        this.processing = false
        return of(null)
      }
      this.setCurrentPage(1, 100000)
      this.currentPage   = 1;
      this.currentDayRan = true;
      return this.pointlessMetrcSalesReport.getUnclosedSalesReport(site, this.searchModel)
    }
    this.currentPage            = this.setCurrentPage(startRow, endRow)
    if (!this.searchModel) { this.searchModel = {}  as PointlessMetrcSearchModel};
    this.searchModel.pageSize   = this.pageSize
    this.searchModel.pageNumber = this.currentPage;
    return this.pointlessMetrcSalesReport.getSalesReport(site, this.searchModel)
  }

  setPaging(resp: IPagedList) {
    this.isfirstpage   = resp.isFirstPage
    this.islastpage    = resp.isFirstPage
    this.currentPage   = resp.currentPage
    this.numberOfPages = resp.pageCount
    this.recordCount   = resp.recordCount
    this.totalRecordCount = resp.totalRecordCount;
  }

  //ag-grid standard method
  onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
      this.autoSizeAll(false);
    }
    this.onFirstDataRendered(this.params)

    if (params == undefined) {
      return;
    }

    if (!params.startRow ||  !params.endRow) {
      params.startRow = 1;
      params.endRow = this.pageSize;
    }

    this.processing = true;

    if (this.searchModel.currentDay) {
      this.pageSize = 100000;
      this.initColumnDefs(1000000);
      this.gridOptions = this.agGridFormatingService.initGridOptionsClientType(this.recordCount , this.columnDefs);
      this.getRowData(params, params.startRow, params.endRow).subscribe(data => {
        if (!data)  {
          this.rowData = null;
          return;}
        if (this.getException(data))  {
          this.rowData = null;
          return;
        }
        this.processing = false;
        this.rowData    = data.results;
        this.getExceptions(data?.exceptions);
        this.setPaging(data.paging);
      })
      return;
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$    = this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            if (!data)  {return;}
            if (this.getException(data))  {return;}
            const resp      =  data.paging;
            this.processing = true;
            this.getExceptions(data?.exceptions);
            this.updateResize();

            if (resp) {
              this.setPaging(data.paging)
              if (this.numberOfPages !=0 && this.numberOfPages) {
                this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
              }
            }

            if (data.results) {
              let results  =  this.refreshImages(data.results)
              params.successCallback(results)
              this.rowData = results
            }
            this.processing = false;
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
    this.autoSizeAll(true);
  }

  getException(data: any) {
    if (!data || data?.exceptionMessage) {
      this.exceptionMessage = data?.exceptionMessage;
      this.processing = false
      return true
    }
    return false;
  }

  getExceptions(exceptions: any[]) {
    if (!this.exceptions) { this.exceptions = []}
    if (exceptions)  {
      this.exceptions = [ ...this.exceptions, ...exceptions];
      this.exceptions = [ ... this.exceptions];
    }
  }

  onFirstDataRendered (params) {
    try {
      if (!params || params.api) {return}
      params.api.sizeColumnsToFit()
    } catch (error) {
      console.log(error)
    }
  }

  onSelectionChanged(event) {
    if (!event) { return }
  }

  editProductFromGrid(e) {
    let history = false
    // const historyValue =

    if ( +e.rowData?.history == 1) {
      history = true;
    }
    if (! e.rowData?.history || +e.rowData?.history == 0) {
      history = false;
    }

    this.setActiveOrder({id: e.rowData.orderID, history: history})
  }


  setActiveOrderByException(orderID: number,history: any) {
    if (+history == 1) {
      history = true;
    }
    if (!history || +history == 0) {
      history = false;
    }
    this.setActiveOrder({id: orderID, history: history})
  }

  setActiveOrder(event) {
    const site  = this.siteService.getAssignedSite();
    let history = false

    if (!event.history) {
      history = false
    }
    if (+event.history == 1) {
      history = true
    }
    if (+event.history == 0) {
      history = false
    }

    const order$ = this.orderService.getOrder(site, event.id, history )
    this.order$  = order$.pipe(
      switchMap(data =>
      {
        this.orderService.setActiveOrder(site, data)
        return of(data)
      }
    ))
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

  //search method for debounce on form fieldf
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

    autoSizeAll(skipHeader) {
      if (! this.gridOptions ) { return }
      if (!this.gridOptions || !this.gridOptions.columnApi) {return}
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

    getLabel(rowData)
    {
      if(rowData) {
        if (!rowData.orderID) {return 'Unknown'}
        const value = rowData.orderID.toString().substr(-5);
        return value
      } else {
          return 'Unknown'
      }
    }

    onExportToCsv() {
      if (this.searchModel.currentDay) {
        this.exportDailySales()
        return;
      }
      if (!this.searchModel.currentDay) {
        const fields = ['completeDate','clientType', 'oomp',  'oompb', 'value', 'packageLabel','quantityTotal','unitType','value', 'value', 'value', 'value', 'value', 'netTotal','orderID',
        , 'value', 'value', 'value', , 'value', 'value' , 'value', 'value', 'value' ]
        this.gridApi.exportDataAsCsv({ columnKeys: fields, allColumns: false,
                                        fileName: 'metrc', skipColumnHeaders: true, suppressQuotes: true});
        return;
      }
    }

    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    exportDailySales() {
      const list = [] as  metrcSalesReport[];
      this.rowData.forEach(data => {
        let item = {} as metrcSalesReport;
        const clientType = data?.clientType.toString() as string;
        if (clientType.toLowerCase() === 'caregiver') {
          console.log('item sale', data)
        }

        const dateFormat = data?.completeDate.slice(0, 10);

        // console.log('completionDate', data.completeDate)
        // console.log('left', left)
        // console.log('short date', this.datePipe.transform( data?.completeDate, 'shortDate'))
        // console.log('mediumTime date', this.datePipe.transform( data?.completeDate, 'mediumTime'))
        // const dateFormat =  this.datePipe.transform( data?.completeDate, 'shortDate');
        const mediumTime =  this.datePipe.transform( data?.completeDate, 'mediumTime');
        item.completeDate = `${dateFormat} ${mediumTime}`;
        item.clientType=  this.capitalizeFirstLetter(clientType);
        item.oomp= data?.oomp;
        item.oompb= data?.oompb;
        item.idMethod = '';
        item.packageLabel = data?.packageLabel;
        item.quantityTotal= data?.quantityTotal.toFixed(2);
        item.uom = data?.unitType;
        item.UTHC = '';
        item.UTHCC = '';
        item.UTHCUOM = '';
        item.UnitWeight = '';
        item.UWUOM = '';
        item.netTotal = data?.netTotal.toFixed(2);
        item.orderID  = data?.orderID;
        item.Price= '0';
        item.ExciseTax = '0';
        item.CityTax = '0';
        item.CountyTax = '0';
        item.MunicipalTax = '0';
        item.DiscountAmount = '0';
        item.SubTotal = '0';
        item.SalesTax = '0';
        list.push(item)
      })
      // const data = JSON.stringify(list)
      const options = {} as UnparseConfig;
      options.quotes = false;
      options.header = false;
      options.skipEmptyLines = true;
      this.reportingItemsSalesService.downloadPapa(list, 'METRCSalesReport', options)
    }

    setSite(id: any) {
      this.site$ = this.siteService.getSite(id).pipe(
        switchMap(data => {
          this.site = data
          this.siteService.setAssignedSite(this.site);
          return of(data)
        })
      )
    }

}