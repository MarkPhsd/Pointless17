import { Component, Inject, OnDestroy, OnInit , Optional} from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, switchMap } from 'rxjs';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BoltInfo, BoltTerminal } from '../../models/models';
import { CardPointMethodsService } from './../../services/index';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrdersService } from 'src/app/_services';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
@Component({
  selector: 'app-cardpointe-transactions',
  templateUrl: './cardpointe-transactions.component.html',
  styleUrls: ['./cardpointe-transactions.component.scss']
})
export class CardpointeTransactionsComponent implements OnInit, OnDestroy {

  sale$: Observable<any>;
  auth$: Observable<any>;
  boltConnection$  :  Observable<any>;
  boltInfo$: Observable<any>;
  boltConnection: Observable<any>;
  public _finalizeSale     = new BehaviorSubject<any>(null);

  private _sale               = new BehaviorSubject<number>(null);
  public itemProcessSection$  = this._sale.asObservable();

  public _connect     = new BehaviorSubject<any>(null);

  initConnectSubscriber() {
    this._connect.subscribe(data => {
      if (data) {
        // console.log('_connectSubscriber', data)
        this.boltSubscriber();
        this._connect.unsubscribe()
      }
    })
  }

  boltSubscriber() {
    // console.log('bolt connect called ', this.methodsService.connect)
    this.methodsService.getConnect().subscribe( data => {
      this.methodsService.connect = data
      this.methodsService.initTerminal(data.xSessionKey, data.expiry);
      this.saleSubscriber();
      this.initFinalizer();
    })
  }

  saleSubscriber() {
    this._sale.subscribe(data => {
      // console.log('process sale called', data)
      if (!data) {return }
      if (!this.methodsService.connect) { return }
      if (this.methodsService.connect && !this.methodsService.connect?.xSessionKey)  { return }

      const auth = this.methodsService.getAuthCaptureRequest(data)
      this.methodsService.processSale(this.methodsService.amount, this.methodsService.orderID, auth)
        .subscribe(data => {
          if (data && data?.respstat.toLowerCase() == 'b') {
            this.orderService.notificationEvent('Please retry. Transaction failed to run correctly and has not been processed.', 'Alert')
            return;
          }
          if (data && data?.respstat.toLowerCase() == 'c') {
            this.orderService.notificationEvent('Declined.', 'Alert')
            return;
          }
          this._finalizeSale.next(data);
          this._sale = new BehaviorSubject<number>(null)
      })
    })
  }

  constructor(  public methodsService       : CardPointMethodsService,
                public auth                 : UserAuthorizationService,
                public paymentMethodsService: PaymentsMethodsProcessService,
                private orderService        : OrdersService,
                @Inject(MAT_DIALOG_DATA) public data: any,
                @Optional() private dialogRef  : MatDialogRef<CardpointeTransactionsComponent>,
              ) {

    this.methodsService.orderID = data?.data?.id;
    this.methodsService.retRef = data?.data?.retRef;
    this.methodsService.amount = data?.amount;

  }

  ngOnInit()  {

    this.methodsService.getBoltInfo().subscribe(data => {

        // console.log('ngOnInit', data)
        if (data.boltInfo && data.terminal) {
          this.methodsService.boltTerminal = {} as BoltTerminal;
          if (!this.methodsService.boltInfo) {
            this.methodsService.boltInfo = {} as BoltInfo;
          }
          this.methodsService.boltInfo = data.boltInfo ;
          this.methodsService.boltTerminal.hsn = data.terminal.cardPointeHSN;
          this.methodsService.boltInfo.hsn     = data.terminal.cardPointeHSN;
          this.methodsService.boltInfoInitialized = true;
          this.methodsService.boltTerminalInitialized = true;
          this.initConnectSubscriber();
          // console.log('calling connect')
          this._connect.next(true);

        } else {
          //terminal info not initialized.
          this.orderService.notificationEvent('Info not initialized. Please close and reopen window.', 'Alert')
        }

    });

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

 initFinalizer() {
  this._finalizeSale.subscribe(data => {
     if (!data) {return}
    //  console.log('finalizer called')
      this.paymentMethodsService.processCardPointResponse( data, this.methodsService.payment, this.orderService.currentOrder)
      this.methodsService.initValues();
      this.dialogRef.close(null)
  })
 }

 sendAuthCardAndCapture() {
    // this.methodsService.initValues()
    this.methodsService.processing = true;
    this.methodsService.sendAuthCard(null).subscribe(data => {
      if (!data || data.errorcode != 0) {

        if (data.errorcode == 7 ) {
          return;
        }

        this.orderService.notificationEvent(`result ${data?.errormessage}`, 'Error Occured')

        return
      }
      this._sale.next(data)
    })
  }

  processVoid(retRef) {
    this.methodsService.processing = true;
    this.methodsService.voidByRetRef(retRef)
    .subscribe(data => {
      this.methodsService.processing = false;
      this.methodsService.sale = data;
      this.methodsService.retRef = data?.retref
    })
  }

  refundByRetRef(retRef) {
    this.methodsService.processing = false;
    // console.log('refund by RetRef')
    this.methodsService.refundByRetRef(retRef)
    .subscribe(data => {
      this.methodsService.processing = true;
      this.methodsService.sale = data;
      this.methodsService.retRef = data?.retref
    })
  }

  sendAuthCard() {
    // this.methodsService.initValues()
    this.methodsService.processing = true;
    this.methodsService.sendAuthCard(null).subscribe(data => {
      this.methodsService.processing = false;
      this.methodsService.transaction = data;
      this.methodsService.retRef = data?.retref
    })
  }

  pinDebitSaleAuthCapture(){
    // this.methodsService.initValues()
    this.methodsService.processing = true;
    this.methodsService.sendAuthCard('debit').subscribe(data => {
      this._sale.next(data)
    })
  }
}
