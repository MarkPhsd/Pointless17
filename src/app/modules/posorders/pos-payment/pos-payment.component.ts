import { Component, OnInit , Input, HostListener} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EMPTY, Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IPaymentResponse, IPaymentSearchModel, IPOSOrder,
         IPOSPayment, IPOSPaymentsOptimzed,
         IServiceType, ISite } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector: 'app-pos-payment',
  templateUrl: './pos-payment.component.html',
  styleUrls: ['./pos-payment.component.scss']
})
export class PosPaymentComponent implements OnInit {

  @Input() order  :   IPOSOrder;
  id              :   number;

  _currentPayment :   Subscription; //    = new BehaviorSubject<IPOSPayment>(null);
  currentPayment$ :   Observable<IPOSPayment>;//     = this._currentPayment.asObservable();
  posPayment      =      {} as IPOSPayment;
  employees$      :   Observable<IItemBasic[]>;
  paymentMethods$ :   Observable<IPaymentMethod[]>;
  paymentMethod   = {} as  IPaymentMethod;
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

  paymentSummary$    : Observable<IPOSPaymentsOptimzed>;
  paymentSummary     : IPOSPaymentsOptimzed;
  paymentsEqualTotal : boolean;

  orderlayout = 'order-layout'
  smallDevice = false;
  orderItemsPanel = ''

