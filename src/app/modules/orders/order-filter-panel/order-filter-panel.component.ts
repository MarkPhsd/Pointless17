import {Component, OnDestroy,
  HostListener, OnInit, AfterViewInit,
  EventEmitter, Output,
  ViewChild, ElementRef,
  }  from '@angular/core';
import { IServiceType, ISetting, IUser,  } from 'src/app/_interfaces';
import { IPOSOrder, IPOSOrderSearchModel,  } from 'src/app/_interfaces/transactions/posorder';
import { IItemBasic,} from 'src/app/_services';
import { OrdersService } from 'src/app/_services';
import { ActivatedRoute, Router} from '@angular/router';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Plugins } from '@capacitor/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription, of } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { IPrinterLocation } from 'src/app/_services/menu/printer-locations.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
const { Keyboard } = Plugins;

@Component({
  selector: 'app-order-filter-panel',
  templateUrl: './order-filter-panel.component.html',
  styleUrls: ['./order-filter-panel.component.scss']
})
export class OrderFilterPanelComponent implements OnDestroy, OnInit, AfterViewInit {

  terminalSetting : ITerminalSettings;
  //auth - suspended orders, employee selection
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  printingEnabled    : boolean;
  electronEnabled    : boolean;
  printerName        : string;
  printQuantity      : number;

  selectedEmployee            : number;
  selectedType                : number;
  toggleOpenClosedAll            = "1";
  toggleSuspendedOrders          = "0";
  toggleOrdersGreaterThanZero    = "0";
  toggleTypeEmployee             = "0"
  printForm          : UntypedFormGroup;
  user               = {} as IUser;

  completionDateForm     : UntypedFormGroup;
  dateFrom          : any;
  dateTo            : any;

  scheduleDateForm  : UntypedFormGroup;
  scheduleDateFrom  : any;
  scheduleDateTo    : any;

  // searchModel   = {} as IPOSOrderSearchModel;
  employees$       :   Observable<IItemBasic[]>;
  serviceTypes$    :   Observable<IServiceType[]>;
  orderServiceType = {} as IServiceType;

  _searchModel     :   Subscription;
  searchModel      :   IPOSOrderSearchModel;
  searchForm       : UntypedFormGroup;
  searchPhrase     : Subject<any> = new Subject();
  value            : string;
  smallDevice      = false;

  isAuthorized     : any;
  isStaff          : boolean;
  isUser           : boolean;

  showDateFilter   : boolean;
  showScheduleFilter  = false ;

  _viewType        : Subscription;
  viewType         : number;

  printLocation       = 0;
  prepStatus          = 1;
  _prepStatus         : Subscription;
  _printLocation      : Subscription;
  printerLocations$   : Observable<IPrinterLocation[]>;

