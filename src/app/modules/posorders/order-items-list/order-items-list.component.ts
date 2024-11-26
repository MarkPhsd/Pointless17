import { Component, OnChanges, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, Subject } from 'rxjs';
import {  IServiceType, ISite } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { IReportingSearchModel, IReportItemSales, ReportingItemsSalesService,IReportItemSaleSummary } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { OrderItemListComponent } from './order-item-list/order-item-list.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-order-items-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    OrderItemListComponent,FormsModule,ReactiveFormsModule
  ],
  templateUrl: './order-items-list.component.html',
  styleUrls: ['./order-items-list.component.scss']
})
export class OrderItemsListComponent implements OnInit, OnChanges {

  childNotifier : Subject<boolean> = new Subject<boolean>();
  //required for filter component.
  filterForm: UntypedFormGroup;
  dateFrom: Date;
  dateTo: Date;

  //Search Lookups
  description: string;
  formControlName: string;
  selectedEmployeeID    = 0;
  selectedDispatcherID  = 0;
  selectedDriverID      = 0;
  selectedServiceTypeID = 0;
  selectedSiteID        = 0;
  productName:     string;
  groupByEmployee: boolean;
  groupByProduct:  boolean;
  groupByDate:     boolean;
  groupByCategory: boolean;
  groupByDepartment: boolean;
  groupByOption:   any;
  productsOnly:    boolean;
  discountsOnly:   boolean;
  weightedItems:   boolean;

  //search Observables
  reportItemSalesSummary$ : Observable<IReportItemSaleSummary>;
  reportItemSales$: Observable<IReportItemSales[]>;
  serviceTypes$: Observable<IServiceType[]>;
  employees$: Observable<IItemBasic[]>;
  drivers$:  Observable<IItemBasic[]>;
  sites$:  Observable<ISite[]>;

  dispatchers$: Observable<IItemBasic[]>;
  employeeID: UntypedFormControl;

  site: ISite;

  constructor(  private orderService: OrdersService,
                private _snackBar: MatSnackBar,
                private serviceTypeService:ServiceTypeService,
                private employeeService: EmployeeService,
                private reportingItemsSalesService: ReportingItemsSalesService,
                private siteService: SitesService,
                private fb: UntypedFormBuilder,
              )
  {

  }

  ngOnInit(): void {
    this.serviceTypes$ = this.serviceTypeService.getAllServiceTypes(this.siteService.getAssignedSite())
    this.employees$ = this.employeeService.getAllActiveEmployees(this.siteService.getAssignedSite())
    this.drivers$ = this.employeeService.getAllActiveEmployees(this.siteService.getAssignedSite())
    this.dispatchers$ = this.employeeService.getAllActiveEmployees(this.siteService.getAssignedSite())
    this.sites$ = this.siteService.getSites()
    this.setFilterDateToday()
  }

  ngOnChanges() {
    this.showresults();
  }

  setFilterDateToday() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    this.filterForm =  this.fb.group({
      dateFrom: new Date(year, month, 1),
      dateTo: new Date()
      }
    );

  }

  async showresults(){

    let searchModel = {} as IReportingSearchModel;

    await this.applySiteOption()

    this.dateFrom = this.filterForm.get("dateFrom").value
    this.dateTo = this.filterForm.get("dateTo").value

    //set values of search model
    searchModel.startDate = this.dateFrom.toLocaleDateString()
    searchModel.endDate = this.dateTo.toLocaleDateString()

    searchModel.employeeID = this.selectedEmployeeID
    searchModel.serviceTypeID = this.selectedServiceTypeID

    searchModel.groupByDate = false
    searchModel.groupByEmployee = false
    searchModel.groupByProduct = false
    let groupingOn = false;

    if (this.groupByOption == 0) {

    }
    if (this.groupByOption == 1) {
      searchModel.groupByEmployee = true
      groupingOn = true
    }
    if (this.groupByOption == 2) {
      searchModel.groupByDate = true
      groupingOn = true
    }
    if (this.groupByOption == 3) {
      searchModel.groupByProduct = true
      groupingOn = true
    }
    if (this.groupByOption == 4) {
      searchModel.groupByCategory = true
      groupingOn = true
    }
    if (this.groupByOption == 5) {
      searchModel.groupByDepartment = true
      groupingOn = true
    }

    if (this.productsOnly) {
      searchModel.productsOnly = true
    }

    if (this.discountsOnly) {
      searchModel.discountsOnly = true
    }

    if (this.weightedItems)  {
      searchModel.weightedItem = true
    }

    if ( this.productName) {
      searchModel.productName = this.productName
    }

    if (groupingOn) {
      this.reportItemSalesSummary$ = this.reportingItemsSalesService.groupItemSales(this.site, searchModel)
    } else {
      this.reportItemSales$ = this.reportingItemsSalesService.searchItemReport(this.site, searchModel)
    }

    this.reportItemSales$.subscribe( data=> {
      // console.log("reportItemSales data", data)
      // here we can consolidate all the data into one big array, and then show it beneath?
      // or we can loop and generate a bunch of lists.
      // and we can loop and add to

    }, err => {
      console.log("reportItemSales Error" , err)
    }
    )

  }

  async applySiteOption() {
    if (this.selectedSiteID == 0) {
      this.site =this.siteService.getAssignedSite()
      return this.site
    } else {
      let promise = this.siteService.setAssignedSiteByID(this.selectedSiteID).pipe().toPromise();
      await promise.then(data=> { this.site = data})
      return this.site
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
