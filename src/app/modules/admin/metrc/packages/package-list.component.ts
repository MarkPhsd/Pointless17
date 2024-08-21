import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, Input, } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import {  catchError, Observable, of, Subject, switchMap  } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import  {GridApi, IGetRowsParams, } from '@ag-grid-community/all-modules';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ImportPackages, MetrcPackagesService, PackageSearchResultsPaged } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage, PackageFilter }  from 'src/app/_interfaces/metrcs/packages';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { METRCProductsAddComponent } from 'src/app/modules/admin/metrc/packages/metrc-products-add/products-add.component';
import { StrainsAddComponent } from 'src/app/modules/admin/metrc/packages/strains-add/strains-add.component';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { ISite } from 'src/app/_interfaces';
import { Capacitor } from '@capacitor/core';

import {
  METRCItems,
  METRCItemsCategories,
  MetrcItemsBrands,
  METRCItemsCreate,
  METRCItemsUpdate
} from 'src/app/_interfaces/metrcs/items';
import { METRCFacilities } from 'src/app/_interfaces/metrcs/facilities';
import { MetrcFacilitiesService } from 'src/app/_services/metrc/metrc-facilities.service';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector    : 'app-package-list',
  templateUrl : './package-list.component.html',
  styleUrls   : ['./package-list.component.scss']
})

export class PackageListComponent implements OnInit {

  @ViewChild('agGrid') agGrid: AgGridAngular;
  //for list selecting.
  @Input() hideAdd         : boolean;
  @Input() hideEditSelected: boolean;
  @Input() editOff         : boolean;
  buttonName: string; //if edit off then it's 'Assign'
  gridlist = "grid-list"

  //needed for search component
  searchForm:    UntypedFormGroup;
  errorMessage: string;
  message: string;

