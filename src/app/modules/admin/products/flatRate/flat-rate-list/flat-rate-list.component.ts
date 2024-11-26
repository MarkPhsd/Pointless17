import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { FlatRateTax } from 'src/app/_services/menu/item-type.service';
import { FlatRateService } from 'src/app/_services/map-routing/flat-rate.service';
import { FlatRateEditComponent } from '../flat-rate-edit/flat-rate-edit.component';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-flat-rate-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    AgGridModule,
  SharedPipesModule],
  templateUrl: './flat-rate-list.component.html',
  styleUrls: ['./flat-rate-list.component.scss']
})
export class FlatRateListComponent implements OnInit {

  searchGridApi:         GridApi;
  // searchGridColumnApi:   GridAlignColumnsDirective;
  searchGridOptions:     any;
  //AgGrid
  private gridApi:       GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions:           any
  columnDefs = [];
  defaultColDef;
  frameworkComponents:   any;
  rowDataClicked1 = {};
  rowDataClicked2 = {};
  public rowData:        any[];
  public info:           string;
  paginationSize = 50
  currentRow = 1;
  currentPage = 1
  pageNumber = 1
  pageSize = 50
  numberOfPages = 1
  rowCount = 50

  flatRate:  FlatRateTax[];
  flatRate$ : Observable<FlatRateTax[]>;

  constructor(  private _snackBar: MatSnackBar,
                private router: Router,
                private agGridService: AgGridService,
                private fb: UntypedFormBuilder,
                private siteService: SitesService,
                private dialog: MatDialog,
                private flatRateService: FlatRateService,) {}

  ngOnInit()
  {
    this.initTypes();
    this.initGridResults();
  }

  initTypes(){
    const site         = this.siteService.getAssignedSite()
    this.flatRate$     = this.flatRateService.getList(site);
    this.flatRate$.subscribe( data=> {
      this.flatRate = data
    })
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

  onSearchGridReady(params) {
    // this.searchItems()
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
  }

  openItemEditor(id: number) {

    const dialogConfig = [
      { data: { id: id } }
    ]

    let dialogRef: any;

    dialogRef = this.dialog.open(FlatRateEditComponent,
      { width:        '75px',
        minWidth:     '750px',
        height:       '450px',
        minHeight:    '450px',
        data : {id: id}
      },
    )

    dialogRef.afterClosed().subscribe(result => {
      this.initTypes()
    });

  }

  initAGGridFeatures() {
    this.columnDefs =  [
      {
       field: "id",
       cellRenderer: "btnCellRenderer",
       cellRendererParams: {
         onClick: this.editItemFromGrid.bind(this),
         label: 'Edit',
         getLabelFunction: this.getLabel.bind(this),
         btnClass: 'btn btn-primary btn-sm'
       },
       minWidth: 150
     },
      {headerName: 'Name', field: 'name', sortable: true, minWidth: 150},
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
      // maxBlocksInCache: 2,
      rowModelType: 'infinite',
      infiniteInitialRowCount: 2,
    }
  }

  addRate() {
    console.log('hello')
    this.openItemEditor(0);
  }

  editItemFromGrid(e) {
    if (e.rowData.id)  {
      this.editItemWithId(e.rowData.id);
    }
  }

  editItemWithId(id:any) {
    this.openItemEditor(id);
    return
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }

}
