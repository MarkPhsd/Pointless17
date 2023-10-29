import { Component, Inject, OnDestroy, OnInit , Optional} from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, switchMap } from 'rxjs';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BoltInfo, BoltTerminal } from '../../models/models';
import { CardPointMethodsService } from './../../services/index';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrdersService } from 'src/app/_services';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSPayment } from 'src/app/_interfaces';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-cardpointe-transactions',
  templateUrl: './cardpointe-transactions.component.html',
  styleUrls: ['./cardpointe-transactions.component.scss']
})
export class CardpointeTransactionsComponent implements OnInit, OnDestroy {

  processingTransaction: boolean;
  action$: Observable<any>;
  toggleData: boolean;
  sale$: Observable<any>;
  auth$: Observable<any>;
  boltConnection$  :  Observable<any>;
  boltInfo$: Observable<any>;
  boltConnection: Observable<any>;
  balanceRemaining: number;
  public _finalizeSale     = new BehaviorSubject<any>(null);
  settings: TransactionUISettings;
  private _sale               = new BehaviorSubject<any>(null);
  public itemProcessSection$  = this._sale.asObservable();
  public _connect     = new BehaviorSubject<any>(null);
  terminalSettings$ : Observable<any>;
  processCardPointResonse$: Observable<any>;

  initConnectSubscriber() {
    this._connect.subscribe(
     data => {
      if (data) {
        // return this.boltSubscriberObs()
        this.boltSubscriber()
        this._connect.unsubscribe()
      }
      }
    )
  }

  boltSubscriber() {
    // console.log('bolt connect called ', this.methodsService.connect)
    this.methodsService.getConnect().subscribe( data => {
      this.methodsService.connect = data
      // console.log('connection data', data.xSessionKey, data.expiry)

      if (data.errorMessage) {
        this.siteService.notify("Error Connecting: " + data?.errorCode + " " + data?.errorMessage, 'Close', 5000, 'red');
        return
      }
      this.methodsService.initTerminal(data.xSessionKey, data.expiry);
      this.saleSubscriber();
      this.initFinalizer();
    })
  }

  boltSubscriberObs() {
    // console.log('bolt connect called ', this.methodsService.connect)
    return  this.methodsService.getConnect().pipe(
      switchMap(data => {
      // console.log('connection data', data.xSessionKey, data.expiry)
      this.methodsService.connect = data
      this.methodsService.initTerminal(data.xSessionKey, data.expiry);
      this.saleSubscriber();
      this.initFinalizer();
      return of(data)
    }))
  }

  saleSubscriber() {
    this._sale.subscribe(data => {
      if (!data) {return }
      if (!this.methodsService.connect) { return }
      if (this.methodsService.connect && !this.methodsService.connect?.xSessionKey)  { return }
      const response = data.response;
      const request = data.request;

      // console.log('data.response', data.response);
      // console.log('data.request', data.request);

      //if  already captured.
      if (request?.capture) {
        this._finalizeSale.next(response);
        this._sale = new BehaviorSubject<number>(null)
        return
      }

      const auth = this.methodsService.getAuthCaptureRequest(response)
      this._processSale(auth)
    })
  }

  _processSale(auth) {
    const site = this.siteService.getAssignedSite()
    const void$ = this.getVoid()
    const processSale$ =  this.methodsService.processSale(auth, site.url);

    void$.pipe(
        switchMap(data => {
          return processSale$
        })
      )
      .subscribe(data => {
        if (data && data?.respstat.toLowerCase() == 'b') {
          const message = 'Please retry. Transaction failed to run correctly and has not been processed.'
          this.siteService.notify(message, 'close', 3000, 'red')
          return;
        }
        if (data && data?.respstat.toLowerCase() == 'c') {
          this.siteService.notify('Declined', 'close', 3000, 'red')
          return;
        }
        this._finalizeSale.next(data);
        this._sale = new BehaviorSubject<number>(null)
    })
  }

