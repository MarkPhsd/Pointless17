import { Component,
         OnInit ,
         Input,
         HostListener,
         OnDestroy,
         ViewChild,
         TemplateRef,
         ChangeDetectorRef,
         ElementRef} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { IPaymentResponse, IPaymentSearchModel, IPOSOrder,
         IPOSPayment, IPOSPaymentsOptimzed,
         IServiceType, ISite } from 'src/app/_interfaces';
import { AuthenticationService, IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { StoreCreditMethodsService } from 'src/app/_services/storecredit/store-credit-methods.service';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { CoachMarksClass, CoachMarksService } from 'src/app/shared/widgets/coach-marks/coach-marks.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'app-pos-payment',
  templateUrl: './pos-payment.component.html',
  styleUrls: ['./pos-payment.component.scss']
})
export class PosPaymentComponent implements OnInit, OnDestroy {

  get platForm() {  return Capacitor.getPlatform(); }
  @ViewChild('receiptView') receiptView: TemplateRef<any>;
  @ViewChild('splitItemsView') splitItemsView: TemplateRef<any>;
  @ViewChild('processingPayment') processingPayment: TemplateRef<any>;
  @ViewChild('giftCardPayButton') giftCardPayButton: TemplateRef<any>;
  @ViewChild('splitItemorders') splitItemorders: TemplateRef<any>;
  @ViewChild('payAPI') payApi: TemplateRef<any>;

  //coaching
  @ViewChild('coachingPaymentsMade', {read: ElementRef}) coachingPaymentsMade: ElementRef;
  @ViewChild('coachingAuthorization', {read: ElementRef}) coachingAuthorization: ElementRef;
  @ViewChild('coachingAdjustAuth', {read: ElementRef}) coachingAdjustAuth: ElementRef;
  @ViewChild('coachingSplitGroups', {read: ElementRef}) coachingSplitGroups: ElementRef;
  @ViewChild('coachingPaymentFull', {read: ElementRef}) coachingPaymentFull: ElementRef;
  @ViewChild('coachingPaymentPartial', {read: ElementRef}) coachingPaymentPartial: ElementRef;
  process$: Observable<any>;
  @Input() order  :   IPOSOrder;
  isApp = this.platFormService.isApp();
  androidApp = this.platFormService.androidApp;
  userAuths       :   IUserAuth_Properties;
  _userAuths      :   Subscription;
  changeDueComing :   any;
  loginAction     :   any;
  id              :   number;
  _currentPayment :   Subscription; //    = new BehaviorSubject<IPOSPayment>(null);
  currentPayment$ :   Observable<IPOSPayment>;//     = this._currentPayment.asObservable();
  posPayment      =   {} as IPOSPayment;

  action$        :   Observable<any>;
  employees$      :   Observable<IItemBasic[]>;
  paymentMethods$ :   Observable<IPaymentMethod[]>;
  paymentGiftCardsList$:   Observable<IPaymentMethod[]>;
  paymentGiftCardsList: IPaymentMethod[]
  paymentMethod   =   {} as IPaymentMethod;
  serviceTypes$   :   Observable<IServiceType[]>;
  serviceType     :   IServiceType;
  _searchModel    :   Subscription;
  searchModel     :   IPaymentSearchModel;
  paymentAmountForm : UntypedFormGroup;
  pointValueForm  :   UntypedFormGroup
  checkNumberForm :   UntypedFormGroup
  _order          :   Subscription;
  showInput       =   true // initialize keypad open
  stepSelection   = 1;
  stripeEnabled   : boolean;
  dsiEMVEnabled   : boolean;
  paymentSummary$    : Observable<IPOSPaymentsOptimzed>;
  paymentSummary     : IPOSPaymentsOptimzed;
  paymentsEqualTotal : boolean;

  posRefOrders$       : Observable<IPOSOrder[]>;
  smallDevice         = false;
  phoneDevice:        boolean;
  orderItemsPanel     = ''

  orderDefaultType    = false;
  paymentIsReady      : boolean;
  splitByItem         : boolean;

  isAuthorized  : boolean;
  isUser        : boolean;
  isStaff       : boolean;
  paymentMethods  : IPaymentMethod[];

