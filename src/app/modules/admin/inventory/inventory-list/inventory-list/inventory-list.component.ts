import { Component, ElementRef, EventEmitter, OnInit, ViewChild, Output, HostListener, OnDestroy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subject, Subscription, switchMap  } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { InventoryAssignmentService, IInventoryAssignment, InventoryFilter, InventorySearchResultsPaged } from 'src/app/_services/inventory/inventory-assignment.service';
import { ClientSearchModel, ISite, IUserProfile, OperationWithAction } from 'src/app/_interfaces';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { InventoryLocationsService } from 'src/app/_services/inventory/inventory-locations.service';
import { MatDialog } from '@angular/material/dialog';
import { IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { IGetRowsParams,  GridApi,  } from '@ag-grid-community/all-modules';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import {
  METRCItemsCategories,
} from 'src/app/_interfaces/metrcs/items';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { Capacitor,  } from '@capacitor/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, ContactsService, IItemBasicB, MenuService } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';
import { MainfestEditorComponent } from '../../manifests/mainfest-editor/mainfest-editor.component';
import { AgIconFormatterComponent } from 'src/app/_components/_aggrid/ag-icon-formatter/ag-icon-formatter.component';
import { ManifestMethodsService } from 'src/app/_services/inventory/manifest-methods.service';
import { AdjustPaymentComponent } from 'src/app/modules/posorders/adjust/adjust-payment/adjust-payment.component';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { AdjustmentReasonsComponent } from 'src/app/shared/widgets/adjustment-reasons/adjustment-reasons.component';
import { NewInventoryItemComponent } from '../../new-inventory-item/new-inventory-item.component';
export interface InventoryStatusList {
  name: string;
  id:   number;
}

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})

export class InventoryListComponent implements OnInit, OnDestroy {

  @Input()  listOnly = false;
  @Input()  manifestID  : number;
  @Input()  siteID : ISite;

  resultMessage: string;
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
  inventoryAssignment$             : Subject<IInventoryAssignment[]> = new Subject();

  currentManifest: InventoryManifest;

  get itemName() {
    if (!this.searchForm) { this.initForm()}
    if (this.searchForm) {
      return this.searchForm.get("itemName") as FormControl;
    }
  }

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

  manifestAssignedList     =
    [
      {name: 'Any',         id: 0},
      {name: 'Assigned'  ,  id: 1},
      {name: 'Un Assigned', id: 2},
    ]


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
  value           : any;

  smallDevice    : boolean;
  @Input() gridlist       = "grid-list"
  sites$:               Observable<ISite[]>;
  site:                 ISite;
  selectedSiteID:       number;

  metrcCategory$:       Observable<METRCItemsCategories[]>;
  metrcCategory:        METRCItemsCategories;
  metrcCategories      :METRCItemsCategories[];
  metrcCategoryID:      number;

  locations$:           Observable<IInventoryLocation[]>;
  inventoryLocation:    IInventoryLocation;
  inventoryLocationID:  number;

  inventoryFilter:      InventoryFilter;
  inventoryStatus:      InventoryStatusList
  inventoryStatusID:    number
  inventoryStatusList  = this.inventoryAssignmentService.inventoryStatusList;

  manifestAssigned: number;

  isAuthorized: boolean;
  //This is for the search Section//
  currentManifest$: Subscription;

