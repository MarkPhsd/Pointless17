import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, Subscription, switchMap, } from 'rxjs';
import { IPaymentResponse, IPOSOrder,  IPOSPayment,   ISite, PosPayment }   from 'src/app/_interfaces';
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
    let response: IPaymentResponse;
    
    return balance$.pipe(
        switchMap(data => {
          console.log('processCashPayment Balance sheet', data)
          return payment$
      })).pipe(switchMap(data => {
        console.log('makePayment data', data)
        if (!data) { 
          this.sitesService.notify('Payment not succeeded.', 'close', 5000, 'red')
          return of(null)
        }

        response  = data;
        this.orderMethodsService.finalizeOrder(response, paymentMethod, order);
        return this.orderMethodsService.finalizeOrderProcesses(null, null, order);
        
      })).pipe(switchMap( data => {

        if (!data) { 
          this.sitesService.notify('Order finalized', 'close', 5000, 'red')
          return of(null)
        }

        return of(response);
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

    // console.log('valid', true)
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
    if (trans && trans.captureStatus && (trans?.captureStatus.toLowerCase() === 'approved'.toLowerCase() ||
                  trans?.captureStatus.toLowerCase() === 'approval'.toLowerCase() ||
                  trans?.captureStatus.toLowerCase() === 'A'.toLowerCase()
                  ) ) {
      return true;
    }
    if (trans && trans.exceptionMessage) {
      this.notify(`Response not approved. Response given ${trans.exceptionMessage}`, 'Failed', 3000)
      return false;
    }
    this.notify(`Response not approved. Response given ${trans.captureStatus}`, 'Failed', 3000)
    return false;
  }

  isTriPOSApproved(trans: any) {
    if (trans && trans.statusCode && (trans?.statusCode.toLowerCase() === 'approved'.toLowerCase() ||
                  trans?.statusCode.toLowerCase() === 'approval'.toLowerCase() ||
                  trans?.statusCode.toLowerCase() === 'A'.toLowerCase()
                  ) ) {
      return true;
    }
    // console.log('isTriPOSApproved status, should be approved or similiar', trans.captureStatus , trans)
    this.notify(`Response not approved. Response given ${trans.captureStatus}`, 'Failed', 3000)
    return false;
  }

  processCardPointResponse(trans: any, payment: IPOSPayment, order: IPOSOrder) {
    // console.log('processCardPointResponse', trans)
    const site = this.sitesService.getAssignedSite();

    if (this.isCardPointApproved(trans)) {
      payment   = this.applyCardPointResponseToPayment(trans, payment)
      payment.textResponse =  trans?.resptext.toLowerCase();
      let paymentMethod    = {} as IPaymentMethod;
      let paymentResponse: IPaymentResponse

      this.paymentMethodService.getPaymentMethodByName(site, 'credit').pipe(
        switchMap( data => {
          payment.paymentMethodID = data.id;
          paymentMethod = data;
          return this.paymentService.makePayment(site, payment, order, payment.amountPaid, data)
        }
      )).pipe(switchMap(data => {
          paymentResponse = data;
          return this.orderMethodsService.finalizeOrderProcesses(null, null, order )
        }
      )).subscribe(data => {
        this.orderService.updateOrderSubscription(paymentResponse.order);
        this.orderMethodsService.finalizeOrder(paymentResponse, paymentMethod, paymentResponse.order);
        this._initTransactionComplete.next(true)
        return payment.textResponse;
      })
    } else {
      return of(null)
    }
  }

  getPaymentMethodByName(site, cardType): Observable<IPaymentMethod> {
    const item$  = this.paymentMethodService.getPaymentMethodByName(site, cardType)
    return  item$.pipe(
      switchMap(data => {
      if (!data) {
        const type = {} as IPaymentMethod;
        type.name = cardType;
        type.isCreditCard = true;
        return this.paymentMethodService.post(site, type);
      }
      return of(data)
    }))
  }

  applyAssociatedAuths(transType: string, payment: IPOSPayment, order: IPOSOrder) { 
    // console.log(transType)
    // console.log(order.posPayments);
    // console.log(payment)
    const list = [] as string[];

    if (transType === 'authorizationCompletionResponse') { 
      order.posPayments.forEach(data => {
        // console.log('applyAssociatedAuths refnumber', data.tranType, data.refNumber, payment.respcode )  
        if (data.tranType === 'incrementalAuthorizationResponse' ) { 
          list.push(data.refNumber)
        }
      })
    }
    console.log(list)
    payment.resptext = JSON.stringify(list)
    return payment
  }

  processTriPOSResponse(trans: any, payment: IPOSPayment, order: IPOSOrder): Observable<any> {
    const site = this.sitesService.getAssignedSite();

    if (!this.isTriPOSApproved(trans)) { 
      this.sitesService.notify(`Error Processing. Message: ${trans?.expressResponseMessage}`, 'close', 5999, 'red')
      return of(null)
    }

    payment   = this.applyTripPOSResponseToPayment(trans, payment);
    payment   = this.applyAssociatedAuths(payment.tranType, payment, order);

    let paymentMethod    = {} as IPaymentMethod;
    let cardType = 'credit'
    let paymentResponse: IPaymentResponse

    if (trans?.cardLogo) {   cardType = trans?.cardLogo;  }

    return this.getPaymentMethodByName(site, cardType).pipe(
      switchMap( data => {
        if (!data) { 
          // console.log('data is null') 
          return of(null)   }
        payment.paymentMethodID = data.id;
        paymentMethod = data;
        // console.log('processTriPOSResponse data', data)
        // console.log('process TripOSResponse', payment, paymentMethod)
        return this.paymentService.makePayment(site, payment, order, payment.amountPaid, data)
      }
    )).pipe(
      switchMap(data => {
        paymentResponse = data;
        // console.log('processTriPOSResponse data 2', data)
        // console.log('process paymentResponse', paymentResponse)
        return this.orderMethodsService.finalizeOrderProcesses(paymentResponse, paymentMethod, order )
    })).pipe(
      switchMap(data => {
        //data response is not required now.
        this.orderService.updateOrderSubscription(paymentResponse.order);
        this.orderMethodsService.finalizeOrder(paymentResponse, paymentMethod, order);
        if (paymentResponse.orderCompleted) {
          this._initTransactionComplete.next(true)
        }
        return of({order: paymentResponse.order, payment: paymentResponse.payment, trans: trans})
    }))

  }

  processAuthTriPOSResponse(trans: any, payment: IPOSPayment, order: IPOSOrder): Observable<any> {
    const site = this.sitesService.getAssignedSite();
    if (!order) {
      this.sitesService.notify('Error retrieiving order information. Please re-open order.', 'Alert',1000)
      return of(order)
    }
    if (!this.isTriPOSApproved(trans)) { 
      this.sitesService.notify(`Error Processing. ${trans.expressResponseMessage}`, 'close', 5999, 'red')
      return of(null)
    }
0
    console.log('trans', trans)
    if (this.isTriPOSApproved(trans)) {
      payment   = this.applyTripPOSResponseToPayment(trans, payment)
      let paymentMethod    = {} as IPaymentMethod;
      let cardType = 'credit'
      if (trans?.cardLogo) {   cardType = trans?.cardLogo;  }

      return this.paymentMethodService.getCreditCardPaymentMethod(site, cardType).pipe(
        switchMap( data => {
          if (!data) { 
            this.sitesService.notify(`Error getting payment method.`, 'close', 3000, 'red')
            return of(null)
          }
          payment.paymentMethodID = data.id;
          paymentMethod = data;
          return this.paymentService.savePOSPayment(site, payment);
        }
      )).pipe(
        switchMap(data => {
          if (!data) { 
            this.sitesService.notify(`Error saving payment.`, 'close', 3000, 'red')
            return of(null)
          }
          const id =  data?.orderID.toString();
          return this.orderService.getOrder(site, id, false)
      }))
    }

    return of(order)
  }

  processCreditCardResponse(rStream: RStream,  payment: IPOSPayment, order: IPOSOrder) {

    const site = this.sitesService.getAssignedSite();
    if (rStream) {
      const validate = this.validateResponse( rStream, payment)
      if (!validate) {
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
            this.orderService.updateOrderSubscription(data.order);
            this.printingService.previewReceipt();
            return this.orderMethodsService.finalizeOrderProcesses(null, null, order )
          })).pipe(switchMap(data => {
            this.orderMethodsService.finalizeOrder(data,  paymentMethod, data.order);
            return of(cmdResponse);
          })
        )
      }

    }
    return of(null)
  }

  processSendOrder(order: IPOSOrder) {
    return this.orderMethodsService.sendToPrep(order, true)
  }

  applyCardPointResponseToPayment(response: any, payment: IPOSPayment) {

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

    const tip = +payment?.tipAmount
    const amountPaid = +payment?.amountPaid
    const amount  = +response?.amount

    if ( tip !=0 ) {
      if (amount == tip + amountPaid) {
        payment.amountPaid      = +(+payment?.amountPaid).toFixed(2)
        payment.amountReceived  = +(+payment?.amountPaid).toFixed(2)
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

    console.log('response payment', payment)
    return payment;
  }


  applyTripPOSResponseToPayment(response: any, payment: IPOSPayment) {
    // console.log('type', response._type, )
    // console.table(response)
    if (response._type === 'authorizationResponse') {
      payment.amountPaid      = response.approvedAmount;
      payment.amountReceived  = response.approvedAmount;
    }

    if (response._type != 'authorizationResponse') {
      payment.amountPaid      = response.transactionAmount;
      payment.amountReceived  = response.transactionAmount;
    }

    if (response._type === 'authorizationCompletionResponse') {
      payment.amountPaid      = response?.subTotalAmount;
      payment.amountReceived  = response?.subTotalAmount;
      payment.tipAmount       = response?.tipAmount
    }

    if (response._type === 'saleResponse') {
      payment.amountPaid      = response?.approvedAmount;
      payment.amountReceived  = response?.approvedAmount;
    }

    payment.account         = response.accountNumber;
    payment.accountNum      = response.accountNum;
    payment.approvalCode    = response.approvalNumber;

    payment.tipAmount       = response.tipAmount;
    payment.captureStatus   = response.statusCode;
    payment.entryMethod     = response.entryMode;
    payment.entrymode       = response.entryMode;
    payment.respproc        = response.networkTransactionId;
    payment.respcode        = response.transactionId
    payment.batchid         = response.binValue;
    payment.tranType        = response._type;
    if (response.expirationMonth && response.expirationYear) {
      payment.expiry          = `${response.expirationMonth}${response.expirationYear}`
    }
    if (response._type === 'refundResponse') {
      payment.amountPaid      = - response.totalAmount;
      payment.amountReceived  = - response.totalAmount;
      payment.approvalCode    = response.approvalNumber;
    }

    payment.refNumber       = response.transactionId;
    if (!payment.approvalCode) {
      payment.approvalCode  = response.transactionId;
    }
    payment.bintype         = response.binValue;
    payment.transactionData = JSON.stringify(response);

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
    // const labelPrint$ = this.printingService.printLabels(order , true);
    let method$

    if (paymentMethod && posPayment && order)
      if (paymentMethod.wic) {
        console.log('method is wic')
        return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }
      if (paymentMethod.ebt) {
        console.log('method is ebt')
        return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }
      //cash
      if (paymentMethod.isCash) {
        console.log('method is isCash')
        return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }

      if (paymentMethod.isCreditCard) {
        console.log('method is isCreditCard')
        return  this.processCreditPayment(site, posPayment, order, amount, paymentMethod)
      }

      if (paymentMethod.name.toLowerCase()  == 'check') {
        console.log('method is check')
        return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }

      if (paymentMethod.name.toLowerCase() === 'rewards points' || paymentMethod.name.toLowerCase() === 'loyalty points') {
        console.log('method is points')
        return this.enterPointCashValue(amount, paymentMethod, posPayment, order)
      }

      return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      // console.log('paymentMethod', paymentMethod, posPayment )
      // console.log('is there a method' , method$)
      // if (!method$) {return of(null)}
      // labelPrint$.pipe(switchMap(data => {
      //   return of(method$)
      // }))
  }

  validatePaymentAmount(amount, paymentMethod: IPaymentMethod, balanceRemaining: number, creditBalanceRemaining): boolean {

    if (  +amount > +balanceRemaining ) {
      // if (!paymentMethod.isCreditCard) {
      //   this.notify(`Enter amount smaller than ${balanceRemaining}.`, 'Try Again', 3000)
      //   return false
      // }
      // console.log('creditBalanceRemaining', creditBalanceRemaining)
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