  stripeTipValue  : any;
  processing: boolean;
  groupPaymentAmount  = 0;
  groupPaymentGroupID = 0;
  _paymentAmount       = 0;
  enterCustomAmount   = false;
  _creditPaymentAmount = 0;

  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  uiTransactions: TransactionUISettings
  devicename = localStorage.getItem('devicename')
  message: string;
  serviceIsScheduled: boolean;
  orderAction$  : Observable<any>;
  saleProcess$  : Observable<any>;
  user          : any;
  _user: Subscription;
  _orderLayout = 'order-receiptLayouts'
  posDevice: ITerminalSettings;
  PaxA920 : boolean;
  payApiEnabled: boolean;
  enablePreAuth = this.paymentsMethodsService?.DSIEmvSettings?.partialAuth;
  posDevice$      = this.uISettingsService.posDevice$.pipe(switchMap(data => {
    if (!data)  {
      const item = localStorage.getItem('devicename')
      return this.uISettingsService.getPOSDevice(item).pipe(switchMap(data => {
        if (data) {
          this.setPaxInfo(data)
          this.posDevice = data;
          this.uISettingsService.updatePOSDevice(data)
        }
        return of(data)
      }))
    } else {
      this.setPaxInfo(data)
    }

    return of(data)
  }))
  get isProcessingPayment() {
    if (this.processing) {
      return this.processingPayment;
    }
    return null;
  }

  setPaxInfo(data) {
    if (data.dsiEMVSettings) {
      if (data?.dsiEMVSettings?.deviceValue == 'EMV_A920PRO_DATACAP_E2E') {
        this.PaxA920 = true
      }
    }
  }

  get androidPaxA920Payment() {
    if (
      !this.order?.completionDate &&
      (
        (this.order?.balanceRemaining != 0 || this.isNegativePaymentAllowed || this.isZeroPaymentAllowed) ||
        (this.order?.balanceRemaining < 0 || this.isNegativePaymentAllowed)
      ) &&
      !this.splitByItem
    ) {
      if (this.smallDevice && this.platFormService.androidApp) {
        return true;
      }
    }
    return false;
  }

  get orderLayout() {
    if (!this._orderLayout) {
        return 'order-layout'
    }
    return this._orderLayout;
  }

  initStepSelectionSubscription() {
     this.saleProcess$ = this.orderMethodsService.posPaymentStepSelection$.pipe(
      switchMap( data => {
        if (data && (data?.isCash || data?.name.toLowerCase() === 'cash')) {
          this.getPaymentMethod(data)
          this.changeDetectorRef.detectChanges();
          this.paymentMethod = data;
          this.stepSelection = 3;
          this.orderMethodsService.updatePaymentMethodStep(null)
        }
      return of(null)
    }))
  }

  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.pipe(
      switchMap( data => {
      if (data) {
        this.order = data

        this.refreshIsOrderPaid();
      }
      if (data && data.serviceTypeID) {
        const site = this.sitesService.getAssignedSite();
        return this.serviceTypeService.getTypeCached(site, data?.serviceTypeID)
      }
      return of(null)
      }
    )).subscribe(data => {
      this.serviceType = data
      if ( data && data.scheduleInstructions ||
         ( this.order && this.order.preferredScheduleDate) ||
         ( data && data.shippingInstructions) ||
         ( data?.deliveryService )
         ) {
        this.serviceIsScheduled = true
      }
      this.processPaymentReady(data)
    })

    this._currentPayment = this.paymentService.currentPayment$.subscribe( data => {
      this.posPayment = data
    })

