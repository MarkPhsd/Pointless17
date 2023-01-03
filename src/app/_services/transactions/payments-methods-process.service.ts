import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, Subscription, switchMap, } from 'rxjs';
import { IPaymentResponse, IPOSOrder,  IPOSPayment,   ISite }   from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from '../reporting/sites.service';
import { IPaymentMethod, PaymentMethodsService } from './payment-methods.service';
import { POSPaymentService } from './pospayment.service';
import { RStream, TranResponse } from '../dsiEMV/dsiemvtransactions.service';
import { ProductEditButtonService } from '../menu/product-edit-button.service';
import { OrderMethodsService } from './order-methods.service';
import { OrdersService } from './orders.service';
import { DSIEMVSettings, TransactionUISettings } from '../system/settings/uisettings.service';
import { PrintingService } from '../system/printing.service';
import { BalanceSheetService } from './balance-sheet.service';
import { PrepPrintingServiceService } from '../system/prep-printing-service.service';

@Injectable({
  providedIn: 'root'
})

export class PaymentsMethodsProcessService implements OnDestroy {

  dialogSubject: Subscription;
  dialogRef: any;

  private _dialog     = new BehaviorSubject<any>(null);
  public  dialog$      = this._dialog.asObservable();

  _initTransactionComplete = new BehaviorSubject<any>(null);

  initSubscriptions() {

    this.dialogSubject = this.dialogRef.afterClosed().pipe(
      switchMap( result => {
        console.log('dialog ref result (payment-methods.process.service)', result)
        if (result) {
          return this.processSendOrder(this.orderService.currentOrder)
        }
    })).subscribe(data => {
      return of(data)
    })

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
    private balanceSheetService : BalanceSheetService,
    private prepPrintingService : PrepPrintingServiceService,
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

  //openDrawerFromBalanceSheet

  processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder,
                     amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {

    const balance$ =  this.balanceSheetService.openDrawerFromBalanceSheet()
    const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)

    return balance$.pipe(switchMap(data => {
      return payment$
    })).pipe(switchMap(data => {
      return of(data)
    }))

  }

  processCreditPayment(site: ISite, posPayment: IPOSPayment,
                       order: IPOSOrder, amount: number,
                       paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {

    if (this.DSIEmvSettings.enabled) {
      this.processSubDSIEMVCreditPayment(order, amount, true)
      return
    }

    return this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)

  }

  processPayPalCreditPayment(order: IPOSOrder, amount: number, manualPrompt: boolean, settings: TransactionUISettings): Observable<IPOSPayment> {
      //once we get back the method 'Card Type'
      //lookup the payment method.
      //we can't get the type of payment before we get the PaymentID.
      //so we just have to request the ID, and then we can establish everything after that.
      const site = this.sitesService.getAssignedSite();
      const  posPayment = {} as IPOSPayment;
      posPayment.orderID = order.id;
      posPayment.zrun = order.zrun;
      posPayment.reportRunID = order.reportRunID;
      posPayment.amountPaid = amount;

      // this.order    = data.order;
      // this.payment  = data.payment;
      // this.settings = data.settings;
      // this.amount   = this.payment.amountPaid.toString();
      // this.clientID = this.settings.payPalClientID;
      // this.currencyCode = this.settings.payPalCurrency;
      // console.log('processPayPalCreditPayment settings', settings)
      const payment$  = this.paymentService.postPOSPayment(site, posPayment)
      payment$.subscribe(data =>
        {
          data.amountPaid = amount;
          this.dialogRef = this.dialogOptions.openPayPalTransaction({order: order,
                                                                    amount: amount,
                                                                    payment: data,
                                                                    settings: settings});
          this._dialog.next(this.dialogRef)
          return of(data)
        }
      )
      return null
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
    const payment$  = this.paymentService.postPOSPayment(site, posPayment);

    payment$.subscribe(data =>
      {
        data.amountPaid = amount;
        let action = 1;
        if (amount < 0) {
          action = 3;
        }
        this.dialogRef = this.dialogOptions.openDSIEMVTransaction({data, amount, action: action,
                                                                   manualPrompt: manualPrompt});
        this._dialog.next(this.dialogRef)
        return of(data)
      }
    )
    return null;
  }