  @Output() outPutHidePanel = new EventEmitter();

  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  searchItems$              : Subject<IPOSOrderSearchModel[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
  debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
      this.refreshSearch()
    )
  )

  uiTransactions  = {} as TransactionUISettings;
  uiTransactions$  : Observable<ISetting>;
  _UITransaction: Subscription;

  searchDates:      Subject<any> = new Subject();
  searchDate$  : Subject<IPOSOrderSearchModel[]> = new Subject();
  _searchDate$ = this.searchDates.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
      {
        this.refreshSearch()
        return searchPhrase
      }
    )
  )

  initUITransactionsSubscriber() {
    this._UITransaction = this.uISettingsService.transactionUISettings$.subscribe( data => {
      if (data) {
        this.uiTransactions = data;
      }
    })
  }
  initTerminalSettingSubscriber() {
    this.settingService.terminalSettings$.subscribe(data => {
      this.terminalSetting = data;
      if (!data) {
        this.terminalSetting = {} as ITerminalSettings;
      }
    })
  }

  initStatusSubscriber() {
    this._prepStatus = this.printingService.prepStatus$.subscribe( data => {
      if (!data) {
        this.prepStatus = 1
      }
      if (data) {
        this.prepStatus = data;
      }
    })
  }

  initPrintLocationSubscriber() {
    this._printLocation = this.printingService.printerLocation$.subscribe( data => {
      if (data) {
        this.printLocation = data;
      }
    })
  }

  initViewTypeSubscriber() {
    this._viewType = this.orderMethodsService.viewOrderType$.subscribe(data => {
      this.viewType = data;
    })
  }

  initSearchSubscriber() {
    try {
      this._searchModel = this.orderMethodsService.posSearchModel$.subscribe( data => {
        this.searchModel = data
        this.initFilter(data)
      })
    } catch (error) {
    }
  }

  initSubscriptions() {
    this.initTerminalSettingSubscriber();
    this.initStatusSubscriber();
    this.initPrintLocationSubscriber();
    this.initViewTypeSubscriber();
    this.initSearchSubscriber();
    this.initUITransactionsSubscriber()
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._prepStatus) { this._prepStatus.unsubscribe()}
    if (this._searchModel) {
      this._searchModel.unsubscribe()
    }
    if (this._printLocation) { this._printLocation.unsubscribe()}
    if (this._prepStatus) { this._prepStatus.unsubscribe()}
    if (this._viewType) { this._viewType.unsubscribe(); }
  }

  constructor(
      private orderService    : OrdersService,
      private router          : Router,
      public  route           : ActivatedRoute,
      private printingService : PrintingService,
      private siteService     : SitesService,
      private serviceTypes    : ServiceTypeService,
      private settingService  : SettingsService,
      private matSnack        : MatSnackBar,
      private fb              : UntypedFormBuilder,
      private userAuthorization  : UserAuthorizationService,
      private dateHelper: DateHelperService,
      private _bottomSheet    : MatBottomSheet,
      private uISettingsService: UISettingsService,
      public orderMethodsService: OrderMethodsService,
  )
  {

    this.initSubscriptions();
    if ( this.terminalSetting) {
      if (this.terminalSetting.resetOrdersFilter) {
        this.orderMethodsService.updateOrderSearchModel(null)
      }
    }
  }

  ngOnInit() {
    const site           = this.siteService.getAssignedSite();
    this.employees$      = this.orderService.getActiveEmployees(site);
    this.serviceTypes$   = this.serviceTypes.getSaleTypes(site);
    this.initAuthorization();
    this.initCompletionDateForm();
    this.initScheduledDateForm();
    this.initForm();
    if (this.isAuthorized) {
      this.serviceTypes$   = this.serviceTypes.getAllServiceTypes(site);
    }
    this.refreshSearch();
    this.updateItemsPerPage();
    this.subscribeToScheduledDatePicker()
  }

  displayPanel()  {
    const show =  localStorage.getItem('OrderFilterPanelVisible')
    console.log(show)
    if (!show || show === 'true') {
      localStorage.setItem('OrderFilterPanelVisible', 'false')
      this.outPutHidePanel.emit(true)
      return
    }
    if (show === 'false') {
      localStorage.setItem('OrderFilterPanelVisible', 'true')
      this.outPutHidePanel.emit(false)
      return
    }
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {

      this.showDateFilter = true;
    }
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      itemName          : [''],
    })
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }
  }

  exitBottomSheet() {
    this._bottomSheet.dismiss()
  }

  ngAfterViewInit() {
    this.initSearchOption();
  }

  initSearchOption() {
    if (this.input) {
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(250),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          try {
            const search  = this.input.nativeElement.value
            this.refreshOrderSearch(search);
            this.input.nativeElement.focus();
          } catch (error) {
            console.log('error searching')
          }
        })
      )
      .subscribe();
      }
  }

  gotoPayments() {
    this.router.navigateByUrl('/pos-payments');
  }

  resetSearch() {
    this.searchModel = {} as IPOSOrderSearchModel;
    this.initCompletionDateForm();
    this.initScheduledDateForm();
    this.toggleSuspendedOrders       = "0";
    this.toggleOrdersGreaterThanZero = "0";
    this.toggleOpenClosedAll         = "1"
    this.toggleTypeEmployee          = "0"

    this.value = ''
    if (this.user.roles==='user'){
      this.value = '1';
    }
    if (this.searchModel) {  this.searchModel.orderID = 0}
    this.initForm();
    this.refreshSearch();
    this.clearOrder();
  }

  clearOrder() {
    this.orderMethodsService.updateOrderSubscription(null);
  }

  initEmployeeList(){
    const site           = this.siteService.getAssignedSite()
    setInterval(this.refreshEmployees, (60*1000) *5);
  }

  refreshEmployees(){
    const site           = this.siteService.getAssignedSite()
    if (!site) { return}
    this.employees$      = this.orderService.getActiveEmployees(site)
  }

  updateOrderSearch(searchModel: IPOSOrderSearchModel) {
    this.orderMethodsService.updateOrderSearchModel( searchModel )
  }

  //check
  initFilter(search: IPOSOrderSearchModel) {
    if (!search) {
      search = {} as IPOSOrderSearchModel
      search.suspendedOrder       = 0
      search.greaterThanZero      = 0
      search.closedOpenAllOrders  = 1;
      this.searchModel = search;
    }

    if (this.uiTransactions && !this.uiTransactions.toggleUserOrAllOrders) {
      this.searchModel.employeeID = 0;
    }

    if (search.suspendedOrder) {
      this.toggleSuspendedOrders       =  search.suspendedOrder.toString()      //= parseInt(this.toggleSuspendedOrders)
    }
    if (search.greaterThanZero) {
      this.toggleOrdersGreaterThanZero =  search.greaterThanZero.toString()
    }
    if (search.closedOpenAllOrders) {
      this.toggleOpenClosedAll         =  search.closedOpenAllOrders.toString()
    }
  }

  changeToggleTypeEmployee() {
  }

  orderSearch(searchPhrase) {
    if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel }
    this.searchModel.orderID = parseInt( searchPhrase)
    this.searchModel.description = searchPhrase

    this.updateOrderSearch(this.searchModel)
  }

  refreshSearch() {
    if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel
      this.searchModel.serviceTypeID = 0
      this.searchModel.employeeID    = 0
    }

    let search               = this.searchModel;
    search.suspendedOrder      = parseInt(this.toggleSuspendedOrders)
    search.greaterThanZero     = parseInt(this.toggleOrdersGreaterThanZero)
    search.closedOpenAllOrders = parseInt(this.toggleOpenClosedAll)
    search.pageNumber          = 1;
    if (this.toggleScheduleDateRangeFilter) {
      search = this.getScheduleDateSearch(search)
    }

    search = this.getCompletionDateSearch(search);

    search.printLocation       = 0;
    search.prepStatus          = 1;
    if (this.viewType ==3) {
      search.printLocation      = this.printLocation;
      search.prepStatus         = 1;
    }
    this.updateOrderSearch(search);
    return of('')
  }

  refreshOrderSearch(searchPhrase) {
    this.searchModel = {} as IPOSOrderSearchModel;
    this.searchModel.serviceTypeID = 0
    this.searchModel.employeeID    = 0
    this.searchModel.orderID   = parseInt(searchPhrase)
    const search               = this.searchModel;
    search.suspendedOrder      = parseInt(this.toggleSuspendedOrders)
    search.greaterThanZero     = parseInt(this.toggleOrdersGreaterThanZero)
    search.closedOpenAllOrders = parseInt(this.toggleOpenClosedAll)
    if (search.closedOpenAllOrders == 2) {
      search.scheduleDate_From = null;
      search.scheduleDate_To = null;
    }
    this.updateOrderSearch(search)
  }

  setServiceType(event) {
    if (!event) { return }
    this.searchModel.serviceTypeID = event.id
    this.refreshSearch()
  }

  setEmployee(event) {
  if (!event) { return }
    this.searchModel.employeeID = event.id
    this.refreshSearch()
  }

  getPrinterName(){}

  async newOrder(){
    const site = this.siteService.getAssignedSite();
    await this.orderMethodsService.newDefaultOrder(site);
  }

  newOrderWithPayload(){
    const site = this.siteService.getAssignedSite();
    this.orderMethodsService.newOrderWithPayload(site, this.orderServiceType)
  }

  newOrderOptions() {
    this._bottomSheet.open(NewOrderTypeComponent)
  }

  notifyEvent(message: string, title: string) {
    this.matSnack.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }

  toggleDateRangeFilter() {
    this.showDateFilter = !this.showDateFilter;
    this.initCompletionDateForm()
  }

  toggleScheduleDateRangeFilter() {
    this.showScheduleFilter = !this.showScheduleFilter;
    this.initScheduledDateForm();
  }

  initCompletionDateForm() {
    if (!this.showDateFilter ) {
      if (this.searchModel) {
        this.searchModel.completionDate_From = null;
        this.searchModel.completionDate_To = null;
      }
      this.completionDateForm = null;
      return
    }
    this.completionDateForm  = this.getEmptyRange() //this.getFormRangeInitial(this.scheduleDateForm)
    this.searchModel.completionDate_From = this.completionDateForm.get("start").value;
    this.searchModel.completionDate_To   = this.completionDateForm.get("end").value;
    this.searchModel.searchOrderHistory = false
    this.subscribeToCompletionDatePicker();
  }

  getEmptyRange() {
    return  this.fb.group({
      start: [],
      end: []
    })
  }

  initScheduledDateForm() {
    if (!this.showScheduleFilter) {
      if (this.searchModel) {
        this.searchModel.scheduleDate_From = null;
        this.searchModel.scheduleDate_To = null;
      }
      this.scheduleDateForm = this.fb.group({
        start: [],
        end: [],
      })
      return
    }
    this.scheduleDateForm = this.getFormRangeInitial(this.scheduleDateForm)
    this.searchModel.scheduleDate_From = this.scheduleDateForm.get("start").value;
    this.searchModel.scheduleDate_To   = this.scheduleDateForm.get("end").value;
  }

  getFormRangeInitial(inputForm: UntypedFormGroup) {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    return  this.fb.group({
      start: new Date(year, month, 1),
      end: new Date()
    })
  }

  subscribeToCompletionDatePicker() {
    const form = this.subscribeToDateRangeData(this.completionDateForm)
    if (!form) {return}
    form.valueChanges.subscribe( res=> {
      if (form.get("start").value &&
          form.get("end").value) {
            this.refreshCompletionDateSearch()
      }
    })
  }

  subscribeToScheduledDatePicker() {
    const form = this.subscribeToDateRangeData(this.scheduleDateForm)
    if (!form) {return}
    form.valueChanges.subscribe( res=> {
      if (form.get("start").value &&
          form.get("end").value) {
            this.refreshScheduledDateSearch()
      }
    })
  }

  subscribeToDateRangeData(form: UntypedFormGroup) {
    if (form) {
      form.get('start').valueChanges.subscribe( res=> {
        if (!res) {return}
        this.dateFrom = res
      }
    )

    form.get('end').valueChanges.subscribe( res=> {
      if (!res) {return}
      this.dateTo = res
      }
    )
    return form
  }}

  emitDatePickerData(event) {
    if (this.completionDateForm) {
      if (!this.completionDateForm.get("start").value || !this.completionDateForm.get("end").value) {
        this.dateFrom = this.completionDateForm.get("start").value
        this.dateTo =  this.completionDateForm.get("end").value
        if (this.dateFrom && this.dateTo) {
          this.refreshCompletionDateSearch()
        }
      }
    }
  }

  emitScheduledDatePickerData(event) {
    if (this.scheduleDateForm) {
      if (!this.scheduleDateForm.get("start").value || !this.scheduleDateForm.get("end").value) {
        this.scheduleDateFrom = this.scheduleDateForm.get("start").value
        this.scheduleDateTo =  this.scheduleDateForm.get("end").value;
        if (this.scheduleDateForm && this.scheduleDateTo) {
          this.refreshScheduledDateSearch()
        }
      }
    }
  }

  refreshCompletionDateSearch() {
    if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel  }
    // this.searchModel = this.getCompletionDateSearch(this.searchModel)
    this.refreshSearch()
  }

  getCompletionDateSearch(searchModel: IPOSOrderSearchModel): IPOSOrderSearchModel {

    if (!this.completionDateForm ) {
      searchModel.completionDate_From = '';
      searchModel.completionDate_To   = '';
      return searchModel
    }
    if (!this.completionDateForm.get("start").value || !this.completionDateForm.get("end").value) {
      searchModel.completionDate_From = '';
      searchModel.completionDate_To   = '';
      return searchModel
    }

    const dateFrom = this.completionDateForm.get("start").value
    const dateTo   = this.completionDateForm.get("end").value
    const start  = this.dateHelper.format(dateFrom, 'short')
    const end = this.dateHelper.format(dateTo, 'short')
    searchModel.completionDate_From = start
    searchModel.completionDate_To   = end
    return searchModel
  }

  getScheduleDateSearch(search: IPOSOrderSearchModel) : IPOSOrderSearchModel {
    if (this.scheduleDateForm && this.scheduleDateForm.get("start").value && this.scheduleDateForm.get("end").value ) {
      this.scheduleDateFrom = this.scheduleDateForm.get("start").value;
      this.scheduleDateTo  = this.scheduleDateForm.get("end").value;
      if (this.scheduleDateTo && this.scheduleDateFrom) {
        const start  = this.dateHelper.format(this.scheduleDateFrom, 'short')
        const end = this.dateHelper.format(this.scheduleDateTo, 'short')
        this.searchModel.scheduleDate_From = start
        this.searchModel.scheduleDate_To  = end
      }
    }
    return search
  }

  refreshScheduledDateSearch() {
      if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel  }

      this.scheduleDateTo = this.scheduleDateForm.get("start").value
      this.scheduleDateFrom  = this.scheduleDateForm.get("end").value

      if (!this.scheduleDateForm || !this.scheduleDateFrom  || !this.scheduleDateTo) {
        this.searchModel.scheduleDate_From = '';
        this.searchModel.scheduleDate_To   = '';
        this.refreshSearch()
        return
      }

      this.searchModel.scheduleDate_From = this.scheduleDateFrom.toLocaleDateString()
      this.searchModel.scheduleDate_To   = this.scheduleDateTo.toLocaleDateString()

      this.refreshSearch()
  }

}
