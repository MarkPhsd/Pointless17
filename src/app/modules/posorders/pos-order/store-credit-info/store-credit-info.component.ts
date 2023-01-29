import { AfterViewInit,  Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentMethod } from '@stripe/stripe-js';
import { Observable, of, Subscription, switchMap,catchError } from 'rxjs';
import { UITransactionsComponent } from 'src/app/modules/admin/settings/software/UISettings/uitransactions/uitransactions.component';
import { IPOSOrder, IPOSPayment, IPurchaseOrderItem, PosOrderItem } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IStoreCreditSearchModel, StoreCredit, StoreCreditMethodsService, StoreCreditResultsPaged } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrdersService } from 'src/app/_services/transactions/orders.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'store-credit-info',
  templateUrl: './store-credit-info.component.html',
  styleUrls: ['./store-credit-info.component.scss'],
})

export class StoreCreditInfoComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() clientID     : number;
  @Input() accountNumber: string;
  @Input() userName     : string;
  @Input() showBalance  = true ;
  @Input() showPayment  = true ;
  @Input() order        : IPOSOrder;
  @Output() closeDialog = new EventEmitter();
  @Output() issueToStoreCredit = new EventEmitter();
  action$ : Observable<any>
  @Input()  searchModel: IStoreCreditSearchModel
  storeCreditValue: any;
  @Input() search     : any;
  _search             : Subscription;
  _order              : Subscription;
  _issueItem          : Subscription;
  @Input()  showIssueMoney      : boolean;
  posIssueItem        : PosOrderItem;
  _posIssuePurchaseItem: Subscription;
  posIssuePurchaseItem : IPurchaseOrderItem;
  storeCreditSearch$ : Observable<any>

  uiTransaction  : TransactionUISettings;
  uiTransaction$ : Observable<TransactionUISettings>;
  getUITransactionsSettings() {
    this.uiTransaction$ = this.settingsService.getUITransactionSetting().pipe(
      switchMap( data => {
        this.uiTransaction = data;
        return of(data)
      })
    )
  }

  initSubscription(){
    try {
      this._search       = this.storeCreditMethodService.searchModel$.subscribe(data => {
        this.search      = data;
        // console.log('data store credit', data)
        if (!data) {
          this.search              = null;
          this.storeCreditSearch$  = null;
        }
        this.clientID = this.order?.clientID
        // console.log('set observable 1 from store credit', this.clientID, this.order?.clientID)
        // console.log('this.storeCreditValue', this.storeCreditValue)
        if ((this.clientID != this.order?.clientID) || !this.storeCreditValue)  {
          this.setObservable(data)
        } else {
          this.setObservable(null)
        }

      })
    } catch (error) {

    }

    try {
      this._posIssuePurchaseItem = this.orderMethodService.posIssuePurchaseItem$.subscribe(data => {
        if (!data) {
          this.posIssuePurchaseItem = null;
        }
        if (data) {
          this.showIssueMoney = true;
          this.posIssuePurchaseItem = data;
        }
      })
    } catch (error) {

    }

    try {
      this._order = this.orderService.currentOrder$.subscribe( data => {
        if (!data) {
          this.order = null;
          this.clientID = 0; //this.order.clientID
          this.storeCreditMethodService.updateSearchModel(this.search)
        }
        if (data) {
          this.order = data
          this.clientID = this.order.clientID; //this.order.clientID
          // if (this.clientID != this.order.clientID) {
            // console.log('update search model from store credit')
            this.storeCreditMethodService.updateSearchModel(this.search)
          // }
        }
      })
    } catch (error) {

    }
  }

  constructor(

    private storeCreditService       : StoreCreditService,
    private orderService   :           OrdersService,
    private settingsService          : SettingsService,
    private siteService              : SitesService,
    private paymentService           : POSPaymentService,
    private paymentMethodService     : PaymentMethodsService,
    private orderMethodService       : OrderMethodsService,
    private storeCreditMethodService : StoreCreditMethodsService,
    private matSnack    : MatSnackBar,
    private dialogRef: MatDialogRef<StoreCreditInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {
    // console.log('search Model', this.searchModel)
    // console.log('ngOnInit with search', this.search)
  }

  ngOnInit(): void {
    const i = 0;
    this.uiTransaction$
    // this.setObservable(this.search);
    this.initSubscription()

    if (this.clientID && this.clientID != 0) {
      const search = {} as IStoreCreditSearchModel;
      search.clientID = this.clientID;
      console.log('set observable 0 from store credit')
      this.setObservable(search);
      this.initSubscription()
      return
    }


  }

  ngOnDestroy(): void {
    if (this._search) {
      this.storeCreditMethodService.updateSearchModel(null)
      this._search.unsubscribe()
    }
  }

  ngAfterViewInit(): void {
    const i = 0;
  }

  applyStoreCreditObs(site, search) {
    return this.storeCreditService.search(site, search).pipe(
      switchMap(data =>  {
          this.storeCreditValue = data;
          return of(data)
        }
      )
    )
  }

  setObservable(search: IStoreCreditSearchModel ){
    if (search) {
      const site = this.siteService.getAssignedSite();
      this.searchModel = search;
      this.storeCreditSearch$ = this.applyStoreCreditObs(site, search)
      return
    }

    const searchModel = {} as IStoreCreditSearchModel;
    if (this.order && this.order.clientID && this.order.clientID !=0 ) {
      const site = this.siteService.getAssignedSite();
      searchModel.clientID = this.clientID;
      this.searchModel = search;
      this.storeCreditSearch$ = this.applyStoreCreditObs(site, searchModel)
      return
    };

    if (this.clientID && this.clientID !=0 ) {
      const site = this.siteService.getAssignedSite();
      searchModel.clientID = this.clientID;
      this.storeCreditSearch$ = this.applyStoreCreditObs(site, searchModel)
      this.searchModel = search;
      console.log('search Model 3', search)
      return
    };

    this.search = null;
    this.searchModel = null;
    this.storeCreditSearch$ = null;
  }

  issueMoney(credit: StoreCredit) {
    if (!credit) { credit = {} as StoreCredit }

    if (credit) {
      if (this.order) {
        credit.orderID = this.order.id;
      }
      if (!credit.value) { credit.value = 0}

      if (!this.posIssuePurchaseItem  ) {
        this.storeCreditMethodService.notifyEvent('No item associated', 'Alert')
        return;
      }
      const site = this.siteService.getAssignedSite();
      if (this.posIssuePurchaseItem  ) {
        credit.value = this.posIssuePurchaseItem .unitPrice + credit.value
        credit.cardData = this.searchModel.cardNumber;
        credit.cardNum =  this.searchModel.cardNumber;
        this.storeCreditMethodService.updateStoreCredit(credit)

        // this.storeCreditMethodService.updateSearchModel(this.searchModel)
        const item$ = this.storeCreditMethodService.issueToStoreCredit(this.order, credit, this.posIssuePurchaseItem.id)
        this.action$ =  item$.pipe(
          switchMap(data => {
            this.storeCreditMethodService.notifyEvent('Card Issued', 'Alert')
            this.showIssueMoney = false;
            this.closeDialog.emit(true)
            this.posIssuePurchaseItem.gcid = data.id.toString();
            this.orderMethodService.updatePOSIssuePurchaseItem(this.posIssuePurchaseItem);
            return of(data)
          }
        )).pipe(switchMap(data => {
          return this.orderService.getOrder(site, this.order.id.toString(), false)
        })).pipe(switchMap( data => {
          this.orderService.updateOrderSubscription(data)
          return of(data)
        }))
      }
    }
  }

  applyAsPayment(credit: StoreCredit) {
    //get order total
    //check balance of storeCredit
    const site = this.siteService.getAssignedSite();
    const order = this.order;
    if (this.order && credit) {
      let type = 'store credit'
      if (credit.type == 1 ) { type = 'gift card' }

      const creditAmount = this.getCreditAmountToApply(credit.value, order.balanceRemaining)
      if (creditAmount >0) {
        //get payment method of the store credit if
        // payment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod
        const payment = {} as IPOSPayment;
        const paymentMethod$ = this.paymentMethodService.getPaymentMethodByName(site, type)

        this.action$ = paymentMethod$.pipe(
          switchMap( paymentMethod => {
            if (!paymentMethod) {
              const paymentMethod = { name: 'Store Credit', companyCredit: true} as IPaymentMethod
              this.action$ =   this.paymentMethodService.saveItem(site, paymentMethod);
              this.matSnack.open('Store Credit payment not configured. Please setup store credit and gift card payments.')
              return of(null)
            }
            payment.giftCardID = credit.id;
            return this.paymentService.makePayment(site, payment, order, creditAmount, paymentMethod);
          }),
          catchError((e) => {
            // handle e and return a safe value or re-throw
            const paymentMethod = { name: 'Store Credit', companyCredit: true} as IPaymentMethod
            this.action$ =   this.paymentMethodService.saveItem(site, paymentMethod);
            this.matSnack.open('Store Credit payment not configured. Please try again and if it does not work, please setup store credit and gift card payments.')
            return of(null)
         })
        ).pipe(
          switchMap( data => {
            if (data && data.paymentSuccess) {
              credit.value = credit.value - creditAmount;
              this.order = data.order
              return this.storeCreditService.putStoreCredit(site, credit.id, credit);
            }
            if (!data || !data.paymentSuccess) {
              this.orderMethodService.notifyEvent(`Payment to apply ${data.responseMessage}`, 'Failed')
              return of(null)
            }
          }
          ),
            catchError((e) => {
              this.matSnack.open('Make Payment failed: ' + e.toString(), 'Alert')
              return of(null)
          })
        ).pipe(
          switchMap(data => {
            // this.storeCreditMethodService.updateSearchModel(null)
            // this.initSearches();
            this.orderService.updateOrderSubscriptionLoginAction(this.order);
            this.closeDialog.emit(true)
            return of(data)
          }),
          catchError((e) => {
            this.matSnack.open('Update store credit failed: ' + e.toString(), 'Alert')
            return of(null)
          })
        )
      }
    }
  }

  initSearches() {
    this.search = null;
    this.searchModel = null;
    this.clientID = 0;
    this.accountNumber = null;
    this.storeCreditSearch$ = null;
    this.storeCreditMethodService.updateStoreCredit(null)
    this.storeCreditMethodService.updateSearchModel(null);
  }

  getCreditAmountToApply(value: number, balance: number) {
    if (value >= balance) {  return balance }
    if (balance > value) {
      return value;
    }
    return 0;
  }

  cancel(item: IPurchaseOrderItem) {
    if (item) {
      this.orderMethodService.cancelItem(item.id, false)
      this.closeDialog.emit(true)
    }
    if (!item) {
      this.closeDialog.emit(true)
    }
    this.dialogRef.close()
  }

  identify(index, item) {
    return item.id;
 }
}