    this._userAuths = this.authenticationService.userAuths$.pipe(
      switchMap(data => {
      if (data) {
        this.userAuths = data;
        return of(data)
      }
      this.userAuths = JSON.parse(localStorage.getItem('userAuth')) as IUserAuth_Properties
      if (this.userAuths) {
        this.authenticationService.updateUserAuths(this.userAuths)
      }
      return of(this.userAuths)
    })).subscribe(data => {

    })
  }

  userSubscriber() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })
  }

  get isCreditProcessingEnabled() {
    if (this.uiTransactions?.dCapEnabled ||  this.uiTransactions?.triposEnabled || this.uiTransactions?.dsiEMVNeteEpayEnabled ||
        this.uiTransactions?.cardPointAndroidEnabled || this.uiTransactions?.cardPointBoltEnabled || this.uiTransactions?.dsiEMVAndroidEnabled) {
          return true
        }
    return false;
  }

  constructor(private paymentService  : POSPaymentService,
              public  orderMethodsService: OrderMethodsService,
              private sitesService    : SitesService,
              private serviceTypeService: ServiceTypeService,
              private paymentMethodService: PaymentMethodsService,
              private matSnackBar     : MatSnackBar,
              private toolbarUI       : ToolBarUIService,
              private paymentsMethodsService: PaymentsMethodsProcessService,
              public  platFormService : PlatformService,
              private uISettingsService: UISettingsService,
              private storeCreditMethodsService: StoreCreditMethodsService,
              private userAuthorization : UserAuthorizationService,
              private authenticationService: AuthenticationService,
              private changeDetectorRef: ChangeDetectorRef,
              private coachMarksService: CoachMarksService,
              private router          : Router,
              private editDialog      : ProductEditButtonService,
              private fb              : UntypedFormBuilder) { }

  ngOnInit(): void {
    this.initTransactionUISettings();
    this.initAuthorization()
    const site = this.sitesService.getAssignedSite();
    this.paymentService.updatePaymentSubscription(this.posPayment)
    this.toolbarUI.updateOrderBar(false)
    this.initForms();
    this.initSubscriptions();
    this.getPaymentMethods(site)
    this.userSubscriber();


    try {
      this.dsiEMVEnabled = this.paymentsMethodsService.DSIEmvSettings?.enabled;
    } catch (error) {
    }

    if (this.order) {
      const searchModel = {} as IPaymentSearchModel
      searchModel.orderID = this.order.id
    }

    this.refreshIsOrderPaid();
    this.freshDevice();

    this.paymentMethods$ = this.getPaymentMethods(site).pipe(
      switchMap(data => {
        this.paymentMethods = data;
        return of(data)
        }
      )
    );


    if (this.authenticationService.userValue) {
      this.orderAction$ = this.orderMethodsService.getLoginActions()
    }

    this.initStepSelectionSubscription();

    this.paymentGiftCardsList$ =  this.paymentMethodService.getCacheList(site).pipe(switchMap(data => {
       this.paymentGiftCardsList = data.filter(data => { return data.name.toLowerCase() === 'gift card' })
       return of(data)
    }))
  }

  get payAPIEnabled() {
    if (this.uiTransactions.dcapPayAPIEnabled && !this.isApp) {
      return true
    }
    return false
  }

  get disableSplitByItems() {
    if (this.user && this.user.userAuths?.disableSplitByItems) {
      return false
    }
    return true
  }

  get multiPayments() {
    if (this.user && this.user.userAuths?.disableMultiPayments) {
      return false
    }
    return true
  }

  get payAPIView() {
    if (!this.isApp && this.uiTransactions?.dcapPayAPIEnabled) {
      return this.payApi
    }
    return null;
  }

  get giftCardPayButtonView() {
    let pass = false;

    if (this.uiTransactions?.enableGiftCards) {
      return this.giftCardPayButton
    }
    return null
  }
    //Allow Cash Payments For Other Servers
    get isCashAuthorizedPayment() {
      if (this.user?.roles === 'user' || this.user?.roles == 'guest') { return false }
      if (this.userAuths?.allowCashPaymentForOtherServer) {
        return true;
      }

      if (!this.userAuths?.userAssignedBalanceSheet) { return true }

      //if this user is not the user who started the order, we have to make sure they are allowed.
      if (!this.userAuths?.allowCashPaymentForOtherServer) {
        if (this.user?.employeeID != this.order?.employeeID) {
          return false
        }
      }
      return true;
    }

  setGroupID(event) {
    console.log('setgroupd', event);
    //then apply it to the split section, so it updates and shows the appropriate group for this current split
  }

  get cashpaymentRemaining() {
    const order = this.order;
    const ui = this.uiTransactions
    if (ui.dcapMultiPrice) {
      if (ui?.dcapDualPriceValue > 0) {
        return order.total - order.cashDiscountFee
      }
      if (ui?.dcapDualPriceValue < 0) {
        return order.total + order.cashDiscountFee
      }
    }
    return order.balanceRemaining
  }

  enterRewardsAmount(amount) {
    // applies payment method of 'Rewards Points'
    this.posPayment = {} as IPOSPayment;
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.paymentsMethodsService.getPaymentMethodByName(site, 'Rewards Points').pipe(switchMap(data => {
      const value = this.uiTransactions.rewardPointValue * this.order.clients_POSOrders.loyaltyPoints;
      if (value > this.order.balanceRemaining) { amount = this.order.balanceRemaining }
      this.paymentMethod = data
      return this._processPayment(amount, this.posPayment)
    }))
  }

  get rewardsOption(): number {
    if (this.order && this.order.clients_POSOrders) {
      if (this.order.clients_POSOrders.loyaltyPoints > 0) {
        if (this.uiTransactions.rewardPointValue > 0) {
          const value = +this.uiTransactions.rewardPointValue * +this.order.clients_POSOrders.loyaltyPoints;
          if (value > 0) {
            return value
          }
        }
      }
    }
    return 0;
  }
  setLoginAction() {
    const item = localStorage.getItem('loginAction')
    this.loginAction = JSON.parse(item)
  }

  exitOrder() {
    this.orderMethodsService.clearOrder();
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {

    }

  }

  houseAccountPayment() {
    this.action$ =  this.orderMethodsService.suspendOrder(this.order)
  }

  initTransactionUISettings() {
    this.uISettingsService.transactionUISettings$.subscribe( data => {
        this.uiTransactions = data
      }
    )

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) { this._order.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
    if (this._currentPayment) { this._currentPayment.unsubscribe()}
    if (this._userAuths) { this._userAuths.unsubscribe()};
    if (this._user) { this._user.unsubscribe()}
  }

  emailOrder(event) {
    this.orderMethodsService.emailOrder(this.order).subscribe(data => {
      if (data && (data.isSuccessStatusCode || data.toString() == 'Success')) {
        this.orderMethodsService.notifyEvent('Email Sent', 'Success')
        return;
      }
      if (!data.isSuccessStatusCode) {
        this.orderMethodsService.notifyEvent('Email not sent. Check email settings', 'Failed')
        return;
      }
    })
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    return today.getTime() === inputDate.getTime();
  }

  getPaymentMethods(site: ISite) {
    const paymentMethods$ = this.paymentMethodService.getCacheList(site);
    if (this.userAuthorization?.user?.roles === 'user') {
      let list  = [] as IPaymentMethod[]
      return paymentMethods$.pipe(
        switchMap(data => {
          list = data.filter( item => item.enabledOnline)
        return  of(list)
      })
      )
    }

    if (this.platFormService.isApp()) {
      return paymentMethods$.pipe(
        switchMap(data => {
          let list = data.filter( item => !item.isCreditCard)
          list = list.filter( item => !item.wic)
          list = list.filter( item => !item.ebt)
          list = list.filter( item => item.name != 'Gift Card')
          if (!this.isCashAuthorizedPayment) {
              list = data.filter( item => !item.isCash)
          }
          return  of(list)
      }))
    }

    return paymentMethods$.pipe(
      switchMap(data => {
      const list = data.filter( item => item.enabledOnline)

      let list2 = list.filter( item => item.name != 'Gift Card')
      if (!this.uiTransactions?.disableCreditFilter) {
         list2 = list.filter( item => !item.isCreditCard)
      }

      if (!this.isCashAuthorizedPayment) {
        list2 = list2.filter( item => !item.isCash)
      }
      return  of(list2)
    }))

  }

  @HostListener("window:resize", [])
  freshDevice() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }
    if (!this.smallDevice) {
      this._orderLayout = 'order-layout'
      this.orderItemsPanel = 'item-list'
    }
    if (window.innerWidth < 599) {
      this.phoneDevice = true
    }
  }

  refreshIsOrderPaid() {
    if (!this.order) { return }
    this.paymentsEqualTotal  = this.paymentsMethodsService.isOrderBalanceZero(this.order)
    if (this.order.completionDate) {
      return true;
    }
  }

  get receiptShowTemplate() {
    if (this.refreshIsOrderPaid()) {
      return this.receiptView
    }
    return null;
  }

  get splitItemordersView() {
    if (this.splitByItem) {
      return this.splitItemorders
    }
    return null;
  }

  get splitItemsTemplate() {
    if (this.splitByItem) {
      const limiter = this.order && (this.order?.productOrderRef == this.order?.id || this.order?.productOrderRef == 0 || !this.order?.productOrderRef)

      if (limiter || this.userAuths.splitItemOverRide){
        return this.splitItemsView
      }
    }
    return null;
  }

  initForms() {
    this.initCheckForm();
    this.initPaymentForm();
  }

  initCheckForm() {
    this.checkNumberForm = this.fb.group( {
      itemName   : [''],
    })
  }

  navSchedule() {
    this.router.navigate(['pos-order-schedule'])
  }

  processPaymentReady(serviceType: IServiceType) {
    if (serviceType) {
      if (serviceType.deliveryService && !this.order.shipAddress ) {
        this.paymentIsReady  = false;
        this.message = `Address  required.`
        return false
      }

      if (serviceType.promptScheduleTime && !this.order.preferredScheduleDate) {
        this.paymentIsReady = false;
        this.message = `Schedule date required.`
        return
      }

      // console.log('order min', serviceType.orderMinimum, this.order.subTotal)
      if (serviceType.orderMinimum > 0 && this.order.subTotal < serviceType.orderMinimum) {
        this.paymentIsReady = false;
        this.message = `Minumun purchase amount of $ ${serviceType.orderMinimum} required.`
        return
      }

      this.paymentIsReady = true;
    }

  }

  initPaymentForm() {
    this.paymentAmountForm = this.fb.group( {
      itemName   : [''],
    })
  }

  roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  get cashDiscount() {
    const ui = this.uiTransactions;

    if (ui?.dcapSurchargeOption == 3) {
      return this.roundToPrecision( this.order.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 2) {
      return this.roundToPrecision( this.order.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 1 ) {
      return this.roundToPrecision( this.order.balanceRemaining * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (!ui?.dcapSurchargeOption && ui.dcapDualPriceValue ) {
      return this.roundToPrecision( this.order.balanceRemaining * (1 + +ui.dcapDualPriceValue) , 5)
    }

    return null
  }


  formatValueEntered(event) {
    if (event) {
      if (event == 0) {
        //then check the form, it could be manually entered.
        if (this.paymentAmountForm) {
          const value =  this.paymentAmountForm.controls['itemName'].value
          if (value && +value != 0) { event = +value}
        }
      }

      if (event == 0) {
        this.notify(`Check amount entered.`, 'Try Again',3000)
        return
      }
      const amountEntered = event;
      return amountEntered
    }
    return 0
  }

  inputPartialAmount() {
    this.enterCustomAmount = true;
  }

  changeAmount() {
    this.enterCustomAmount = true;
    this.stepSelection = 3
  }

  checkCurrentBalance(event) {
    //show remaining balance after entry.
    // console.log('event', event)
    if (!event) {
      this.changeDueComing = null;
      return;
    }
    this.changeDueComing = event - this.order.balanceRemaining;

  }

  applyPaymentAmount(event) {
    if (!event && this.groupPaymentAmount != 0) {
      this.initPaymentForm();
      return
    }
    let amount;
    if (event) {   amount = event  }
    if (this.order &&  this.paymentMethod) {
        if (event) {
          amount = event
        }  else {
          amount = this.groupPaymentAmount;
        }

        this.posPayment.groupID = this.groupPaymentGroupID;
        if (!amount || amount == 0) {
          amount   = this.formatValueEntered(event)
        }
        if (amount && amount === 0) {
          this.notify('Error getting values for payment. ' + amount, 'Alert', 2000);
          return;
        }

        const isValidAmount = this.paymentsMethodsService.validatePaymentAmount(amount,
                              this.paymentMethod,
                              this.order.balanceRemaining,
                              this.order.creditBalanceRemaining );

        if (!isValidAmount) {
          this.paymentAmountForm  = this.fb.group({fieldname: []})
          return;
        }

        if (this.enterCustomAmount) {
          this.enterCustomAmount = false
          this._paymentAmount    = amount;
          this._creditPaymentAmount = amount;
          this.stepSelection     = 1;
          return
        }

      this.process$ = this._processPayment(amount, this.posPayment);
      return
    }

    const isValidAmount = this.paymentsMethodsService.validatePaymentAmount(amount,
                                                          this.paymentMethod,
                                                          this.order.balanceRemaining,
                                                          this.order.creditBalanceRemaining );
    if (this.enterCustomAmount) {
      this.enterCustomAmount = false
      this._paymentAmount    = amount;
      this._creditPaymentAmount = amount;
      this.stepSelection     = 1;
      return
    }

    this.initPaymentForm();
  }

  _processPayment(amount, posPayment) {
    return this.processGetResults(amount, posPayment).pipe(
      switchMap( data => {
        if (!data) {
          return this.sitesService.notifyObs('Payment not processed', 'close', 5000, 'red');
        }
        this.groupPaymentAmount  = 0;
        this.groupPaymentGroupID = 0;
        this.resetPaymentMethod()
        return of(data)
      })
      ,catchError(err => {
        this.sitesService.notify('Error : Payment not processed' + err.toString(), 'close', 5000, 'red');
        return of(err)
    }))
  }

  applyGroupPayment(event) {
    if (!event || event.amount == 0) { return }
    this.splitByItem = false;
    // this._paymentAmount = event.amount;
    // this.groupPaymentAmount = event.amount;
    // this.groupPaymentGroupID = event.groupID as number;

    this.action$ = this.orderMethodsService.splitOrderFromGroup(this.order.id, event.groupID, this.order).pipe(switchMap(data => {
      //set tj
      // then we want to refresh the screen, but it might just happen automatically when the order is refreshed.
      return of(data)
    }))
  }

  clearGroupSelection() {
    this.splitByItem = false;
    this._paymentAmount = 0;
    this.groupPaymentAmount = 0;
    this.groupPaymentGroupID = 0;
  }

  closeOrder() {
    const site = this.sitesService.getAssignedSite();
    this.orderMethodsService.closeOrder(site, this.order);
  }

  getResults(amount): Observable<IPaymentResponse> {
    //if credit card - prompt for credit card payment
    const site = this.sitesService.getAssignedSite();
    if (this.paymentMethod && this.posPayment && this.order) {

      if (this.paymentMethod.isCash) {
        return  this.processCashPayment(site, this.posPayment, this.order, amount, this.paymentMethod)
      }

      //else
      if (this.paymentMethod.isCreditCard) {
        return  this.processCreditPayment(site, this.posPayment, this.order, amount, this.paymentMethod)
      }

      //else
      if (this.paymentMethod.name.toLowerCase()  == 'check') {
        return  this.processCashPayment(site, this.posPayment, this.order, amount, this.paymentMethod)
      }

      if (this.paymentMethod.name.toLowerCase() === 'rewards points'
          || this.paymentMethod.name.toLowerCase() === 'loyalty points') {
        return  this.enterPointCashValue(amount)
      }

      //else
      if (this.paymentMethod.companyCredit) {

      }

      //else
      if (this.paymentMethod.name.toLowerCase() === 'gift card') {

      }
    }
    return
  }

  get isZeroPaymentAllowed() {
    // Public Property allowNegativeTransaction As Nullable(Of Boolean) = False
    // Public Property allowZeroTransaction As Nullable(Of Boolean) = False
    // if (this.userAuthorization.currentUser.)
    if ( this.userAuths &&  this.userAuths.allowZeroTransaction) {
      return true
    }
    return false;
  }


  get isNegativePaymentAllowed() {
    // Public Property allowNegativeTransaction As Nullable(Of Boolean) = False
    // Public Property allowZeroTransaction As Nullable(Of Boolean) = False
    // if (this.userAuthorization.currentUser.)
    if ( this.userAuths &&  this.userAuths.allowNegativeTransaction) {
      return true
    }
    return false;
  }


  processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    return this.paymentsMethodsService.processCashPayment(site, posPayment, order, amount, paymentMethod)
  }

  processCreditPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    if ( !this.paymentsMethodsService?.DSIEmvSettings) { return
    }
    const enabled = this.paymentsMethodsService?.DSIEmvSettings.enabled
    if (enabled) {
      this.paymentsMethodsService.processSubDSIEMVCreditPayment(order, amount, true)
      return
    }
    return this.paymentsMethodsService.processCreditPayment(site, posPayment, order, amount, paymentMethod )
  }

  processRewardPoints(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    return this.processRewardPoints(site, posPayment, order, amount, paymentMethod)
  }

  applyPointBalance() {
    let  amountPaid = this.paymentsMethodsService.getPointsRequiredToPayBalance(
                    this.paymentAmount,
                    this.order.clients_POSOrders.loyaltyPointValue);
    this.pointValueForm = this.fb.group( { itemName: [amountPaid] } );
    const paymentResponse$ = this.processGetResults(amountPaid, this.posPayment);
    this.process$ = paymentResponse$.pipe(switchMap(data => {
      if (!data) {
        this.notify('Payment not processed', 'failure', 1000)
      }
      return of(data)
    }))
  }

  processGetResults(amount, posPayment: IPOSPayment): Observable<IPaymentResponse> {
    if (!posPayment) {
      this.sitesService.notify('No Payment info provided.', 'Close', 50000, 'red')
      return of(null)
    }
    posPayment.amountReceived = amount;
    this.processing = true
    return  this.paymentsMethodsService.getResults(amount, this.paymentMethod, this.posPayment, this.order).pipe(
      switchMap(data => {
        if (data && data?.order) {
          this.orderMethodsService.updateOrder(data?.order)
        }
        this.processing = false
        return of(data)
    }))
  }

  enterPointCashValue(event) {
    const site = this.sitesService.getAssignedSite();
    return  this.paymentsMethodsService.enterPointCashValue(   event, this.paymentMethod, this.posPayment, this.order )
  }

  storeCredit() {
    if (this.order && this.order.clientID) {
      const dialog = this.storeCreditMethodsService.openStoreCreditPopUp(0, this.order?.clientID, 'payment');
      dialog.subscribe(data => {
        console.log('store credit close')
      })
    }
  }

  get paymentAmount() {
    if (!this._paymentAmount || this._paymentAmount ==0) {
      return  this.order.balanceRemaining;
    }
    return this._paymentAmount;
  }

  public get creditPaymentAmount() {
    if (!this._creditPaymentAmount || this._creditPaymentAmount != 0) {
      if (this.order.creditBalanceRemaining == 0) {
        return  this.order.balanceRemaining;
      }
      return  this.order.creditBalanceRemaining;
    }
    return this._creditPaymentAmount;
  }

  applyBalance() {
    if (!this.paymentMethod) { return }
    let amount : number;
    if (!this.paymentMethod?.isCreditCard) {
      amount = this.order?.balanceRemaining
    }
    if (this.paymentMethod  && this.paymentMethod.isCreditCard) {
      amount = this.order?.creditBalanceRemaining
    }
    this.applyPaymentAmount(amount)
  }

  async processCheckPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPOSPayment> {
    return
  }

  getPaymentMethod(paymentMethod) {
    this.paymentMethod = paymentMethod;
    if (this.paymentMethod) {
      if (this.groupPaymentAmount != 0) {
        this.applyPaymentAmount(this.groupPaymentAmount)
        return
      }
      if (this.paymentMethod.name.toLowerCase() === 'check') {
        this.stepSelection = 2;
        return
      }
      if (this.paymentMethod.name.toLowerCase() === 'rewards points') {
        this.stepSelection = 4;
        return
      }
      this.stepSelection = 3;
    }
    return
  }


  goToPaymentMethod(){
    this.resetPaymentMethod();
  }

  enterCheckNumber(event) {
    if (this.posPayment && event) {
      this.posPayment.checkNumber = event
      this.stepSelection = 3;
    } else {
      this.posPayment = {} as IPOSPayment;
      this.posPayment.checkNumber = event
    }
  }

  // Action triggered when user swipes
  swipe(selectedIndex: any, action = this.SWIPE_ACTION.RIGHT) {
    // Out of range
    if ( selectedIndex < 0 || selectedIndex > 1 ) return;

    // Swipe left, next tab
    if (action === this.SWIPE_ACTION.LEFT) {
      const isLast = selectedIndex === 1;
      selectedIndex = isLast ? 0 : selectedIndex + 1;
    }

    // Swipe right, previous tab
    if (action === this.SWIPE_ACTION.RIGHT) {
      const isFirst = selectedIndex === 0;
      selectedIndex = isFirst ? 1 :  selectedIndex - 1;
    }
  }

  resetPaymentMethod() {
    this.initForms();
    this.paymentMethod = null;
    this.stepSelection = 1;
    this.groupPaymentAmount  = 0;
    this.groupPaymentGroupID = 0;
    this._paymentAmount       = 0;
    this.enterCustomAmount   = false;
    this._creditPaymentAmount = 0;
  }

  setStep(value: number) {
    this.resetPaymentMethod()
  }

  applyEBTPayment() {
  }

  applyWICPayment() {
    this.notify('Payment method not implemented', 'error', 1000)
    if (this.order && this.order.wicTotal !=0){
      const amount = this.order.wicTotal
      this.posPayment.amountReceived = amount;
      const site   = this.sitesService.getAssignedSite()
      this.process$ =  this.paymentMethodService.getPaymentMethodByName(site, 'wic').pipe(
        switchMap( method => {
            if (!method) {
              this.notify('payment method not found', 'error', 1000)
              return of(null)
            }
            return   this.paymentsMethodsService.getResults(amount, method, this.posPayment, this.order)
          }
        )).pipe(
          switchMap(paymentResponse => {
          if (!paymentResponse) {
            return this.sitesService.notifyObs('Payment not processed', 'failure', 1000)
          }
          return of(paymentResponse)
      }))
    }
  }

  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

  navToMenu() {
    this.router.navigate(['/app-main-menu'])
  }

  closeCart() {
    this.orderMethodsService.currentOrder = null
    this.orderMethodsService.updateOrderSubscription(null)
    this.router.navigate(['/app-main-menu'])
  }
  initPopOver() {
    if (this.user?.userPreferences?.enableCoachMarks ) {
      this.coachMarksService.clear()
      this.addCoachingList()
      this.coachMarksService.showCurrentPopover();
    }
  }

  addCoachingList() {
    this.coachMarksService.add(new CoachMarksClass(this.coachingPaymentsMade.nativeElement, "Payments Made: If payments exist you will see options to void or print the payment."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingAuthorization.nativeElement, "Credit Authorization: If you have done an Authorization Credit Card sale, here you will find a button to complete the authorization."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingAdjustAuth.nativeElement, "Credit Adjust Authorization: If you need to add payment to a prior auth, for example the bar order was 50 dollars, and they ordered 5 more drinks, you would use the button that appears to add payment to the authorization."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingSplitGroups.nativeElement, "Split Checks by Item: If you have assigned items to different groups, you will see those as separate totals, with their items to make split payments to the order."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingPaymentFull.nativeElement, "Pay in Full: If you want to complete the transaction, you may use the buttons above."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingPaymentPartial.nativeElement, "Partial Payments: If you want to add a payment amount you specify for a certain type of payment methods, like check or cash, you may press the button and then enter the amount."));

  }

  editPayment() {
    let payment : any
    // if (this.posPayment) {
    //   payment = this.posPayment;
    // } else {
    //   payment = this.order.posPayments[0]
    // }
    payment = this.order.posPayments[0]

    payment = this.order.posPayments[0]
    //get payment
    const site = this.sitesService.getAssignedSite();
    if (payment.paymentMethodID == 0) {
      this.editDialog.openChangeDueDialog(payment, null, this.order)
      return;
    }
    const method$ = this.paymentMethodService.getPaymentMethod(site, payment.paymentMethodID)
    method$.subscribe( method => {
      this.editDialog.openChangeDueDialog(payment, method, this.order)
    })
 }

}

