import { AfterViewInit, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { GridApi, Optional } from 'ag-grid-community';
import { of } from 'rxjs';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
// import { MenuItem } from 'electron';
// import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import { ReportItemSalesOptimized } from 'src/app/_services/reporting/reporting-items-sales.service';
// import { PaymentSummary } from 'src/app/_services/reporting/sales-payments.service';

@Component({
  selector: 'dynamic-ag-grid',
  templateUrl: './dynamic-ag-grid.component.html',
  styleUrls: ['./dynamic-ag-grid.component.scss']
})

export class DynamicAgGridComponent implements  AfterViewInit {

  @Output() outPutItem = new EventEmitter();
  @Input() dataInterface: string;
  @Input() data        : any;
  params               : any;
  private gridApi      : GridApi;
  get gridAPI(): GridApi {  return this.gridApi;  }
  openingProduct: boolean;
  
  buttonName: string;
  columnDefs = [];

  defaultColDef = {
    flex: 2,
  };

  gridOptions = {
    defaultColDef: {
      sortable: true,
      filter: 'agTextColumnFilter',
      resizable: true,
    },

    columnDefs: this.columnDefs,
    enableSorting: true,
    enableFilter: true,
    pagination: false,
  } as any;

  dynamicallyConfigureColumnsFromObject(anObject) {
    let intefaceType : any; //anObject[0] as IReportItemSales

    if (this.dataInterface === 'ReOrderList' ||
        this.dataInterface === 'MenuItem') {
      intefaceType = anObject[0] // as MenuItem
    }

    if (this.dataInterface === 'ItemSales' ||
        this.dataInterface === 'IReportItemSales') {
          console.log(anObject[0])
      intefaceType = anObject[0] // as ReportItemSalesOptimized
    }

    if (this.dataInterface === 'SalesTax' ||
        this.dataInterface === 'ITaxReport') {
      intefaceType = anObject[0]
    }

    if (this.dataInterface === 'PaymentSummary') {
      intefaceType = anObject[0] // as PaymentSummary
    }

    const colDefs = this.columnDefs;
    colDefs.length = 0;
    const keys = Object.keys(intefaceType);

    if (this.dataInterface === 'ReOrderList' ||
        this.dataInterface === 'MenuItem')  {
        let item = {headerName: 'Edit',  field: 'id',
        cellRenderer: "btnCellRenderer",
        cellRendererParams: {
          onClick: this.editProductFromGrid.bind(this),
          label: 'view',
          getLabelFunction: 'view',
          btnClass: 'btn btn-primary btn-sm'
        },
        minWidth: 125,
        maxWidth: 125,
        flex: 2,
      }

      keys.forEach((key) => {
        if (key !== 'id') {
          colDefs.push({ field: key });
        }
      });
      

    } else { 
      keys.forEach((key) => colDefs.push({
        field: key
      }));
    }


    this.columnDefs = colDefs;
    this.gridApi.setColumnDefs(colDefs)

  }

  constructor(
    @Optional() private dialogRef: MatDialogRef<DynamicAgGridComponent>,
    @Inject(MAT_DIALOG_DATA) public gridData: any,

    ) {

      console.log('loaded data', gridData)
      if (gridData) {
        this.data = gridData.data;
        this.dataInterface = gridData.name
      }
     }

  ngAfterViewInit(): void {

  }

  onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
    }
    if (this.data) {
      this.dynamicallyConfigureColumnsFromObject(this.data)
    }
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  editProductFromGrid(e) {
    if (!e) {
      // console.log('edit product from grid no data')
      return
    }
    if (e.rowData.id)  {
      if (this.buttonName === 'Edit') {
        // this.editItemWithId(e.rowData.id);

      }
    }
  }



}
