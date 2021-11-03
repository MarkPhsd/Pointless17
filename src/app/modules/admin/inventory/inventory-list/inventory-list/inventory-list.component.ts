import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, AfterViewInit, ViewChild, Output, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromEvent, Observable, Subject  } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';
import { InventoryAssignmentService, IInventoryAssignment, InventoryFilter } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { InventoryLocationsService } from 'src/app/_services/inventory/inventory-locations.service';
import { MatDialog } from '@angular/material/dialog';
import { IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { IGetRowsParams,  GridApi, GridOptions, ICellRendererParams  } from '@ag-grid-community/all-modules';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';

import {
  METRCItems,
  METRCItemsCategories,
  MetrcItemsBrands,
  METRCItemsCreate,
  METRCItemsUpdate
} from 'src/app/_interfaces/metrcs/items';
import { MoveInventoryLocationComponent } from '../../move-inventory-location/move-inventory-location.component';
import { InventoryListToolTipComponent } from '../inventory-list-tool-tip/inventory-list-tool-tip.component';
import { NavParams } from '@ionic/angular';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';

export interface InventoryStatusList {
  name: string;
  id:   number;
}

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})

export class InventoryListComponent implements OnInit, AfterViewInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  id:                   any;
  item:                 string;
  search:               string;
  searchPhrase:         Subject<any> = new Subject();


  // _inventoryAssignment$             : Observable<IInventoryAssignment[]>;
  inventoryAssignment$             : Subject<IInventoryAssignment[]> = new Subject();
  _iInventoryAssignment$ = this.searchPhrase.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.refreshSearch(searchPhrase)
    )
  )

  searchGridApi:         GridApi;
  searchGridColumnApi:   GridAlignColumnsDirective;
  searchGridOptions:     any;
  //AgGrid
  private gridApi:       GridApi;
  private gridColumnApi: GridAlignColumnsDirective;
  gridOptions:           any
  columnDefs =           [];
  defaultColDef;

  // public modules:        any[] = AllCommunityModules;
  frameworkComponents:   any;
  tooltipShowDelay:      any;
  rowDataClicked1 =      {};
  rowDataClicked2 =      {};
  public rowData:        any[];
  public info:           string;
  paginationSize =       50
  currentRow =           1;
  currentPage =          1
  pageNumber =           1
  pageSize =             50
  numberOfPages =        1
  rowCount =             50
  startRow: number;
  endRow  : number;

  rowSelection              :  any;
  inventoryAssignment       :  IInventoryAssignment;
  inventoryAssignmentHistory: IInventoryAssignment[];

  //list select
  sites$:               Observable<ISite[]>;
  site:                 ISite;
  selectedSiteID:       number;

  metrcCategory$:       Observable<METRCItemsCategories[]>;
  metrcCategory:        METRCItemsCategories;
  metrcCategoryID:      number;

  locations$:           Observable<IInventoryLocation[]>;
  inventoryLocation:    IInventoryLocation;
  inventoryLocationID:  number;

  inventoryFilter:      InventoryFilter;
  inventoryStatus:      InventoryStatusList
  inventoryStatusID:    number
  inventoryStatusList  = [
                          {id: 1, name: 'In Stock - For Sale'},
                          {id: 2, name: 'In Stock - Not for Sale'},
                          {id: 3, name: 'Sold Out'},
                          {id: 0, name:  'All'}
  ] as InventoryStatusList[]

  //This is for the search Section//
  public searchForm: FormGroup;
  get searchProductsValue() { return this.searchForm.get("searchProducts") as FormControl;}
  get selectedSiteValue()   { return this.searchForm.get("selectedSiteID") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  searchPaging:               boolean;
  refreshGrid:                boolean;
  //This is for the search Section//

  constructor(  private _snackBar: MatSnackBar,
                private inventoryAssignmentService: InventoryAssignmentService,
                private router: Router,
                private agGridService: AgGridService,
                private fb: FormBuilder,
                private siteService: SitesService,
                private metrcCategoriesService: MetrcItemsCategoriesService,
                private locationService: InventoryLocationsService,
                private dialog: MatDialog,
                private inventoryEditButon: InventoryEditButtonService,
              )
  {



  }

  ngOnInit(): void {

    this.sites$ =          this.siteService.getSites();
    this.metrcCategory$ =  this.metrcCategoriesService.getCategories();
    this.locations$ = this.locationService.getLocations();

    this.searchForm = this.fb.group( {
        searchProducts:     [''],
        selectedSiteID:     [''],
        inventoryLocations: [''],
        inventoryStatusID:  [''],
      }
    );

    this.initGridResults();

    this.refreshGrid = true

    if (!this.search) { this.search = ''}
  };

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement,'keyup')
        .pipe(
            filter(Boolean),
            debounceTime(500),
            distinctUntilChanged(),
            tap((event:KeyboardEvent) => {
              const search  = this.input.nativeElement.value
              this.refreshSearch(search);
            })
        )
      .subscribe();
  }


  initAGGridFeatures() {

    this.columnDefs =  [

      {headerName: 'id',  sortable: true, field: 'id',  hide: true, },
      {headerName: 'Name',  sortable: true, field: 'productName',  minWidth: 150},
      {headerName: 'Sku', field: 'sku', sortable: true},
      {headerName: 'Location', field: 'location', sortable: true},
      {headerName: 'Category', field: 'productCategoryName', sortable: true},
      {headerName: 'Count', field: 'packageCountRemaining', sortable: true},
      {headerName: 'PKG Type', field: 'unitConvertedtoName', sortable: true},
      {headerName: 'Retail', field: 'price', sortable: true,
                    cellRenderer: this.currencyCellRendererUSD},
      {headerName: 'Cost', field: 'cost', sortable: true,
                    cellRenderer: this.currencyCellRendererUSD},
    ]

    this.rowSelection = 'single';

    this.tooltipShowDelay = 0;

    this.initGridOptions()


  }

  // agGridService
  currencyCellRendererUSD(params: any) {

    if (isNaN(params) != true)  {  return 0.00 }

    var inrFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });

    if (inrFormat.format(params.value) == '$NaN') { return ''}
    return inrFormat.format(params.value);

  }

  initGridResults() {

    this.initAGGridFeatures()

    this.frameworkComponents =  { inventoryListToolTipComponent: InventoryListToolTipComponent,
                                  btnCellRenderer: ButtonRendererComponent  }

    this.defaultColDef = {
      flex:             1,
      minWidth:         100,
      filter:           true,
      resizable:        true,
      // editable:         true,
      sortable:         true,
      tooltipComponent: 'inventoryListToolTipComponent',
      // cellRendererFramework: InventoryListToolTipComponent,
      // cellRendererParams: (params: ICellRendererParams) => this.formatToolTip(params.data)
    };
  }

  formatToolTip(params: any) {
    // USE THIS FOR TOOLTIP LINE BREAKS
    const adjustmentNote = params.adjustmentNote;
    const adjustmentType = params.adjustmentType;
    const lineBreak = true;
    const toolTipArray = [adjustmentNote, adjustmentType]
    return { toolTipArray, lineBreak }

    // USE THIS FOR SINGLE LINE TOOLTIP
    // const lineBreak = false;
    // const toolTipString = 'Hello World'
    // return { toolTipString, lineBreak }
  }

  initGridOptions()  {
    this.gridOptions = {
      pagination: true,
      paginationPageSize: 50,
      cacheBlockSize: 50,
      maxBlocksInCache: 800,
      rowModelType: 'infinite',
      infiniteInitialRowCount: 2,
    }
  }

  initSearchGridOptions()  {
    this.searchGridOptions = {
      pagination: true,
      paginationPageSize: this.paginationSize,
      cacheBlockSize: this.paginationSize,
      // maxBlocksInCache: 2,
      rowModelType: 'infinite',
      infiniteInitialRowCount: 2,
    }
  }

  addInventoryItem() {
    try {
      this.inventoryEditButon.addInventoryDialog(0)
    } catch (error) {
      console.log(error)
    }
  }

  listAll(){

    this.pageNumber = 1
    this.currentPage = this.currentPage  + 1
    this.inventoryFilter = this.initSearchModel('')
    this._iInventoryAssignment$ = this.inventoryAssignmentService.getInventory(this.site, this.inventoryFilter)
    this.getRowData(1, 50)

  }

  refreshData() {

    const inv$ = this.inventoryAssignmentService.getInventory(this.site, this.inventoryFilter)
    inv$.subscribe ( data => {
      this.inventoryAssignment$.next(data)
    })


  }

  getAssignedSiteSelection(event) {
    if (event.value) {
      this.selectedSiteID = event.value
      this.assignSite(this.selectedSiteID);
    }
  }

  assignSite(id: number){
    this.siteService.getSite(id).subscribe( data => {
      this.site = data
    })
  }

  getAssignedSite(): ISite {
    if (this.site) {
      return this.site
    } else {
      return  this.siteService.getAssignedSite()
    }
  }

  getMetrcCategory(event) {

    this.metrcCategoryID = event.value
    if (this.metrcCategoryID == 0) {
      this.metrcCategory = null
      this.searchItems()
      return
    }
    if (event.value) {
      this.metrcCategoryID = event.value
      this.assignMetrcCategory(this.metrcCategoryID);
    }
  }

  assignMetrcCategory(id: number) {
    this.metrcCategoriesService.getCategory(id).subscribe( data => {
      this.metrcCategory = data
      this.searchItems()
    })
  }

  getLocation(event) {
    this.inventoryLocationID = event.value
    if (this.inventoryLocationID == 0) {
      this.inventoryLocation = null
      this.searchItems()
      return
    }
    if (event.value) {
      this.assignLocation(this.inventoryLocationID);
    }
  }

  assignLocation(id: number){
    this.locationService.getLocation(id).subscribe( data => {
      this.inventoryLocation = data
      console.log(data)
      this.searchItems()
    })
  }

  getInventoryStatus(event) {
    if (event.value) {
      this.assignInventoryStatus(event.value);
    } else {
      this.inventoryStatus.id = 0
      this.searchItems()
    }
  }

  assignInventoryStatus(name: string): InventoryStatusList {
    return  this.inventoryStatus = this.inventoryStatusList.find(data =>
      {
        if ( data.name === name ) {
          this.inventoryStatus = data;
          this.inventoryStatusID  = this.inventoryStatus.id
          this.searchItems()
          return
        }
      }
    )
  }

  initSearchModel(search: string): InventoryFilter {
    let searchModel = {} as InventoryFilter;
    searchModel.productName = search
    searchModel.label = search
    searchModel.sku = search
    searchModel.inventoryStatus = this.inventoryStatusID
    //if location
    if (this.inventoryLocation) {searchModel.location = this.inventoryLocation.name }
    if (this.metrcCategory)     {searchModel.productCategoryName = this.metrcCategory.name}
    searchModel.pageSize  = this.pageSize
    searchModel.pageNumber = this.pageNumber
    this.id = 0
    return searchModel
  }

  refreshSearch(search: string) : Observable<IInventoryAssignment[]>  {

    const site =   this.getAssignedSite()
    this.searchPaging = true
    // this.search = search //for update of forms when the dialog's close.
    if (site) {
      const searchModel = this.initSearchModel(search);
      const inv$ = this.inventoryAssignmentService.getActiveInventory(site, searchModel).subscribe( data => {
        this.inventoryAssignment$.next(data)
      })
      return  this._iInventoryAssignment$

    } else {

      this.inventoryAssignment$.next(null)// = null
    }
  }

  searchItems() {
    const site = this.getAssignedSite()
    if (site) {
      const search = this.searchProductsValue.value
      const searchModel = this.initSearchModel(search);
      const inv =  this.inventoryAssignmentService.getActiveInventory(site, searchModel)
      inv.subscribe( data => {
        this.inventoryAssignment$.next(data)
      })
    } else {
      console.log("site not defined")
    }
  }

  // iInventoryAssignment$ = this.searchPhrase.pipe(
  //   debounceTime(250),
  //   distinctUntilChanged(),
  //   switchMap(searchPhrase =>
  //       this.refreshSearch(searchPhrase)
  //   )
  // )

  getRowData(startRow: number, endRow: number) : Observable<IInventoryAssignment[]> { //:  { //  Observable<IInventoryAssignment[]>  {

    //this routine converts the StartRows and Endrows to pageNumber and PageSize.
    //this means we have to keep track of the current page.
    //the grid only captures the star rows and current rows. So it doesn't know
    //what page we are on.
    //we can display the current page on the screen using currentPage
    startRow = this.currentPage
    console.log(startRow, endRow)

    this.pageNumber = this.currentPage
    this.currentPage = this.currentPage  + 1
    if (startRow == 0)  { startRow = 1 }

    if (!this.searchProductsValue.value)
    {
      if (this.searchPaging) {
        this.pageNumber = 1
        this.searchPaging = !this.searchPaging
      }
      this.searchItems()
    }

    return this.inventoryAssignment$

  }

  onSelectionChanged(event) {
    console.log('onSelectionChanged', event)
    const  selectedRows = this.gridApi.getSelectedRows();
    this.id = selectedRows[0].id;
    this.getInventoryHistory(this.id)
  }

  async getInventoryHistory(id: any) {
    const site = this.siteService.getAssignedSite();
    if (id) {

      this.inventoryAssignmentService.getInventoryAssignment(site, id ).subscribe(data =>{
        this.inventoryAssignment = data;
      })

      const history$ = this.inventoryAssignmentService.getInventoryAssignmentHistory(site, id)
      history$.subscribe(data=>{
        this.inventoryAssignmentHistory = data
      })
    }
  }

  onSearchgridReady({ api } : {api: GridApi}) {
    this.gridApi = api;
    api.sizeColumnsToFit();
  }

  onSearchGridReady(params) {
    this.searchItems()
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    console.log(params)
  }

  ongridReady({ api } : {api: GridApi}) {
    this.gridApi = api;
    api.sizeColumnsToFit();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    let datasource = {
      getRows: (params: IGetRowsParams) => {
        this.info = "Getting datasource rows, start: " + params.startRow + ", end: " + params.endRow;
        this.getRowData(params.startRow, params.endRow)
          .subscribe(data =>
              {
                if (this.paginationSize > data.length) {
                  this.paginationSize = data.length
                  this.refreshGrid = false
                  this.initAGGridFeatures()
                  this.refreshGrid = true
                }
                params.successCallback(data)
              }, err => {
                console.log(err)
              }
            );
       }
    };
    params.api.setDatasource(datasource);
  }

  onSearch(){
    if (this.searchProductsValue.value) {
      this.searchPaging = true
      this.pageNumber = 1
      this.currentPage = 1
    } else {
      this.searchPaging = false
    }
    this.searchItems()
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

  editItemFromGrid(e) {
    if (e.rowData.id)  {
      this.editItemWithId(e.rowData.id);
    }
  }

  editItemWithId(id:any) {

    return
  }

  onDeselectAll() {
  }

  onExportToCsv() {
    if (!this.searchPaging) {
      this.gridApi.exportDataAsCsv();
    } else {
      this.searchGridApi.exportDataAsCsv();
    }
  }

  onSortByNameAndPrice(sort: string) {
  }

  displayFn(search) {
    this.searchPaging = true
    this.selectItem(search)
    this.item = search
    this.search = search
    return search;
  }

  selectItem(search){
    if (search) {
      this.searchPaging = true
      this.searchPhrase.next(search)
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}


