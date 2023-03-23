import { Component,
         OnInit ,
         Input,
         HostListener,
         OnDestroy,
         ViewChild,
         TemplateRef,
         ChangeDetectorRef} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IPaymentResponse, IPaymentSearchModel, IPOSOrder,
         IPOSPayment, IPOSPaymentsOptimzed,
         IServiceType, ISite } from 'src/app/_interfaces';
import { AuthenticationService, IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
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

@Component({
  selector: 'app-pos-payment',
  templateUrl: './pos-payment.component.html',
  styleUrls: ['./pos-payment.component.scss']
})
export class PosPaymentComponent implements OnInit, OnDestroy {
  get platForm() {  return Capacitor.getPlatform(); }
  @ViewChild('receiptView') receiptView: TemplateRef<any>;
  @ViewChild('splitItemsView') splitItemsView: TemplateRef<any>;
  process$: Observable<any>;
  @Input() order  :   IPOSOrder;
   isApp = this.platFormService.isApp();
  userAuths       :   IUserAuth_Properties;
  _userAuths      : Subscription;

  loginAction     :   any;
  id              :   number;
  _currentPayment :   Subscription; //    = new BehaviorSubject<IPOSPayment>(null);
  currentPayment$ :   Observable<IPOSPayment>;//     = this._currentPayment.asObservable();
  posPayment      =   {} as IPOSPayment;

  action$        :   Observable<any>;
  employees$      :   Observable<IItemBasic[]>;
  paymentMethods$ :   Observable<IPaymentMethod[]>;
  paymentMethod   =   {} as IPaymentMethod;
  serviceTypes$   :   Observable<IServiceType[]>;
  serviceType     :   IServiceType;
  _searchModel    :   Subscription;
  searchModel     :   IPaymentSearchModel;
  paymentAmountForm : FormGroup;
  pointValueForm  :   FormGroup
  checkNumberForm :   FormGroup
  _order          :   Subscription;
  showInput       =   true // initialize keypad open
  stepSelection   = 1;
  stripeEnabled   : boolean;
  dsiEMVEnabled   : boolean;
  paymentSummary$    : Observable<IPOSPaymentsOptimzed>;
  paymentSummary     : IPOSPaymentsOptimzed;
  paymentsEqualTotal : boolean;

  orderlayout         = 'order-layout'
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

  groupPaymentAmount  = 0;
  groupPaymentGroupID = 0;
  _paymentAmount       = 0;
  enterCustomAmount   = false;
  _creditPaymentAmount = 0;

  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  uiTransactions: TransactionUISettings
  uiTransactions$ : Observable<TransactionUISettings>;
  devicename = localStorage.getItem('devicename')
  message: string;
  serviceIsScheduled: boolean;
  orderAction$  : Observable<any>;
  saleProcess$  : Observable<any>;

  initStepSelectionSubscription() {
     this.saleProcess$ = this.orderMethodsService.posPaymentStepSelection$.pipe(
      switchMap( data => {
        if (data && (data?.isCash || data?.name.toLowerCase() === 'cash')) {
          this.getPaymentMethod(data)
          this.changeDetectorRef.detectChanges();
          this.paymentMethod = data;
          this.stepSelection = 3;
          console.log('apply payment method', data.name)
          this.orderMethodsService.updatePaymentMethodStep(null)
        }
      return of(null)
    }))
  }


  initSubscriptions() {
    this._order = this.orderService.currentOrder$.pipe(
      switchMap( data => {
      if (data) {
        this.order = data
        this.refreshIsOrderPaid();
      }
      if (data && data.serviceTypeID) {
        const site = this.sitesService.getAssignedSite();
        return this.serviceTypeService.getTypeCached(site, data.serviceTypeID)
      }
      return of(null)
      }

    )).subscribe(data => {
      this.serviceType = data
      if (data && data.scheduleInstructions || (this.order && this.order.preferredScheduleDate) || ( data && data.shippingInstructions) ) {
        this.serviceIsScheduled = true
      }
      this.processPaymentReady(data)
    })

    this._currentPayment = this.paymentService.currentPayment$.subscribe( data => {
      this.posPayment = data
    })

    this._userAuths = this.authenticationService.userAuths$.subscribe(data => {
      if (data) {
        this.userAuths = data;
      }
    })
  }

  constructor(private paymentService  : POSPaymentService,
              public orderMethodsService: OrderMethodsService,
              private sitesService    : SitesService,
              private orderService    : OrdersService,
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
              private router          : Router,
              private fb              : FormBuilder) { }

  ngOnInit(): void {

    this.initAuthorization()
    const site = this.sitesService.getAssignedSite();
    this.paymentService.updatePaymentSubscription(this.posPayment)
    this.toolbarUI.updateOrderBar(false)
    this.initForms();
    this.initSubscriptions();
    this.getPaymentMethods(site)

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

    this.initTransactionUISettings();
    this.paymentMethods$ = this.getPaymentMethods(site)
    this.paymentMethods$.subscribe(data => { this.paymentMethods = data; })
    if (this.authenticationService.userValue) {
      this.orderAction$ = this.orderMethodsService.getLoginActions()
    }

    // this.changetDd

    this.initStepSelectionSubscription();


  }

  setLoginAction() {
    const item = localStorage.getItem('loginAction')
    this.loginAction = JSON.parse(item)
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

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) { this._order.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
    if (this._currentPayment) { this._currentPayment.unsubscribe()}
    if (this._userAuths) { this._userAuths.unsubscribe()}
  }

  getPaymentMethods(site: ISite) {
    const paymentMethods$ = this.paymentMethodService.getCacheList(site);
    if (this.userAuthorization?.user?.roles === 'user') {
      return paymentMethods$.pipe(
        switchMap(data => {
          let list = data.filter( item => !item.isCreditCard)
          list = list.filter( item => !item.isCash)
          list = list.filter( item => !item.wic)
          list = list.filter( item => !item.ebt)
          list = list.filter( item => item.enabledOnline)
          list = list.filter( item => item.name != 'Gift Card')
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
          return  of(list)
      }))
    }

    return paymentMethods$.pipe(
      switchMap(data => {
      const list = data.filter( item => item.enabledOnline)
      let list2 = list.filter( item => !item.isCreditCard)
      list2 = list2.filter( item => item.name != 'Gift Card')
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
      this.orderlayout = 'order-layout'
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

  get splitItemsTemplate() {
    if (this.splitByItem) {
      return this.splitItemsView
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

  processPaymentReady(serviceType: IServiceType) {
    if (serviceType) {
      if (serviceType.deliveryService && !this.order.shipAddress ) {
        this.paymentIsReady  = false;
        this.message = `Address  required.`
        return false
      }

      // console.log('prompt schedule time', serviceType.promptScheduleTime, this.order.preferredScheduleDate)
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

  applyPaymentAmount(event) {

    if (!event && this.groupPaymentAmount != 0) {
      this.initPaymentForm();
      return
    }

    if (this.order &&  this.paymentMethod) {
        let amount;
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
                              this.order.creditBalanceRemaining
                              );

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

        let processResults$

        processResults$ = this.processGetResults(amount, this.posPayment)

        if (!processResults$) {
          this.sitesService.notify('Error getting values for payment.', 'close', 2000, 'red');
          return
        }

        this.process$ =    processResults$.subscribe( {
          next: (data) => {
            if (!data) {
              this.sitesService.notify('Payment not processed','close', 5000, 'red');
            }
            this.processResults(data)
            this.groupPaymentAmount  = 0;
            this.groupPaymentGroupID = 0;
          },
          error: err => {
            this.sitesService.notify(`Payment not processed ${err}`, 'close', 5000, 'red');
            console.error(err)
          }
        }
      )
    }
    this.initPaymentForm();
  }

  applyGroupPayment(event) {
    if (!event || event.amount == 0) { return }
    this.splitByItem = false;
    this._paymentAmount = event.amount;
    this.groupPaymentAmount = event.amount;
    this.groupPaymentGroupID = event.groupID;
  }

  processResults(paymentResponse: IPaymentResponse) {
    let result = 0
    if (paymentResponse?.paymentSuccess || paymentResponse?.orderCompleted) {
      if (paymentResponse?.orderCompleted) {
        this.action$ =   this.orderMethodsService.finalizeOrderProcesses(paymentResponse, this.paymentMethod, paymentResponse.order).pipe(switchMap(data => {
          result =  this.orderMethodsService.finalizeOrder(paymentResponse, this.paymentMethod, paymentResponse.order)
          return of(data)
        }))
      }
    }

    this.resetPaymentMethod();

    if (paymentResponse?.paymentSuccess || paymentResponse?.responseMessage.toLowerCase() === 'success') {
      this.orderService.updateOrderSubscription(paymentResponse.order)
      this.notify(`Payment succeeded: ${paymentResponse.responseMessage}`, 'Success', 1000)
    } else {
      this.notify(`Payment failed because: ${paymentResponse?.responseMessage}`, 'Something unexpected happened.',3000)
    }
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
        // console.log('processingcheck')
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

  processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    return this.paymentsMethodsService.processCashPayment(site, posPayment, order, amount, paymentMethod )
  }

  processCreditPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    const enabled = this.paymentsMethodsService.DSIEmvSettings.enabled
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
    paymentResponse$.subscribe( {
        next: (data) => {
          if (!data) {
            this.notify('Payment not processed', 'failure', 1000)
          }
          this.processResults(data)
        },
        error: (e) => console.error(e)
      }
    )
  }

  processGetResults(amount, posPayment: IPOSPayment): Observable<IPaymentResponse> {
    posPayment.amountReceived = amount;
    return  this.paymentsMethodsService.getResults(amount, this.paymentMethod, this.posPayment, this.order)
  }

  enterPointCashValue(event) {
    const site = this.sitesService.getAssignedSite();
    return  this.paymentsMethodsService.enterPointCashValue(
        event, this.paymentMethod, this.posPayment, this.order)
  }

  storeCredit() {
    if (this.order && this.order.clientID) {
      const dialog = this.storeCreditMethodsService.openStoreCreditPopUp(0, this.order?.clientID, 'payment');
      dialog.subscribe(data => {

      })
    }
  }

  // giftCard() {
  //   if (this.order) {
  //     this.storeCreditMethodsService.openStoreCreditPopUp(0, 0)
  //   }
  // }

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
      amount = this.order?.creditBalanceRemaining
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
    console.log('getPaymentMethod .stepselection', this.stepSelection)
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
    console.log('resetpayment method')
    this.initForms();
    this.paymentMethod = null;
    this.stepSelection = 1;
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
      this.paymentMethodService.getPaymentMethodByName(site, 'wic').pipe(
        switchMap( method => {
            if (!method) {
              this.notify('payment method not found', 'error', 1000)
              return of(null)
            }
            return   this.paymentsMethodsService.getResults(amount, method, this.posPayment, this.order)
          }
        )).subscribe(paymentResponse => {
          if (!paymentResponse) {
            this.notify('Payment not processed', 'failure', 1000)
            return
          }
        this.processResults(paymentResponse)
      })
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
    this.orderService.currentOrder = null
    this.orderService.updateOrderSubscription(null)
    this.router.navigate(['/app-main-menu'])
  }

}