  get itemName() {
    if (this.searchForm) {
      return this.searchForm.get("itemName") as UntypedFormControl;
    }
  }
  get hasImportedControl() { return this.searchForm.get("hasImported") as UntypedFormControl;}
  get activeControl() { return this.searchForm.get("active") as UntypedFormControl;}

  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }

  @ViewChild('input', {static: true}) input: ElementRef;
  get platForm() {  return Capacitor.getPlatform(); }
  action$ : Observable<any>;

  params               : any;
  private gridApi      : GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions          : any
  columnDefs           = [];
  defaultColDef        ;
  frameworkComponents = { btnCellRenderer: ButtonRendererComponent };
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
  isfirstpage             : boolean;
  islastpage              : boolean;
  selected            : any;
  id                  : number;
  value               : string;
  metrcCategory$ :  Observable<METRCItemsCategories[]>;
  metrcCategory  :  METRCItemsCategories;
  metrcCategoryID:  number;
  label          :  string;

  siteID: number;
  sites$: Observable<ISite[]>;
  sites: ISite[];
  site: ISite;
  facilityNumber: string;
  facility    : METRCFacilities;
  facilities$ :  Observable<METRCFacilities[]>;
  facilities  : METRCFacilities[];
  facilityID  : number;

  // hasImported = false;
  downloadVisible:  boolean;
  selectedSiteID:   number;
  loadingFacilities: boolean;

  metrcPackage : METRCPackage;
  metrcPackages: METRCPackage[];
  metrcPackages$: Observable<METRCPackage[]>;
  importing     = false;

  gridDimensions: string;
  agtheme        = 'ag-theme-material';

  scheduleDateForm  : UntypedFormGroup;
  scheduleDateFrom  : any;
  scheduleDateTo    : any;

  packageImport: ImportPackages;

  urlPath : string;
  viewAll           = 1;
  viewOptions$     = of(
    [
      {name: 'Active', id: 1},
      {name: 'All', id: 0},
      {name: 'Inactive', id: 2}
    ]
  )

  // mETRCPackagesGet$ = this.searchPhrase.pipe(
  //   debounceTime(250),
  //   distinctUntilChanged(),
  //   switchMap(searchPhrase =>
  //       this.refreshSearch(searchPhrase)
  //   )
  // )

  // //This is for the search Section//
  // get searchProductsValue() { return this.searchForm.get("itemname") as FormControl;}
  private readonly onDestroy = new Subject<void>();
  search: string;
  // mETRCPackagesGet$: Observable<METRCPackage[]>;
  //This is for the search Section//
  searchPaging: boolean;

  constructor(  private _snackBar: MatSnackBar,
                private router: Router,
                private fb: UntypedFormBuilder,
                private dialog: MatDialog,
                private agGridService         : AgGridService,
                private agGridFormatingService: AgGridFormatingService,
	              public  route                  : ActivatedRoute,
                private metrcPackagesService  : MetrcPackagesService,
                private siteService           : SitesService,
                private metrcCategoriesService: MetrcItemsCategoriesService,
                private metrcFacilityService  : MetrcFacilitiesService,
              )
  {

  }

  ngOnInit(): void {

    this.initPackageSearch()
    this.scheduleDateForm = this.getFormRangeInitial(this.scheduleDateForm)

    this.metrcCategory$ = this.metrcCategoriesService.getCategories().pipe(switchMap(data => {
      if (!data) {
        this.siteService.notify('pleae download categories', 'close', 3000)
      }
      return of(data)
    }))

    this.initClasses();
    this.initForm();
    this.initAGGrid()
  }

  initGridResults() {
    this.initAGGrid()
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100,
    };
  }

  initForm() {
    const site = this.siteService.getAssignedSite();
    const metrcLicenseNumber = site.metrcLicenseNumber
    this.searchForm = this.fb.group( {
      itemName: [''],
      metrcCategory : [''],
      selectedSiteID: [],
      facilityID    : [metrcLicenseNumber],
      active        : [''],
      hasImported   : [''],
      numberOfdays  : [10],
    });


    this.sites$ = this.siteService.getSites()
    .pipe(switchMap(data => {
      if (data) {
        this.selectedSiteID  = data[0].id
        this.site = data[0]
        this.searchForm.patchValue({selectedSiteID: this.site?.id})
        // console.log(this.searchForm.value)
        this.packageImport.siteID = this.selectedSiteID
        this.refreshFilters(this.site)
      }
      this.sites = data;
      return of(data)
    }))

  }

  initClasses()  {
    const platForm = this.platForm;
    this.gridDimensions   = 'width: 100%; height: 90%;'
    // agtheme            = 'ag-theme-alpine-dark';
    this.agtheme          = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions = 'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }

  initAGGrid() {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };

    this.defaultColDef = {
      flex: 2,
      // minWidth: 100,
    };
    this.columnDefs =  [
     {
       field: "id",
       cellRenderer: "btnCellRenderer",
       cellRendererParams: {
         onClick: this.editProductFromGrid.bind(this),
         label: 'Intake',
         getLabelFunction: this.getLabel.bind(this),
         btnClass: 'agGridButton',
         minWidth: 155,
         maxWidth: 155,
         flex: 2,
       },
     },
      {headerName: 'Label', field: 'label', sortable: true, minWidth: 225},
      {headerName: 'Source',  sortable: true, field: 'itemFromFacilityLicenseNumber',},
      {headerName: 'Strain/Product', field: 'item.name', sortable: true},
      {headerName: 'Quantity', field: 'quantity', sortable: true},
      {headerName: 'UOM', field: 'unitOfMeasureName', sortable: true},
      {headerName: 'Package Date', field: 'packagedDate', sortable: true,},
      {headerName: 'Category', field: 'productCategoryName', sortable: true,},
      {headerName: 'Type', field: 'packageType', sortable: true,},
    ]
    // this.initGridOptions()
    const filter = this.initSearchModel();
    if (filter.pageSize == 0) {filter.pageSize = 25}
    this.gridOptions = this.agGridFormatingService.initGridOptions(filter.pageSize, this.columnDefs);

  }

  setFacliity(event) {
    if (event) {
       this.facilityNumber = event;
    }
  }

  refreshFilters(event) {

    this.initSiteSelection()
    this.getAssignedSiteSelection(event)
    if (this.site) {
      this.facilities$ = this.metrcFacilityService.getFacilities(this.site)
      this.loadingFacilities = true;
      this.facilities$.subscribe(data => {
        this.facilities = data;
        this.loadingFacilities = false;
        this.facility = {} as METRCFacilities;
        this.facilityNumber = this.site.metrcLicenseNumber
        const item = {facilityID: this.site.metrcLicenseNumber }
        this.searchForm.patchValue(item)
      })
    }
  }

  initSiteSelection() {
    this.facilityNumber = '';
    this.site = null;
  }

  getAssignedSiteSelection(event) {
    if (event) {
      this.selectedSiteID = event.value;
      this.siteID         = event.id;
      this.site           = event as ISite;
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
    this.metrcCategoryID = event
    // console.log(this.metrcCategory, event)
    if (this.metrcCategoryID == 0) {
      this.metrcCategory = null
      this.refreshSearch()
      return
    }

    if (event) {
      this.metrcCategoryID = event
      this.assignMetrcCategory(this.metrcCategoryID);
    }
  }

  assignMetrcCategory(id: number) {
    this.metrcCategoriesService.getCategory(id).subscribe( data => {
      this.metrcCategory = data
      this.refreshSearch()
    })
  }

  reset() {
    this.initUI()
    this.action$ = null;
  }

  initUI() {
    this.errorMessage= ''
    this.importing = false
    this.message = ''
  }
  refreshSearchPhrase(event) {
    // if ( !this.itemName) { return }
    // this.itemName.setValue(event)
    // this.refreshSearch();

    const item = { itemName: event }
    this.searchForm.patchValue(item)
    this.refreshSearch();
  }

  importActiveBySearch() {
    if (this.site) {
      const facility = this.facilityNumber
      this.importing = true
      this.errorMessage= ''

      this.packageImport.startDate = this.scheduleDateForm.get("start").value;
      this.packageImport.endDate   = this.scheduleDateForm.get("end").value;

      let  search = this.packageImport
      search.facility = this.facilityNumber // this.facility.name;
      if (!search.startDate || !search.endDate) {
        this.notify('Dates have not been set', 'Close', 5000);
        return;
      }

      // console.log(search)
      // return;
      this.action$ = this.metrcPackagesService.importActiveBySearch(this.site, search).pipe(switchMap (data => {
        this.importing = false
        this.setMessage(data)
        this.refreshSearch();
        return of(data)
      })),catchError(data => {
        this.initUI()
        return of(data)
      })
    }
  }

  importActivePackages() {
    if (this.site) {
      const facility = this.facilityNumber
      this.importing = true
      this.action$ = this.metrcPackagesService.importActiveByDaysBack(this.site, this.getNumberOfDays() ,facility).pipe(switchMap (data => {

        this.importing = false
        this.setMessage(data)
        return of(data)
      })),catchError(data => {
        this.initUI()
        return of(data)
      })

    }
  }

  setMessage(data:PackageSearchResultsPaged) {
    if (data) {
      this.errorMessage = data?.errorMessage;
      this.message = data?.message
    }
  }

  resetImportActivePackages() {
    const result = window.confirm('This will delete the packages and re-import, are you sure you want to do this?')
    if (!result ) { return }
    if (this.site) {
      const facility = this.facilityNumber
      this.importing = true
      const import$ = this.metrcPackagesService.resetImportActivePackages(this.site, this.getNumberOfDays(), facility)
      import$.subscribe(data => {

        this.setMessage(data)
        this.importing = false
        this.refreshSearch();
      }, err=> {
        this.notify(`Import error occured. Check your settings and try again. ${err}`, `Please try Again`, 2000 )
        this.importing = false
      })
    }
  }

  getNumberOfDays(){
    if (this.searchForm) {
      let daysBack = this.searchForm.controls['numberOfdays'].value as number
      if (daysBack == 0) { daysBack = 10}
      return daysBack
    }
    return 10;
  }

  notify(message, title, duragtion) {
    this._snackBar.open(message, title, {
      duration: duragtion,
      verticalPosition: 'top'
    });
  }

  refreshSearch() {
    const site               = this.siteService.getAssignedSite()
    const packageFilter      = this.initSearchModel();
    this.onGridReady(this.params)
  }

  refreshGrid() {
    const site               = this.siteService.getAssignedSite()
    // const productSearchModel = this.initSearchModel();
    this.onGridReady(this.params)
  }

  initSearchModel(): PackageFilter {
    const searchModel       = {} as PackageFilter

    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage

    if (this.activeControl && this.activeControl.value) {
      searchModel.active = 0
    }

    if (this.hasImportedControl &&  this.hasImportedControl.value) {
      searchModel.hasImported = this.hasImportedControl.value
    }

    if (this.itemName) {
      searchModel.productName = this.itemName.value
      searchModel.label       = this.itemName.value
    }

    if (this.metrcCategory) {  searchModel.productCategoryName =   this.metrcCategory.name }
    return searchModel;
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
  getRowData(params, startRow: number, endRow: number):  Observable<PackageSearchResultsPaged>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const productSearchModel  = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.metrcPackagesService.getPackagesBySearch(site, productSearchModel)
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
            const resp         =  data.paging
            if (!resp) {return}
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount

            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            let results        =  data.results
            params.successCallback(results)
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
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

  refreshActiveChange(event) {
    this.viewAll = event;
    this.refreshSearch();
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
    this.getItem(this.label)
    this.getItemHistory(this.id)
  }

  getItem(label: string) {
    if (label) {
      const site = this.siteService.getAssignedSite();
      const facility = this.facilityNumber;
      if (facility) {
        this.metrcPackagesService.getPackagesByLabel(site, label, facility).subscribe(data => {
           this.metrcPackage[0] = data;
          }
        )
      }
    }
  }

  async getItemHistory(id: any) {
    const site = this.siteService.getAssignedSite();
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  getLabel(rowData)
  {
    return 'Intake'
  }

  onBtnClick1(e) {
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    this.rowDataClicked2 = e.rowData;
  }

  editProductFromGrid(e) {
    if (e.rowData.id)  {
      this.getPackage(e.rowData.id);
    }
  }

  async getPackage(id:any) {
    if (!this.site) { this.site = this.siteService.getAssignedSite();}

    const metrc$ = this.metrcPackagesService.getPackagesByID(id, this.site)

    metrc$.subscribe( data => {
        if (data.item.quantityType === 'WeightBased') {
          this.openStrainsDialog(data.id)
          return
        }
        if (data.item.quantityType === 'CountBased') {
          this.openProductsDialog(data.id)
          return
        }
      }
    )
  }

  editProduct(e){
    this.notifyEvent(`Event ${e}`, "Success")
    this.router.navigate(["/productedit/", {id:e.id}]);
  }

  onDeselectAll() {
  }

  onSortByNameAndPrice(sort: string) {
  }

  openStrainsDialog(id: any) {
    const dialogConfig = [
      { data: { id: id } }
    ]
    const dialogRef = this.dialog.open(StrainsAddComponent,
      { width:      '95vw',
        minWidth:   '1000px',
        height:     '90vh',
        minHeight:  '800px',
        data : {id: id}
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      // if (result && result.completed) {
        this.refreshGrid()
      // }
    });
  }

  openProductsDialog(id: any) {
    const dialogConfig = [
      { data: { id: id } }
    ]
    const dialogRef = this.dialog.open(METRCProductsAddComponent,
      { width:      '95vw',
        minWidth:   '1000px',
        height:     '90vh',
        minHeight:  '800px',
        data : {id: id}
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      // if (result && result.completed || (result)) {
        this.refreshGrid()
      // }
    });
  }

  deleteRow() {
    try {
      //refresh Grid
    } catch (error) {
      console.log('delete Row')
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


  initPackageSearch() {

    if (!this.packageImport) {
      this.packageImport = {} as ImportPackages
      this.packageImport.startDate = null;
      this.packageImport.endDate = null;
      return;
    }

    this.packageImport.startDate = this.scheduleDateForm.get("start").value;
    this.packageImport.endDate   = this.scheduleDateForm.get("end").value;
    this.packageImport.siteID = this.site.id;
    this.packageImport.facility = this.facilityNumber;
  }

  getFormRangeInitial(inputForm: UntypedFormGroup) {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    return  this.fb.group({
      start: new Date(year, month, 1),
      end: new Date()
    })
  }
}


