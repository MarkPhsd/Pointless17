import { Injectable, OnDestroy } from '@angular/core';
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
import { PrintingService } from '../system/printing.service';
import { AnyNaptrRecord } from 'dns';

@Injectable({
  providedIn: 'root'
})

export class PaymentsMethodsProcessService implements OnDestroy {

  dialogSubject: Subscription;
  dialogRef: any;

  private _dialog     = new BehaviorSubject<any>(null);
  public  dialog$      = this._dialog.asObservable();

  initSubscriptions() {
     this.dialogSubject = this.dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }

  ngOnDestroy(): void {
      if (this.dialogSubject){ this.dialogSubject.unsubscribe()}
   }

  constructor(
    private sitesService        : SitesService,
    private paymentService      : POSPaymentService,
    private paymentMethodService: PaymentMethodsService,
    private orderService        : OrdersService,
    private orderMethodsService : OrderMethodsService,
    public  printingService     : PrintingService,
    private dialogOptions       : ProductEditButtonService,
    private matSnackBar         : MatSnackBar) {
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

  processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder,
                     amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    return payment$
  }

  processCreditPayment(site: ISite, posPayment: IPOSPayment,
                       order: IPOSOrder, amount: number,
                       paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    if (this.DSIEmvSettings.enabled) {
      this.processSubDSIEMVCreditPayment(order, amount, true)
      return
    }
    const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    return payment$
  }

  processSubDSIEMVCreditPayment( order: IPOSOrder, amount: number, manualPrompt: boolean) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    const site = this.sitesService.getAssignedSite();
    const  posPayment = {} as IPOSPayment;
    posPayment.orderID = order.id;
    posPayment.zrun = order.zrun;
    posPayment.reportRunID = order.reportRunID;
    const payment$  = this.paymentService.postPOSPayment(site, posPayment)
    payment$.subscribe(data =>
      {
        data.amountPaid = amount;
        this.dialogRef = this.dialogOptions.openDSIEMVTransaction({data, amount, action: 1, manualPrompt: manualPrompt});
        this._dialog.next(this.dialogRef)
        return of(data)
      }
    )
    return null
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

  validateResponse(response: RStream, payment: IPOSPayment) {
    const rStream = response //.RStream as RStream;
    const cmdResponse       = rStream.CmdResponse;
    const trans             = rStream.TranResponse;

    if (!cmdResponse) {
      this.notify(`Error no response`, 'Transaction not Complete', 3000);
      return false
    }
    if (!trans) {
      this.notify(`Error no transaction response`, 'Transaction not Complete', 3000);
      return false
    }

    if (cmdResponse.CmdStatus.toLowerCase() === 'TimeOut'.toLowerCase() ) {
      this.notify(`Error: ${status} , ${status}`, 'Transaction not Complete', 3000);
      return false
    }

    if (cmdResponse.CmdStatus.toLowerCase() === 'Error'.toLowerCase() ) {
      this.notify(`Error: ${status} , ${status}`, 'Transaction not Complete', 3000);
      return false
    }

    return true;

  }

  //"AP*", "Approved", "Approved, Partial AP"
  //then we can get the payment Method Type from Card Type.
  isApproved(cmdStatus: string) {
    if (cmdStatus.toLowerCase() === 'AP*'.toLowerCase() ||
        cmdStatus.toLowerCase() === 'Approved'.toLowerCase() ||
        cmdStatus.toLowerCase() === 'Partial AP'.toLowerCase()) {
      return true;
    }
    return false;
  }

  async processCreditCardResponse(response: any, payment: IPOSPayment, order: IPOSOrder) {

    const site = this.sitesService.getAssignedSite();

    console.log('processCreditCardResponse', response)

    if (response) {
      const rStream      = response.RStream as RStream;
      const validate = this.validateResponse(rStream, payment)
      if (!validate) { return }
      const cmdResponse  = rStream.CmdResponse;
      const trans        = rStream.TranResponse;
      const status       = cmdResponse?.TextResponse;
      const cmdStatus    = cmdResponse?.CmdStatus;

      payment   = this.applyEMVResponseToPayment(trans, payment)

      if (this.isApproved(cmdStatus)) {

        const cardType       = trans?.CardType;
        payment.textResponse =  cmdResponse.CmdStatus.toLowerCase();
        let paymentMethod    = {} as IPaymentMethod;

        this.paymentMethodService.getPaymentMethodByName(site, cardType).pipe(
          switchMap( data => {
            payment.paymentMethodID = data.id;
            paymentMethod = data;
            return this.paymentService.makePayment(site, payment, order, +trans.Amount.Authorize,paymentMethod)
          }
        )).subscribe(data => {
          this.orderService.updateOrderSubscription(data.order);
          this.orderMethodsService.finalizeOrder(data,  paymentMethod, data.order);
          this.printingService.previewReceipt();
          //print receipt prompt
          //print receipt auto
          return cmdResponse;
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
    // <MerchantID>93344</MerchantID>
		// <AcctNo>************3907</AcctNo>
		// <CardType>VISA</CardType>
		// <TranCode>EMVSale</TranCode>
		// <AuthCode>00421D</AuthCode>
		// <CaptureStatus>Captured</CaptureStatus>
		// <RefNo>212442535014</RefNo>
		// <InvoiceNo>249571</InvoiceNo>
		// <OperatorID>Clive Wolder</OperatorID>
		// <Amount>
		// 	<Purchase>220.76</Purchase>
		// 	<Authorize>220.76</Authorize>
		// </Amount>
		// <AcqRefData>|1623410529|95985</AcqRefData>
		// <AVSResult>Z</AVSResult>
		// <CVVResult>M</CVVResult>
		// <RecordNo>1623410529</RecordNo>
		// <EntryMethod>CHIP READ/MANUAL</EntryMethod>
		// <Date>05/04/2022</Date>
		// <Time>15:00:14</Time>
    payment.accountNum    = trans?.AcctNo;
    payment.exp           = trans?.ExpDate;
    payment.cardHolder    = trans?.CardholderName;
    payment.trancode      = trans?.TranCode;
    payment.refNumber     = trans?.RefNo;
    payment.dlNumber      = trans?.AcqRefData;
    payment.processData   = trans?.ProcessData;
    payment.ccNumber      = trans?.RecordNo;

    payment.approvalCode  = trans?.AuthCode;
    payment.captureStatus = trans?.CaptureStatus;

    payment.amountPaid     = +trans?.Amount?.Authorize;
    payment.amountReceived = +trans?.Amount?.Authorize;

    payment.applicationLabel = trans?.ApplicationLabel;

    payment.entryMethod   = trans?.EntryMethod;

    payment.aid           = trans?.AID;
    payment.tvr           = trans?.TVR;
    payment.tsi           = trans?.TSI;
    payment.arc           = trans?.ARC;
    payment.emvcvm        = trans?.CVM;
    payment.emvDate       = trans?.Date;
    payment.emvTime       = trans?.Time;

    payment.captureStatus = trans?.CaptureStatus;

    payment.saleType      = 1;
    return payment;
  }

  processRewardPoints(site: ISite, posPayment: IPOSPayment, order: IPOSOrder,
                      amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    if (order.clients_POSOrders) {
      if (order.clients_POSOrders.loyaltyPointValue >= amount) {
        const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
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
