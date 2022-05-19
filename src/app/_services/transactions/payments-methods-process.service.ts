import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription, switchMap, } from 'rxjs';
import { IPaymentResponse, IPOSOrder, IPOSPayment,  ISite }   from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from '../reporting/sites.service';
import { IPaymentMethod, PaymentMethodsService } from './payment-methods.service';
import { POSPaymentService } from './pospayment.service';
import { CmdResponse, RStream, TranResponse } from '../dsiEMV/dsiemvtransactions.service';
import { transcode } from 'buffer';
import { DSIProcessService } from '../dsiEMV/dsiprocess.service';
import { ProductEditButtonService } from '../menu/product-edit-button.service';
import { OrderMethodsService } from './order-methods.service';
import { OrdersService } from './orders.service';
import { DSIEMVSettings } from '../system/settings/uisettings.service';

@Injectable({
  providedIn: 'root'
})

export class PaymentsMethodsProcessService {

  dialogSubject: Subscription;
  dialogRef: any;

  private _dialog     = new BehaviorSubject<any>(null);
  public  dialog$      = this._dialog.asObservable();

  initSubscriptions() {
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }


  constructor(
    private sitesService     : SitesService,
    private paymentService : POSPaymentService,
    private paymentMethodService: PaymentMethodsService,
    private orderService    : OrdersService,
    private dialogOptions   : ProductEditButtonService,
    private matSnackBar     : MatSnackBar,) {

  }

  get DSIEmvSettings(): DSIEMVSettings {
    const item = localStorage.getItem('DSIEMVSettings');
    if (!item) { return }
    const EMVSettings = JSON.parse(item)
    return EMVSettings
  }

  enterPointCashValue(event, paymentMethod: IPaymentMethod, posPayment: IPOSPayment, order: IPOSOrder ): Observable<IPaymentResponse> {
    const site = this.sitesService.getAssignedSite();
    //apply payment as cash value
    if (posPayment && event && paymentMethod && order) {
      const amountPaid = event;
      if (order.balanceRemaining >= amountPaid)  {
        return  this.processRewardPoints(site, posPayment, order, amountPaid, paymentMethod)
      }
      if (amountPaid > order.balanceRemaining )  {
        this.notify('Amount entered is greater than the total. Please try again.', 'Oops!', 1500)
        return
      }
    }
  }

  processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    // const results =  await payment$.pipe().toPromise();
    // return results
    return payment$
  }

  processCreditPayment(site: ISite, posPayment: IPOSPayment,
                       order: IPOSOrder, amount: number,
                       paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {

    if (this.DSIEmvSettings.enabled) {
      this.processDSIEMVCreditPayment(order, amount)
      return
    }

    const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    return payment$

  }

  processDSIEMVCreditPayment( order: IPOSOrder, amount: number) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    const site = this.sitesService.getAssignedSite();
    const  posPayment = {} as IPOSPayment;
    posPayment.orderID = order.id;
    const payment$  = this.paymentService.postPOSPayment(site, posPayment)
    payment$.subscribe(data =>
      {
        data.amountPaid = amount;
        this.dialogRef = this.dialogOptions.openDSIEMVTransaction({data, amount, action: 1});
        this._dialog.next(this.dialogRef)
        return of(data)
      }
    )
    // return of(posPayment)

  }

  processDSIEMVCreditVoid( payment: IPOSPayment) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    const site = this.sitesService.getAssignedSite();
    const  posPayment = {} as IPOSPayment;
    posPayment.orderID = payment.id;

    this.dialogRef = this.dialogOptions.openDSIEMVTransaction({voidPayment: payment, action: 2});
    this._dialog.next(this.dialogRef)

  }

  async processCreditCardResponse(response: any, payment: IPOSPayment) {
    const site = this.sitesService.getAssignedSite();

    if (response) {

      const rStream = response.RStream as RStream;

      const cmdResponse       = rStream.CmdResponse;
      const trans             = rStream.TranResponse;

      console.log('processCreditCardResponse response', response)
      console.log('processCreditCardResponse response', rStream)
      console.log('processCreditCardResponse cmdResponse', cmdResponse)
      console.log('processCreditCardResponse trans', trans)

      const status = cmdResponse?.TextResponse;
      const cmdStatus = cmdResponse?.CmdStatus;

      if (cmdResponse.CmdStatus === 'TimeOut'.toLowerCase() ) {
        this.notify(`Error: ${status} , ${status}`, 'Transaction not Complete', 3000);
        return cmdResponse
      }

      if (cmdResponse.CmdStatus === 'Error'.toLowerCase() ) {
        this.notify(`Error: ${status} , ${status}`, 'Transaction not Complete', 3000);
        return cmdResponse
      }

      payment                 = this.applyEMVResponseToPayment(trans, payment)
      //"AP*", "Approved", "Approved, Partial AP"
      //then we can get the payment Method Type from Card Type.

      if (cmdResponse.CmdStatus === 'AP*' || cmdResponse.CmdStatus === 'Approved' || cmdResponse.CmdStatus === 'Partial AP') {
        const cardType = trans?.CardType;
        this.paymentMethodService.getPaymentMethodByName(site, cardType).pipe(
          switchMap( data => {
            payment.paymentMethodID = data.id;
            return this.paymentService.putPOSPayment(site, payment)
          }
        )).pipe(
          switchMap( data => {
            payment.paymentMethodID = data.id
            //then we can get the current order.
            return this.orderService.getOrder(site, payment.orderID.toString(), false);
          }
        )).subscribe(data => {
          this.orderService.updateOrderSubscription(data)
          //print receipt prompt
          //print receipt auto

        })
      }

      return cmdResponse;
    }
  }

  applyEMVResponseToPayment(trans: TranResponse, payment: IPOSPayment) {
    //void =6
    //refund = 5;
    //preauth = 3
    //preauth capture = 7
    //force = 4;

    payment.accountNum    = trans?.AcctNo;
    payment.refNumber     = trans?.RefNo;
    payment.aid           = trans?.AID;
    payment.tranType      = trans?.TranCode;
    payment.approvalCode  = trans?.AuthCode;
    payment.saleType      = 1;
    payment.entryMethod   = trans?.EntryMethod;
    return payment;

  }

  processRewardPoints(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    if (order.clients_POSOrders) {
      if (order.clients_POSOrders.loyaltyPointValue >= amount) {
        const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
        // const results  = await payment$.pipe().toPromise();
        // return results
        return payment$
      } else  {
        this.notify(`There are not enough points to pay this amount. The client has $${order.clients_POSOrders.loyaltyPointValue} in total.`, 'Try Again',3000)
        return null
      }
    }
  }

  getPointsRequiredToPayBalance(balanceRemaining: number, loyaltyPointValue: number) {

    if (!loyaltyPointValue || loyaltyPointValue == 0) { return 0}

    let amountPaid = 0

    if (loyaltyPointValue >= balanceRemaining) {  amountPaid = balanceRemaining  }

    if (balanceRemaining >= loyaltyPointValue) { amountPaid = loyaltyPointValue  }

    return amountPaid

  }

  getResults(amount, paymentMethod: IPaymentMethod,
                  posPayment: IPOSPayment, order: IPOSOrder): Observable<IPaymentResponse> {
    //if credit card - prompt for credit card payment
    const site = this.sitesService.getAssignedSite();

    if (paymentMethod && posPayment && order)
    {
      // console.log('pos method, payment method, order are true')
    }

    if (paymentMethod && posPayment && order)

      if (paymentMethod.wic) {
        return  this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }
      if (paymentMethod.ebt) {
        return  this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }
      //cash
      if (paymentMethod.isCash) {
        return  this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }

      //else
      if (paymentMethod.isCreditCard) {
        return  this.processCreditPayment(site, posPayment, order, amount, paymentMethod)
      }

      //else
      if (paymentMethod.name.toLowerCase()  == 'check') {
        return  this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }

      if (paymentMethod.name.toLowerCase() === 'rewards points' || paymentMethod.name.toLowerCase() === 'loyalty points') {
        return  this.enterPointCashValue(amount, paymentMethod, posPayment, order)
      }

      //else
      if (paymentMethod.companyCredit) {

      }

      //else
      if (paymentMethod.name.toLowerCase() === 'gift card') {

      }
      return null;
  }


  validatePaymentAmount(amount, isCash: boolean, balanceRemaining: number): boolean {
    if (  +amount > + balanceRemaining ) {
      if (!isCash) {
        this.notify(`Enter amount smaller than ${balanceRemaining}.`, 'Try Again',3000)
        return false
      }
    }
    return true
  }

  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

  isOrderBalanceZero(order: IPOSOrder) {
    if (order) {
      if ( order.balanceRemaining > 0)  {
        return  false;
      }
      if ( order.balanceRemaining == 0)  {
        return  true;
      }
    }
  }

}
