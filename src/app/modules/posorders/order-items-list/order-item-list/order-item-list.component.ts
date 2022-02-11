import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { GridApi } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { IReportingSearchModel, IReportItemSales } from 'src/app/_services/reporting/reporting-items-sales.service';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';

@Component({
  selector: 'app-order-item-list',
  templateUrl: './order-item-list.component.html',
  styleUrls: ['./order-item-list.component.scss']
})
export class OrderItemListComponent implements OnInit {

  @Input() reportItemSales$: Observable<IReportItemSales[]>;
  @Input() posOrderSearchModel: IReportingSearchModel;

  // public modules: Module[] = [
  //   ClientSideRowModelModule,
  //   RowGroupingModule,
  //   MenuModule,
  //   ColumnsToolPanelModule,
  // ];

  //AgGrid

  private gridApi: GridApi;
  gridOptions: {};
  // private gridColumnApi: GridAlignColumnsDirective;
  columnDefs = [];
  defaultColDef;
  frameworkComponents: any;

  constructor(
                private readonly datePipe: DatePipe,
                private agGridService: AgGridService) { }

  ngOnInit(): void {

    this.initColDefs();
  }

  initColDefs() {

    this.gridOptions = {
      enableCharts: true,
      enableRangeSelection: true,
      enablePivot: true,
    }

    this.columnDefs =  [
      {
        field: "id",
        cellRenderer: "btnCellRenderer",
        cellRendererParams: {
            clicked: function(field: any) {
            alert(`${field} was clicked`);
          }
        },
        minWidth: 150
      },
      {headerName: 'Type', field: 'serviceType', sortable: true},
      {headerName: 'Completion Date',  sortable: true,
                    field: 'completionDateShort',
                    valueFormatter: ({ value }) => this.datePipe.transform(value, 'short')
      },

      {headerName: 'Item name', field: 'productName', sortable: true},
      {headerName: 'Department', field: 'department', sortable: true,},
      {headerName: 'Category',  field: 'category', sortable: true,},
      {headerName: 'Serial', field: 'serialNumber', sortable: true},
      {headerName: 'Barcode', field: 'barcode', sortable: true},
      {headerName: 'Employee', field: 'employee', sortable: true},
      {headerName: 'POS name', field: 'posName', sortable: true},

      {headerName: 'QTY', field: 'quantity', sortable: true },

      {headerName: 'Item Total', field: 'itemTotal', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'Tax 1', field: 'taxTotal1', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'Tax 2', field: 'taxTotal2', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'Tax 3', field: 'taxTotal3', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'CRV', field: 'crv', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'Order $ Disc', field: 'orderCashDiscount', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'Item $ Disc', field: 'itemCashDiscounts', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: '% DIscount', field: 'itemPercentageDiscount', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'pointDiscount', field: 'pointDiscount', sortable: true,  cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'Completed',  field: 'completionDate', sortable: true},
      {headerName: 'WeightedItem', field: 'weightedItem', sortable: true,},

    ]

    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };

    this.defaultColDef = {
      flex: 1,
      cellClass: 'number-cell',
      minWidth: 100
    };

  }

  onPOSGridReady(params) {
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
  }

  formatNumber(number) {
  // this puts commas into the number eg 1000 goes to 1,000,
  // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

  onDeselectAll() {
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }
}
