import { Component, OnInit , Input, HostListener} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IPaymentResponse, IPOSOrder, IPOSPayment, IPOSPaymentsOptimzed, IServiceType, ISite } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { IPaymentSearchModel, POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'app-pos-payment',
  templateUrl: './pos-payment.component.html',
  styleUrls: ['./pos-payment.component.scss']
})
export class PosPaymentComponent implements OnInit {

  @Input() order  :   IPOSOrder;
  id              :   number;

  _currentPayment   : Subscription; //    = new BehaviorSubject<IPOSPayment>(null);
  currentPayment$   : Observable<IPOSPayment>;//     = this._currentPayment.asObservable();
  posPayment       : IPOSPayment;

  employees$      :   Observable<IItemBasic[]>;
  paymentMethods$  :  Observable<IPaymentMethod[]>;
  paymentMethod   :   IPaymentMethod;
  serviceTypes$   :   Observable<IServiceType[]>;
  _searchModel    :   Subscription;
  searchModel     :   IPaymentSearchModel;
  paymentAmountForm :   FormGroup;
  checkNumberForm :   FormGroup
  _order          :   Subscription;
  showInput       =   true // initialize keypad open
  stepSelection   =   1;

  paymentSummary$ :  Observable<IPOSPaymentsOptimzed>;
  paymentSummary     :  IPOSPaymentsOptimzed;
  paymentsEqualTotal : boolean;

