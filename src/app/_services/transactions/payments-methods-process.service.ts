import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, Observable, of, Subscription, switchMap, } from 'rxjs';
import { IPaymentResponse, IPOSOrder,  IPOSPayment,   ISite, PosPayment }   from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from '../reporting/sites.service';
import { IPaymentMethod, PaymentMethodsService } from './payment-methods.service';
import { POSPaymentService } from './pospayment.service';
import { RStream, TranResponse } from '../dsiEMV/dsiemvtransactions.service';
import { ProductEditButtonService } from '../menu/product-edit-button.service';
import { OrderMethodsService } from './order-methods.service';
import { OrdersService } from './orders.service';
import { DSIEMVSettings, TransactionUISettings, UISettingsService } from '../system/settings/uisettings.service';
import { PrintingService } from '../system/printing.service';
import { BalanceSheetService } from './balance-sheet.service';
import { PrepPrintingServiceService } from '../system/prep-printing-service.service';
import { BalanceSheetMethodsService } from './balance-sheet-methods.service';
import { PlatformService } from '../system/platform.service';
import { POSOrderItemService } from './posorder-item-service.service';
import { UserAuthorizationService } from '../system/user-authorization.service';

@Injectable({
  providedIn: 'root'
})

export class PaymentsMethodsProcessService implements OnDestroy {

  dialogSubject: Subscription;
  dialogRef: any;

  private _dialog     = new BehaviorSubject<any>(null);
  public  dialog$      = this._dialog.asObservable();

  _initTransactionComplete = new BehaviorSubject<any>(null);


  public _sendOrder     = new BehaviorSubject<IPOSOrder>(null);
  public  sendOrder$      = this._sendOrder.asObservable();

  public _sendOrderAndLogOut     = new BehaviorSubject<any>(null);
  public  sendOrderAndLogOut$      = this._sendOrderAndLogOut.asObservable();


  public _sendOrderOnExit     = new BehaviorSubject<any>(null);
  public sendOrderOnExit$     = this._sendOrderOnExit.asObservable();


  ngOnDestroy(): void {
      if (this.dialogSubject){ this.dialogSubject.unsubscribe()}
   }

  constructor(
    private sitesService        : SitesService,
    private paymentService      : POSPaymentService,
    private paymentMethodService: PaymentMethodsService,
    private orderService        : OrdersService,
    private platFormService     : PlatformService,
    private uiSettingService    : UISettingsService,
    private orderMethodsService : OrderMethodsService,
    private posOrderItemService : POSOrderItemService,
    public  printingService     : PrintingService,
    private prepPrintingService : PrepPrintingServiceService,
    private dialogOptions       : ProductEditButtonService,
    private balanceSheetMethodsSevice: BalanceSheetMethodsService,
    private userAuthorizationService: UserAuthorizationService,
    private editDialog              : ProductEditButtonService,
    private matSnackBar         : MatSnackBar) {
  }

  get DSIEmvSettings(): DSIEMVSettings {
    const item = localStorage.getItem('DSIEMVSettings');
    if (!item) { return }
  const EMVSettings = JSON.parse(item)
  return EMVSettings
  }


  newOrderWithPayloadMethod(site, serviceType){
    let sendOrder$ = of('true')
    if (this.orderMethodsService.currentOrder) {
       sendOrder$ = this.sendOrderOnExit(this.orderMethodsService.currentOrder)
    }
    // this.paymentMethodsProcess.updateSendOrderOnExit(this.order);
    // let sendOrder$ = of('true')
    return sendOrder$.pipe(switchMap(data => {
      return this.orderMethodsService.newOrderWithPayloadMethod(site, serviceType)
    })).pipe(
      switchMap(data => {
          return of(data)
      })
    )

  }

  sendOrderAndLogOut(order: IPOSOrder, logOut: boolean) {
    const item = {order: order, logOut: logOut};
    this._sendOrderAndLogOut.next(item)
  }

  enterPointCashValue(amount, paymentMethod: IPaymentMethod, posPayment: IPOSPayment, order: IPOSOrder ): Observable<IPaymentResponse> {
    const site = this.sitesService.getAssignedSite();
    return this.processPayment(site, posPayment, order, amount, paymentMethod)
  }

  sendOrderProcess(order: IPOSOrder) {
    this._sendOrder.next(order)
  }

  sendOrderProcessLockMethod(order: IPOSOrder) {
    this._sendOrder.next(order)
  }

  sendOrderProcessAndLogOut(order: IPOSOrder) {
    this._sendOrderAndLogOut.next(order)
  }

  processPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder,
                 amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {

    let response: IPaymentResponse;
    const balance$ =  this.balanceSheetMethodsSevice.openDrawerFromBalanceSheet();

    if (posPayment.tipAmount) {  amount = (amount - posPayment.tipAmount)  }

    // console.log('process payment')
    const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod);

    return balance$.pipe(
        switchMap(data => {
          return payment$
      })).pipe(switchMap(data => {
        // console.log('process payment Data', data)
        if (!data) {
          return this.sitesService.notifyObs('Payment not succeeded.', 'close', 5000, 'red')
        }
        order = data?.order;
        response = data;
        if (!data?.paymentSuccess ||
            ( data?.responseMessage && data?.responseMessage.toLowerCase() != 'success')) {
          return  this.sitesService.notifyObs(`Payment failed because: ${data?.responseMessage}`, 'Close.', 15000)
        }

        return this.finalizeOrderProcesses(order);
      })).pipe(switchMap( data => {
        // console.log('udpdate order subscription')
        this.orderMethodsService.updateOrderSubscription( order );
        if (response.orderCompleted) {
          this.printingService.printJoinedLabels() ;
          this.finalizeOrder(response, paymentMethod, order);
          this._initTransactionComplete.next(true)
        }
        return of(response);
      }), catchError(err => {
        this.sitesService.notify('Error in processing payment' + err, 'Error', 5000, 'red')
        return of(err)
    }));
  }

  updateSendOrderOnExit(order: IPOSOrder) {
    const item = {order: order, logOut: false};
    this._sendOrderOnExit.next(item)
  }

  sendOrderOnExit(order: IPOSOrder) {
    // console.log('sendOrderOnExit', order?.id);

    let sendOrder$ : Observable<any>;
    if (!order) {  return of(null)  }
    if (this.isApp) {
      // console.log('isapp', this.isApp)
      return  sendOrder$ = this.uiSettingService.transactionUISettings$.pipe(switchMap(data => {
        // console.log('prepOrderOnExit',  data?.prepOrderOnExit)
        if (data) {
          if (data.prepOrderOnExit) {
            return this.sendToPrep (order, true, data, true  )
          }
        }
        return of(null)
      }),catchError(data => {
        // console.log('Send order on exit error', data.toString())
        return of(data)
      }))
    }
    return of(null)
  }

  get isApp() {
    if (!this.platFormService.isApp ||  !this.platFormService.isAppElectron) return false;
    return true;
  }

  finalizeOrderProcesses(order: IPOSOrder) {
    this.printingService.updatePrintingFinalizer(true)
    let printLabels$ : Observable<any>;
    let sendOrder$   : Observable<any>;
    if (!this.platFormService.isApp || !this.platFormService.isAppElectron) return of(null);

    return this.uiSettingService.transactionUISettings$.pipe(switchMap(data => {
      printLabels$ = of(null);
      sendOrder$  = of(null);
      if (data.prepOrderOnClose) {
        this.sendToPrep(order, true, data)
      }
      if (data.printLabelsOnclose) {
        return this.printingService.printLabels(order, true)
      }
      return forkJoin([printLabels$, sendOrder$])
    }))
  }


  finalizeOrder(paymentResponse: IPaymentResponse,
                paymentMethod: IPaymentMethod,
                order: IPOSOrder): number {

  this.orderMethodsService.setLastOrder(order)

  if (!paymentResponse ) {
    this.sitesService.notify(`No payment response `, 'close', 3000, 'red');
    return 0
  }

  if (!paymentResponse || !paymentResponse.payment) {
    this.sitesService.notify('No payment in payment response', 'close', 3000, 'red');
    return 0
  }

  const payment = paymentResponse.payment;
  if (order && !order.balanceRemaining) { order.balanceRemaining = 0}

  if (payment && paymentMethod) {

  if (paymentMethod.isCreditCard) {
    if (this.platFormService.isApp()) {
      this.editDialog.openChangeDueDialog(payment, paymentMethod, order)
    }
    return 1
  }

  if (paymentMethod.isCash) {
      this.balanceSheetMethodsSevice.openDrawerFromBalanceSheet()
  }

  if (payment.amountReceived >= payment.amountPaid || order.balanceRemaining == 0) {
    if (this.platFormService.isApp()) {
        this.editDialog.openChangeDueDialog(payment, paymentMethod, order)
  }
  return 1
  }

  return 0
  }
}

 sendToPrep(order: IPOSOrder, printUnPrintedOnly: boolean, uiTransactions: TransactionUISettings, cancelUpdateSubscription?: boolean): Observable<any> {
    if (!this.userAuthorizationService?.user) {
      return of(null)
    }

    if (order) {
      const site = this.sitesService.getAssignedSite()
      const expoPrinter = uiTransactions?.expoPrinter
      const templateID = uiTransactions?.expoTemplateID;
      const prep$ = this.prepPrintingService.printLocations(order,
                                                            printUnPrintedOnly,
                                                            expoPrinter,
                                                            templateID);
      let item$ =  prep$.pipe(
        switchMap( data => {
          return  this.prepPrintUnPrintedItems(order.id, cancelUpdateSubscription)
      })
      ,catchError( data => {
          console.log('error in send to prep', data)
          this.sitesService.notify('Error printing templates' + data.toString(), 'close', 5000, 'red')
          return of(data)
      }))

      return item$;
    }
    return of(null)
  }

  prepPrintUnPrintedItems(id: number, cancelUpdateSubscription?: boolean) {

    if (!this.userAuthorizationService?.user) { return of(null)  }
    if (id) {
      const site = this.sitesService.getAssignedSite()
      return  this.posOrderItemService.setUnPrintedItemsAsPrinted(site, id).pipe(
        switchMap(data => {
          return this.orderService.getOrder(site, id.toString(), false)
        })).pipe(
          switchMap( order => {
          if (order) {
            if (!cancelUpdateSubscription) {
              this.orderMethodsService.updateOrderSubscription(order)
            }
            return of(order)
          }
          return of(null)
      }));
    }
    return of(null)
  }
  // Error in processing cash paymentTypeError: Cannot read properties of undefined (reading 'pipe')

  //openDrawerFromBalanceSheet
  processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder,
                     amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
    return this.processPayment(site, posPayment, order, amount, paymentMethod)
  }

  processCreditPayment(site: ISite, posPayment: IPOSPayment,
                       order: IPOSOrder, amount: number,
                       paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {

    if (this.platFormService.isAppElectron) {
      if (this.DSIEmvSettings && this.DSIEmvSettings?.enabled) {
        this.processSubDSIEMVCreditPayment(order, amount, true)
        return
      }
    }

    return this.processPayment(site, posPayment, order, amount, paymentMethod)
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
      this.notify(`Error no cmdResponse`, 'Transaction not Complete', 3000);
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
        cmdStatus.toLowerCase() === 'Partial AP'.toLowerCase() ||
        cmdStatus.toLowerCase() === 'captured'.toLowerCase()) {
      return true;
    }
    return false;
  }

  isCardPointApproved(trans: any) {

    if (trans && trans.captureStatus && (trans?.captureStatus.toLowerCase() === 'approved'.toLowerCase() ||
                  trans?.captureStatus.toLowerCase() === 'approval'.toLowerCase() ||
                  trans?.captureStatus.toLowerCase() === 'A'.toLowerCase() ||
                  trans?.captureStatus.toLowerCase() === 'captured'.toLowerCase()
                  ) ) {
      return true;
    }

    if (trans) {
      if (trans.resptext === 'Approval') {
        return true;
      }
    }

    if (trans && trans.exceptionMessage) {
      this.notify(`Response not approved. Response given ${trans.exceptionMessage}`, 'Failed', 3000)
      return false;
    }
    this.notify(`Response not approved. Response given ${trans.captureStatus}`, 'Failed', 3000)
    return false;
  }

  isTriPOSApproved(trans: any) {

    // console.log('isTriPOSApproved' , trans?.isApproved, trans?.statusCode)
    if (trans && trans?.isApproved) {
      return true;
    }

    if ( trans && trans.statusCode && (trans?.statusCode.toLowerCase() === 'approved'.toLowerCase() ||
                  trans?.statusCode.toLowerCase() === 'approval'.toLowerCase() ||
                  trans?.statusCode.toLowerCase() === 'A'.toLowerCase()
                  ) ) {
      return true;
    }

    // console.log('not approved')
    this.notify(`Response not approved. Response given ${trans?.statusCode}. Reason: ${trans?._processor?.expressResponseMessage} ` , 'Failed', 3000)
    return false;
  }

  processCardPointResponse(trans: any, payment: IPOSPayment, order: IPOSOrder): Observable<any> {
    const site = this.sitesService.getAssignedSite();

    //if not approved, but you know it is, then check the messages for approval, sometimes they need to be updated.
    if (this.isCardPointApproved(trans)) {
      payment   = this.applyCardPointResponseToPayment(trans, payment)
      payment.textResponse =  trans?.resptext.toLowerCase();
      let paymentMethod    = {} as IPaymentMethod;
      let paymentResponse: IPaymentResponse

      const process$ =  this.paymentMethodService.getPaymentMethodByName(site, 'credit').pipe(
        switchMap( data => {
          // console.log('paymentMethod', paymentMethod)
          payment.paymentMethodID = data.id;
          paymentMethod = data;
          return this.processPayment(site, payment, order, payment.amountPaid, paymentMethod)
        }
      )).pipe(switchMap(data => {
        let response = data;
        return of(payment.textResponse)
      }))

      return process$
    } else {
      return of(null)
    }
  }

  getPaymentMethodByName(site, cardType): Observable<IPaymentMethod> {
    const item$  = this.paymentMethodService.getCreditCardPaymentMethod(site, cardType)
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
    const list = [] as string[];
    if (transType === 'authorizationCompletionResponse') {
      order.posPayments.forEach(data => {
        // console.log('applyAssociatedAuths refnumber', data.tranType, data.refNumber, payment.respcode )
        if (data.tranType === 'incrementalAuthorizationResponse' ) {
          list.push(data.refNumber)
        }
      })
    }
    payment.resptext = JSON.stringify(list)
    return payment
  }

  processTriPOSResponse(trans: any, payment: IPOSPayment, order: IPOSOrder, tipValue: number): Observable<any> {

    const site = this.sitesService.getAssignedSite();
    const approved = this.isTriPOSApproved(trans);

    if (!approved) {
      return of(null)
    }

    // console.log('approved')

    //transactionIDRef
    const idRef = payment.id.toString();

    payment   = this.applyTripPOSResponseToPayment(trans, payment, tipValue);
    payment   = this.applyAssociatedAuths(payment.tranType, payment, order);
    let paymentMethod    = {} as IPaymentMethod;
    let cardType = 'credit'
    let paymentResponse: IPaymentResponse

    if (trans?.cardLogo) {   cardType = trans?.cardLogo;  }

    // console.log('trans', trans)
    // console.log('cardType', cardType)

    return this.getPaymentMethodByName(site, cardType).pipe(
      switchMap( data => {
        if (!data) {  return of(null)   }
        payment.paymentMethodID = data.id;
        paymentMethod = data;
        payment.transactionIDRef = idRef;
        return this.processPayment(site, payment, order, payment.amountPaid, data)
      }
    )).pipe(
      switchMap(data => {
        paymentResponse = data;
        return of({order: paymentResponse.order, payment: paymentResponse.payment, trans: trans})
    }))

  }

  processAuthTriPOSResponse(trans: any, payment: IPOSPayment, order: IPOSOrder, tipValue: number): Observable<any> {
    const site = this.sitesService.getAssignedSite();

    if (!order) {
      this.sitesService.notify('Error retrieiving order information. Please re-open order.', 'Alert',1000)
      return of(order)
    }

    if (!this.isTriPOSApproved(trans)) { return of(order) }

    payment   = this.applyTripPOSResponseToPayment(trans, payment, tipValue)
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

  processCreditCardResponse(rStream: RStream,  payment: IPOSPayment, order: IPOSOrder) {

    const site = this.sitesService.getAssignedSite();
    if (!rStream) {
      this.sitesService.notify('No RStream resposne', 'close', 3000, 'red');
      return;
    }

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
        let response: IPaymentResponse;
        const payment$ =   this.paymentService.makePayment(site, payment, order, +trans.Amount.Authorize, paymentMethod)

        return  payment$.pipe(
          switchMap(data => {
            this.orderMethodsService.updateOrderSubscription(data.order);
            this.printingService.previewReceipt();
            response = data;
            return this.finalizeOrderProcesses(order )
          })).pipe(switchMap(data => {
            this.finalizeOrder(response,  paymentMethod, data.order);
            return of(cmdResponse);
          })
        )
      }

    }
    return of(null)
  }

  // processSendOrder(order: IPOSOrder) {
  //   return this.sendToPrep(order, true)
  // }

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

    // console.log('response payment', payment)
    return payment;
  }


  applyTripPOSResponseToPayment(response: any, payment: IPOSPayment, tipValue: number) {
    // console.log('type', response._type, )
    // console.table(response)

    payment = this.applyPaymentAmount(response,payment,tipValue)

    // console.log('payment response saved', payment.amountPaid)

    payment.account         = response?.accountNumber;
    payment.accountNum      = response?.accountNum;
    payment.approvalCode    = response?.approvalNumber;

    payment.captureStatus   = response?.statusCode;
    payment.entryMethod     = response?.entryMode;
    payment.entrymode       = response?.paymentType;
    payment.respproc        = response?.networkTransactionId;
    payment.respcode        = response?.transactionId
    payment.batchid         = response?.binValue;
    payment.tranType        = response?._type;

    if (response.expirationMonth && response.expirationYear) {
      payment.expiry          = `${response?.expirationMonth}${response?.expirationYear}`
    }

    payment.refNumber       = response?.transactionId;
    if (!payment.approvalCode) {
      payment.approvalCode  = response?.transactionId;
    }
    payment.bintype         = response?.binValue;
    payment.transactionIDRef = response?.transactionIDRef

    if (payment.entryMethod === 'ContactIcc') {
      payment.aid =response?.emv?.applicationIdentifier;
      payment.applicationLabel = response?.emv?.applicationPreferredName || response?.emv?.applicationLabel;
      payment.tvr = response?.emv?.cryptogram;
    }

    payment.transactionData = JSON.stringify(response);

    return payment;
  }

  applyPaymentAmount(response: any, payment: IPOSPayment, tipValue: number) {
    // console.log('applyPaymentAmount', response._type, response.approvedAmount, response.totalAmount)
    if (response._type === 'authorizationResponse') {
      payment.amountPaid      = response.approvedAmount;
      payment.amountReceived  = 0
      payment.tipAmount       = tipValue;
      return payment;
    }

    if (response._type === 'saleResponse') {
      if (+tipValue == (response.approvedAmount - +tipValue)) {
        payment.tipAmount       = tipValue;
        payment.amountPaid      = +response.approvedAmount - +tipValue;
        payment.amountReceived  = +response.approvedAmount - +tipValue;
      } else  {
        payment.amountPaid      = +response.approvedAmount ;
        payment.amountReceived  = +response.approvedAmount ;
      }
      return payment;
    }

    if (response._type === 'authorizationCompletionResponse') {
      ///for authorizationCompletionResponse always use the total amount approved amount will return 0.00
      payment.amountPaid      = +response?.totalAmount;
      payment.amountReceived  = +response?.totalAmount;

      if (+tipValue == (payment.amountPaid  - +tipValue)) {
        payment.tipAmount       = tipValue;
        payment.amountPaid      = payment.amountPaid  - +tipValue;;
        payment.amountReceived  = payment.amountReceived - +tipValue;;
      }
      return payment;
    }

    if (response._type === 'refundResponse') {
      payment.amountPaid      = - response.totalAmount;
      payment.amountReceived  = - response.totalAmount;
      payment.approvalCode    = response.approvalNumber;
    }


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

  // processRewardPoints(site: ISite, posPayment: IPOSPayment, order: IPOSOrder,
  //                     amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {
  //   if (order.clients_POSOrders) {
  //     if (amount) {
  //       const payment$ = this.processPayment(site, posPayment, order, amount, paymentMethod)
  //       return payment$
  //     }
  //   }
  // }

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
        // console.log('method is wic')
        return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }
      if (paymentMethod.ebt) {
        // console.log('method is ebt')
        return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }
      //cash
      if (paymentMethod.isCash) {
        // console.log('method is isCash')
        return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }

      if (paymentMethod.isCreditCard) {
        // console.log('method is isCreditCard')
        return  this.processCreditPayment(site, posPayment, order, amount, paymentMethod)
      }

      if (paymentMethod.name.toLowerCase()  == 'check') {
        // console.log('method is check')
        return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }

      if (paymentMethod.name.toLowerCase() === 'rewards points' || paymentMethod.name.toLowerCase() === 'loyalty points') {
        // console.log('method is points')
        return this.enterPointCashValue(amount, paymentMethod, posPayment, order)
      }

      // console.log('paymentMethod', paymentMethod, posPayment )
      return   this.processCashPayment(site, posPayment, order, amount, paymentMethod)

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

  processResults(paymentResponse: IPaymentResponse, paymentMethod: IPaymentMethod) {
    let result = 0
    if (paymentResponse.paymentSuccess || paymentResponse.orderCompleted) {
      if (paymentResponse.orderCompleted) {
        result =  this.finalizeOrder(paymentResponse, paymentMethod, paymentResponse.order)
      } else {
      }
    }

    if (paymentResponse.paymentSuccess || paymentResponse.responseMessage.toLowerCase() === 'success') {
      this.orderMethodsService.updateOrderSubscription(paymentResponse.order)
      this.sitesService.notify(`Payment succeeded: ${paymentResponse.responseMessage}`, 'Success', 1000)
    } else {
      this.sitesService.notify(`Payment failed because: ${paymentResponse.responseMessage}`, 'Something unexpected happened.',3000)
    }
  }

}
