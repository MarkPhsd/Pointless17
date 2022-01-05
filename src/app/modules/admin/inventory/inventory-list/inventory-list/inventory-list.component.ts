import { Component, ElementRef, EventEmitter, OnInit, ViewChild, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subject  } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { InventoryAssignmentService, IInventoryAssignment, InventoryFilter, InventorySearchResultsPaged } from 'src/app/_services/inventory/inventory-assignment.service';
import { ClientSearchModel, ISite, IUserProfile } from 'src/app/_interfaces';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { InventoryLocationsService } from 'src/app/_services/inventory/inventory-locations.service';
import { MatDialog } from '@angular/material/dialog';
import { IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { IGetRowsParams,  GridApi,  } from '@ag-grid-community/all-modules';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';

import {
  METRCItemsCategories,
} from 'src/app/_interfaces/metrcs/items';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { Capacitor,  } from '@capacitor/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, ContactsService, IItemBasicB, MenuService } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';

export interface InventoryStatusList {
  name: string;
  id:   number;
}

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})

export class InventoryListComponent implements OnInit {

    InventorySearchResultsPaged: InventorySearchResultsPaged;
    inventoryAssignment        : IInventoryAssignment;
    inventoryAssignmentHistory : IInventoryAssignment[];
    @ViewChild('input', {static: true}) input: ElementRef;
    @Output() itemSelect  = new EventEmitter();

    id:                   any;
    item:                 string;
    search:               string;
    searchPhrase:         Subject<any> = new Subject();
    public searchForm: FormGroup;
    // inventoryAssignment$             : Subject<IInventoryAssignment[]> = new Subject();
    // _iInventoryAssignment$ = this.searchPhrase.pipe(
    //   debounceTime(250),
    //   distinctUntilChanged(),
    //   switchMap(searchPhrase =>
    //       this.refreshSearch(searchPhrase)
    //   )
    // )

    //needed for search component

    get itemName() { return this.searchForm.get("itemName") as FormControl;}
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
    pageNumber          : number;
    currentRow              = 1;
    currentPage             = 1
    numberOfPages           = 1
    startRow                = 0;
    endRow                  = 0;
    recordCount             = 0;
    isfirstpage             : boolean;
    islastpage              : boolean;
    // pageSize              : number;
    //This is for the filter Section//
    brands           : IUserProfile[];
    categories$      : Observable<IMenuItem[]>;
    departments$     : Observable<IMenuItem[]>;
    productTypes$    : Observable<IItemBasicB[]>;
    viewOptions$     = of(
      [
        {name: 'Active', id: 0},
        {name: 'All', id: 1},
        {name: 'Inactive', id: 2}
      ]
    )

    //search form filters
    inputForm        : FormGroup;
    categoryID       : number;
    productTypeSearch: number;
    productTypeID    : number;
    typeID           : number;
    brandID          : number;
    active           : boolean;
    viewAll           = 1;

    selected        : any[];
    selectedRows    : any;
    agtheme         = 'ag-theme-material';
    gridDimensions
    urlPath:        string;
    value : any;

    gridlist = "grid-list"
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

