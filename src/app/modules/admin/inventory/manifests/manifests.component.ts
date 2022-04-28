import { Component, ElementRef, EventEmitter, OnInit, ViewChild, Output, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subject  } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { InventoryAssignmentService, IInventoryAssignment, InventoryFilter, InventorySearchResultsPaged, InventoryStatusList } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite, IUserProfile } from 'src/app/_interfaces';
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
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { Capacitor,  } from '@capacitor/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, ContactsService, IItemBasicB, MenuService } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { InventoryManifest, ManifestInventoryService, ManifestSearchModel, ManifestSearchResults } from 'src/app/_services/inventory/manifest-inventory.service';


@Component({
  selector: 'app-manifests',
  templateUrl: './manifests.component.html',
  styleUrls: ['./manifests.component.scss']
})
export class ManifestsComponent implements OnInit {

  manifestSearchModel:         ManifestSearchModel
  manifestSearchResults:       ManifestSearchResults;
  inventoryManifest          : InventoryManifest;
  inventoryAssignments               : IInventoryAssignment[];
  selectedInventoryAssignments       : IInventoryAssignment[];


  id:                   any;
  item:                 string;
  search:               string;
  searchPhrase:         Subject<any> = new Subject();
  public searchForm: FormGroup;
  inventoryManifests$             : Subject<InventoryManifest[]> = new Subject();

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

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

  //search form filters
  inputForm        : FormGroup;
  productTypeID    : number;
  typeID           : number;
  brandID          : number;
  active           : boolean;
  viewAll           = 1;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions
  urlPath:         string;
  value           : any;

  smallDevice     : boolean;
  gridlist        = "grid-list"
  sites$:               Observable<ISite[]>;
  site:                 ISite;
  selectedSiteID:       number;

  inventoryStatusList  = this.inventoryAssignmentService.inventoryStatusList;
  inventoryStatus:      InventoryStatusList
  locations$:           Observable<IInventoryLocation[]>;
  inventoryLocation:    IInventoryLocation;
  inventoryLocationID:  number;

  get searchProductsValue() { return this.searchForm.get("searchProducts") as FormControl;}
  get selectedSiteValue()   { return this.searchForm.get("selectedSiteID") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  constructor(private _snackBar: MatSnackBar,
              private inventoryAssignmentService: InventoryAssignmentService,
              private inventoryManifestService: ManifestInventoryService,
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
          ) { }

  ngOnInit(): void {
    this.initClasses();
    this.sites$         = this.siteService.getSites();
    this.locations$     = this.locationService.getLocations();


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
    })
  }

  refreshSearchOut(event) {
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

    let item = {headerName: 'id',  sortable: true, field: 'id',  hide: true, } as any;

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

    this.rowSelection = 'single';

    this.gridOptions = this.agGridFormatingService.initGridOptions(this.pageSize, this.columnDefs);
  }

  listAll(){
    const control = this.itemName
    if (control) {
      control.setValue('')
    }
    this.refreshSearch()
  }

  initSearchModel(): ManifestSearchModel {
    let searchModel         = {} as ManifestSearchModel;
    searchModel.name        = this.search
    searchModel.pageSize    = this.pageSize
    searchModel.pageNumber  = this.pageNumber
    this.id                 = 0
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

  refreshActiveChange(event) {
    this.viewAll = event;
    this.refreshSearch();
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

  addManifest() {
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
    })
  }

  getAssignedSite(): ISite {
    if (this.site) {
      return this.site
    } else {
      return  this.siteService.getAssignedSite()
    }
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
          return
        }
      }
    )
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<ManifestSearchResults>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.inventoryManifestService.searchManifest(site, searchModel)
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
    // this.getInventoryHistory(this.id)
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