  initFinalizer() {
    this._finalizeSale.subscribe(data => {
      if (!data) {return}
      this.processingTransaction = true

      const order =  this.orderMethodsService.currentOrder;
      const payment = this.methodsService.payment;

      this.processCardPointResonse$ = this.paymentMethodsService.processCardPointResponse( data, payment, order).pipe(switchMap( data => {
          // console.log('processCardPointResponse', data)
          this.processingTransaction = false;
          this.methodsService.initValues();
          this.dialogRef.close(null)
          return of(data)
      }))
    })
  }

  getVoid() {
    let void$
    if (this.methodsService.payment && this.methodsService.payment.retref) {
      void$ = this.methodsService.voidByRetRef(this.methodsService.payment.retref.toString())
    }
    if (this.methodsService.payment && !this.methodsService.payment.retref) {
      void$ = of('success')
    }
    return void$
  }

  constructor(  public methodsService       : CardPointMethodsService,
                public auth                 : UserAuthorizationService,
                public paymentMethodsService: PaymentsMethodsProcessService,
                public paymentService       : POSPaymentService,
                private siteService         : SitesService,
                public orderMethodsService  : OrderMethodsService,
                private orderService        : OrdersService,
                @Inject(MAT_DIALOG_DATA) public data: any,
                @Optional() private dialogRef  : MatDialogRef<CardpointeTransactionsComponent>,
    ) {

    this.methodsService.orderID = data?.data?.id;
    this.methodsService.retRef = data?.data?.retref;
    this.methodsService.amount = data?.amount;
    this.methodsService.transactionUISettings = data?.settings

    //payment: payment, setting: setting,balanceRemaining: balanceRemaining
    if (data && data.payment) {
      this.balanceRemaining = data?.balanceRemaining;
      this.methodsService.payment = data.payment;
      this.methodsService.orderID =  data.payment?.id;
      this.methodsService.retRef  =  data.payment?.retref;
      this.methodsService.amount  =  data.payment?.amountPaid;
      this.methodsService.transactionUISettings  = data?.setting;
    }
  }

  ngOnInit()  {
    this.terminalSettings$ =  this.methodsService.getBoltInfo().pipe(
      switchMap(data => {
        console.log('data result', data.boltInfo, data.terminal)
        if (data.boltInfo && data.terminal) {

          this.methodsService.boltTerminal = {} as BoltTerminal;
          if (!this.methodsService.boltInfo) {   this.methodsService.boltInfo = {} as BoltInfo;  }
          this.methodsService.boltInfo = data.boltInfo ;
          this.methodsService.boltTerminal.hsn = data.terminal.cardPointeHSN;
          this.methodsService.boltInfo.hsn     = data.terminal.cardPointeHSN;
          this.methodsService.boltInfoInitialized = true;
          this.methodsService.boltTerminalInitialized = true;
          this.initConnectSubscriber();
          this._connect.next(true);
        } else {
          console.log('not initiaited', data)
          this.orderService.notificationEvent('Info not initialized. Please close and reopen window.', 'Alert')
        }
        return of(data)
    }));
  }

  cancel() {
    this.dialogRef.close(null)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    try {
      this.methodsService.getDisconnect().subscribe()
    } catch (error) {
      console.log('error', error)
    }
    try {
      if (this._finalizeSale) { this._finalizeSale.unsubscribe()}
      if ( this._sale) { this._sale.unsubscribe()}
      // if (this._connectSubscriber) { this._connectSubscriber.unsubscribe()}
    } catch (error) {
    }
  }

  initTransactionComplete() {
    this.paymentMethodsService._initTransactionComplete.subscribe(data => {
      this.dialogRef.close()
    })
  }

