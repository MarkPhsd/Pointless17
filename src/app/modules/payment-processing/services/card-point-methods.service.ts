import { Injectable } from '@angular/core';
import { CardPointBoltService } from './card-point-bolt.service';
import { CardPointService } from './card-point.service';
import { BehaviorSubject, forkJoin, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { BoltInfo, BoltTerminal } from './../models/models';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPaymentResponse, IPOSOrder, IPOSPayment, ISetting, ISite } from 'src/app/_interfaces';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrdersService } from 'src/app/_services';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

export interface IBoltInfo {
   boltInfo: BoltInfo;
   boltTerminal: BoltTerminal;
   terminal: ITerminalSettings
}
@Injectable({
  providedIn: 'root'
})
export class CardPointMethodsService {


  amount = 1;
  orderID = 1139191;
  currency = 'USD';
  retRef: string;
  payment: IPOSPayment;
  transactionUISettings: TransactionUISettings;

  ping$: Observable<any>;
  connect$: Observable<any>;
  listTerminals$: Observable<any>;
  disconnect$: Observable<any>;
  terminalDetails$: Observable<any>;
  terminalSettings: ITerminalSettings;

  transaction$: Observable<any>;
  transaction:any
  testProcess: boolean;
  sale: any;
  request: any;
  terminalDetails: any;
  connect: any;
  disconnect: any;
  listTerminals: any;
  ping: any;
  processing: boolean;
  manualPrompt: boolean;

  public boltInfo: BoltInfo;
  public boltTerminal: BoltTerminal;

