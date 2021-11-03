import { Component, OnInit} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject  } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MetrcFacilitiesService } from 'src/app/_services/metrc/metrc-facilities.service';
import { METRCFacilities }  from 'src/app/_interfaces/metrcs/facilities';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-facilities-list',
  templateUrl: './facilities-list.component.html',
  styleUrls: ['./facilities-list.component.scss']
})
export class FacilitiesListComponent implements OnInit {

  searchGridApi: GridApi;
  searchGridColumnApi: GridAlignColumnsDirective;
  searchGridOptions: any;
  private gridApi: GridApi;
  private gridColumnApi: GridAlignColumnsDirective;
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


  //This is for the search Section//
  public searchForm: FormGroup;
  private readonly onDestroy = new Subject<void>();
  search: string;
  mETRCFacilities$: Observable<METRCFacilities[]>;
  refreshGrid = true;
  //This is for the search Section//

  constructor(  private _snackBar: MatSnackBar,
                private router: Router,
                private agGridService: AgGridService,
                private fb: FormBuilder,
                private siteService: SitesService,
                private metrcFacilitiesService: MetrcFacilitiesService,
                private dialog: MatDialog,
	              public route: ActivatedRoute,
              )
  {
    this.searchItems()
    this.initGridResults()
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
    // this.searchForm = this.fb.group( { searchProducts: ''});
    console.log('')
  };

  initAGGridFeatures() {
    this.columnDefs =  [
      {
       field: "id",
       cellRenderer: "btnCellRenderer",
       cellRendererParams: {
         onClick: this.editProductFromGrid.bind(this),
         label: 'Edit',
         getLabelFunction: this.getLabel.bind(this),
         btnClass: 'btn btn-primary btn-sm'
       },
       minWidth: 75
     },
      {headerName: 'Name', field: 'name', sortable: true, minWidth: 250},
      {headerName: 'DisplayName',  sortable: true, field: 'displayName',},
      {headerName: 'License', field: 'license.number', sortable: true},

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


  import() {
    const mETRCFacilities$ =  this.metrcFacilitiesService.importFacilities(this.siteService.getAssignedSite())
    mETRCFacilities$.subscribe(data =>{
      this.searchItems();
    })

  }

  searchItems() {
    // const packageFilter = {} as PackageFilter
    // packageFilter.pageNumber =1
    // packageFilter.pageSize = 100
    // packageFilter.hasImported = false

    this.mETRCFacilities$ = this.metrcFacilitiesService.getFacilities(this.siteService.getAssignedSite())
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

  getRowData():  Observable<METRCFacilities[]>  {
    // const packageFilter = {} as PackageFilter
    // packageFilter.pageNumber =1
    // packageFilter.pageSize = 100
    // packageFilter.hasImported = false

    return this.metrcFacilitiesService.getFacilities(this.siteService.getAssignedSite())
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

  editProductFromGrid(e) {
    console.log(e)

    if (e.rowData.id)  {
      this.getPackage(e.rowData.id);
    }
  }

  async getPackage(id:any) {
    console.log(id)
    this.metrcFacilitiesService.getFacility(id, this.siteService.getAssignedSite())
              .subscribe( data => {

        // if (data.item.quantityType === 'CountBased') {
        //   this.openStrainsDialog(data.id)
        //   return
        // }
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

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  openFacility(id: any) {
    // const dialogConfig = [
    //   { data: { id: id } }
    // ]
    // const dialogRef = this.dialog.open(StrainsAddComponent,
    //   { width: '90vw',
    //     height: '90vh',
    //     data : {id: id}
    //   },
    // )
    // dialogRef.afterClosed().subscribe(result => {
    // });
  }



}


