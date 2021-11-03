import { Component,  Inject,  Input, Output, OnInit, Optional,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthenticationService, AWSBucketService, ContactsService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IItemBasic } from 'src/app/_services/menu/menu.service';

import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ClientSearchModel, IPOSPayment, IPOSPaymentsOptimzed, IProduct, IServiceType, IUserProfile } from 'src/app/_interfaces';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { Capacitor, Plugins } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BalanceSheetSearchModel, BalanceSheetService, IBalanceSheet, IBalanceSheetPagedResults } from 'src/app/_services/transactions/balance-sheet.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BalanceSheetFilterComponent } from '../balance-sheet-filter/balance-sheet-filter.component';

@Component({
  selector: 'app-balance-sheets',
  templateUrl: './balance-sheets.component.html',
  styleUrls: ['./balance-sheets.component.scss']
})
export class BalanceSheetsComponent implements OnInit, AfterViewInit {

  toggleListGrid = true // displays list of payments or grid
  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();
  dateRange        : FormGroup;

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
  private gridColumnApi: GridAlignColumnsDirective;
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
  searchForm:        FormGroup;
  inputForm        : FormGroup;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions  = "width: 100%; height: 100%;"
  urlPath:        string;

  id              : number;
  balanceSheet      : IBalanceSheet;

  employees$      :   Observable<IItemBasic[]>;
  paymentMethod$  :   Observable<IBalanceSheet[]>;

  _searchModel    :   Subscription;
  searchModel     :   BalanceSheetSearchModel;
  isAuthorized    :   boolean;
  smallDevice       = false;

  constructor(  private _snackBar               : MatSnackBar,
                private balanceSheetService     : BalanceSheetService,
                private agGridService           : AgGridService,
                private fb                      : FormBuilder,
                private siteService             : SitesService,
                private productEditButtonService: ProductEditButtonService,
                private agGridFormatingService  : AgGridFormatingService,
                private awsService              : AWSBucketService,
                private userAuthorization       : UserAuthorizationService,
                private userService             : AuthenticationService,
                private router                  : Router,
                private _bottomSheet            : MatBottomSheet,
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

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions = 'width: 100%; height: 100%;'
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }

  async initForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
    this.dateRange = new FormGroup({
      start: new FormControl(),
      end: new FormControl()
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
      console.log('ngAfterViewInit refreshInputHook')
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
      this._searchModel = this.balanceSheetService.balanceSearchModelSheet$.subscribe( data => {
        this.searchModel            = data

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
      // minWidth: 100,
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
      {headerName: 'Employee',     field: 'balanceSheetEmployee.lastName', sortable: true,
                    width   : 100,
                    minWidth: 100,
                    maxWidth: 100,
                    flex    : 2,
      },

      {headerName: 'Date',     field: 'endTime',         sortable: true,
                  cellRenderer: this.agGridService.dateCellRendererUSD,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 150,
                  flex    : 2,
      },
      {headerName: 'Total',  field: 'Total',      sortable: true,
                  width: 100,
                  minWidth: 100,
                  maxWidth: 100,
                  flex    : 2,
      },
      {headerName: 'Balance',    field: 'overUnderTotal', sortable: true,
                  cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  flex    : 2,
      },
      {headerName: 'DeviceName', field: 'deviceName', sortable: true,
                  width   : 140,
                  minWidth: 100,
                  maxWidth: 150,
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
    console.log('initSearchModel', searchModel)
    this.balanceSheetService.updateBalanceSearchModel(searchModel)
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
  getDataSource(params) {
    return {
    getRows: (params: IGetRowsParams) => {
      const items$ = this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            if (data.paging) {
              const resp =  data.paging
              this.isfirstpage   = resp.isFirstPage
              this.islastpage    = resp.isFirstPage
              this.currentPage   = resp.currentPage
              this.numberOfPages = resp.pageCount
              this.recordCount   = resp.recordCount
            }
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            if (data.results) {
              params.successCallback(data.results)

              this.rowData = data.results
            }

          }, err => {
            console.log(err)
          }
      );
      }
    };


    if (this.numberOfPages !=0 && this.numberOfPages) {
      this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
    }

  }

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
      this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
      this.autoSizeAll(false)
    }
    this.onFirstDataRendered(this.params)

    // if (!params) { return }
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

    console.log("this autosize all")
    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
    this.autoSizeAll(true)
  }

   onFirstDataRendered (params) {
    try {
      params.api.sizeColumnsToFit()
      window.setTimeout(() => {
        const colIds = params.columnApi.getAllColumns().map(c => c.colId)
        params.columnApi.autoSizeColumns(colIds)
      }, 50)

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
    console.log('displayFn', search)
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

    // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
    this.selected = selected
    this.id = selectedRows[0].id;
    this.getItem(this.id)
  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.balanceSheetService.getSheet(site, this.id).subscribe(data => {
         this.balanceSheet = data;
        }
      )
    }
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

  async editItemWithId(item:any) {
    if(!item) {
      console.log(item)
      return
    }
    const id   = item.rowData.id;
    const site = this.siteService.getAssignedSite()
    // const sheet = await this.balanceSheetService.getSheet(site, id).pipe().toPromise();
    // this.balanceSheetService.updateBalanceSheet(sheet)
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
}

