import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  IPayPalConfig,
  ICreateOrderRequest,
  IOnApproveCallbackData,
  IClientAuthorizeCallbackData
} from 'ngx-paypal';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment, ISetting } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'app-pay-pal-transaction',
  templateUrl: './pay-pal-transaction.component.html',
  styleUrls: ['./pay-pal-transaction.component.scss']
})
export class PayPalTransactionComponent implements OnInit {

  sale$       : Observable<any>;
  public payPalConfig ? : IPayPalConfig;
  showError   : boolean;
  showCancel  : boolean;
  showSuccess : boolean;

  currencyCode         = 'USD';
  amount               = '9.99';
  categoryDescription  = 'Online Order';
  clientID             =  ''; //'AYMWQmVWocs14oF0DwxaiMofYBiUGUw_Qn1_5vJJX98ekNfu4FWij2taT7DNurOz_nEFse4Tjqey6KYT' ;
  balanceRemaining: number;

  uiTransactionSetting$: Observable<TransactionUISettings>;
  uiTransactionSetting : TransactionUISettings;

  _order: Subscription;
  order : IPOSOrder;
  paymentsMade: boolean;
  payment: IPOSPayment;
  settings: TransactionUISettings;
  message = ''
  _transactionUI: Subscription;

  currentOrderSusbcriber() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
      if (!data) { return }
      this.checkIfPaymentsMade()
    })
  }

  getUITransactionsSettings() {
    this._transactionUI = this.uiSettingsService.transactionUISettings$.subscribe( data => {
      if (data) {

        this.uiTransactionSetting = data;
        this.clientID = this.uiTransactionSetting.payPalClientID;
        this.currencyCode = this.settings.payPalCurrency;
      }
    });
  }


  constructor(private orderService        : OrdersService,
              public  uiSettingsService   : UISettingsService,
              public  userAuthorization    : UserAuthorizationService,
              private paymentMethodService: PaymentMethodsService,
              public paymentService       : POSPaymentService,
              public orderMethodsService: OrderMethodsService,  private siteService         : SitesService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              @Optional() private dialogRef  : MatDialogRef<PayPalTransactionComponent>,
            ) {


    this.order    = data.order;
    this.payment  = data.payment;
    this.settings = data.settings;

    this.getUITransactionsSettings();
    this.amount   = this.payment.amountPaid.toString();

    if (data) {
      this.message = 'transaction initialized'
      this.initConfig()
    };
  }

  ngOnInit(): void {
    const i = 0;
    if (this.order && this.settings && this.clientID && this.amount && this.currencyCode) {
      // this.initTransactions();
    }
  }

  initTransactions() {
    // this.message = 'transaction initialized'
    // this.currencyCode = this.settings.payPalCurrency;
    // this.clientID = this.settings.payPayClientID;

  }

  cancel() {
    this.dialogRef.close()
  }

  checkIfPaymentsMade() {
    this.paymentsMade = false
    if (this.order && this.order.posPayments) {
      if (this.order.posPayments.length > 0) {
        this.paymentsMade = true
        return true
      }
    }
  }

  resetStatus() { }

  completeSale(payPal: IOnApproveCallbackData) {
    console.log("completeSale", payPal)
    const site =  this.siteService.getAssignedSite();
    const method$ = this.paymentMethodService.getPaymentMethodByName(site, 'PayPal');
    method$.pipe(
      switchMap(data => {
        this.payment.paymentMethodID = data.id;
        const payment = this.setPaymentValues(this.payment, payPal)
        const sale$ = this.paymentService.putPOSPayment(site, payment)
        return sale$
    })).pipe(
      switchMap(data => {
        console.log("putPOSPayment" )
        const order$ = this.orderService.completeOrder(site, data.orderID);
        return order$
      })
     ).pipe(
      switchMap(data => {
        console.log("completeOrder" )
        this.orderMethodsService.updateOrderSubscription(data)
        this.dialogRef.close()
        return of(data)
      })
    )
   return method$;
  }

  setPaymentValues(payment: IPOSPayment, data: IOnApproveCallbackData) {
    payment.account = data.payerID;
    payment.processData = data.orderID;
    payment.transactionData = JSON.stringify(data);
    return payment;
  }

  completeAuth(payPal: IClientAuthorizeCallbackData) {
    // console.log("completAuth", payPal)
    const site =  this.siteService.getAssignedSite();

    return this.paymentMethodService.getPaymentMethodByName(site, 'PayPal').pipe(
      switchMap(data => {
          this.payment.paymentMethodID = data.id;
          const payment = this.setAuthValues(this.payment, payPal)
          return this.paymentService.makePayment(site, this.payment, this.order, +this.amount, data)
        })
      ).pipe(
      switchMap(data => {
        // console.log('payment', data)
        return this.orderService.completeOrder(site, this.payment.orderID);
      })
      ).pipe(
      switchMap(data => {
        this.orderMethodsService.updateOrderSubscription(data)
        this.dialogRef.close()
        return of(data)
      })
    )

  }

  setAuthValues(payment: IPOSPayment, auth: IClientAuthorizeCallbackData) {
    // create_time: string;
    // update_time: string;
    // id: string;
    // intent: OrderIntent;
    // payer: IPayer;
    // status: OrderStatus;
    // links: ILinkDescription[];
    // purchase_units: IPurchaseUnit[];

    payment.tranType = auth.status;
    payment.trancode = auth.intent;
    payment.processData = auth.id;
    payment.amountPaid = +this.amount;
    payment.amountReceived = +this.amount;
    payment.approvalCode   = auth.status;
    payment.entryMethod    = 'Online';
    payment.respcode       = auth.intent;
    payment.refNumber      = auth.id;

    if (auth.payer.email_address) {
      payment.account        =  auth.payer.email_address.substring(0,24);
    }
    payment.transactionData = JSON.stringify(auth);
    return payment;
  }


  private initConfig(): void {
    // console.log('process sale')
    this.payPalConfig = {
        currency: this.currencyCode,
        clientId: this.clientID,
        createOrderOnClient: (data) => < ICreateOrderRequest > {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: this.currencyCode,
                    value: this.amount,
                    breakdown: {
                        item_total: {
                            currency_code: this.currencyCode,
                            value: this.amount
                        }
                    }
                },
                items: [{
                    name: 'Product',
                    quantity: '1',
                    category: 'PHYSICAL_GOODS',
                    unit_amount: {
                        currency_code: this.currencyCode,
                        value: this.amount,
                    },
                }]
            }]
        },
        advanced: {
            commit: 'true'
        },
        style: {
            label: 'paypal',
            layout: 'vertical'
        },
        onApprove: (data, actions) => {
            // console.log('onApprove - transaction was approved, but not authorized', data, actions);
            this.sale$ =  this.completeSale(data)
            actions.order.get().then(details => {
                // console.log('onApprove - you can get full order details inside onApprove: ', details);
            });

        },
        onClientAuthorization: (data) => {
            // console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
            this.showSuccess = true;
            this.sale$ = this.completeAuth(data)
        },
        onCancel: (data, actions) => {
            // console.log('OnCancel', data, actions);
            this.showCancel = true;

        },
        onError: err => {
            // console.log('OnError', err);
            this.showError = true;
        },
        onClick: (data, actions) => {
            // console.log('onClick', data, actions);
            this.resetStatus();
        }
    };
  }


}
