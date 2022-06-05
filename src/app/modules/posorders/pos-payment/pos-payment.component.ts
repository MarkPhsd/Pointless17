import { Component,
         OnInit ,
         Input,
         HostListener,
         OnDestroy,
         ViewChild,
         TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EMPTY, Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IPaymentResponse, IPaymentSearchModel, IPOSOrder,
         IPOSPayment, IPOSPaymentsOptimzed,
         IServiceType, ISite } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { StripeAPISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { MatDialog,} from '@angular/material/dialog';
import { StripeCheckOutComponent } from '../../admin/settings/stripe-settings/stripe-check-out/stripe-check-out.component';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { StoreCreditMethodsService } from 'src/app/_services/storecredit/store-credit-methods.service';

@Component({
  selector: 'app-pos-payment',
  templateUrl: './pos-payment.component.html',
  styleUrls: ['./pos-payment.component.scss']
})
export class PosPaymentComponent implements OnInit, OnDestroy {

  @ViewChild('receiptView') receiptView: TemplateRef<any>;
  @ViewChild('splitItemsView') splitItemsView: TemplateRef<any>;

  @Input() order  :   IPOSOrder;

  id              :   number;
  _currentPayment :   Subscription; //    = new BehaviorSubject<IPOSPayment>(null);
  currentPayment$ :   Observable<IPOSPayment>;//     = this._currentPayment.asObservable();
  posPayment      =   {} as IPOSPayment;
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
  stepSelection   =   1;
  stripeEnabled   : boolean;
  dsiEMVEnabled   : boolean;
  paymentSummary$    : Observable<IPOSPaymentsOptimzed>;
  paymentSummary     : IPOSPaymentsOptimzed;
  paymentsEqualTotal : boolean;

  orderlayout         = 'order-layout'
  smallDevice         = false;
  orderItemsPanel     = ''

  orderDefaultType    = false;
  paymentIsReady      : boolean;
  splitByItem         : boolean;

  groupPaymentAmount  = 0;
  groupPaymentGroupID = 0;
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  message: string;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.pipe(
      switchMap( data => {
      if (data) {
        this.order = data
        this.refreshIsOrderPaid();
      }
      if (data && data.serviceTypeID) {
        this.updateOrderSchedule(data.serviceTypeID);
        const site = this.sitesService.getAssignedSite();
        return this.serviceTypeService.getTypeCached(site, data.serviceTypeID)
      }
      return EMPTY
      }

    )).subscribe(data => {
      this.serviceType = data
    })

    this._currentPayment = this.paymentService.currentPayment$.subscribe( data => {
      this.posPayment = data
    })
  }

  constructor(private paymentService  : POSPaymentService,
              private orderMethodsService: OrderMethodsService,
              private sitesService    : SitesService,
              private orderService    : OrdersService,
              private serviceTypeService: ServiceTypeService,
              private settingService  : SettingsService,
              private paymentMethodService: PaymentMethodsService,
              private matSnackBar     : MatSnackBar,
              private toolbarUI       : ToolBarUIService,
              private paymentsMethodsService: PaymentsMethodsProcessService,
              public  platFormService : PlatformService,
              private uISettingsService: UISettingsService,
              private dialog          : MatDialog,
              private dsiProcess      : DSIProcessService,
              private storeCreditMethodsService: StoreCreditMethodsService,
              private router          : Router,
              private fb              : FormBuilder) { }

  ngOnInit(): void {
    const site = this.sitesService.getAssignedSite();
    this.paymentService.updatePaymentSubscription(this.posPayment)
    this.toolbarUI.updateOrderBar(false)
    this.initForms();
    this.initSubscriptions();
    this.getPaymentMethods(site)
    try {
      this.dsiEMVEnabled = this.paymentsMethodsService.DSIEmvSettings?.enabled;
    } catch (error) {
      console.log('error pospayment init' , error)
    }
    if (this.order) {
      const searchModel = {} as IPaymentSearchModel
      searchModel.orderID = this.order.id
    }

    this.refreshIsOrderPaid();
    this.updateItemsPerPage();
    this.initStripe();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) { this._order.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
    if (this._currentPayment) { this._currentPayment.unsubscribe()}
  }

  initStripe() {
    this.uISettingsService.getSetting('StripeAPISettings').subscribe(data => {
      if (data) {
        const stripeAPISettings   = JSON.parse(data.text) as StripeAPISettings;
        this.stripeEnabled        = stripeAPISettings?.enabled;
      }
    });
  }

  getPaymentMethods(site: ISite) {
    const paymentMethods$ = this.paymentMethodService.getCacheList(site);
    if (this.platFormService.isApp()) {
      this.paymentMethods$ = paymentMethods$
      return
    }
    paymentMethods$.subscribe(data => {
      if (!this.platFormService.isApp()) {
        const list = data.filter( item => item.enabledOnline == true)
        this.paymentMethods$ = of(list)
        return
      }
    })
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }

    if (!this.smallDevice) {
      this.orderlayout = 'order-layout'
      this.orderItemsPanel = 'item-list'
    }
  }

  refreshIsOrderPaid() {
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

  updateOrderSchedule(serviceTypeID: number){
    //if app is in place, then there is a default order.
    //if there is no service type or the plateform is an app then it will go to schedule.
    //otherwise it will accept the service type assigned.
    const site = this.sitesService.getAssignedSite();
    if (!serviceTypeID || this.platFormService.isApp()) {

      this.settingService.getSettingByNameCached(site, 'DefaultOrderType').pipe(
        switchMap(data => {
          console.log('update order scheduleddata', data)
        if (data) {
          if (+data.value != this.order.serviceTypeID) {
            return this.serviceTypeService.getType(site, +data.value)
          }
          if (this.platFormService.isApp() ) {
            return this.serviceTypeService.getType(site, +data.value)
          }
          return of(null)
        }
        return of(null)
      })).subscribe(result => {
          if (!result) { return }
          this.serviceType = result;
          this.processPaymentReady(result)
        }
      )
    }

    this.serviceTypeService.getType(site, serviceTypeID).subscribe(data => {
        console.log('result', data)
        if (!data) { return }
        this.serviceType = data;
        this.processPaymentReady(data)
      }
    )
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

      if (serviceType.orderMinimumTotal > 0 && this.order.subTotal < serviceType.orderMinimumTotal) {
        this.paymentIsReady = false;
        this.message = `Minumun purchase amount of $ ${serviceType.orderMinimumTotal} required.`
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

  applyStripePayment() {
    const order = this.order;
    if (order) {
      const data = {title: 'Payment', amount: order.balanceRemaining}
      this.openStripePayment(data)
    }
  }

  processDSICreditCardPayment() {
    const order = this.order;
    if (order) {
      // this.paymentsMethodsService.processDSIEMVCreditPayment(this.order, order.balanceRemaining);
      this.paymentsMethodsService.processSubDSIEMVCreditPayment(this.order, order.balanceRemaining, false)
      //  dialogRef.afterClosed().subscribe(result => {
      //     if (!result) { return }
      //     this.processResults(result)
      //   });

    }
  }

  processDSIManualCreditCardPayment() {
    const order = this.order;
    if (order) {
      this.paymentsMethodsService.processSubDSIEMVCreditPayment(this.order, order.balanceRemaining, true)
    }
  }

  async dsiResetDevice() {
    const response  = await this.dsiProcess.pinPadReset( );
    this.notify('PIN Pad Reset', 'Success', 1000)
  }

  openStripePayment(data: any){
    let dialogRef: any;
    const site = this.sitesService.getAssignedSite();
    dialogRef = this.dialog.open(StripeCheckOutComponent,
      { width:        '75vw',
        minWidth:     '375px',
        maxWidth:     '450px',
        height:       '675px',
        minHeight:    '675px',
        data: data,
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return }
      this.processResults(result)
    });
  }

  applyPaymentAmount(event) {

    if (!event && this.groupPaymentAmount != 0) {
      this.initPaymentForm(); return
    }

    if (this.order &&  this.paymentMethod) {

        let amount = this.groupPaymentAmount;

        if (amount == 0) {
          amount   = this.formatValueEntered(event)
          this.posPayment.groupID = this.groupPaymentGroupID;
        }

        const isValidAmount = this.paymentsMethodsService.validatePaymentAmount(amount,
                                  this.paymentMethod.isCash,
                                  this.order.balanceRemaining);

        if (!isValidAmount) { return }

        const processResults$ = this.processGetResults(amount, this.posPayment)

        processResults$.subscribe( {
          next: (data) => {
            if (!data) {
              this.notify('Payment not processed', 'failure', 1000)
            }
            this.processResults(data)
            this.groupPaymentAmount  = 0;
            this.groupPaymentGroupID = 0;
          },
          error: err => console.error(err)
        }
      )
    }
    //if order or payment method don't exist, we have a bigger problem, but we can ignore for now.
    this.initPaymentForm();
  }

  applyGroupPayment(event) {
    if (!event || event.amount == 0) { return }
    this.splitByItem = false;
    this.groupPaymentAmount = event.amount;
    this.groupPaymentGroupID = event.groupID
  }

  processResults(paymentResponse: IPaymentResponse) {
    let result = 0

    if (paymentResponse.paymentSuccess || paymentResponse.orderCompleted) {
      if (paymentResponse.orderCompleted) {
        result =  this.orderMethodsService.finalizeOrder(paymentResponse, this.paymentMethod, paymentResponse.order)
      } else {
      }
    }

    this.orderService.updateOrderSubscription(paymentResponse.order)
    this.resetPaymentMethod();
    if (paymentResponse.paymentSuccess || paymentResponse.responseMessage.toLowerCase() === 'success') {
      this.notify(`Payment succeeded: ${paymentResponse.responseMessage}`, 'Success', 1000)
    } else {
      this.notify(`Payment failed because: ${paymentResponse.responseMessage}`, 'Something bad happened.',3000)
    }
  }


  closeOrder() {
    const site = this.sitesService.getAssignedSite();
    this.orderMethodsService.closeOrder(site, this.order);
  }

  getResults(amount): Observable<IPaymentResponse> {
      //if credit card - prompt for credit card payment
    const site = this.sitesService.getAssignedSite();

    if (this.paymentMethod && this.posPayment && this.order)
    {
      // console.log('pos method, payment method, order are true')
    }

    if (this.paymentMethod && this.posPayment && this.order) {

      //cash
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
      // const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
      // const results =  await payment$.pipe().toPromise();
      return this.paymentsMethodsService.processCashPayment(site, posPayment, order, amount, paymentMethod )
  }

  processCreditPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
      // const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
      // const results =  await payment$.pipe().toPromise();
      const enabled = this.paymentsMethodsService.DSIEmvSettings.enabled
      if (enabled) {
        this.paymentsMethodsService.processSubDSIEMVCreditPayment(order, amount, true)
        return
      }
      return this.paymentsMethodsService.processCreditPayment(site, posPayment, order, amount, paymentMethod )

   }

  processRewardPoints(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    // if (order.clients_POSOrders) {
    //   if (order.clients_POSOrders.loyaltyPointValue >= amount) {
    //     const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    //     const results  = await payment$.pipe().toPromise();
    //     return results
    //   } else  {
    //     this.notify(`There are not enough points to pay this amount. The client has $${order.clients_POSOrders.loyaltyPointValue} in total.`, 'Try Again',3000)
    //     return
    //   }
    // }
    return this.processRewardPoints(site, posPayment, order, amount, paymentMethod)
  }

  applyPointBalance() {
    let  amountPaid = this.paymentsMethodsService.getPointsRequiredToPayBalance(
                    this.order.balanceRemaining,
                    this.order.clients_POSOrders.loyaltyPointValue)
    this.pointValueForm = this.fb.group( { itemName: [amountPaid] } )
    const paymentResponse$ = this.processGetResults(amountPaid, this.posPayment)
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
    //apply payment as cash value
    // if (this.posPayment && event && this.paymentMethod && this.order) {
    //   const amountPaid = event;
    //   if (this.order.balanceRemaining >= amountPaid)  {
    //     return await this.processRewardPoints(site, this.posPayment, this.order, amountPaid, this.paymentMethod)
    //   }
    //   if (amountPaid > this.order.balanceRemaining )  {
    //     this.notify('Amount entered is greater than the total. Please try again.', 'Oops!', 1500)
    //     return
    //   }
    // }
    const site = this.sitesService.getAssignedSite();
    return  this.paymentsMethodsService.enterPointCashValue(
        event, this.paymentMethod, this.posPayment, this.order)

  }

  storeCredit() {
    if (this.order) {
      this.storeCreditMethodsService.openStoreCreditPopUp(0, this.order.clientID)
    }
  }

  applyBalance() {
    this.applyPaymentAmount(this.order.balanceRemaining)
  }

  async processCheckPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPOSPayment> {
    return
  }

  getPaymentMethod(paymentMethod) {
    this.paymentMethod = paymentMethod;
    console.log('apply Payment Method',this.paymentMethod.name, this.groupPaymentAmount)

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
              return EMPTY
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