  get searchProductsValue() { return this.searchForm.get("searchProducts") as FormControl;}
  get selectedSiteValue()   { return this.searchForm.get("selectedSiteID") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  constructor(  private _snackBar: MatSnackBar,
                private inventoryAssignmentService: InventoryAssignmentService,
                private router: Router,
                private agGridService: AgGridService,
                private fb: FormBuilder,
                private siteService: SitesService,
                private metrcCategoriesService: MetrcItemsCategoriesService,
                private locationService: InventoryLocationsService,
                private dialog                  : MatDialog,
                private inventoryEditButon     : InventoryEditButtonService,
                private menuService            : MenuService,
                private itemTypeService        : ItemTypeService,
                private contactsService        : ContactsService,
                private awsService             : AWSBucketService,
                private agGridFormatingService : AgGridFormatingService,

              )
  {
    this.initAgGrid();
  }

  async ngOnInit() {
    this.initClasses();
    this.sites$         =          this.siteService.getSites();
    this.metrcCategory$ =  this.metrcCategoriesService.getCategories();
    this.locations$     = this.locationService.getLocations();

    this.initForm()

    const clientSearchModel       = {} as ClientSearchModel;
    clientSearchModel.pageNumber  = 1
    clientSearchModel.pageSize    = 1000;

    this.urlPath        = await this.awsService.awsBucketURL();
    const site          = this.siteService.getAssignedSite()
    this.rowSelection   = 'multiple'
    this.categories$    = this.menuService.getListOfCategories(site)
    this.departments$   = this.menuService.getListOfDepartments(site)
    this.productTypes$  = this.itemTypeService.getBasicTypes(site)

    const brandResults$       = this.contactsService.getBrands(site, clientSearchModel)
    brandResults$.subscribe(data => {
      this.brands = data.results
    })

    // this.buttonName = 'Edit'
    // this.refreshGrid = true
    if (!this.search) { this.search = ''}
  };

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions = 'width: 100%; height: 90%;'
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }

  initForm() {
    this.searchForm = this.fb.group( {
      searchProducts:     [''],
      selectedSiteID:     [''],
      inventoryLocations: [''],
      inventoryStatusID:  [''],
    })
  }

  refreshSearchPhrase(event) {
    this.itemName.setValue(event)
    this.refreshSearch();
  }

  initAgGrid() {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };

    this.defaultColDef = {
      flex: 2,
      // minWidth: 100,
    };
    this.columnDefs =  [
      {headerName: 'id',  sortable: true, field: 'id',  hide: true, },
      {headerName: 'Name',  sortable: true, field: 'productName',
      width   : 175,
      minWidth: 175,
      maxWidth: 275,
      flex    : 2,},
      {headerName: 'Sku', field: 'sku', sortable: true,
      width   : 175,
      minWidth: 175,
      maxWidth: 275,
      flex    : 1,
       },
      {headerName: 'Location', field: 'location', sortable: true,
      width   : 175,
      minWidth: 175,
      maxWidth: 275,
      flex    : 1,
       },
      {headerName: 'Category', field: 'productCategoryName', sortable: true,
      width   : 175,
      minWidth: 175,
      maxWidth: 275,
      flex    : 1,
       },
      {headerName: 'Count', field: 'packageCountRemaining', sortable: true,
      width   : 175,
      minWidth: 175,
      maxWidth: 275,
      flex    : 1,
       },
      {headerName: 'PKG Type', field: 'unitConvertedtoName', sortable: true,
      width   : 150,
      minWidth: 150,
      maxWidth: 275,
      flex    : 1,
       },
      {headerName: 'Retail', field: 'price', sortable: true,
                    cellRenderer: this.currencyCellRendererUSD,
                    width   : 150,
                    minWidth: 150,
                    maxWidth: 275,
                    flex    : 1,
      },
      {headerName: 'Cost', field: 'cost', sortable: true,
                    cellRenderer: this.currencyCellRendererUSD,
                    width   : 150,
                    minWidth: 150,
                    maxWidth: 275,
                    flex    : 1,
      },
    ]
    // this.rowSelection = 'single';

