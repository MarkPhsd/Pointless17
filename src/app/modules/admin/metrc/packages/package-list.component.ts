import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, AfterViewInit, ViewChild, Output, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromEvent, Observable, Subject  } from 'rxjs';
import { of } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import {IDatasource, IGetRowsParams,  GridApi, GridOptions } from '@ag-grid-community/all-modules';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MetrcPackagesService } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage, PackageFilter }  from 'src/app/_interfaces/metrcs/packages';
import { MatDialog } from '@angular/material/dialog';
import { METRCProductsAddComponent } from 'src/app/modules/admin/metrc/packages/metrc-products-add/products-add.component';
import { StrainsAddComponent } from 'src/app/modules/admin/metrc/packages/strains-add/strains-add.component';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { ISite } from 'src/app/_interfaces';
import { Capacitor, Plugins } from '@capacitor/core';

import {
  METRCItems,
  METRCItemsCategories,
  MetrcItemsBrands,
  METRCItemsCreate,
  METRCItemsUpdate
} from 'src/app/_interfaces/metrcs/items';


@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss']
})

export class PackageListComponent implements OnInit,AfterViewInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  get platForm() {  return Capacitor.getPlatform(); }
  searchGridApi:        GridApi;
  searchGridColumnApi:  GridAlignColumnsDirective;
  searchGridOptions:    any;
  private gridApi:      GridApi;
  private gridColumnApi:GridAlignColumnsDirective;
  gridOptions:          any
  columnDefs = [];
  defaultColDef;
  frameworkComponents:  any;
  rowDataClicked1 = {};
  rowDataClicked2 = {};
  public rowData: any[];
  public info: string;
  paginationSize = 250
  currentRow = 1;
  currentPage = 1
  pageNumber = 1
  pageSize = 250
  numberOfPages = 1
  rowCount = 50
  searchPhrase:         Subject<any> = new Subject();

  metrcCategory$:   Observable<METRCItemsCategories[]>;
  metrcCategory:    METRCItemsCategories;
  metrcCategoryID:  number;

  sites$:           Observable<ISite[]>;
  site:             ISite;
  selectedSiteID:   number;
  searchProducts:   string;

  gridDimensions: string;
  agtheme        = 'ag-theme-material';

  mETRCPackagesGet$ = this.searchPhrase.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.refreshSearch(searchPhrase)
    )
  )

  //This is for the search Section//
  public searchForm: FormGroup;
  get searchProductsValue() { return this.searchForm.get("searchProducts") as FormControl;}
  private readonly onDestroy = new Subject<void>();
  search: string;
  // mETRCPackagesGet$: Observable<METRCPackage[]>;
  refreshGrid = true;
  //This is for the search Section//
  searchPaging: boolean;

  constructor(  private _snackBar: MatSnackBar,
                private router: Router,
                private agGridService: AgGridService,
                private fb: FormBuilder,
                private metrcPackagesService: MetrcPackagesService,
                private dialog: MatDialog,
	              public route: ActivatedRoute,
                private siteService: SitesService,
                private metrcCategoriesService: MetrcItemsCategoriesService,
              )
  {

  }

  initGridResults() {
    this.initAGGridFeatures()
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100,
    };
  }

  ngOnInit(): void {
    this.sites$ =          this.siteService.getSites();
    this.metrcCategory$ =  this.metrcCategoriesService.getCategories();

    this.initSearch();
    this.searchItems();
    this.initGridResults();
    this.refreshGrid = true
    if (!this.search) { this.search = ''}
    this.initClasses()
  }

  initSearch() {
    this.searchForm = this.fb.group( {
      searchProducts: [''],
      metrcCategory:  [''],
      selectedSiteID: [''],
    });

  }

  initClasses()  {
    const platForm = this.platForm;
    this.gridDimensions =  'width: 100%; height: 100%;'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 85%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 85%;' }
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement,'keyup')
            .pipe(
                filter(Boolean),
                debounceTime(250),
                distinctUntilChanged(),
                tap((event:KeyboardEvent) => {
                  const search  = this.input.nativeElement.value
                  this.refreshSearch(search);
                })
            )
          .subscribe();
  }



  // btnClass: 'btn btn-primary btn-sm', minWidth: 50
  initAGGridFeatures() {
    this.columnDefs =  [
      {
       field: "id",
       cellRenderer: "btnCellRenderer",
       cellRendererParams: {
         onClick: this.editProductFromGrid.bind(this),
         label: 'Intake',
         getLabelFunction: this.getLabel.bind(this),
         btnClass: 'agGridButton', minWidth: 60
       },
     },
      {headerName: 'Label', field: 'label', sortable: true, minWidth: 175},
      {headerName: 'Source',  sortable: true, field: 'itemFromFacilityLicenseNumber',},
      {headerName: 'Strain/Product', field: 'item.name', sortable: true},
      {headerName: 'Quantity', field: 'quantity', sortable: true},
      {headerName: 'UOM', field: 'unitOfMeasureName', sortable: true},
      {headerName: 'Package Date', field: 'packagedDate', sortable: true,},
      {headerName: 'Category', field: 'productCategoryName', sortable: true,},
      {headerName: 'Type', field: 'packageType', sortable: true,},
    ]
    this.initGridOptions()
  }

  initGridOptions()  {
    this.gridOptions = {
      pagination: true,
      paginationPageSize: 50,
      cacheBlockSize: 25,
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
      rowModelType: 'infinite',
      infiniteInitialRowCount: 2,
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


  searchLabels() {
    if (this.searchProductsValue.value) {
      const site = this.siteService.getAssignedSite()
      const packageFilter = this.getPackageFilter();
      packageFilter.label = this.searchProductsValue.value
      packageFilter.productName = this.searchProductsValue.value

      this.mETRCPackagesGet$ = this.metrcPackagesService.getActive(site, packageFilter)
    }
  }

  searchItems() {
    const packageFilter = this.getPackageFilter();
    const site = this.siteService.getAssignedSite()
    this.mETRCPackagesGet$ = this.metrcPackagesService.getActive(site, packageFilter)
  }

  // mETRCPackagesGet
  refreshSearch(search: string): Observable<METRCPackage[]> {
    const packageFilter = this.getPackageFilter();
    const site = this.siteService.getAssignedSite()

    if (this.metrcCategory) {  packageFilter.productCategoryName =   this.metrcCategory.name }
    packageFilter.productName = search
    packageFilter.label = search

    this.mETRCPackagesGet$ = this.metrcPackagesService.getActive(site, packageFilter)
    return this.mETRCPackagesGet$

  }

  getPackageFilter(): PackageFilter {
    const packageFilter = {} as PackageFilter
    packageFilter.pageNumber =1
    packageFilter.pageSize = 100
    packageFilter.hasImported = false

    if ( this.searchProducts != '' ) {
      packageFilter.productName = this.searchProducts
      packageFilter.label = this.searchProducts
    }

    if (this.metrcCategory) {  packageFilter.productCategoryName =   this.metrcCategory.name }
    console.log(packageFilter)
    return packageFilter;
  }

  onSearchgridReady({ api } : {api: GridApi}) {
    this.gridApi = api;
    api.sizeColumnsToFit();
  }

  onSearchGridReady(params) {
    this.searchItems()
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getRowData():  Observable<METRCPackage[]>  {
    const packageFilter = {} as PackageFilter
    packageFilter.pageNumber =1
    packageFilter.pageSize = 100
    packageFilter.hasImported = false

    return this.metrcPackagesService.getActive(this.siteService.getAssignedSite(), packageFilter)
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return 'Intake';
      else return 'Intake';
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

    this.metrcPackagesService.getPackagesByID(id, this.siteService.getAssignedSite())
              .subscribe( data => {

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

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  onSortByNameAndPrice(sort: string) {
  }



  openStrainsDialog(id: any) {
    const dialogConfig = [
      { data: { id: id } }
    ]
    const dialogRef = this.dialog.open(StrainsAddComponent,
      { width:      '900px',
        minWidth:   '900px',
        height:     '775px',
        minHeight:  '775px',
        data : {id: id}
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      this.displayFn('')
    });
  }

  openProductsDialog(id: any) {

    const dialogConfig = [
      { data: { id: id } }
    ]
    const dialogRef = this.dialog.open(METRCProductsAddComponent,
      { height:     '750px',
        minHeight:  '750px',
        width:      '805px',
        minWidth:   '805px',
        data : {id: id}
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      this.displayFn('')
    });

  }

  displayFn(search) {
    this.searchPaging = true
    this.search = search
    this.selectItem(search)
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