  processDSIEMVCreditVoid( payment: IPOSPayment) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    const site = this.sitesService.getAssignedSite();
    const  posPayment = {} as IPOSPayment;
    posPayment.id = payment.id;
    this.dialogRef = this.dialogOptions.openDSIEMVTransaction({payment: payment,
                                                              voidPayment: payment,
                                                              action: 2});
    this._dialog.next(this.dialogRef)
  }

  //once we get back the method 'Card Type'
  //lookup the payment method.
  //we can't get the type of payment before we get the PaymentID.
  //so we just have to request the ID, and then we can establish everything after that.
  processDSIEMVAndroidCreditVoid ( order: IPOSOrder, amount: number, manualPrompt: boolean, settings: TransactionUISettings) {
    const site = this.sitesService.getAssignedSite();
    const  posPayment = {} as IPOSPayment;
    posPayment.orderID = order.id;
    posPayment.zrun = order.zrun;
    posPayment.reportRunID = order.reportRunID;
    posPayment.amountPaid = amount;
    const payment$  = this.paymentService.postPOSPayment(site, posPayment);

    payment$.subscribe(data => {
      this.dialogRef = this.dialogOptions.openDSIEMVAndroidTransaction({payment: data,
                                                                        type: 1});
      this._dialog.next(this.dialogRef)
    })
  }


  validateResponse(rStream: RStream, payment: IPOSPayment) {

    const cmdResponse       = rStream?.CmdResponse;
    const trans             = rStream?.TranResponse;

    console.log('validateResponse,', cmdResponse, payment);

    if (!cmdResponse) {
      this.notify(`Error no response`, 'Transaction not Complete', 3000);
      return false
    }

    if (!trans) {
      this.notify(`Error no transaction response`, 'Transaction not Complete', 3000);
      return false
    }

    if (cmdResponse.CmdStatus.toLowerCase() === 'TimeOut'.toLowerCase() ) {
      this.notify(`Error: ${cmdResponse}, ${trans}  `, `Transaction not Complete`, 3000);
      return false
    }

    if (cmdResponse.CmdStatus.toLowerCase() === 'Error'.toLowerCase() ) {
      this.notify(`Error: ${'error'} , `, `Transaction not Complete`, 3000);
      return false
    }

    console.log('valid', true)
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

  isCardPointApproved(trans: any) {
    if (trans && (trans?.resptext.toLowerCase() === 'Approved'.toLowerCase() ||
                  trans?.resptext.toLowerCase() === 'Approval'.toLowerCase() ||
                  trans?.respstat.toLowerCase() === 'A'.toLowerCase()
                  ) ) {
      return true;
    }
    this.notify(`Response not approved. Response given ${trans.resptext}`, 'Failed', 3000)
    return false;
  }

  processCardPointResponse(trans: any, payment: IPOSPayment, order: IPOSOrder) {
    // console.log('processCardPointResponse', trans)
    const site = this.sitesService.getAssignedSite();
    //validate response
    if (this.isCardPointApproved(trans)) {
      payment   = this.applyCardPointResponseToPayment(trans, payment)
      payment.textResponse =  trans?.resptext.toLowerCase();
      let paymentMethod    = {} as IPaymentMethod;
      // console.log('processCardPointResponse', trans);
      this.paymentMethodService.getPaymentMethodByName(site, 'credit').pipe(
        switchMap( data => {
          payment.paymentMethodID = data.id;
          paymentMethod = data;
          return this.paymentService.makePayment(site, payment, order, payment.amountPaid, data)
        }
      )).subscribe(data => {
        // console.log('data. completed response', data.orderCompleted)
        this.orderService.updateOrderSubscription(data.order);
        this.orderMethodsService.finalizeOrder(data, paymentMethod, data.order);
        // this.printingService.previewReceipt();
        this._initTransactionComplete.next(true)
        return payment.textResponse;
      })
    }

  }

  processCreditCardResponse(rStream: RStream,  payment: IPOSPayment, order: IPOSOrder) {

    const site = this.sitesService.getAssignedSite();

    if (rStream) {

      const validate = this.validateResponse( rStream, payment)
      if (!validate) {
        console.log('processCreditCardResponse - not valid')
        return of(null)
      }

      const cmdResponse  = rStream.CmdResponse;
      const trans        = rStream.TranResponse;
      const status       = cmdResponse?.TextResponse;
      const cmdStatus    = cmdResponse?.CmdStatus;

      payment   = this.applyEMVResponseToPayment(trans, payment)

      if (this.isApproved(cmdStatus)) {

        let cardType       = trans?.CardType;

        if (!cardType || cardType === '0') {  cardType = 'credit'};

        payment.textResponse =  cmdResponse.CmdStatus.toLowerCase();
        let paymentMethod    = {} as IPaymentMethod;
        paymentMethod.name = cardType;

        const payment$ =   this.paymentService.makePayment(site, payment, order, +trans.Amount.Authorize, paymentMethod)

        return  payment$.pipe(
          switchMap(data => {
            // console.log('processCreditCardResponse makePayment data', data)
            this.orderService.updateOrderSubscription(data.order);
            this.orderMethodsService.finalizeOrder(data,  paymentMethod, data.order);
            this.printingService.previewReceipt();
            return of(cmdResponse);
        }),catchError( err => {
          this.sitesService.notify('Error: ' + err, 'Alert', 4000)
          return of(null)
        }))
      }

    }
    return of(null)
  }

  processSendOrder(order: IPOSOrder) {
    return this.prepPrintingService.sendToPrep(order)
  }

  applyCardPointResponseToPayment(response: any, payment: IPOSPayment) {

    // payment.au
    // payment.commcard = response?.commcard;
    payment.resptext = response?.resptext;
    payment.cvvresp = response?.cvvresp;
    payment.respcode = response?.respcode;
    payment.preAuth = response?.authcode;
    payment.entryMethod = response?.entrymode;
    payment.avsresp = response?.avsresp;
    payment.entrymode = response?.entrymode;
    payment.respproc = response?.respproc;
    payment.bintype = response?.bintype;
    payment.expiry = response?.expiry;
    payment.retref = response?.retref;
    payment.respstat = response?.respstat;
    payment.account = response?.account;
    payment.transactionData = JSON.stringify(response);

    const tip = +payment.tipAmount
    const amountPaid = +payment.amountPaid
    const amount  = +response?.amount

    console.log(amount == tip + amountPaid)
    console.log(amount,amountPaid,tip)

    if ( tip !=0 ) {
      if (amount == tip + amountPaid) {
        payment.amountPaid      = +(+payment.amountPaid).toFixed(2)
        payment.amountReceived  = +(+payment.amountPaid).toFixed(2)
        payment.tipAmount       = +(tip ).toFixed(2)
      }
    } else {
      payment.amountPaid = response?.amount;
      payment.amountReceived = response?.amount;
    }

    payment.saleType      = 1;
    payment.exp           =  response?.expiry;
    payment.approvalCode  =  response?.authcode;
    payment.captureStatus =  response?.resptext;

    return payment;
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
    payment.tranType      = trans?.TranCode;
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

  validatePaymentAmount(amount, paymentMethod: IPaymentMethod, balanceRemaining: number, creditBalanceRemaining): boolean {

    if (  +amount > +balanceRemaining ) {
      // if (!paymentMethod.isCreditCard) {
      //   this.notify(`Enter amount smaller than ${balanceRemaining}.`, 'Try Again', 3000)
      //   return false
      // }
      console.log('creditBalanceRemaining', creditBalanceRemaining)
      if (paymentMethod.isCreditCard) {
        this.notify(`Enter amount smaller than ${creditBalanceRemaining}.`, 'Try Again', 3000)
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