    this.gridOptions = this.agGridFormatingService.initGridOptions(this.pageSize, this.columnDefs);

  }

  listAll(){
    const control = this.itemName
    if (control) {
      control.setValue('')
    }
    this.categoryID        = 0;
    this.productTypeSearch = 0;
    this.brandID           = 0
    this.refreshSearch()
  }



  initSearchModel(): InventoryFilter {
    let searchModel             = {} as InventoryFilter;
    searchModel.productName     = this.search
    searchModel.label           = this.search
    searchModel.sku             = this.search
    searchModel.inventoryStatus = this.inventoryStatusID
    //if location
    if (this.inventoryLocation) {searchModel.location = this.inventoryLocation.name }
    if (this.metrcCategory)     {searchModel.productCategoryName = this.metrcCategory.name}

    searchModel.pageSize    = this.pageSize
    searchModel.pageNumber = this.pageNumber
    this.id = 0
    return searchModel
  }

  refreshCategoryChange(event) {
    this.categoryID = event;
    this.refreshSearch();
  }

  refreshProductTypeChange(event) {
    this.productTypeSearch = event;
    this.refreshSearch();
  }

  refreshActiveChange(event) {
    this.viewAll = event;
    this.refreshSearch();
  }

  setBrandID(event) {
    if (event && event.id) {
      this.brandID = event.id
      this.refreshSearch();
    }
  }

  refreshSearch() {
    const site               = this.siteService.getAssignedSite()
    const productSearchModel = this.initSearchModel();
    this.onGridReady(this.params)
  }

  refreshGrid() {
    this.onGridReady(this.params)
  }

  //this d
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
            const resp =  data.paging
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            params.successCallback(data.results)
            this.rowData = data.results
          }, err => {
            console.log(err)
          }
      );
      }
    };
  }

  addInventoryItem() {
    try {
      this.inventoryEditButon.addInventoryDialog(0)
    } catch (error) {
      console.log(error)
    }
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
      // this.searchItems()
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
      // this.searchItems()
    })
  }

  getLocation(event) {
    this.inventoryLocationID = event.value
    if (this.inventoryLocationID == 0) {
      this.inventoryLocation = null
      // this.searchItems()
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
      // this.searchItems()
    })
  }

  getInventoryStatus(event) {
    if (event.value) {
      this.assignInventoryStatus(event.value);
    } else {
      this.inventoryStatus.id = 0
      // this.searchItems()
    }
  }

  assignInventoryStatus(name: string): InventoryStatusList {
    return  this.inventoryStatus = this.inventoryStatusList.find(data =>
      {
        if ( data.name === name ) {
          this.inventoryStatus = data;
          this.inventoryStatusID  = this.inventoryStatus.id
          // this.searchItems()
          return
        }
      }
    )
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<InventorySearchResultsPaged>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.inventoryAssignmentService.getInventory(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    console.log('params', params)
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    if (params == undefined) { return }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)

      items$.subscribe(data =>
        {
          if (data.errorMessage) {
            this.notifyEvent(data.errorMessage, 'Failure')
            return
          }
            const resp         =  data.paging
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            params.successCallback(data.results)
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
  }

    //mutli select method for selection change.
  onSelectionChanged(event) {

    let selectedRows       = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow          = this.pageSize;
    let selected           = []

    if (selectedRows.length == 0) { return }
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
    this.getInventoryHistory(this.id)
    // this.getItemHistory(this.id)
  }

  async getInventoryHistory(id: any) {
    const site = this.siteService.getAssignedSite();
    if (id) {
      this.inventoryAssignmentService.getInventoryAssignment(site, id ).subscribe(data =>{
        this.inventoryAssignment = data;
      })
      const history$ = this.inventoryAssignmentService.getInventoryAssignmentHistory(site, id)
      history$.subscribe(data=>{
        this.inventoryAssignmentHistory = data;
      })
    }
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
    this.gridApi.exportDataAsCsv();
  }

  onSortByNameAndPrice(sort: string) {
  }

  displayFn(search) {
    // this.searchPaging = true
    this.selectItem(search)
    this.item = search
    this.search = search
    return search;
  }

  selectItem(search){
    if (search) {
      // this.searchPaging = true
      this.searchPhrase.next(search)
    }
  }

  formatToolTip(params: any) {
    // USE THIS FOR TOOLTIP LINE BREAKS
    const adjustmentNote = params.adjustmentNote;
    const adjustmentType = params.adjustmentType;
    const lineBreak = true;
    const toolTipArray = [adjustmentNote, adjustmentType]
    return { toolTipArray, lineBreak }
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

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}


