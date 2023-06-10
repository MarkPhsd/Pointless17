import { Component, OnInit, ViewChild, OnChanges,  SimpleChange, Input, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, Subject, switchMap } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { ReportingService} from 'src/app/_services/reporting/reporting.service';
import { ISite,Item,IUser }  from 'src/app/_interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DatePipe } from '@angular/common'
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { IDeviceInfo, MenuService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnChanges,OnInit  {

  dynamicData$      : any;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  loadDynamicData:  boolean = false;

  reportsListView = [
    {id: 1, visible: false },
    {id: 2, visible: false },
    {id: 3, visible: false },
    {id: 4, visible: false },
    {id: 5, visible: false },
    {id: 6, visible: false },
    {id: 7, visible: false },
    {id: 8, visible: false }
  ]

  reportCategoriesListForm: UntypedFormGroup;
  reportItemsForm: UntypedFormGroup;
  reportDesignerForm: UntypedFormGroup;

  reportGroupSelected: any;
  reportGroupList = [
    {name: 'Financials', value: 'financials', id: 1, icon: ''},
    {name: 'Products & Services', value: 'items', id: 2, icon: ''},
    {name: 'Inventory / Menu', value: 'output', id: 3, icon: ''},
    {name: 'Audit', value: 'audit', id: 4, icon: ''}
  ]

  reportList = [
    {name: 'Re Order List', id: '1', icon: ''},
    {name: 'Department Values', id: '2', icon: ''},
    {name: 'Category Values', id: '3', icon: ''},
    {name: 'Item Values', id: '4', icon: ''},
    {name: 'New Customer Count Today', id: '5', icon: ''},
    {name: 'New Customer Count 30 Days', id: '6', icon: ''},
  ]

  itemReportList = [
    {name: 'All Details', id: '0', icon: ''},
    {name: 'Categories', id: '1', icon: ''},
    {name: 'Taxed ', id: '2', icon: ''},
    {name: 'Non Taxed', id: '3', icon: ''},
    {name: 'All Items', id: '4', icon: ''},
  ]

  @ViewChild('customReport')      customReport: TemplateRef<any> | undefined;
  @ViewChild('categorySales')         categorySales: TemplateRef<any> | undefined;
  @ViewChild('taxedCategorySales')    taxedCategorySales: TemplateRef<any> | undefined;
  @ViewChild('nonTaxedCategorySales') nonTaxedCategorySales: TemplateRef<any> | undefined;
  @ViewChild('itemSales')       itemSales: TemplateRef<any> | undefined;
  @ViewChild('itemVoids')       itemVoids: TemplateRef<any> | undefined;

  @ViewChild('siteReports')      siteReports: TemplateRef<any> | undefined;
  @ViewChild('paymentVoids')     paymentVoids: TemplateRef<any> | undefined;
  @ViewChild('paymentRefunds')   paymentRefunds: TemplateRef<any> | undefined;
  @ViewChild('reportDesigner')   reportDesigner: TemplateRef<any> | undefined;

  @ViewChild('reportCategories')     reportCategories: TemplateRef<any> | undefined;
  @ViewChild('reportCategoriesList') reportCategoriesList: TemplateRef<any> | undefined;

  @ViewChild('designReportButton')   designReportButton: TemplateRef<any> | undefined;

  emailSending           = false;
  showValues             = false;
  email$                 : Observable<any>;
  count                  = 0;
  value                  = false;
  childNotifier          : Subject<boolean> = new Subject<boolean>();
  @ViewChild('metrcNetSalesSummary') metrcNetSalesSummary: TemplateRef<any>;
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
  sites                 : ISite[];
  sitecount             = 0;
  observer              : any[];
  uiTransactions: TransactionUISettings;
  uiTransactions$: Observable<TransactionUISettings>;
  item                  : Item; //for routing
  displayReports = 'financials'
  deviceInfo: IDeviceInfo;

  completionDateForm     : UntypedFormGroup;

  constructor(
              private authentication  : AuthenticationService,
              private reportingService: ReportingService,
              private sendGridService     :   SendGridService,
              private sitesService    : SitesService,
              private siteService        : SitesService,
              private menuService: MenuService,
              public datepipe: DatePipe,
              private router: Router,
              private dateHelper: DateHelperService,
              private clientTableService: ClientTableService,
              private uISettingsService  : UISettingsService,
              public authService: AuthenticationService,
              private cd: ChangeDetectorRef,
              private fb: FormBuilder,
          ) {

    this.reportCategoriesListForm = this.fb.group({
      field: []
    })
    this.reportItemsForm = this.fb.group({
      field: []
    })
    this.reportDesignerForm = this.fb.group({
      field: []
    })
  }

  ngOnInit(): void {
    this.deviceInfo = this.authService.deviceInfo;
    const showValues = localStorage.getItem('showValues')
    this.showValues = false;
    if (showValues == 'true') {
      this.showValues = true
    }
    this.initDateFilter();
    this.initSettings();
  };

  initDateFilter() {
    this.completionDateForm  = this.getFormRangeInitial(this.completionDateForm);
    this.subscribeToCompletionDatePicker();
    this.refreshCompletionDateSearch();
    this.refreshReports()
    return
  }

  refreshCompletionDateSearch() {
    const dateFrom = this.completionDateForm.get("start").value
    const dateTo   = this.completionDateForm.get("end").value
    this.dateFrom  = this.dateHelper.format(dateFrom, 'MM/dd/yyyy')
    this.dateTo    = this.dateHelper.format(dateTo, 'MM/dd/yyyy')
    this.count = +this.count+1
    this.setReportingServiceDateRange();
    this.refreshReports()
  }

  setReportingServiceDateRange(){
    this.reportingService.dateFrom = this.dateFrom;
    this.reportingService.dateTo = this.dateTo;
  }

  subscribeToCompletionDatePicker() {
    const form = this.completionDateForm //(this.completionDateForm)
    if (!form) {return}
    form.valueChanges.subscribe( res=> {
      if (form.get("start").value &&
          form.get("end").value) {
        this.refreshCompletionDateSearch()
      }
    })
  }

  subscribeToDateRangeData(form: UntypedFormGroup) {
    if (form) {
      form.get('start').valueChanges.subscribe( res=> {
        form.controls['end'].setValue('')
      }
    )
    return form
  }}


  getFormRangeInitial(inputForm: UntypedFormGroup) {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    //then set the current date range of the view
    inputForm  =  this.fb.group({
      start: new Date(year, month, 1),
      end: new Date()
    })
    return inputForm;
  }

  toggleReports(type) {
    this._showValues(true)
    this.showValues = true;
    this.displayReports = type;
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.setReportingServiceDateRange();
  }

  notifyChild() {
    this.value = !this.value;
    this.childNotifier.next(this.value);
  }

  setInitialDateRange() {
    const date = new Date();
    const firstDay =   new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.dateFrom = this.datepipe.transform(firstDay, 'yyyy-MM-dd')
    this.dateTo = this.datepipe.transform(lastDay, 'yyyy-MM-dd')
  }

  refreshReports() {
    this.getUser()
    this.notifyChild()
  }

  get designReportButtonView() {
    if (this.largeDevice) {
      return this.designReportButton
    }
    return null;
  }

  get reportDesignerOutPutView() {
    if (this.largeDevice && this.displayReports === 'output') {
      return this.reportDesigner
    }
    return undefined;
  }

  get reportCategoriesView() {
    if (this.largeDevice) {
        return this.reportCategories
    }
    return this.reportCategoriesList;
  }

  get largeDevice() {
    try {
      if (this.deviceInfo.smallDevice ) {
        return false;
      }
      if (this.deviceInfo.phoneDevice ) {
        return false;
      }
      return true;
    } catch (error) {
      console.log('error large device', error)
    }
    return true;
  }

  navDesigner() {
    this.router.navigate(['ps-designer-list'])
  }

  toggleShowValues() {
    this.showValues= !this.showValues
    this._showValues(this.showValues)
  }

  _showValues(result: boolean) {
    localStorage.setItem('showValues', 'false')
    if (this.showValues) {
      localStorage.setItem('showValues', 'true')
    }
  }

  initSettings() {

    const sites$ = this.sitesService.getSites().pipe(switchMap(data => {
      this.sites = data;
      return of(data)
    }))

    const uiTransactions$ =  this.uISettingsService.getSetting('UITransactionSetting')

    this.uiTransactions$ =
        sites$.pipe(switchMap(data => {
            return uiTransactions$
        })).pipe(switchMap(data => {
          if (data) {
            this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
            return of(this.uiTransactions)
          }
          if (!data) {
            this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
            return of(this.uiTransactions)
          }
        })).pipe(switchMap(data => {
          this.initDateFilter();
          this.refreshReports();
          return of(data)
      })
    )
  }

  getUser() {
    const user = this.authentication.userValue;
    this.currentUser    = user;
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
      this.setReportingServiceDateRange()
      this.refreshReports()
    }
  };

  get siteReportsView() {
    if (this.sites) {
      return this.siteReports;
    }
    return null;
  }

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
  }

  email() {
    this.email$ = this._email()
  }

  get customReportView() {
    if (this.displayReports === 'output') {
      return this.customReport;
    }
    return undefined
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

  showView(view: any) {
    console.log('show view', view)
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

  get paymentRefundsView() {
    const filteredData = this.reportsListView.filter(data => data.id === 7 && data.visible);
    if (filteredData.length > 0) {
      return this.paymentRefunds
    }
    return null
  }

  get paymentVoidsView() {
    const filteredData = this.reportsListView.filter(data => data.id === 8 && data.visible);
    if (filteredData.length > 0) {
      return this.paymentVoids
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
