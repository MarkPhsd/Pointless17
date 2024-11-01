import { Component, OnInit, ViewChild, OnChanges,  SimpleChange, Input, TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, shareReplay, Subject, Subscription, switchMap } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { ReportingService} from 'src/app/_services/reporting/reporting.service';
import { ISite,Item,IUser }  from 'src/app/_interfaces';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DatePipe } from '@angular/common'
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { IDeviceInfo, MenuService, OrdersService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { IPaymentSalesSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';
import { ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { BalanceSheetService } from 'src/app/_services/transactions/balance-sheet.service';
import { TransferDataService } from 'src/app/_services/transactions/transfer-data.service';
import dayjs from 'dayjs/esm';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnChanges,OnInit, OnDestroy  {
  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective: DaterangepickerDirective;

  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  }

  averageHourlySales$: Observable<any[]>;
  topSalesByQuantity$: Observable<any[]>;
  topSalesByTotalPrice$ : Observable<any[]>;
  topSalesByProfit$: Observable<any[]>;
  showTopSales: boolean;
  viewChartReports : number = 0;
  auditPayment$ : Observable<IPaymentSalesSummary>;
  auditPayment  : IPaymentSalesSummary;
  averageHourlySales = []
  dynamicData$      : any;
  zrunID            : string;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  loadDynamicData:  boolean = false;


  reportList = [
    {name: 'Re Order List', id: '1', icon: ''},
    {name: 'Department Values', id: '2', icon: ''},
    {name: 'Category Values', id: '3', icon: ''},
    {name: 'Department Values', id: '8', icon: ''},
    {name: 'SubCategory Values', id: '9', icon: ''},
    {name: 'Brand Values', id: '7', icon: ''},
    {name: 'Item Values', id: '4', icon: ''},
    {name: 'New Customer Count Today', id: '5', icon: ''},
    {name: 'New Customer Count 30 Days', id: '6', icon: ''},
  ]

  //    {id:10, visible: false, name: 'ServiceFees'},
  reportsListView = [
    {id: 1, visible: false, name: 'Category Sales' },
    {id: 2, visible: false ,name: 'Taxed Category'},
    {id: 3, visible: false, name: 'Non Tax Category' },
    {id: 4, visible: false, name: 'Item Sales' },
    {id: 5, visible: false, name: 'Item Voids View' },
    {id: 6, visible: false, name: '' },
    {id: 7, visible: false, name: 'Payment Refunds' },
    {id: 8, visible: false, name: 'Payment Voids' },
    {id: 9, visible: false, name: 'Item Type Sales' },
    {id:12, visible: false, name: 'UOM'},
    {id:13, visible: false, name: 'ItemSizeGroup'},
    {id:14, visible: false, name: 'SubCategory Sales'},
    {id:15, visible: false, name: 'Brands Sales'},
    {id:17, visible: false, name: 'Departments View'},
    {id:18, visible: false, name: 'Vendor Sales'},
  ]

  //  {name: 'Service Fees',id: '10', icon:''},
  itemReportList = [
    {name: 'All Details', id: '0', icon: ''},
    {name: 'Categories',  id: '1', icon: ''},
    {name: 'Taxed Categories',       id: '2', icon: ''},
    {name: 'Non Taxed Categories',   id: '3', icon: ''},
    {name: 'All Items',   id: '4', icon: ''},
    {name: 'Departments', id: '17', icon: ''},
    {name: 'Item Types',  id: '9', icon:''},
    {name: 'UOM Sales',   id: '12', icon:''},
    {name: 'Item Grouped QTY',  id: '13', icon:''},
    {name: 'Sub Category',id: '14', icon: ''},
    {name: 'Brands',      id: '15', icon: ''},
    {name: 'Vendor',      id: '18', icon: ''},
  ]

  reportCategoriesListForm: UntypedFormGroup;
  reportItemsForm: UntypedFormGroup;
  reportDesignerForm: UntypedFormGroup;

  reportGroupSelected: any;
  reportGroupList = [
    {name: 'Financials', value: 'financials', id: 1, icon: 'money'},
    {name: 'Products & Services', value: 'items', id: 2, icon: 'list'},
    {name: 'Inventory / Menu', value: 'output', id: 3, icon: 'inventory'},
    {name: 'Labor', value: 'labor', id: '5', icon: 'people'},
    {name: 'Audit', value: 'audit', id: 4, icon: 'inventory'}
  ]

  @ViewChild('customReport')      customReport: TemplateRef<any> | undefined;
  @ViewChild('departmentSales')       departmentSales: TemplateRef<any> | undefined;
  @ViewChild('categorySales')         categorySales: TemplateRef<any> | undefined;
  @ViewChild('taxedCategorySales')    taxedCategorySales: TemplateRef<any> | undefined;
  @ViewChild('nonTaxedCategorySales') nonTaxedCategorySales: TemplateRef<any> | undefined;
  @ViewChild('itemSales')         itemSales: TemplateRef<any> | undefined;
  @ViewChild('itemTypeSales')     itemTypeSales: TemplateRef<any> | undefined;
  @ViewChild('serviceFees')       serviceFees: TemplateRef<any> | undefined;
  @ViewChild('uomSales')          uomSales: TemplateRef<any> | undefined;
  @ViewChild('itemSizeSales')     itemSizeSales: TemplateRef<any> | undefined;

  @ViewChild('subCategorySales')  subCategorySales: TemplateRef<any> | undefined;
  @ViewChild('brandSales')        brandSales: TemplateRef<any> | undefined;
  @ViewChild('vendorSales')       vendorSales: TemplateRef<any> | undefined;

  @ViewChild('itemVoids')       itemVoids: TemplateRef<any> | undefined;

  @ViewChild('siteReports')          siteReports: TemplateRef<any> | undefined;
  @ViewChild('paymentVoids')         paymentVoids: TemplateRef<any> | undefined;
  @ViewChild('paymentRefunds')       paymentRefunds: TemplateRef<any> | undefined;
  @ViewChild('reportDesigner')       reportDesigner: TemplateRef<any> | undefined;
  @ViewChild('paymentPositiveNeg')   paymentPositiveNeg: TemplateRef<any> | undefined;

  @ViewChild('reportCategories')      reportCategories: TemplateRef<any> | undefined;
  @ViewChild('reportCategoriesList')  reportCategoriesList: TemplateRef<any> | undefined;
  @ViewChild('reportDepartmentsList') reportDepartmentsList: TemplateRef<any> | undefined;
  @ViewChild('designReportButton')    designReportButton: TemplateRef<any> | undefined;

  @ViewChild('reportsView')   reportsView: TemplateRef<any> | undefined;
  @ViewChild('chartsView')    chartsView: TemplateRef<any> | undefined;

  emailSending           = false;
  showValues             = false;
  email$                 : Observable<any>;
  count                  = 0;
  value                  = false;
  childNotifier          : Subject<boolean> = new Subject<boolean>();
  @ViewChild('metrcNetSalesSummary') metrcNetSalesSummary: TemplateRef<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  //for charts
  action$: Observable<any>;
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
  zrunReports$: Observable<any>;
  zrunListForm : FormGroup;
  item                  : Item; //for routing
  displayReports = 'financials'
  deviceInfo: IDeviceInfo;

  completionDateForm     : UntypedFormGroup;

  uiHomePage : UIHomePageSettings
  _uiHomePage: Subscription;
  autoPrint: boolean = false;
  batchData: any;
  selected
  constructor(
              private authentication              : AuthenticationService,
              private reportingService            : ReportingService,
              private balanceSheetService         : BalanceSheetService,
              private  reportingItemsSalesService : ReportingItemsSalesService,
              private salesPaymentsService        : SalesPaymentsService,
              private sendGridService             : SendGridService,
              private sitesService                : SitesService,
              private siteService                 : SitesService,
              private menuService: MenuService,
              public  datepipe: DatePipe,
              private router: Router,
              private dateHelper: DateHelperService,
              private clientTableService: ClientTableService,
              private uISettingsService  : UISettingsService,
              public  authService: AuthenticationService,
              private cd: ChangeDetectorRef,
              private paymentReportService: SalesPaymentsService,
              private fb: FormBuilder,
              private orderService: OrdersService,
              private orderMethodsService: OrderMethodsService,
              private transferDataService: TransferDataService,
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
    this.subscribeUIHomePage();
  };

  openDatepicker() {
      this.pickerDirective.open();
  }
  subscribeUIHomePage() {
    try {
      this._uiHomePage = this.uISettingsService.homePageSetting$.subscribe(data => {
        if (data) {
          this.uiHomePage = data;
        }
      })
    } catch (error) {

    }

  }
  setOrder(id: number, history) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.orderService.getOrder(site, id.toString(), true).subscribe(data => {
        this.orderMethodsService.setActiveOrder(data)
        }
      )
    }
  }

  initDateFilter() {
    this.completionDateForm  = this.getFormRangeInitial(this.completionDateForm);
    this.refreshZrunReports(this.completionDateForm.controls["start"].value , this.completionDateForm.controls["end"].value )
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
    const form = this.completionDateForm
    if (!form) {return}
    form.valueChanges.subscribe( res=> {
      if (form.get("start").value &&
          form.get("end").value) {
        this.refreshCompletionDateSearch();
        this.initZrunForm()
        this.refreshZrunReports(form.get("start").value , form.get("end").value )
      }
    })
  }

  initZrunForm() {
    this.zrunListForm = this.fb.group({
      id: [],
    })
  }

  setDaterangeByZRUN(event) {
    const site = this.siteService.getAssignedSite()
    this.zrunID = null;
    this.action$ =  this.balanceSheetService.getSheet(site, event).pipe(switchMap(data => {
      const batchObj = this.siteService.convertToCamel(JSON.parse(data?.batchJSON))
      this.dateFrom = null;
      this.dateTo   = null;
      this.zrunID   = data?.id.toString();
      this.batchData = batchObj
      return of(data)
    }))
  }

  refreshZrunReports(start: string, end: string) {

    if (this.dateFrom) {
      start = this.dateFrom
    }
    if (this.dateTo) {
      end = this.dateTo
    }

    const site = this.siteService.getAssignedSite()
    this.zrunID = null;

    this.initZrunForm()
    this.zrunReports$ = this.salesPaymentsService.listZrunsInDateRange(site, start, end).pipe(switchMap(data => {
      if (data.resultMessage) {
        this.siteService.notify(`Error ${data.resultMessage}`, 'Error', 5000, 'red'  )
      }
      return of(data.paymentSummary);
    }))
  }

  deleteDuplicates() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.transferDataService.deleteDuplicates(site, this.zrunID).pipe(switchMap(data => {
      this.siteService.notify('Process complete. Please refresh reports and validate', 'close', 5000)
      return of(data)
    }))
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

  get  reportsOrChartsView() {
    if (this.viewChartReports == 0) {
      return this.reportsView
    }
    if (this.viewChartReports == 1) {
      return this.chartsView;
    }
  }

  toggleReports(type) {
    this._showValues(true)
    this.showValues = true;
    this.displayReports = type;
    if (type == 'items') {
      this.showView(1)
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.setReportingServiceDateRange();
  }

  ngOnDestroy() {
    if (this._uiHomePage) { this._uiHomePage.unsubscribe()}
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
    this.count = +this.count+1
    this.getUser()
    this.notifyChild();
  }

  refreshReportsSub() {
    this.refreshCompletionDateSearch();
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
    if (this.viewChartReports == 0) {
      this.viewChartReports = 1;
      return
    }
    if (this.viewChartReports == 1) {
      this.viewChartReports = 0;
      return;
    }
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

  assignItemFromDynamicGrid(event) {
    console.log(event)
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

  getAverageHourlySalesData() {
    const observablesArray: Observable<any>[] = this.sites.map(site =>
        this.salesPaymentsService.getSalesAndLaborPeriodAverage(site, this.dateFrom, this.dateTo)
    );
    this.averageHourlySales$ = forkJoin(observablesArray).pipe(shareReplay(1));
  }


  getTopProductCharts() {
    this.showTopSales = true ;
    const topProductsProfit: Observable<any>[] = this.sites.map(site =>
      this.reportingItemsSalesService.getTopSalesByProfit(site, this.dateFrom, this.dateTo)
    );

    this.topSalesByProfit$ = forkJoin(topProductsProfit).pipe(shareReplay(1));

    const topSalesByTotalPrice: Observable<any>[] = this.sites.map(site =>
      this.reportingItemsSalesService.getTopSalesByTotalPrice(site, this.dateFrom, this.dateTo)
    );

    this.topSalesByTotalPrice$ = forkJoin(topSalesByTotalPrice).pipe(shareReplay(1));

    const topSalesByQuantity: Observable<any>[] = this.sites.map(site =>
      this.reportingItemsSalesService.getTopSalesByQuantity(site, this.dateFrom, this.dateTo)
    );
    this.topSalesByQuantity$ = forkJoin(topSalesByQuantity).pipe(shareReplay(1));
  }

  showView(view: any) {

    if (view == 0) {
      this.reportsListView.forEach(data => {
        data.visible = true
      })
    }

    // console.log('view', view)
    this.reportsListView.forEach(data => {
      if (view == data.id) {
        // console.log('view', view, data.id, view == data.id)
        data.visible = true
      }
    })
  }

  get vendorSalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 18 && data.visible);
    if (filteredData.length > 0) {
      return this.vendorSales
    }
    return null
  }


  get brandSalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 15 && data.visible);
    if (filteredData.length > 0) {
      // console.log('brand sales visible')
      return this.brandSales
    }
    return null
  }

  get subCategorySalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 14 && data.visible);
    if (filteredData.length > 0) {
      return this.subCategorySales
    }
    return null
  }


  get departmentSalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 17 && data.visible);
    if (filteredData.length > 0) {
      return this.departmentSales;
    }
    return null
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

  get serviceFeesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 10 && data.visible);
    if (filteredData.length > 0) {
      return this.serviceFees
    }
    return null
  }

  get itemTypeSalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 9 && data.visible);
    if (filteredData.length > 0) {
      return this.itemTypeSales
    }
    return null
  }

  get itemSizeSalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 13 && data.visible);
    if (filteredData.length > 0) {
      return this.itemSizeSales
    }
    return null
  }

  get uomSalesView() {
    const filteredData = this.reportsListView.filter(data => data.id === 12 && data.visible);
    if (filteredData.length > 0) {
      return this.uomSales
    }
    return null
  }

  get paymentPositiveNegView() {
    const auth = this.authService._userAuths.value
    if (auth.buysSalesReports) {
      return this.paymentPositiveNeg
    }
    return null;
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