  public boltInfoInitialized: boolean
  public boltTerminalInitialized: boolean
  observer$         : Observable<IBoltInfo>
  boltInfo$         : Observable<any>;
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
    private cardPointService: CardPointService,
    private settingsService: SettingsService,
    private paymentService      : POSPaymentService,
    private siteService         : SitesService,
    private cardPointBoltService: CardPointBoltService,
    private paymentMethodService: PaymentMethodsService,
    private orderService        : OrdersService,
    private orderMethodsService : OrderMethodsService,
    public  printingService     : PrintingService,
    private dialogOptions       : ProductEditButtonService,
    private matSnackBar         : MatSnackBar) {
  }

  getBolt() : Observable<BoltInfo> {
    let   boltInfo  = {} as BoltInfo;
    const device = localStorage.getItem('devicename');

    const site = this.siteService.getAssignedSite()
    return this.settingsService.getSettingByNameCached(site, 'boltInfo').pipe(switchMap(data => {
      const item = JSON.parse(data.text) as BoltInfo;

      if (!this.boltInfo) { this.boltInfo = {} as BoltInfo };
      this.boltInfo.apiURL = item?.apiURL;
      this.boltInfo.merchID = item?.merchID;
      return of(item)
    }))
  };

  getBoltInfo() {
    const site = this.siteService.getAssignedSite()
    const deviceName = localStorage.getItem('devicename');

    const terminal$ = this.getBoltTerminalInfo(deviceName, site)
    const boltInfo$ = this.getBolt(); //
    return boltInfo$.pipe(
      switchMap((boltInfo) =>
        forkJoin({
          terminal: terminal$,
          boltInfo: of(boltInfo) //boltInfo$
      })
    ))
  };

  getBoltTerminalInfo(deviceName: string, site: ISite): Observable<ITerminalSettings> {
    const settings$ =   this.settingsService.getDeviceSettings( deviceName )
    return  settings$.pipe(
      switchMap( data => {
        this.boltTerminal = {} as BoltTerminal;
        const item = JSON.parse(data.text) as ITerminalSettings;
        console.log('getBoltTerminalInfo', data.text)
        this.boltTerminal.hsn = item?.cardPointeHSN;
        return of(item)
    }))
  };

  init() {
    this.ping$ = null;
    this.listTerminals$= null;
    this.disconnect$= null;
    this.connect = null;
    this.terminalDetails$ = null;
  }

  initTransactions() {
    this.transaction$ = null
  }

  initValues() {
    this.connect = null;
    this.processing = false;
    if (this.boltTerminal) {
      this.boltTerminal.xSessionKey = null;
      this.boltTerminal.expiry = null;
    }

    this.amount = 1;
    this.orderID = 0;
    this.currency = 'USD';
    this.retRef = null;
    this.payment= null;

    this.ping$= null;
    this.connect$= null;
    this.listTerminals$ = null;
    this.disconnect$= null;
    this.terminalDetails$= null;
    this.terminalSettings= null;
    this.terminalDetails= null;
    this.transaction$ = null;
    this.transaction= null;
    this.testProcess= false;
    this.sale = null;
    this.request= null;
    this.connect = null;
    this.disconnect= null;
    this.listTerminals = null;
    this.ping= null;
    this.processing =false;
    this.manualPrompt = false
    this.init();
  }

  getConnect() {
    const bolt = this.boltInfo;
    return  this.cardPointBoltService.connect( bolt.apiURL, this.boltTerminal.hsn)
  }

  getConnectObservable() {
    const bolt = this.boltInfo;
    return  this.cardPointBoltService.connect( bolt.apiURL, this.boltTerminal.hsn).pipe(
      switchMap( data => {
        this.connect = data
        this.initTerminal(data.xSessionKey, data.expiry);
        return of(data)
      })
    )
  }

  sendterminalDetails() {
    this.init()
    const bolt = this.boltTerminal
    this.listTerminals$ = this.cardPointBoltService.terminalDetails( bolt.url, this.boltTerminal.hsn, bolt.xSessionKey)
  }

  sendDisconnect() {
    this.init()
    const bolt = this.boltTerminal
    if (bolt.url && this.boltTerminal.hsn && bolt.xSessionKey) {
      this.disconnect$ = this.cardPointBoltService.disconnect( bolt.url, this.boltTerminal.hsn, bolt.xSessionKey)
    }
    this.disconnect$ = of(null)
  }

  getDisconnect() {
    this.sendDisconnect();
    return this.disconnect$
  }

  sendPing() {
    this.init()
    const bolt = this.boltTerminal
    this.ping$ = this.cardPointBoltService.ping(bolt.url, this.boltTerminal.hsn, bolt.xSessionKey)
  }

  sendlistTerminals() {
    this.init()
    const bolt = this.boltTerminal
    this.listTerminals$ = this.cardPointBoltService.listTerminals( bolt.url, this.boltTerminal.hsn, bolt.xSessionKey)
  }

  sendconnect() {
    this.init()
    const bolt = this.boltInfo;
    this.cardPointBoltService.connect( bolt.apiURL, this.boltTerminal.hsn).subscribe(
      data => {
        this.connect = data;
        this.initTerminal(data.xSessionKey, data.expiry)
      }
    )
  }

  //auth and payments
  sendReadCard() {
    // this.init()
    const item = {
        "merchantId" : this.boltInfo.merchID,
        "hsn" :this.boltInfo.hsn,
        "amount" : (this.amount * 100).toFixed(0),
        "includeSignature" : "false",
        "gzipSignature" : "false",
        "signatureFormat" : "png",
        "signatureImageType" : "rgb",
        "signatureDimensions" : "320,450",
        "includeAmountDisplay" : "false",
        "confirmAmount" : "true",
        "beep" : "false",
        "aid" : "credit"
    };
    this.request = item;
    if (item) {
      const bolt = this.boltTerminal
      const connect$ = this.getConnect();
      connect$.pipe(
        switchMap(data =>  {
            this.connect = data;
            this.initTerminal(data.xSessionKey, data.expiry)
            return this.cardPointBoltService.readCard( bolt.url, item, data.xSessionKey )
          }
        )
      ).subscribe(data => {
        this.transaction = data;
      })
    }
  }

  resetAll() {
    this.init();
    this.initTransactions();
    this.sale = null;
    this.transaction = null;
    const bolt = this.boltTerminal;
    if (bolt) {
      if (this.cardPointBoltService && this.boltTerminal) {
        if (this.boltTerminal.xSessionKey) {
            const session = this.boltTerminal.xSessionKey;
            this.cardPointBoltService.cancel( bolt.url, this.boltTerminal.hsn, session).subscribe(data => {
          })
        };
      }
    };
  }

  getAuthRequest(aid: string, capture: boolean, manual: boolean) {
    if (!manual) {
      return this.getAuthCardRequest(aid, capture);
    }
    if (manual) {
      return this.getAuthCardManualRequest( capture );
    }
  }

  sendAuthCard(aid: string, capture: boolean, manual: boolean) {
    if (!this.connect) {
      this.sale = {errorMessage:  'Failed, No connection to device', errorCode: -1}
      return of({errorMessage: 'Failed, No connection to device', errorCode: -1})
    }

    const item  = this.getAuthRequest(aid, capture, manual)
    this.request = item;

    if (!item) {
      // console.log('Error 2 sendAuthCard')
      this.transaction = {errorMessage: 'Failed, no auth request', errorCode: -1}
      return of({errorMessage: 'Failed, no auth request', errorCode: -1})
    }

    if (!this.boltTerminal) {
      this.transaction = {errorMessage: 'Terminal not initiated', errorCode: -1}
      return of({errorMessage: 'Terminal not initiated', errorCode: -1})
    }

    const bolt = this.initTerminal(this.connect.xSessionKey, this.connect.expiry);

    if (manual) {
      return this.cardPointBoltService.authManual( this.boltTerminal.url, item, this.connect.xSessionKey )
    }
    return this.cardPointBoltService.authCard( this.boltTerminal.url, item, this.connect.xSessionKey )

  }

  //{ "message": null, "errorcode": 0, "token": "9674338015190051", "expiry": "1222", "name": "Datacap/Test Card 02" }
  sendCompleteAuth(item: any) {
    if (item) {
    }
  }

  ///CardPointe
  // AuthCapture
  validateAuthResult() {
    //this.connect
    if (!this.connect) {
      // console.log('Error 0 Auth Capture')
      this.sale = {errorMessage:  'Failed, No connection to device', errorCode: -1}
      return {errorMessage: 'Failed, No connection to device', errorCode: -1}
    }

    if (!this.transaction) {
      // console.log('Error 1 Auth Capture')
      this.sale = {errorMessage:  'Failed, No authorization request', errorCode: -1}
      return  {errorMessage: 'Failed, No authorization request', errorCode: -1}
    }

    if (this.transaction && this.transaction?.errorMessage != 0)   {
      // console.log('Error 2 Auth Capture')
      this.sale = {errorMessage: this.transaction?.errorMessage, errorCode: -1}
      return {errorMessage: this.transaction?.errorMessage, errorCode: -1}
    }

    if (this.transaction && !this.transaction?.token )   {
      // console.log('Error 2 Auth Capture')
      this.sale = {errorMessage: this.transaction?.errorMessage, errorCode: -1}
      return  {errorMessage: `no token provided`, errorCode: -1}
    }
  }

  validateAuth() {
    //this.connect
    if (!this.connect) {
      // console.log('Error 0 Auth Capture')
      this.sale = {errorMessage:  'Failed, No connection to device', errorCode: -1}
      return of({errorMessage: 'Failed, No connection to device', errorCode: -1})
    }

    if (!this.transaction) {
      // console.log('Error 1 Auth Capture')
      this.sale = {errorMessage:  'Failed, No authorization request', errorCode: -1}
      return of({errorMessage: 'Failed, No authorization request', errorCode: -1})
    }

    if (this.transaction && this.transaction?.errorMessage != 0)   {
      // console.log('Error 2 Auth Capture')
      this.sale = {errorMessage: this.transaction?.errorMessage, errorCode: -1}
      return of({errorMessage: this.transaction?.errorMessage, errorCode: -1})
    }

    if (this.transaction && !this.transaction?.token )   {
      // console.log('Error 2 Auth Capture')
      this.sale = {errorMessage: this.transaction?.errorMessage, errorCode: -1}
      return of({errorMessage: `no token provided`, errorCode: -1})
    }
  }

  authCapture() {
    const invalid = this.validateAuth();
    if (invalid) { return of(invalid) }
    const item = this.getAuthCaptureRequest(this.transaction);

    if (!item) {
      console.log('Error 3 Auth Capture')
      this.sale = {errorMessage: 'Failed, no auth request response', errorCode: -1}
      return of({errorMessage: 'Failed, no auth auth request response', errorCode: -1})
    }

    const bolt = this.initTerminal(this.connect.xSessionKey, this.connect.expiry);
    const sale$ = this.cardPointService.authCapture( bolt.url, item );
    sale$.subscribe(data => {
      this.request = item;
      this.sale =   data;
    })

  }

  captureOnly(auth) {
    let boltInfo = this.boltInfo
    if (!boltInfo) {
       boltInfo = JSON.parse(localStorage.getItem('boltInfo'))
    }
    if (!boltInfo) {
      this.orderService.notificationEvent('Bolt info not initialized', 'Alert');
      return
    }
    this.boltInfo = boltInfo;
    const site = this.siteService.getAssignedSite();
    return this.cardPointService.capture(site.url, auth)
  }

  refundByRetRef(retref: any) {
    let boltInfo = this.boltInfo
    if (!boltInfo) {
      boltInfo = JSON.parse(localStorage.getItem('boltInfo'))
    }
    let boltTerminal = this.boltTerminal
    if (!boltTerminal) {
      boltInfo = JSON.parse(localStorage.getItem('boltTerminal'))
    }
    const item = { retref: retref, merchID: boltInfo.merchID }
    return this.cardPointService.refundWithReference(boltInfo.apiURL, item )
  }

  voidByRetRef(retref: any) {
    let boltInfo = this.boltInfo
    if (!boltInfo) {
      boltInfo = JSON.parse(localStorage.getItem('boltInfo'))
    }

    const item = { retref: retref, merchID: boltInfo.merchID }
    console.log( item  )
    return this.cardPointService.void(boltInfo.apiURL, item )
  }

  voidByOrderID(orderID: any) {
    let boltInfo = this.boltInfo
    if (!boltInfo) {
      boltInfo = JSON.parse(localStorage.getItem('boltInfo'))
    }

    const item = { orderid: orderID, merchID: boltInfo.merchID }
    return this.cardPointService.voidByOrderId(boltInfo.apiURL, item )
  }

  processSale(auth: any, url: string) {
    if (!url) {
      const bolt = this.initTerminal(this.connect.xSessionKey, this.connect.expiry);
      if (!bolt) {
        console.log('no bolt terminal')
        return
      }
      url = bolt.url;
    }
    return this.cardPointService.authCapture(url, auth)
  }

  getProcessTip(session: string) {
    const bolt = this.initTerminal(this.connect.xSessionKey, this.connect.expiry);
    if (!bolt) {
      return
    }
    return this.cardPointBoltService.tip(bolt.url, this.boltTerminal.hsn, this.connect.xSessionKey)
  }

  getAuthCaptureRequest(data) {

    let token = data?.token;
    if (!token) {
      token = data?.account
    }

    let amount = data?.amount;
    if (!data?.amount) {
      amount = data.amountPaid  + data?.tipAmount
    }

    const item =  {
      "merchid":  this.boltInfo.merchID,
      "account":  token,
      "expiry":   data.expiry,
      "amount":   (amount * 100).toFixed(0),
      "currency": this.currency,
      "name"    : data?.name,
      "capture": "y",
      "receipt": "y",
    }
    // console.log('getAuthCaptureRequest', item)
    this.request = item;
    return item
  }

  getAuthCardManualRequest( capture: boolean ) {

    let _capture = 'false'
    if (capture) {
      _capture = 'true'
    }

    const item = {
      "merchantId" : this.boltInfo.merchID,
      "hsn"        : this.boltTerminal.hsn,
      "amount"     : ((this.amount) * 100).toFixed(0),
      "includeSignature" : "false",
      "includeAmountDisplay" : "true",
      "beep"          : "true",
      "includeAVS"    : "true",
      "includeCVV"    : "true",
      "capture"       : _capture,
      "gzipSignature" : "false",
      "orderId"       :  this.payment.id,
      "clearDisplayDelay" : "500"
    }

    // console.log('getAuthCardManualRequest', item)
    this.request = item;
    return item
  }

  getAuthCardRequest(aid: string, capture: boolean) {

    let inlcudePIN = 'false'
    if (!aid) {
      aid = 'credit'
    }
    if (aid === 'debit') {
      inlcudePIN = 'true'
    }
    let _capture = 'false'
    if (capture) {
      _capture = 'true'
    }

    const item = {
      "merchantId" : this.boltInfo.merchID,
      "hsn"     :    this.boltTerminal.hsn,
      "amount"  :    ((this.amount) * 100).toFixed(0),
      "orderId" :    this.payment.id,
      "includeSignature" : "false",
      "includeAmountDisplay" : "true",
      "beep" : "true",
      "aid"  : aid,
      "includeAVS" : "false",
      "capture" : _capture,
      "clearDisplayDelay" : "500",
      'includePIN': inlcudePIN
    };

    this.request = item;
    return item
  }

  initTerminal(sessionID: string, expiry: string) {
    if (!this.boltInfo && this.boltTerminal) {
      console.log('no bolt info')
      return
    };
    if (!this.boltTerminal) {
      console.log('no bolt terminal info')
      return
    };
    const  terminal = {} as BoltTerminal;
    terminal.hsn         = this.boltTerminal.hsn;
    terminal.merchantID  = this.boltInfo.merchID;
    terminal.url         = this.boltInfo.apiURL;
    terminal.xSessionKey = sessionID;
    terminal.expiry      = expiry;
    this.boltTerminal    = terminal;

    this.processing = false;
    return terminal;
  }

  processCreditPayment(site: ISite, posPayment: IPOSPayment,
    order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod,
    settings: TransactionUISettings): Observable<IPaymentResponse> {
    this.processSubCreditPayment(order, amount, true, settings)
    return
  }

  processSubCreditPayment ( order: IPOSOrder, amount: number, manualPrompt: boolean, settings: TransactionUISettings) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    const site = this.siteService.getAssignedSite();
    const  posPayment = {} as IPOSPayment;
    posPayment.orderID = order.id;
    posPayment.zrun = order.zrun;
    posPayment.reportRunID = order.reportRunID;

    this.amount       = amount;
    this.manualPrompt = manualPrompt;
    this.orderID      = order.id;

    const payment$  = this.paymentService.postPOSPayment(site, posPayment)
    payment$.subscribe(data =>
      {
        data.amountPaid = amount;
        this.payment = data;
        this.dialogRef = this.dialogOptions.openCardPointBoltTransaction({data, amount, action: 1, manualPrompt: manualPrompt, settings: settings});
        this._dialog.next(this.dialogRef)
        return of(data)
      }
    )
    return null
  }

  processSubCreditVoid( payment: IPOSPayment) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    this.amount       = payment.amountPaid + payment.tipAmount;
    // this.manualPrompt = manualPrompt;
    this.orderID      = payment.orderID;

    const site = this.siteService.getAssignedSite();
    const  posPayment = {} as IPOSPayment;
    posPayment.id = payment.id;
    this.dialogRef = this.dialogOptions.openCardPointBoltTransaction({payment: payment, voidPayment: payment, action: 2});
    this._dialog.next(this.dialogRef)
  }

  processCapture( payment: IPOSPayment, balanceRemaining: number, setting: TransactionUISettings) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    this.amount       = payment.amountPaid + payment.tipAmount;
    this.orderID      = payment.orderID;

    this.dialogRef = this.dialogOptions.openCardPointBoltTransaction({payment: payment, setting: setting,balanceRemaining: balanceRemaining });
    this._dialog.next(this.dialogRef)
  }

}