 sendAuthCardAndCapture(manual: boolean) {
    // this.methodsService.initValues()
    const sendAuth$ = this.methodsService.sendAuthCard(null, true, manual);
    const tip$  = this.methodsService.getProcessTip(this.methodsService.boltTerminal.xSessionKey);
    this.methodsService.processing = true;
    this.siteService.getAssignedSite();

    sendAuth$.subscribe(data => {
      if (!data || data.errorcode != 0) {
        if (data.errorcode == 7 ) {
          return;
        }
        this.orderService.notificationEvent(`result ${data?.errormessage}`, 'Error Occured')
        return
      }
      const item = {request: this.methodsService.request, response: data};
      this._sale.next(item)
    })

 }

  //preserve failed payments
  getPaymentFailed(): IPOSPayment {
    return null
  }

  processVoid(retRef) {
    this.methodsService.processing = true;
    this.methodsService.voidByRetRef(retRef)
    .subscribe(data => {
      this.methodsService.processing = false;
      this.methodsService.sale = data;
      this.methodsService.retRef = data?.retref
    })
  };

  voidByOrder(orderID: string) {
    return this.methodsService.voidByRetRef(orderID)
  }

  refundByRetRef(retRef) {
    this.methodsService.processing = false;
    this.methodsService.refundByRetRef(retRef)
    .subscribe(data => {
      this.methodsService.processing = true;
      this.methodsService.sale = data;
      this.methodsService.retRef = data?.retref
    })
  }

  sendAuthCard(manual: boolean) {
    // this.methodsService.initValues()
    this.methodsService.processing = true;
    // this.methodsService.sendAuthCard(null, true)
    const authCard$ =  this.methodsService.sendAuthCard(null, true, manual);
    authCard$.subscribe(data => {
      this.methodsService.processing = false;
      this.methodsService.transaction = data;
      this.methodsService.retRef = data?.retref
    })
  }

  sendAuthCardOnly(manual: boolean) {
    const site = this.siteService.getAssignedSite()
    this.methodsService.processing = true;

    const auth$ = this.methodsService.sendAuthCard(null, false, manual);

    if (this.methodsService.payment) {
      auth$.pipe(
        switchMap(data => {
          this.methodsService.processing = false;
          this.methodsService.transaction = data;
          this.methodsService.retRef = data?.retref
          this.methodsService.payment.retref =  data?.retref
          this.methodsService.payment.account =  data?.token
          this.methodsService.payment.approvalCode =  data?.retref
          this.methodsService.payment.resptext =  data?.resptext
          this.methodsService.payment.amountPaid =  data?.amount
          this.methodsService.payment.processData = data?.emvTagData;
          this.methodsService.payment.expiry = data?.expiry;
          return this.paymentService.savePOSPayment(site, this.methodsService.payment);
        }
      )).pipe(
        switchMap(data => {
            if (data && data.orderID) {
              const id =  data?.orderID.toString();
              return this.orderService.getOrder(site, id, false)
            }
            else {
              return of(null)
            }
          }
        )
      ).subscribe(data => {
        if (!data) {
          this.orderService.notificationEvent('Card not Authorized', 'Alert')
          return
        }
        this.orderService.notificationEvent('Card Authorized. Press the edit button in the payments to capture.', 'Alert')
        this.orderMethodsService.updateOrderSubscription(data);
      })
    }
  }

  applyBalance() {
    if ( this.balanceRemaining) {
      this.methodsService.payment.amountPaid = this.balanceRemaining;
      this.methodsService.amount = this.balanceRemaining;
    }
  }

  captureOnly() {
    const auth = this.methodsService.getAuthCaptureRequest(this.methodsService.payment)
    this._processSale(auth);
  }

  pinDebitSaleAuthCapture(manual: boolean){
    // this.methodsService.initValues()
    this.methodsService.processing = true;
    this.methodsService.sendAuthCard('debit', true, manual).subscribe(data => {
      const item = {request: this.methodsService.request, response: data};
      this._sale.next(item)
    })
  }
}
