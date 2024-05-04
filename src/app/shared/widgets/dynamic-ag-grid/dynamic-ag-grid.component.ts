import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { GridApi, Optional } from 'ag-grid-community';
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

  @Input() dataInterface: string;
  @Input() data        : any;
  params               : any;
  private gridApi      : GridApi;
  get gridAPI(): GridApi {  return this.gridApi;  }

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

    // console.log(dataGrid)
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

    console.log('data', this.dataInterface, anObject, intefaceType)
    const colDefs = this.columnDefs;
    colDefs.length = 0;
    const keys = Object.keys(intefaceType);

    keys.forEach((key) => colDefs.push({
      field: key
    }));

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
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }
    if (this.data) {
      this.dynamicallyConfigureColumnsFromObject(this.data)
    }
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }


}
