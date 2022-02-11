import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IPOSOrder,IPOSOrderSearchModel } from 'src/app/_interfaces/transactions/posorder';
import { Observable } from 'rxjs';
import { GridApi} from 'ag-grid-community';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';

@Component({
  selector: 'app-pos-order-list',
  templateUrl: './pos-order-list.component.html',
  styleUrls: ['./pos-order-list.component.scss']
})
export class PosOrderListComponent implements OnInit {

  @Input() posOrders$: Observable<IPOSOrder[]>;
  @Input() orders$: Observable<IPOSOrder[]>;

  @Input() posOrderSearchModel: IPOSOrderSearchModel;

  //AgGrid
  private gridApi: GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  columnDefs = [];
  defaultColDef;
  frameworkComponents: any;
  agGridClass = "ag-grid-angular ag-theme-alpine"

  constructor(
                private readonly datePipe: DatePipe,
                private agGridService: AgGridService) { }

  ngOnInit(): void {

    this.initColDefs();

  }

  initColDefs() {

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
      {headerName: 'Date',  sortable: true,
                    field: 'orderDate',
                    valueFormatter: ({ value }) => this.datePipe.transform(value, 'short')
      },
      {headerName: 'Completed', field: 'completionDate', sortable: true},
      {headerName: 'Employee', field: 'employeeName', sortable: true},
      {headerName: 'Customer', field: 'customerName', sortable: true},
      {headerName: 'SubTotal', field: 'subTotal', sortable: true, cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'Total', field: 'total', sortable: true, cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'Tax', field: 'taxTotal', sortable: true, cellRenderer: this.agGridService.currencyCellRendererUSD },
      {headerName: 'ItemCount', field: 'itemCount', sortable: true},
    ]
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100
    };
  }

  onPOSGridReady(params) {
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
  }


  onDeselectAll() {
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }
}
