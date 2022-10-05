import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment, IPurchaseOrderItem, PosOrderItem } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IStoreCreditSearchModel, StoreCredit, StoreCreditMethodsService, StoreCreditResultsPaged } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrdersService } from 'src/app/_services/transactions/orders.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'store-credit-info',
  templateUrl: './store-credit-info.component.html',
  styleUrls: ['./store-credit-info.component.scss'],
})

export class StoreCreditInfoComponent implements OnInit,AfterViewInit,OnDestroy {

  @Input() clientID     : number;
  @Input() accountNumber: string;
  @Input() userName     : string;
  @Input() showPayment  : boolean;
  @Input() order        : IPOSOrder;
  @Output() closeDialog = new EventEmitter();
  @Output() issueToStoreCredit = new EventEmitter();

  searchModel: IStoreCreditSearchModel

  search              : IStoreCreditSearchModel
  _search             : Subscription;
  _order              : Subscription;
  _issueItem          : Subscription;
  showIssueMoney      : boolean;
  posIssueItem        : PosOrderItem;
  _posIssuePurchaseItem: Subscription;
  posIssuePurchaseItem : IPurchaseOrderItem;

  storeCreditSearch$ : Observable<StoreCreditResultsPaged>

  initSubscription(){

    try {
      this._search       = this.storeCreditMethodService.searchModel$.subscribe(data => {
        this.search      = data;
        this.showPayment = true;
        if (!data) {
          this.showPayment         = false;
          this.search              = null;
          this.storeCreditSearch$  = null;
        }
        this.setObservable(data)
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
        }
        if (data) {

          this.order = data
        }
      })
    } catch (error) {

    }


  }

  constructor(
    private storeCreditService       : StoreCreditService,
    private orderService   :          OrdersService,
    private siteService              : SitesService,
    private paymentService           : POSPaymentService,
    private paymentMethodService     : PaymentMethodsService,
    private orderMethodService       : OrderMethodsService,
    private storeCreditMethodService : StoreCreditMethodsService,

  ) { }

  ngOnInit(): void {

    const i = 0;

    if (this.clientID) {
      const search = {} as IStoreCreditSearchModel;
      search.clientID = this.clientID;
      this.setObservable(search);
      this.initSubscription()
      return
    }

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._search) {
      this.storeCreditMethodService.updateSearchModel(null)
      this._search.unsubscribe()
    }
  }

  ngAfterViewInit(): void {
    // this.setObservable()
    const i = 0;
    // console.log(storeCreditSearch)
  }

  setObservable(search: IStoreCreditSearchModel ){
    // console.log('search',search)
    if (search) {
      const site = this.siteService.getAssignedSite();
      this.searchModel = search;
      this.storeCreditSearch$ = this.storeCreditService.search(site, search)
      return
    }

    const searchModel = {} as IStoreCreditSearchModel
    if (this.order && this.order.clientID && this.order.clientID !=0 ) {
      const site = this.siteService.getAssignedSite();
      searchModel.clientID = this.clientID;
      this.searchModel = search;
      this.storeCreditSearch$ = this.storeCreditService.search(site, searchModel)
      return
    };

    if (this.clientID && this.clientID !=0 ) {
      const site = this.siteService.getAssignedSite();
      searchModel.clientID = this.clientID;
      this.storeCreditSearch$ = this.storeCreditService.search(site, searchModel)
      this.searchModel = search;
      return
    };
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

      if (this.posIssuePurchaseItem  ) {
        credit.value = this.posIssuePurchaseItem .unitPrice + credit.value
        credit.cardData = this.searchModel.cardNumber;
        credit.cardNum =  this.searchModel.cardNumber;
        this.storeCreditMethodService.updateStoreCredit(credit)

        // this.storeCreditMethodService.updateSearchModel(this.searchModel)
        const item$ = this.storeCreditMethodService.issueToStoreCredit(this.order, credit, this.posIssuePurchaseItem .id)
        item$.subscribe(data => {
          //hide issue button
          this.storeCreditMethodService.notifyEvent('Card Issued', 'Alert')
          this.showIssueMoney = false;
          this.closeDialog.emit(true)
          this.posIssuePurchaseItem.gcid = data.id.toString();
          this.orderMethodService.updatePOSIssuePurchaseItem(this.posIssuePurchaseItem);

        })
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
        const paymentMethod$ = this.paymentMethodService.getPaymentMethodByName(site,type)

        paymentMethod$.pipe(
          switchMap( paymentMethod => {
            payment.giftCardID = credit.id;
            return this.paymentService.makePayment(site, payment, order, creditAmount, paymentMethod);
          })
        ).pipe(
          switchMap( data => {
            if (data.paymentSuccess) {
              this.orderService.updateOrderSubscription(data.order)
              credit.value = credit.value - creditAmount;
              return this.storeCreditService.putStoreCredit(site, credit.id, credit)
            }
            if (!data.paymentSuccess) {
              this.orderMethodService.notifyEvent(`Payment to apply ${data.responseMessage}`, 'Failed')
            }
          }
        )).subscribe( data => {
          console.log('emitting close')
          // this.setObservable(this.searchModel);
          this.storeCreditMethodService.updateSearchModel(this.search)
          this.closeDialog.emit(true)
        })
      }
    }
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
  }
}
