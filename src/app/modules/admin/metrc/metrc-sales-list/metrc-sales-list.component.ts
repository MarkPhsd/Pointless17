import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { GridApi } from 'ag-grid-community';
import { Observable, Subject } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { FormControl, FormGroup } from '@angular/forms';
import { IEmployee, IServiceType, ISite } from 'src/app/_interfaces';
import { ReportingService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MetrcSalesService } from 'src/app/_services/metrc/metrc-sales.service';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-metrc-sales-list',
  templateUrl: './metrc-sales-list.component.html',
  styleUrls: ['./metrc-sales-list.component.scss']
})
export class MetrcSalesListComponent implements OnInit {

  @Input() metrcSales$: Observable<IMETRCSales[]>;

  //AgGrid
  private gridApi: GridApi;
  private gridColumnApi: GridAlignColumnsDirective;
  columnDefs = [];
  defaultColDef;
  frameworkComponents: any;
  get platForm() {  return Capacitor.getPlatform(); }
  // private gridApi: GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  // columnDefs = [];
  // defaultColDef;
  // frameworkComponents: any;
  searchForm: FormGroup;

  childNotifier : Subject<boolean> = new Subject<boolean>();
  //required for filter component.
  dataFromFilter: string;
  dataCounterFromFilter: string; //used to signal refresh of charts
  dateFrom: string;
  dateTo: string;

  //Search Lookups
  description:           string;
  formControlName:       string;
  selectedEmployeeID:    number;
  selectedDispatcherID:  number;
  selectedDriverID:      number;
  selectedServiceTypeID: number;
  productName:           string;

  selectedSiteID:        number;
  //search Observables
  serviceTypes$: Observable<IServiceType[]>;
  employees$: Observable<IEmployee[]>;
  drivers$:  Observable<IEmployee[]>;
  dispatchers$: Observable<IEmployee[]>;
  employeeID: FormControl;

  sites$: Observable<ISite[]>;
  site: ISite;
  private _snackBar: any;

  gridDimensions: string;
  agtheme        = 'ag-theme-material';;

  constructor(
            private readonly datePipe: DatePipe,
            private agGridService: AgGridService,
            private metrcSalesService: MetrcSalesService,
            private siteService: SitesService,
            private reportingServices: ReportingService,
            ) { }


  ngOnInit(): void {
    this.initColDefs();
    this.site = {} as ISite;
    this.sites$ = this.siteService.getSites();
    this.site = this.siteService.getAssignedSite()
    this.initClasses()
  }

  initClasses()  {
    const platForm = this.platForm;
    this.gridDimensions =  'width: 100%; height: 90%;'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 85%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 85%;' }
  }

  editProductFromGrid(event) {

  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }

  initColDefs() {

    this.columnDefs =  [
      {
        field: "id",
        cellRenderer: "btnCellRenderer",
        cellRendererParams: {
          onClick: this.editProductFromGrid.bind(this),
          icon: 'inventory',
          label: 'Intake',
          getLabelFunction: this.getLabel.bind(this),
          btnClass: 'agGridButton', minWidth: 60
        },
      },
      {headerName: 'Completion Date',  sortable: true,
                    field: 'completionDate',
                    valueFormatter: ({ value }) => this.datePipe.transform(value, 'short')
      },

      {headerName: 'Item name', field: 'productName', sortable: true},
      {headerName: 'Quantity', field: 'quantity', sortable: true, cellClass: 'number-cell' },
      {headerName: 'Unit Price', field: 'unitPrice', sortable: true, cellRenderer: this.agGridService.currencyCellRendererUSD  },
      {headerName: 'UnitOfMeasure', field: 'metrcUnit', sortable: true},
      {headerName: 'Package Label', field: 'serialCode', sortable: true},
      {headerName: 'metrcResponse', field: 'metrcResponse', sortable: true},
      {headerName: 'batchDate', field: 'batchDate', sortable: true},

    ]
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100
    };
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onDeselectAll() {
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  searchLabels() {

  }

  async setSite(id: any) {

    this.site = await this.assingSite(id);

    this.siteService.setAssignedSite(this.site);

  }

  async assingSite(id: any) {

    let site$ = this.siteService.setAssignedSiteByID(id)
    return site$.pipe().toPromise()

  }

  showresults(){
    let site: ISite = this.siteService.getAssignedSite()
    this.metrcSales$ = this.metrcSalesService.getMetrcSales(this.siteService.getAssignedSite());
    this.metrcSales$.subscribe(data => {
      console.log(data)
    })
  }

  showResultsUnProcessed(){
    let site: ISite = this.siteService.getAssignedSite()
    this.metrcSales$ = this.metrcSalesService.getMetrcSales(this.siteService.getAssignedSite());
  }

  processSales(){
    this.metrcSales$ = this.metrcSalesService.getMetrcSales(this.siteService.getAssignedSite());
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  receiveData($event) {
    this.dataFromFilter = $event
    var data = this.dataFromFilter.split(":", 3)
    this.dateFrom = data[0]
    this.dateTo = data[1]
    this.dataCounterFromFilter = data[2];
  } ;

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


}