  orderDefaultType = false;
  paymentIsReady: boolean;

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
        // console.log('serviceTypeID data', data.serviceTypeID)
        return this.serviceTypeService.getTypeCached(site, data.serviceTypeID)
      }
      return EMPTY
      }

    )).subscribe(data => {
      this.serviceType = data
      // console.log('data', this.serviceType)
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
              private editDialog      : ProductEditButtonService,
              private paymentsMethodsService: PaymentsMethodsProcessService,
              private printingService :PrintingService,
              public  platFormService : PlatformService,
              private router          : Router,
              private fb              : FormBuilder) { }

  ngOnInit(): void {
    const site = this.sitesService.getAssignedSite();
    this.paymentService.updatePaymentSubscription(this.posPayment)
    this.toolbarUI.updateOrderBar(false)
    this.initForms();
    this.initSubscriptions();
    this.getPaymentMethods(site)

    if (this.order) {
      const searchModel = {} as IPaymentSearchModel
      searchModel.orderID = this.order.id
    }

    this.refreshIsOrderPaid()
    this.updateItemsPerPage();
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

    const site = this.sitesService.getAssignedSite();
    this.settingService.getSettingByNameCached(site,'DefaultOrderType').pipe(
      switchMap(data => {
      if (data) {
        if (+data.value != this.order.serviceTypeID) {
          return this.serviceTypeService.getType(site, +data.value)
        }
        if (this.platFormService.isApp() ) {
          return this.serviceTypeService.getType(site, +data.value)
        }
        return of(false)
      }
      return of(null)
    })).subscribe(result => {
        if (!result) { return }
        this.serviceType = result;
        this.processPaymentReady(result)
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
        this.notify(`Check amount entered.`, 'Try Again',3000)
        return
      }
      const amountEntered = event/100;
      return amountEntered
    }
    return 0
  }

  async applyPaymentAmount(event) {
    if (!event) {  this.initPaymentForm(); return }
    if (this.order &&  this.paymentMethod) {
      const amount = this.formatValueEntered(event)
      const isValidAmount = this.paymentsMethodsService.validatePaymentAmount(amount,
                                 this.paymentMethod.isCash,
                                 this.order.balanceRemaining)
      if (!isValidAmount) { return }
      await this.processGetResults(amount, this.posPayment)
    }
    //if order or payment method don't exist, we have a bigger problem, but we can ignore for now.
    this.initPaymentForm();
  }

  processResults(paymentResponse: IPaymentResponse) {
    let result = 0
    // if (paymentResponse) { console.log(paymentResponse) }
    if (paymentResponse.paymentSuccess || paymentResponse.orderCompleted) {
      if (paymentResponse.orderCompleted) {
         result =  this.finalizeOrder(paymentResponse, this.paymentMethod, paymentResponse.order)
      } else {
      }
    }
    this.orderService.updateOrderSubscription(paymentResponse.order)
    this.resetPaymentMethod();
    if (paymentResponse.paymentSuccess || paymentResponse.responseMessage.toLowerCase() === 'success') {
      this.notify(`Payment succeeded: ${paymentResponse.responseMessage}`, '.', 1000)
    } else {
      this.notify(`Payment failed because: ${paymentResponse.responseMessage}`, 'Something happened.',3000)
    }
  }

  finalizeOrder(paymentResponse: IPaymentResponse, paymentMethod: IPaymentMethod, order: IPOSOrder): number {

    const payment = paymentResponse.payment
    if (payment && paymentMethod) {
      if (paymentMethod.isCreditCard) {
        //open tip input option - same as cash
        if (this.platFormService.isApp()) {
          this.editDialog.openChangeDueDialog(payment, paymentMethod, order)
        }
        this.printingService.previewReceipt()
        return 1
      }
      if (payment.amountReceived >= payment.amountPaid) {
        if (this.platFormService.isApp()) {
          this.editDialog.openChangeDueDialog(payment, paymentMethod, order)
        }
        this.printingService.previewReceipt()
        return 1
      }
      return 0
    }
  }

  closeOrder() {
    const site = this.sitesService.getAssignedSite();
    this.orderMethodsService.closeOrder(site, this.order);
  }

  async getResults(amount): Promise<IPaymentResponse> {
      //if credit card - prompt for credit card payment
    const site = this.sitesService.getAssignedSite();

    if (this.paymentMethod && this.posPayment && this.order)
    {
      // console.log('pos method, payment method, order are true')
    }

    if (this.paymentMethod && this.posPayment && this.order) {

      //cash
      if (this.paymentMethod.isCash) {
        return await this.processCashPayment(site, this.posPayment, this.order, amount, this.paymentMethod)
      }

      //else
      if (this.paymentMethod.isCreditCard) {
        return await this.processCreditPayment(site, this.posPayment, this.order, amount, this.paymentMethod)
      }

      //else
      if (this.paymentMethod.name.toLowerCase()  == 'check') {
        // console.log('processingcheck')
        return await this.processCashPayment(site, this.posPayment, this.order, amount, this.paymentMethod)
      }

      if (this.paymentMethod.name.toLowerCase() === 'rewards points' || this.paymentMethod.name.toLowerCase() === 'loyalty points') {
        console.log("Rewards Value Applied", amount)
        return await this.enterPointCashValue(amount)
        // return await this.processRewardPoints(site, this.posPayment, this.order, amount, this.paymentMethod)
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

  async processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
    // const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    // const results =  await payment$.pipe().toPromise();
    return this.paymentsMethodsService.processCashPayment(site, posPayment, order, amount, paymentMethod )
  }

  async processCreditPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
    // const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    // const results =  await payment$.pipe().toPromise();
    return this.paymentsMethodsService.processCreditPayment(site, posPayment, order, amount, paymentMethod )
  }

  async processRewardPoints(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
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
    this.processGetResults(amountPaid, this.posPayment)

  }

  async processGetResults(amount, posPayment: IPOSPayment) {
    let paymentResponse  = {} as IPaymentResponse
    posPayment.amountReceived = amount;
    paymentResponse = await this.paymentsMethodsService.getResults(amount, this.paymentMethod, this.posPayment, this.order)
    if (!paymentResponse) {
      this.notify('Payment not processed', 'failure', 1000)
      return
    }
    this.processResults(paymentResponse)
  }

  async enterPointCashValue(event) {
    const site = this.sitesService.getAssignedSite();
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

    return  this.paymentsMethodsService.enterPointCashValue(
        event, this.paymentMethod, this.posPayment, this.order)
    {}

  }

  applyBalance() {
    this.applyPaymentAmount(this.order.balanceRemaining *100)
  }

  async processCheckPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPOSPayment> {
    return
  }

  getPaymentMethod(paymentMethod) {
    this.paymentMethod = paymentMethod;
    if (this.paymentMethod) {
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
        console.log("Swipe right - INDEX: " +  selectedIndex);
      }

      // Swipe right, previous tab
      if (action === this.SWIPE_ACTION.RIGHT) {
        const isFirst = selectedIndex === 0;
        selectedIndex = isFirst ? 1 :  selectedIndex - 1;
        console.log("Swipe left - INDEX: " + selectedIndex);
      }
    }

  resetPaymentMethod() {
    this.initForms();
    this.paymentMethod = null;
    this.stepSelection = 1;
  }

  applyEBTPayment() {

  }

 async applyWICPayment() {
    let paymentResponse  = {} as IPaymentResponse
    this.notify('Payment method not implemented', 'error', 1000)
    if (this.order && this.order.wicTotal !=0){
      const amount = this.order.wicTotal
      this.posPayment.amountReceived = amount;
      const site   = this.sitesService.getAssignedSite()
      const method = await this.paymentMethodService.getPaymentMethodByName(site, 'wic').toPromise()


      if (!method) {
        this.notify('payment method not found', 'error', 1000)
        return
      }
      paymentResponse = await this.paymentsMethodsService.getResults(amount, method, this.posPayment, this.order)
      if (!paymentResponse) {
        this.notify('Payment not processed', 'failure', 1000)
        return
      }
      this.processResults(paymentResponse)
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