  orderlayout = 'order-layout'
  smallDevice = false;
  orderItemsPanel = ''

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {

      this.order = data
      this.refreshIsOrderPaid();

    })
    this._currentPayment = this.paymentService.currentPayment$.subscribe( data => {
      this.posPayment = data
    })
  }

  constructor(private paymentService: POSPaymentService,
              private sitesService  : SitesService,
              private orderService  : OrdersService,
              private paymentMethodService: PaymentMethodsService,
              private matSnackBar   : MatSnackBar,
              private router        : Router,
              private toolbarUI     : ToolBarUIService,
              private editDialog      : ProductEditButtonService,
              private fb            : FormBuilder) { }

  ngOnInit(): void {

    const site = this.sitesService.getAssignedSite();
    this.posPayment = {} as IPOSPayment;
    this.paymentService.updatePaymentSubscription(this.posPayment)

    this.toolbarUI.updateOrderBar(false)
    this.initForms();
    this.initSubscriptions();
    this.paymentMethods$ = this.paymentMethodService.getCacheList(site);

    if (this.order) {
      //get paymentinfo.
      const searchModel = {} as IPaymentSearchModel
      searchModel.orderID = this.order.id
      const payments$ = this.paymentService.searchPayments(site, searchModel);
    }

    this.refreshIsOrderPaid()
    this.updateItemsPerPage();
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
    if (this.order) {
      if ( this.order.balanceRemaining > 0)  {
        this.paymentsEqualTotal = false;
      }
      if ( this.order.balanceRemaining == 0)  {
        this.paymentsEqualTotal = true;
      }
    }
  }

  // refreshPayments() {
  //   if (this.order) {
  //     const site = this.sitesService.getAssignedSite();
  //     const searchModel = {} as IPaymentSearchModel;
  //     searchModel.orderID = this.order.id;
  //     this.paymentSummary$ = this.paymentService.searchPayments(site, searchModel)
  //     this.paymentSummary$.subscribe(data => {
  //       this.paymentSummary = data;
  //     })
  //   }
  //   this.refreshIsOrderPaid();
  // }

  initForms() {
    this.initCheckForm();
    this.initPaymentForm();
  }

  initCheckForm() {
    this.checkNumberForm = this.fb.group( {
      itemName   : [''],
    })
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

  validateAmount(amount, paymentMethod: IPaymentMethod, order: IPOSOrder): boolean {
    if (  +amount > + order.balanceRemaining ) {
      if (!paymentMethod.isCash) {
        this.notify(`Enter amount smaller than ${order.balanceRemaining}.`, 'Try Again',3000)
        return false
      }
    }
    return true
  }

  async applyPaymentAmount(event) {

    if (this.order &&  this.paymentMethod) {

      const amount = this.formatValueEntered(event)
      const isValidAmount = this.validateAmount(amount, this.paymentMethod, this.order)
      if (!isValidAmount) { return }

      let paymentResponse  = {} as IPaymentResponse
      this.posPayment.amountReceived = amount;

      paymentResponse = await this.getResults(amount)
      console.log('applyPaymentAmount', paymentResponse)

      this.processResults(paymentResponse)
    }

    //if order or payment method don't exist, we have a bigger problem, but we can ignore for now.
    this.initPaymentForm();

  }

  processResults(paymentResponse: IPaymentResponse) {

    let result = 0
    if (paymentResponse) {
      console.log('paymentResponse)', paymentResponse)
    }
    if (paymentResponse.paymentSuccess || paymentResponse.orderCompleted) {
      if (paymentResponse.orderCompleted) {
         result =  this.finalizeOrder(paymentResponse, this.paymentMethod, paymentResponse.order)
      } else {

      }
    }

    if (result == 0) {

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
        this.editDialog.openChangeDueDialog(payment, paymentMethod, order)
        return 1
      }
      if (payment.amountReceived >= payment.amountPaid) {
        this.editDialog.openChangeDueDialog(payment, paymentMethod, order)
        return 1
      }

      return 0

    }
  }


  closeOrder() {
    if (this.order) {
      const site = this.sitesService.getAssignedSite();
      const result$ = this.orderService.completOrder(site, this.order.id)
      result$.subscribe(data=>  {
        this.notify(`Order Paid for`, 'Order Completed', 1000)
        this.orderService.updateOrderSubscription(data)
        // this.router.navigateByUrl('/pos-orders')
      }
    )
   }
  }

  async getResults(amount): Promise<IPaymentResponse> {
      //if credit card - prompt for credit card payment
    const site = this.sitesService.getAssignedSite();

    if (this.paymentMethod && this.posPayment && this.order)
      {console.log('pos method, payment method, order are true')}

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
        console.log('processingcheck')
        return await this.processCashPayment(site, this.posPayment, this.order, amount, this.paymentMethod)
      }

      //else
      if (this.paymentMethod.companyCredit) {

      }

      //else
      if (this.paymentMethod.name.toLowerCase() === 'gift card') {

      }

      if (this.paymentMethod.name.toLowerCase() === 'rewards Points' || this.paymentMethod.name.toLowerCase() === 'loyalty points') {
        return await this.processRewardPoints(site, this.posPayment, this.order, amount, this.paymentMethod)
      }
    }
    return
  }

  async processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
    const payment$ = await this.paymentService.makePayment(site, this.posPayment, this.order, amount, this.paymentMethod)
    const results =  await payment$.pipe().toPromise();
    return results
  }

  async processCreditPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
    const payment$ = await this.paymentService.makePayment(site, this.posPayment, this.order, amount, this.paymentMethod)
    const results =  await payment$.pipe().toPromise();
    return results
  }

  async processRewardPoints(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
    if (order.clients_POSOrders) {
      if (order.clients_POSOrders.loyaltyPointValue >= amount) {
        const payment$ = await this.paymentService.makePayment(site, this.posPayment, this.order, amount, this.paymentMethod)
        const results =  await payment$.pipe().toPromise();
        return results
      } else  {
        this.notify(`There are not enough points to pay this amount. The client has $${order.clients_POSOrders.loyaltyPointValue} in total.`, 'Try Again',3000)
        return
      }
    }
  }

  async processCheckPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPOSPayment> {
    return
  }

  applyBalance() {
    this.applyPaymentAmount(this.order.balanceRemaining *100)
  }

  goToPaymentMethod(){
    this.resetPaymentMethod();
  }

  getPaymentMethod(paymentMethod) {
    this.paymentMethod = paymentMethod;

    console.log(paymentMethod)

    if (this.paymentMethod) {
      if (this.paymentMethod.name.toLowerCase() === 'check') {
        this.stepSelection = 2;
      } else {
        this.stepSelection = 3;
      }
    }
    return
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

  resetPaymentMethod() {
    this.initForms();
    this.paymentMethod = null;
    this.stepSelection = 1;
  }

  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

}
