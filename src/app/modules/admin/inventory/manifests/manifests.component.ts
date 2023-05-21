import { Component, ElementRef, EventEmitter, OnInit, ViewChild, Output, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subject, Subscription  } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { InventoryAssignmentService, IInventoryAssignment, InventoryFilter, InventorySearchResultsPaged, InventoryStatusList } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite, IUserProfile } from 'src/app/_interfaces';
import { InventoryLocationsService } from 'src/app/_services/inventory/inventory-locations.service';
import { IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { IGetRowsParams,  GridApi,  } from '@ag-grid-community/all-modules';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { Capacitor,  } from '@capacitor/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IItemBasicB } from 'src/app/_services';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { InventoryManifest, ManifestInventoryService, ManifestSearchModel, ManifestSearchResults } from 'src/app/_services/inventory/manifest-inventory.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manifests',
  templateUrl: './manifests.component.html',
  styleUrls: ['./manifests.component.scss']
})
export class ManifestsComponent implements OnInit {

  searchModel:                  ManifestSearchModel
  _searchModel                 : Subscription;
  manifestSearchResults:        ManifestSearchResults;
  inventoryManifest            : InventoryManifest;
  inventoryAssignments         : IInventoryAssignment[];
  selectedInventoryAssignments : IInventoryAssignment[];

