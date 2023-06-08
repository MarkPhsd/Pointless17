import { Component, OnInit, ViewChild, OnChanges,  SimpleChange, Input, TemplateRef } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, Subject, switchMap } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { ReportingService} from 'src/app/_services/reporting/reporting.service';
import { ISite,Item,IUser }  from 'src/app/_interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DatePipe } from '@angular/common'
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MenuService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnChanges,OnInit  {

  dynamicData$      : any;
  loadDynamicData: boolean;

  reportsListView = [
    {id: 1, visible: false },
    {id: 2, visible: false },
    {id: 3, visible: false },
    {id: 4, visible: false },
    {id: 5, visible: false },
    {id: 6, visible: false }
  ]

  reportList = [
    {name: 'Re Order List', id: '1'},
    {name: 'Department Values', id: '2'},
    {name: 'Category Values', id: '3'},
    {name: 'Item Values', id: '4'},
    {name: 'New Customer Count Today', id: '5'},
    {name: 'New Customer Count 30 Days', id: '6'},
  ]

  @ViewChild('customReportView')      customReportView: TemplateRef<any>;

  @ViewChild('categorySales')      categorySales: TemplateRef<any>;
  @ViewChild('taxedCategorySales')      taxedCategorySales: TemplateRef<any>;
  @ViewChild('nonTaxedCategorySales')      nonTaxedCategorySales: TemplateRef<any>;
  @ViewChild('itemSales')      itemSales: TemplateRef<any>;
  @ViewChild('itemVoids')      itemVoids: TemplateRef<any>;


  emailSending           = false;
  showValues             = false;
  email$                 : Observable<any>;
  count                  = 0;
  value                  = false;
  @ViewChild('metrcNetSalesSummary') metrcNetSalesSummary: TemplateRef<any>;
  childNotifier          : Subject<boolean> = new Subject<boolean>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  //for charts
  currentUser$           : Observable<IUser>;
  currentUser            : IUser;

  dataFromFilter         : string;
  dataCounterFromFilter  : string; //used to signal refresh of charts
  dateFrom               : string;
  dateTo                 : string;
  @Input() groupBy       ="date";

  localSite             : ISite;
  sites$                : Observable<ISite[]>;
  sitecount             = 0;
  observer              : any[];
  uiTransactions: TransactionUISettings;
  uiTransactions$: Observable<TransactionUISettings>;

  item                  : Item; //for routing

  displayReports = 'financials'

  constructor(
              private authentication  : AuthenticationService,
              private reportingService: ReportingService,
              private sendGridService     :   SendGridService,
              private sitesService    : SitesService,
              private siteService        : SitesService,
              private menuService: MenuService,
              public datepipe: DatePipe,
              private router: Router,
              private clientTableService: ClientTableService,
              private uISettingsService  : UISettingsService,
          ) {
  }

  toggleReports(type) {
    this.displayReports = type;
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.initDateRange();

  }
  navDesigner() {
    this.router.navigate(['ps-designer-list'])
  }
  toggleShowValues() {

    this.showValues= !this.showValues
    localStorage.setItem('showValues', 'false')
    if (this.showValues) {
      localStorage.setItem('showValues', 'true')
    }

  }
  initTransactionUISettings() {
    this.uiTransactions$ = this.uISettingsService.getSetting('UITransactionSetting').pipe(
    switchMap(data => {
      if (data) {
        this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
        return of(this.uiTransactions)
      }
      if (!data) {
        this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
        return of(this.uiTransactions)
      }
  }))
}
  notifyChild() {
    this.value = !this.value;
    this.childNotifier.next(this.value);
  }

  ngOnInit(): void {

    const showValues = localStorage.getItem('showValues')
    this.showValues = false;
    if (showValues == 'true') {
      this.showValues = true
    }

    this.initTransactionUISettings()
    this.refreshReports()
  };

  setInitialDateRange() {
    const date = new Date();
    const firstDay =   new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.dateFrom = this.datepipe.transform(firstDay, 'yyyy-MM-dd')
    this.dateTo = this.datepipe.transform(lastDay, 'yyyy-MM-dd')
  }

  refreshReports() {
    this.getUser()
    this.sites$ = this.sitesService.getSites()
    this.initDateRange()
    this.setInitialDateRange();
  }

  getUser() {
    const user = this.authentication.userValue;
    this.currentUser    = user;
  }

  initDateRange(){
    this.reportingService.dateFrom = this.dateFrom;
    this.reportingService.dateTo = this.dateTo;
  }

  get viewMetrcNetSales() {
    if (this.uiTransactions && (this.uiTransactions.recmedPricing || this.uiTransactions.enablMEDClients)) {
      return this.metrcNetSalesSummary;
    }
    return null
  }

  //gets filterShared Component and displays the chart data
  receiveData(event) {
    console.log('event', event)
    this.dateFrom = "" // data[0]
    this.dateTo = ""
    this.dataFromFilter = event
    this.count += 1
    var data = this.dataFromFilter.split(":", 3)
    this.dateFrom = data[0]
    this.dateTo = data[1]
    const result = data[2]
    this.count = parseInt(result) + this.count
    if (this.dateFrom && this.dateTo) {
      this.dataCounterFromFilter = data[2];
      this.initDateRange()
    }
  };

  _email() {

    this.emailSending = true;
    const site = this.siteService.getAssignedSite();
    const list = this.siteService.getSites();

    return  list.pipe(
      switchMap( data => {
          const reports$ = []
          data.forEach( site => {
              reports$.push(this.sendGridService.sendSalesReport(site,0, this.dateFrom, this.dateTo))
            }
          )
          const result = forkJoin(reports$)
          return result
        }
      )
    )


    // return this.sendGridService.sendSalesReport(site,0, this.dateFrom, this.dateTo).pipe(
    //   switchMap( data => {
    //     this.emailSending = false;
    //     this.matSnack.open('Email Sent', 'Success', {duration: 1500})
    //     return of(data)
    //   }
    // ));

  }

  email() {
    this.email$ = this._email()
  }


  get customReport() {
    if (this.loadDynamicData) {
      return this.customReportView;
    }
    return true
  }

  selectReport(event) {

    const report = +event?.id;
    const site = this.siteService.getAssignedSite()

    if (report == 1) {
      this.dynamicData$ = this.reportingService.getReOrderList(site)
    }
    if (report == 2) {
      this.dynamicData$ = this.menuService.getCategoryValues(site)
    }
    if (report == 3) {
      this.dynamicData$ = this.menuService.getDepartmentValues(site)
    }
    if (report == 4) {
      this.dynamicData$ = this.menuService.getInventoryValues(site)
    }
    if (report == 5) {
      this.dynamicData$ = this.clientTableService.GetNewClientsOverDateCount(site, 1)
    }
    if (report == 6) {
      this.dynamicData$ = this.clientTableService.GetNewClientsOverDateCount(site, 30)
    }

    this.loadDynamicData = true

  }

  showView(view: number) {
    if (view == 0) {
      this.reportsListView.forEach(data => {
        data.visible = true
      })
    }
    this.reportsListView.forEach(data => {
      if (view == data.id) {
        data.visible = true
      }
    })
    console.log(view, this.reportsListView)
  }

  get categorySalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 1 && data.visible);
    if (filteredData.length > 0) {
      return this.categorySales
    }
    return null
  }
  get taxedCategorySalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 2 && data.visible);
    if (filteredData.length > 0) {
      return this.taxedCategorySales
    }
    return null
  }
  get nonTaxedCategorySalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 3 && data.visible);
    if (filteredData.length > 0) {
      return this.nonTaxedCategorySales
    }
    return null
  }
  get itemSalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 4 && data.visible);
    if (filteredData.length > 0) {
      return this.itemSales
    }
    return null
  }
  get itemVoidsView() {
    const filteredData = this.reportsListView.filter(data => data.id === 5 && data.visible);
    if (filteredData.length > 0) {
      return this.itemVoids
    }
    return null
  }

  reOrderListReport(site: ISite) {

    this.dynamicData$ = this.reportingService.getReOrderList(site)
    this.loadDynamicData = true
  }

  clearCustomData() {
    this.loadDynamicData = false
    this.dynamicData$ = null;
  }
}
