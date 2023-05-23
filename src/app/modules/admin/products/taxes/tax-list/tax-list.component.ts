import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable} from 'rxjs';
import { UntypedFormBuilder } from '@angular/forms';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialog } from '@angular/material/dialog';
import { TaxEditComponent } from '../tax-edit/tax-edit.component';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { TaxRate } from 'src/app/_interfaces';

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.scss']
})
export class TaxListComponent implements OnInit {

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

  taxes:  TaxRate[];
  taxes$ : Observable<TaxRate[]>;

  constructor(  private _snackBar: MatSnackBar,
                private router: Router,
                private agGridService: AgGridService,
                private fb: UntypedFormBuilder,
                private siteService: SitesService,
                private dialog: MatDialog,
                private taxesService: TaxesService,) {}

  ngOnInit()
  {
    this.initTypes();
    this.initGridResults();

  }

  initTypes(){
    const site         = this.siteService.getAssignedSite()
    this.taxes$     = this.taxesService.getTaxRates(site);
    this.taxes$.subscribe( data=> {
      this.taxes = data
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

    dialogRef = this.dialog.open(TaxEditComponent,
      { width:        '400px',
        minWidth:     '450px',
        height:       '300px',
        minHeight:    '350px',
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
      {headerName: 'Rate', field: 'amount', sortable: true, minWidth: 150},
      {headerName: 'Column', field: 'taxColumn', sortable: true, minWidth: 150},
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