  get searchProductsValue() { return this.searchForm.get("searchProducts") as FormControl;}
  get selectedSiteValue()   { return this.searchForm.get("selectedSiteID") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  initSubscriptions() {
    this.currentManifest$ = this.manifestService.currentInventoryManifest$.subscribe(data => {
      if (data ) {
        this.currentManifest = data;
        this.manifestID = data.id
      }
      if (!data ) {
        this.currentManifest = null;
      }
    })
  }

  constructor(  private _snackBar: MatSnackBar,
                private manifestService : ManifestInventoryService,
                private inventoryAssignmentService: InventoryAssignmentService,
                private fb: FormBuilder,
                private siteService: SitesService,
                private metrcCategoriesService: MetrcItemsCategoriesService,
                private locationService        : InventoryLocationsService,
                private inventoryEditButon     : InventoryEditButtonService,
                private menuService            : MenuService,
                private itemTypeService        : ItemTypeService,
                private contactsService        : ContactsService,
                private awsService             : AWSBucketService,
                private agGridFormatingService : AgGridFormatingService,
                private userAuthorization      : UserAuthorizationService,
                private dialog                 : MatDialog,
              )
  {
    this.initForm()
  }

  async ngOnInit() {

    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
    this.initSubscriptions();
    this.initClasses();
    this.sites$         = this.siteService.getSites();
    this.locations$     = this.locationService.getLocations();

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

    this.metrcCategory$ = this.metrcCategoriesService.getCategories()
    this.metrcCategory$.subscribe(
        {next: data => {
          this.metrcCategories = data;
          this.initAgGrid();
        },
        error: err => {
          console.log('err', err)
          this.initAgGrid();
        }
      }
    )
    if (!this.search) { this.search = ''}
  };

  setRefreshAgGrid(value: number) {
    this.columnDefs = this.initAgGrid();
  }

  agColumnApiRefresh() {
    if (this.columnDefs) {
      this.agGridFormatingService.initGridOptionsFormated(this.pageSize, this.columnDefs)
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // if (this.currentManifest$) {
    //   this.currentManifest$.unsubscribe()
    // }
    const i = 0;
  }

  openAdjustmentDialog() {
    const dialogConfig = [
      { data: { id: 4 } }
    ]
    const dialogRef = this.dialog.open(AdjustmentReasonsComponent,
      { width:  '600px',
        height: '800px',
        data : {id: 4}
      },
    )
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions = 'width: 100%; height: 100%;'
    this.agtheme        = 'ag-theme-material';
    if (this.smallDevice) {
      this.gridDimensions = 'width: 100%; height: 70%;'
    }
  }

  @HostListener("window:resize", [])
    updateDeviceSize() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }
    this.initClasses();
  }

  initForm() {
    this.searchForm = this.fb.group( {
      itemName      :     [''],
      searchProducts:     [''],
      selectedSiteID:     [''],
      inventoryLocations: [''],
      inventoryStatusID:  [''],
      manifestAssigned  : [''],
      metrcCategory     : [''],

    })
  }

  refreshSearchOut(event) {
    this.refreshSearch();
  }

  initAgGrid() {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent,
      iconCell: AgIconFormatterComponent
    };

    // this.gridOptions.push(rowClassRules)
    this.defaultColDef = {
      flex: 2,
      // minWidth: 100,
    };

    let item = {headerName: 'id',  sortable: true, field: 'id',  hide: true, } as any;
    this.columnDefs.push(item)

    item =     {
      field: "selected",
      minWidth: 50,
      maxWidth: 50,
      checkboxSelection: true
    }
    this.columnDefs.push(item)

    item =     {
      field: 'id',
      cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                      onClick: this.editItemFromGrid.bind(this),
                      getIconFunction: this.getLabel.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 75,
                    maxWidth: 75,
                    flex: 2,
    }
    if (this.listOnly) {
      this.columnDefs.push(item)
    }

    //notAvalibleForSale
    item = {headerName: 'notAvalibleForSale',  sortable: true, field: 'notAvalibleForSale',  hide: true, } as any;
    this.columnDefs.push(item)
    item = {headerName: 'active',  sortable: true, field: 'active',  hide: true, } as any;
    this.columnDefs.push(item)

    item =  {headerName: 'Name',  sortable: true, field: 'productName',
                width   : 175,
                minWidth: 175,
                maxWidth: 275,
                flex    : 2,} as any;
    this.columnDefs.push(item)

    item =  {headerName: 'Sku', field: 'sku', sortable: true,
              width   : 175,
              minWidth: 175,
              maxWidth: 275,
              flex    : 1,
              } as any;
    this.columnDefs.push(item)

    item =  {headerName: 'Location', field: 'location', sortable: true,
              width   : 175,
              minWidth: 175,
              maxWidth: 275,
              flex    : 1,
              }
    this.columnDefs.push(item)

    if (this.metrcCategories.length>0) {
      item =  {headerName: 'Category', field: 'productCategoryName', sortable: true,
                width   : 175,
                minWidth: 175,
                maxWidth: 275,
                flex    : 1,
              }
      this.columnDefs.push(item)
    }

    item =  {headerName: 'Count', field: 'packageCountRemaining', sortable: true,
              width   : 175,
              minWidth: 175,
              maxWidth: 275,
              flex    : 1,
               }
    this.columnDefs.push(item)

    item = {headerName: 'PKG Type', field: 'unitConvertedtoName', sortable: true,
              width   : 150,
              minWidth: 150,
              maxWidth: 275,
              flex    : 1,
               }
    this.columnDefs.push(item)

