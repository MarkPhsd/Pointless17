import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { DatePipe } from '@angular/common';
import { IServiceType, ISite } from 'src/app/_interfaces/';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { FormControl } from '@angular/forms';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridApi} from 'ag-grid-community';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
// https://stackoverflow.com/questions/53908460/ag-grid-unable-to-add-icon-button-into-each-row-of-the-ag-grid-and-multiselectio?rq=1
//https://www.ag-grid.com/javascript-grid-cell-rendering/
//  @HostBinding('@pageAnimations')

@Component({
  selector: 'app-pos-orders',
  templateUrl: './pos-orders.component.html',
  styleUrls: ['./pos-orders.component.scss'],
  // animations:  [ fadeInAnimation ],
})
export class PosOrdersComponent implements OnInit {

  @Input() posOrders$: Observable<IPOSOrder[]>;

  //Search Lookups
  description: string;
  formControlName: string;
  selectedEmployeeID: number;
  selectedDispatcherID: number;
  selectedDriverID: number;
  selectedServiceTypeID: number;
  selectedSiteID: number;

  //search Observables
  serviceTypes$: Observable<IServiceType[]>;
  employees$: Observable<IItemBasic[]>;
  drivers$:  Observable<IItemBasic[]>;
  sites$:  Observable<ISite[]>;
  dispatchers$: Observable<IItemBasic[]>;
  employeeID: FormControl;

  frameworkComponents: any;
  defaultColDef;
  //AgGrid
  private gridApi: GridApi;
  private gridColumnApi: GridAlignColumnsDirective;
  columnDefs = [];

  constructor(  private orderService            : OrdersService,
                private _snackBar               : MatSnackBar,
                private serviceTypeService      : ServiceTypeService,
                private employeeService         : EmployeeService,
                private siteService             : SitesService,
                private agGridService           : AgGridService,
                private readonly datePipe       : DatePipe,
                private toolbarUIService        : ToolBarUIService,
              )
  {
  }

  ngOnInit(): void {
    this.serviceTypes$ = this.serviceTypeService.getSaleTypes(this.siteService.getAssignedSite())
    this.employees$ = this.employeeService.getAllActiveEmployees(this.siteService.getAssignedSite())
    this.drivers$ = this.employeeService.getAllActiveEmployees(this.siteService.getAssignedSite())
    this.dispatchers$ = this.employeeService.getAllActiveEmployees(this.siteService.getAssignedSite())
    this.sites$ = this.siteService.getSites()
    this.initColDefs();
    this.toolbarUIService.hidetoolBars();
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
    this.gridColumnApi = params.columnApi;
  }

  onDeselectAll() {
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  onSortByNameAndPrice(sort: string) {
  }

  showAllOrders() {
    const site = this.siteService.getAssignedSite()
    this.posOrders$ = this.orderService.getTodaysOpenOrders(site);
  }

  showFilteredOrders() {
    const site = this.siteService.getAssignedSite()
    this.posOrders$ = this.orderService.getTodaysOpenOrders(site);
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