  id:                   any;
  item:                 string;
  search:               string;
  searchPhrase:         Subject<any> = new Subject();
  public searchForm: UntypedFormGroup;
  inventoryManifests$             : Subject<InventoryManifest[]> = new Subject();

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  get itemName() {
    if (!this.searchForm) { this.initForm()}
    if (this.searchForm) {
      return this.searchForm.get("itemName") as UntypedFormControl;
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
  buttonName       = 'Edit'
  brands           : IUserProfile[];
  categories$      : Observable<IMenuItem[]>;
  departments$     : Observable<IMenuItem[]>;
  productTypes$    : Observable<IItemBasicB[]>;
  viewOptions$     = of(
    [
      {name: 'Active', id: 1},
      {name: 'All', id: 2},
      {name: 'Inactive', id: 0}
    ]
  )

  //search form filters
  inputForm        : UntypedFormGroup;
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

  inventoryActiveList  = this.inventoryAssignmentService.inventoryActiveList;
  inventoryActive      : any;
  locations$:           Observable<IInventoryLocation[]>;
  inventoryLocation:    IInventoryLocation;
  inventoryLocationID:  number;

  get searchProductsValue() { return this.searchForm.get("searchProducts") as UntypedFormControl;}
  get selectedSiteValue()   { return this.searchForm.get("selectedSiteID") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  constructor(private _snackBar: MatSnackBar,
              private inventoryAssignmentService: InventoryAssignmentService,
              private inventoryManifestService: ManifestInventoryService,
              private fb: UntypedFormBuilder,
              private siteService: SitesService,
              private locationService: InventoryLocationsService,
              private inventoryEditButon     : InventoryEditButtonService,
              private datePipe               : DatePipe,
              private agGridFormatingService : AgGridFormatingService,
          ) { }

  ngOnInit(): void {
    this.initClasses();
    this.sites$         = this.siteService.getSites();
    this.locations$     = this.locationService.getLocations();
    this.initForm();
    this.initAgGrid();
    this.initSearchSubscription();
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
      statusID      :     [''],
      activeStatus  :     [''],
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

    this.columnDefs = [];
    // let item = {headerName: 'id',  sortable: true, field: 'id',  hide: true, } as any;

    let button =    {
      field: 'id',
      cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                      onClick: this.editItemFromGrid.bind(this),
                      label: this.buttonName,
                      getLabelFunction: this.getLabel.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 125,
                    maxWidth: 125,
                    flex: 2,
    }

    this.columnDefs.push(button)

    let item =  {headerName: 'Name',  sortable: true, field: 'name',
                width   : 150,
                minWidth: 150,
                maxWidth: 150,
                flex    : 2,} as any;
    this.columnDefs.push(item)

    item =  {headerName: 'Scheduled', field: 'scheduleDate', sortable: true,
              cellRenderer: this.dateCellRenderer,
              width   : 150,
              minWidth: 150,
              maxWidth: 150,
              flex    : 1,
              } as any;
    this.columnDefs.push(item)

    item = {headerName: 'Sent', field: 'sendDate', sortable: true,
              cellRenderer: this.dateCellRenderer,
              width   : 150,
              minWidth: 150,
              maxWidth: 150,
              flex    : 1,
               }
    this.columnDefs.push(item)

    item =  {headerName: 'Accepted', field: 'acceptedDate', sortable: true,
              cellRenderer: this.dateCellRenderer,
              width   : 125,
              minWidth: 125,
              maxWidth: 125,
              flex    : 1,
          }
    this.columnDefs.push(item)

    item = {headerName: 'Destination', field: 'destinationSiteName', sortable: true,
              width   : 150,
              minWidth: 150,
              maxWidth: 150,
              flex    : 1,
              }
    this.columnDefs.push(item)

    item = {headerName: 'Source', field: 'sourceSiteName', sortable: true,
        width   : 150,
        minWidth: 150,
        maxWidth: 150,
        flex    : 1,
        }
    this.columnDefs.push(item)

    item =   {
      headerName: "active",
      width:    100,
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
      field: "active",
      cellRenderer: function(params) {
          var input = document.createElement('input');
          input.type="checkbox";
          input.checked=params.value;
          input.disabled = true;
          input.addEventListener('click', function (event) {
              params.value=!params.value;
              params.node.data.fieldName = params.value;
          });
          return input;
    }}

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
    if (!this.searchModel) {
      this.searchModel = {} as ManifestSearchModel
    }
    this.searchModel.name        = this.search
    this.searchModel.pageSize    = this.pageSize
    this.searchModel.pageNumber  = this.currentPage;

    if (this.inventoryActive) {
      this.searchModel.activeStatus = this.inventoryActive.id;
    }
    console.log(this.searchModel)
    this.id                      = 0
    return this.searchModel
  }

  refreshSearchPhrase(event) {
    if (this.itemName) {
      const item = { itemName: event }
      this.searchForm.patchValue(item)
      this.search = event;
      this.refreshSearch();
    }
  }

  initSearchSubscription() {
    this._searchModel = this.inventoryManifestService.searchModel$.subscribe( data => {
        this.searchModel          = data;

        if (!this.searchModel) {
          const searchModel       = {} as ManifestSearchModel;
          this.currentPage        = 1
          searchModel.pageNumber  = 1;
          searchModel.pageSize    = 25;
          this.searchModel        = searchModel
          console.log('data initSearchSubscription',  this.searchModel )
        }

        this.refreshSearch();

      }
    )
  }

  refreshActiveChange(event) {
    this.viewAll = event;
    this.refreshSearch();
  }

  refreshSearch() {
    this.initSearchModel();
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
      const result =   this.inventoryEditButon.addManifest(0)
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
      this.refreshGrid();
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
      this.refreshGrid();
    })
  }

  getInventoryStatus(event) {
    if (event.value) {
      console.log(event.value)
      const item = this.assignInventoryStatus(event.value);
      console.log(item)
      console.log( this.inventoryActive)
      this.refreshSearch();
    } else {
      this.inventoryActive.id = 0
    }
  }

  assignInventoryStatus(name: string): InventoryStatusList {
    console.log(name)
    return  this.inventoryActive = this.inventoryActiveList.find(data =>
      {
        if ( data.name === name ) {
          this.inventoryActive = data;
          return data
        }
      }
    )
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<ManifestSearchResults>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    let site = this.site ;
    if (!site) {
      site = this.siteService.getAssignedSite();
    }
    return this.inventoryManifestService.searchManifest(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
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
      this.inventoryManifestService.openManifestForm(e.rowData.id);
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
    this.selectItem(search)
    this.item = search
    this.search = search
    return search;
  }

  selectItem(search){
    if (search) {
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

  dateCellRenderer(params: any) {
    if (!params.value || params.value == undefined || params.value === '') { return ''}
    const dateValue = params.value;
    try {
      if (this.datePipe) {
        return this.datePipe.transform(dateValue, 'MM/dd/yyyy')
      }
    } catch (error) {
      // console.log('error', error)
      return dateValue;
    }
    return ;
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}