    item =  {headerName: 'Retail', field: 'price', sortable: true,
                            cellRenderer: this.currencyCellRendererUSD,
                            width   : 150,
                            minWidth: 150,
                            maxWidth: 275,
                            flex    : 1,
              }
    this.columnDefs.push(item)

    item =  {headerName: 'Cost', field: 'cost', sortable: true,
                            cellRenderer: this.currencyCellRendererUSD,
                            width   : 150,
                            minWidth: 150,
                            maxWidth: 275,
                            flex    : 1,
              }
    this.columnDefs.push(item)

    item =     {
      field: 'manifestID',
      cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                      onClick: this.editManifest.bind(this),
                      getIconFunction: this.getManifestIcon.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 125,
                    maxWidth: 125,
                    flex: 2,
    }
    if (!this.listOnly) {
      this.columnDefs.push(item)
    }

    item =  {headerName: 'Rejected', field: 'rejected', sortable: true,
                            width   : 150,
                            minWidth: 150,
                            maxWidth: 275,
                            flex    : 1,
              }
    if (this.listOnly) {
      this.columnDefs.push(item)
    }

    const columnDefs = this.columnDefs
    this.rowSelection = 'multiple';
    this.gridOptions = this.agGridFormatingService.initGridOptions(this.pageSize, this.columnDefs);
    return columnDefs
  }

  editManifest(e) {

    if (!e) {return}
    if (e.rowData.id)  {
      this.manifestService.openManifestForm(e.rowData.manifestID);
    }
  }

  listAll(){
    const control = this.itemName
    if (control) {
      control.setValue('')
    }
    if (!this.listOnly) {
      this.manifestID = 0;
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

    if (this.listOnly && this.currentManifest) {
      searchModel.manifestID      = this.currentManifest.id
    }

    if (this.manifestAssigned) {
      searchModel.manifestAssigned = this.manifestAssigned;
    }

    //if location
    if (this.itemName && this.searchForm) {
      if (this.itemName.value)  { searchModel.productName   = this.itemName.value  }
    }

    if (this.inventoryLocation) {searchModel.location = this.inventoryLocation.name }
    if (this.metrcCategory)     {searchModel.productCategoryName = this.metrcCategory.name}
    searchModel.pageSize    = this.pageSize
    searchModel.pageNumber = this.currentPage;

    this.id = 0
    return searchModel
  }

  refreshSearchPhrase(event) {
    if (this.itemName) {
      const item = { itemName: event }
      this.searchForm.patchValue(item)
      this.search = event;
      this.refreshSearch();
    }
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

  //this doesn't change the page, but updates the properties for getting data from the server.
  setCurrentPage(startRow: number, endRow: number): number {
    const tempStartRow = this.startRow
    this.startRow      = startRow
    this.endRow        = endRow;
    if (tempStartRow > startRow) { return this.currentPage - 1 }
    if (tempStartRow < startRow) { return this.currentPage + 1 }
    return this.currentPage
  }

  addInventoryItem() {
    try {
      const result =   this.inventoryEditButon.addInventoryDialog(0)
      if (result) {
        this.refreshSearch();
      }
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
      this.siteService.setAssignedSite(data);
      this.siteService.updateSiteSubscriber(data);
      this.refreshSearch();
      this.manifestService.updateCurrentInventoryManifest(null)
    })
  }

  getAssignedSite(): ISite {
    if (this.site) {
      return this.site
      this.manifestService.updateSelectedManifestSite(this.site)
    } else {
      this.manifestService.updateSelectedManifestSite( this.siteService.getAssignedSite())
      return  this.siteService.getAssignedSite()
    }
  }

  getMetrcCategory(event) {
    this.metrcCategoryID = event.value
    if (this.metrcCategoryID == 0) {
      this.metrcCategory = null
      this.refreshSearch();
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
    
    })
  }

  getLocation(event) {
    this.inventoryLocationID = event.value
    if (this.inventoryLocationID == 0) {
      this.inventoryLocation = null
      this.refreshSearch();
      return
    }
    if (event.value) {
      this.assignLocation(this.inventoryLocationID);
    }
  }

  assignLocation(id: number){
    this.locationService.getLocation(id).subscribe( data => {
      this.inventoryLocation = data
      this.refreshSearch();
    })
  }

  getInventoryStatus(event) {
    if (event.value) {
      this.assignInventoryStatus(event.value);
      this.refreshSearch();
    } else {
      this.inventoryStatus.id = 0
    }
  }

  getManifestStatus(event) {
    if (event.value) {
      this.manifestAssigned = event.value;
      this.refreshSearch();
    } else {
      this.manifestAssigned = 0;
      this.refreshSearch();
    }
  }

  assignInventoryStatus(name: string): InventoryStatusList {
    return  this.inventoryStatus = this.inventoryStatusList.find(data =>
      {
        if ( data.name === name ) {
          this.inventoryStatus = data;
          this.inventoryStatusID  = this.inventoryStatus.id
          return
        }
      }
    )
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<InventorySearchResultsPaged>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    let  site                = this.siteService.getAssignedSite()
    if (this.site) { site = this.site}
    return this.inventoryAssignmentService.getInventory(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
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

    // this.setRefreshAgGrid(2000)
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
    this.manifestService.updateInventoryItems(this.gridApi.getSelectedRows())
    this.id = selectedRows[0].id;
    this.getInventoryHistory(this.id)
  }

  async getInventoryHistory(id: any) {
    const site = this.siteService.getAssignedSite();
    this.id = id;
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

    // if(rowData && rowData.hasIndicator) {
      return 'edit';
    // }
    return '';
  }

  getManifestIcon(rowData) {
    if ( rowData && rowData.manifestID != 0 ) {
      return 'warehouse'
    }
    return ''
  }

  getIcon(rowData)
  {
    if(rowData && rowData.hasIndicator) {
      return 'warehouse';
    }
    return '';
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

  editItemWithId(id: any) {
    this.openInventoryDialog(id);
  }

  ///move to inventoryAssignemtnService
  openInventoryDialog(id: number) {

    const dialogRef = this.dialog.open(NewInventoryItemComponent,
      { width:        '800px',
        minWidth:     '800px',
        height:       '750px',
        minHeight:    '750px',
        data : {id: id}
      },
    )

    if (dialogRef) {
    dialogRef.afterClosed().subscribe(result => {

      if (result && result != 'false') {
        // this.outputRefresh.emit('true')
        this.id = 0;
        this.inventoryAssignment = null;
      }

      });
    }

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

  get isDistributor(): boolean {
    const site = this.siteService.getAssignedSite();
    if (this.currentManifest) {
      if (this.currentManifest.originatorID == undefined || this.currentManifest.sourceSiteID == site.id) {
        return true;
      }
    }
    return false;
  }

  get isSiteSatellite(): boolean {
    const site = this.siteService.getAssignedSite();
    if (this.currentManifest) {
      if (this.currentManifest.originatorID != undefined || this.currentManifest.originatorID != 0) {
        return true;
      }
    }
    return false;
  }

  validateSiteSelectedForManifest(): boolean {
    if (this.selectedSiteID == 0 || this.selectedSiteID == undefined)  {
      this.notifyEvent('Please selecte a site.', 'Alert')
      return false
    }
    return true
  }

  validateItemsSelectedForManifest(): boolean {
    const items = this.gridAPI.getSelectedRows();
    let result = true
    items.forEach( inv => {
      const item = inv  as IInventoryAssignment;
      if (item) {
        console.log(item?.manifestID, item.manifestID)
        if (item.manifestID != null && item.manifestID != 0) {
          this.notifyEvent('You have selected items already assigned to a manifest. Please reselect items.', 'Alert')
          result = false
        }
      }
    })
    return result;
  }

  validateRevoval() {
    const result = window.confirm("Are you sure you want to remove these from the manifest?")
    const site = this.siteService.getAssignedSite();
    if (!result) { return false }
    if (this.isAuthorized) { return true }
    if (this.currentManifest) {
        if (this.isSiteSatellite) { return false }
        if (this.currentManifest.acceptedDate) { return false }
        if (this.isDistributor)   {
          return false
        }
    }
    return true;
  }

  addItemsToManifest() {

    if (!this.validateItemsSelectedForManifest()) { return }

    const items = this.gridAPI.getSelectedRows();

    if (!this.currentManifest) {
      this.notifyEvent('No current manifest exists.', 'Alert')
      return
    }

    const manifest = {} as InventoryManifest
    if (!manifest.inventoryAssignments) { manifest.inventoryAssignments = [] as IInventoryAssignment[]}
    try {
      manifest.inventoryAssignments = [ ...items, ... manifest.inventoryAssignments]
    } catch (error) {
      console.log('error', error)
    }

    this.manifestService.inventoryItems$.subscribe(data => {
      const items  = data;
      manifest.inventoryAssignments = items;
      const site = this.siteService.getAssignedSite()
      if (site) {
          manifest.sourceSiteID = site.id;
          manifest.sourceSiteName = site.name;
          manifest.sourceSiteURL = site.url;
          this.manifestService.add(site, manifest).subscribe(data => {
            this.manifestService.updateSelectedManifestSite(site)
            this.openManifestEditor(data)
          }
        )
      }
    })

  }



  rejectFromManifest(){
    let selectedRows = this.gridApi.getSelectedRows();
    const selected   = selectedRows as IInventoryAssignment[]
    this.rejectManifest(selected);
  }

  rejectAllFromManifest() {
    if (!this.currentManifest) {
      this.notifyEvent('No Current Manifest', 'Alert')
      return }
    this.rejectManifest(this.currentManifest.inventoryAssignments)
  }

  setAcceptedSelected() {
    if (!this.currentManifest) { return  }

    let  selectedRows = this.gridApi.getSelectedRows();
    let  selected     = selectedRows as IInventoryAssignment[];

    this.acceptItemsFromManifest(selected);
  }

  setAcceptedAll() {
    if (!this.currentManifest) { return }
    this.acceptItemsFromManifest(this.currentManifest.inventoryAssignments)
  }

  //reject manifest
  //takes list of items, prompts for rejection note
  //applies rejection note to items selected
  //sets items to not be sold (disabled)
  //sets items not to be active.
  //to determine the difference between the source site notification and the detination it it uses the originatorID (source)
  //

  validateRejection(source, originatorID, selected): boolean {
    if (!source || !source.url) {
      this.notifyEvent('No Source', 'Failed')
      return false
    }
    if (!originatorID || originatorID == null) {
      this.notifyEvent('No Originator', 'Failed')
      return false
    }
    if (!selected) {
      this.notifyEvent('No selected', 'Failed')
      return false
    }
    return true;
  }

  rejectManifest(selected: IInventoryAssignment[]) {
    const result = this.validateRevoval()
    if (!this.currentManifest) {
      this.notifyEvent('No Current Manifest', 'Alert')
      return }
    if (!result)        { return false }
    if (!this.listOnly) { return }

    let destination = {} as ISite;
    destination.url = this.currentManifest.destinationURL;

    let source = {} as ISite;
    source.url = this.currentManifest.sourceSiteURL;

    const data = this.openRejection(this.currentManifest)
      let originatorID = this.currentManifest.originatorID;

      if (originatorID == 0 || originatorID == null || !originatorID) {
        originatorID   = this.currentManifest.id;
      }

      // const dest$         = this.inventoryAssignmentService.putInventoryAssignmentList(destinationSite, this.currentManifest.id,  selected);
      data.afterClosed().subscribe(
        message => {
          const items = this.assignRejectionMessage(message.toString(), selected);
          this.currentManifest.inventoryAssignments  = items;

          if (!this.validateRejection) { return }

          const assignMent$ =    this.inventoryAssignmentService.postInventoryAssignmentList(source, originatorID, items);
          assignMent$.pipe(
            switchMap(data => {
              if (originatorID != this.currentManifest.id) {
                return  this.inventoryAssignmentService.postInventoryAssignmentList(destination, this.currentManifest.id, items)
              }
              return of('success')
            })).subscribe(
              {next: data => {
                this.notifyEvent('Items Rejected', 'Completed')
                this.refreshGrid();
              },
              error: error => {
                this.notifyEvent(`Error ${error}`, 'Error Occured')
              }
          });
        })

  }


  assignRejectionMessage(message: string, selected:IInventoryAssignment[]): IInventoryAssignment[] {
    const allItems =  this.getItemsFromManifest(selected)

    if (allItems){
      allItems.forEach( data => {
        data.rejected = message;
      })
    }

    return allItems
  }

  getItemsFromManifest(selected: IInventoryAssignment[]) {
    const allItems =  this.currentManifest.inventoryAssignments;
    let newList = [] as  IInventoryAssignment[];
    selected.forEach( data => {
      allItems.find( item => {
          if ( item.id == data.id ) {
            newList.push(item)
          }
        })
      }
    );
    return newList
  }

  acceptItemsFromManifest(selected: IInventoryAssignment[]) {
    // const result = this.validateRevoval()
    if (!this.currentManifest) {
      this.notifyEvent('No Current Manifest', 'Alert')
      return
    }

    let destination = {} as ISite;
    destination.url = this.currentManifest.destinationURL;

    let source = {} as ISite;
    source.url = this.currentManifest.sourceSiteURL;

    let originatorID = this.currentManifest.id;

    selected  = this.getItemsFromManifest(selected);

    selected.forEach(data => {
      if (!data.rejected) {
        data.notAvalibleForSale = false;
        data.requiresAttention = false;
      }
    })

    const assignMent$ =    this.inventoryAssignmentService.postInventoryAssignmentList(destination, originatorID, selected);
      assignMent$.subscribe(
          {next: data => {
            this.notifyEvent('Items Accepted', 'Completed')
            this.refreshGrid();
          },
          error: error => {
            this.notifyEvent(`Error ${error}`, 'Error Occured')
          }
      });

  }


  openRejection(manifest: InventoryManifest ) {
    let dialogRef: any;
    // const site = this.siteService.getAssignedSite();
    // this.menuService.getProduct(site, id).subscribe( data=> {
    //   const productTypeID = data.prodModifierType
    //   this.openProductEditor(id, productTypeID)
      const site = this.siteService.getAssignedSite();
      if (manifest) {
        let action      = {}  as OperationWithAction;
        action.action   = 4;
        action.manifest  = manifest;
        action.id        = manifest.id
        console.log('adjust payment component')
        dialogRef = this.dialog.open(AdjustPaymentComponent,
          { width:        '450px',
            minWidth:     '450px',
            height:       '400px',
            minHeight:    '400px',
            data     : action
        })
        return dialogRef
      }

  }

  removeSelectedFromManifest() {

    const result = this.validateRevoval()
    if (!result)       { return false }
    if (!this.listOnly){ return }

    const site = this.siteService.getAssignedSite()
    let selectedRows = this.gridApi.getSelectedRows();
    const selected   = selectedRows as IInventoryAssignment[];
    site.url = this.currentManifest.sourceSiteURL;

    const item$ =  this.inventoryAssignmentService.assignItemsToManifest(site, 0, selected)
    item$.pipe(
      switchMap(data => {
        return this.manifestService.get(site, this.currentManifest.id)
      })
    )
    .subscribe( data => {
      this.manifestService.updateCurrentInventoryManifest(data)
      this.refreshGrid()
    })

  }

  addToNewManifest() {

    if (!this.validateItemsSelectedForManifest()) { return }
    const items = this.gridAPI.getSelectedRows();

    if (!items) {
      this.notifyEvent('Please select some items to add to the new manifest', 'Alert')
      return;
    }

    const manifest = {} as InventoryManifest
    try {
      if (!manifest.inventoryAssignments) { manifest.inventoryAssignments = [] as IInventoryAssignment[]}
    } catch (error) {
      console.log('error', error)
    }

    try {
      manifest.inventoryAssignments = [ ...items, ... manifest.inventoryAssignments]
    } catch (error) {
      console.log('error', error)
    }
    const site = this.siteService.getAssignedSite()

    if (site) {
        manifest.sourceSiteID   = site.id;
        manifest.sourceSiteName = site.name;
        manifest.sourceSiteURL  = site.url;
        this.manifestService.add(site, manifest).subscribe(data => {
          this.manifestService.updateCurrentInventoryManifest(data)
          this.openManifestEditor(data)
        })
    }

  }

  clearAssignedManifest() {
    this.manifestService.updateCurrentInventoryManifest(null)
  }

  getSelectedItems(): IInventoryAssignment[] {
    const items = this.gridAPI.selectAll
    return null;
  }

  openManifestEditor(manifest: InventoryManifest) {
    let dialogRef: any;
    // const site = this.siteService.getAssignedSite();
    // this.menuService.getProduct(site, id).subscribe( data=> {
    //   const productTypeID = data.prodModifierType
    //   this.openProductEditor(id, productTypeID)
    if (manifest) {
      // dialogRef = this.dialog.open(MainfestEditorComponent,
      //   { width:          '800px',
      //     minWidth:       '399px',
      //     height:         '800px',
      //     minHeight:      '650px',
      //     data : manifest
      // })
      // return dialogRef
      this.manifestService.openManifestForm(manifest.id)
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


