import { Component, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, Subject  } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { GridApi } from 'ag-grid-community';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { ItemCategoriesEditComponent } from '../item-categories-edit/item-categories-edit.component';
import { Capacitor } from '@capacitor/core';

import {
  METRCItemsCategories,
} from 'src/app/_interfaces/metrcs/items';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-item-categories-list',
  templateUrl: './item-categories-list.component.html',
  styleUrls: ['./item-categories-list.component.scss']
})
export class ItemCategoriesListComponent implements OnInit {

  searchGridApi: GridApi;
  // searchGridColumnApi: GridAlignColumnsDirective;
  searchGridOptions: any;

  //AgGrid
  private gridApi: GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions: any
  columnDefs = [];
  defaultColDef;
  frameworkComponents: any;
  rowDataClicked1 = {};
  rowDataClicked2 = {};

  public rowData: any[];
  public info: string;

  paginationSize = 50
  currentRow = 1;
  currentPage = 1
  pageNumber = 1
  pageSize = 50
  numberOfPages = 1
  rowCount = 50

  get platForm() {  return Capacitor.getPlatform(); }
  //This is for the search Section//
  public searchForm: UntypedFormGroup;
  // get searchItemsValue() { return this.searchForm.get("controlSearchItems") as FormControl;}
  private readonly onDestroy = new Subject<void>();
  search: string;

  mETRCItemsCategories$: Observable<METRCItemsCategories[]>;

  refreshGrid = true;
  //This is for the search Section//
  gridDimensions: string;
  agtheme        = 'ag-theme-material';;

  public gridStyle: any = {
    general: {
        normal: 'grid-eor-normal'
    },
    row: {
        general: {
            normal: 'grid-eor-row-normal',
            hovered: 'grid-eor-row-hovered',
            selected: 'grid-eor-row-selected'
        }
    }
  }

  constructor(  private _snackBar: MatSnackBar,
      private router: Router,
      private agGridService: AgGridService,
      private fb: UntypedFormBuilder,
      private metrcItemsCategoriesService: MetrcItemsCategoriesService,
      private dialog: MatDialog,
      private sitesService: SitesService,
      public  route: ActivatedRoute,
    )
  {
    this.searchItems()
    this.initGridResults()
    this.initClasses()
  }

  initClasses()  {
    const platForm = this.platForm;
    this.gridDimensions =  'width: 100%; height: 90%;'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 85%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 85%;' }
  }

  initGridResults() {
    this.initAGGridFeatures()
    this.frameworkComponents = { btnCellRenderer: ButtonRendererComponent };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100,
    };
  }

  ngOnInit(): void {
    this.initSearchForm();
  };

  initSearchForm() {
    this.searchForm = this.fb.group(
      { controlSearchItems: ['']
     }
   );
  }

  initAGGridFeatures() {

    this.columnDefs =  [

      {
        headerName: "Row",
        valueGetter: "node.rowIndex + 1"
      },
      
      {
        field: "id",
        cellRenderer: "btnCellRenderer",
        cellRendererParams: {
          onClick: this.editFromGrid.bind(this),
          label: 'Edit',
          getLabelFunction: this.getLabel.bind(this),
          btnClass: 'btn btn-primary btn-sm'
        },
        minWidth: 65,
        width: 65
      },

      {headerName: 'Name', field: 'name', sortable: true, minWidth: 250},
      {headerName: 'Type',  sortable: true, field: 'productCategoryType',},
      {headerName: 'Quantity Type', field: 'quantityType', sortable: true},
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

  searchLabels() {
    this.mETRCItemsCategories$ = this.metrcItemsCategoriesService.getCategories()
  }

  searchItems() {
    this.mETRCItemsCategories$ = this.metrcItemsCategoriesService.getCategories()
  }

  importCategories() {
    const site = this.sitesService.getAssignedSite();
    const import$ = this.metrcItemsCategoriesService.importItemCategories(site)
    import$.subscribe(data => {
      this.searchItems()
    })
  }

  refreshCategories( ) {

  }

  onSearchgridReady({ api } : {api: GridApi}) {
    this.gridApi = api;
    api.sizeColumnsToFit();
  }

  onSearchGridReady(params) {
    this.searchItems()
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
  }

  getRowData():  Observable<METRCItemsCategories[]>  {
    return this.metrcItemsCategoriesService.getCategories()
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }

  onBtnClick1(e) {
    console.log(e)
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    console.log(e)
    this.rowDataClicked2 = e.rowData;
  }

  editFromGrid(event) {
    if (event.rowData.id) {
      const id = event.rowData.id
      this.openCategoriesDialog(id)
    }
  }

  // editProduct(e){
  //   this.notifyEvent(`Event ${e}`, "Success")
  //   this.router.navigate(["/productedit/", {id:e.id}]);
  // }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  onSortByNameAndPrice(sort: string) {
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  openCategoriesDialog(id: number) {
    console.log('openCategoriesDialog', id)
    const dialogConfig = [
      { data: { id: id } }
    ]

    const dialogRef = this.dialog.open(ItemCategoriesEditComponent,
      { width: '850px',
        height: '700px',
        data : {id: id}
      },
    )

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });

  }







}
