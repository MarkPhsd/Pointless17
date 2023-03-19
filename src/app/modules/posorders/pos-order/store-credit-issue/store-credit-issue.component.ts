import { Component,Output,OnInit,
  Inject,
  ViewChild,
  TemplateRef,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { OrdersService } from 'src/app/_services';
import { Subscription, Observable, switchMap, of } from 'rxjs';
import { IPOSOrder, IPurchaseOrderItem, PosOrderItem,  } from 'src/app/_interfaces';
import { IStoreCreditSearchModel, StoreCredit, StoreCreditMethodsService, StoreCreditResultsPaged } from 'src/app/_services/storecredit/store-credit-methods.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { values } from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-store-credit-issue',
  templateUrl: './store-credit-issue.component.html',
  styleUrls: ['./store-credit-issue.component.scss']
})
export class StoreCreditIssueComponent implements OnInit, OnDestroy {

  action$: Observable<any>;
  @ViewChild('keyValueView')             keyValueView: TemplateRef<any>;
  @ViewChild('storeCreditInfoView')      storeCreditInfoView: TemplateRef<any>;

  toggleKeyValue: boolean;

  @Output() closeDialog = new EventEmitter();
  @ViewChild('storeCreditItems') storeCreditItems: TemplateRef<any>;
	@ViewChild('noItems')          noItems         : TemplateRef<any>;
  currentTemplate     : TemplateRef<any>;
  _order              : Subscription;
  order               : IPOSOrder;
  cardNum: string;
  credit : StoreCredit;

  storeCreditSearch$  : Observable<StoreCreditResultsPaged>
  storeCreditSearch   : StoreCreditResultsPaged;
  searchModel         : IStoreCreditSearchModel;
  _search             : Subscription;
  _issueItem          : Subscription;
  posIssueItem        : PosOrderItem;
  purchaseOrderItem  : IPurchaseOrderItem;
  inputForm           : FormGroup;
  keyInstruction = 'Enter Value';

  get currentView() {
    if (this.toggleKeyValue) {
      return this.keyValueView;
    }
    return this.storeCreditInfoView;
  }

  initSubscriptions() {
    try {
      this._search = this.storeCreditMethodService.searchModel$.subscribe(data => {
        this.searchModel = data
      })
    } catch (error) {
    }

    try {
      this._order = this.orderService.currentOrder$.subscribe( data => {
        this.order = data
      })
    } catch (error) {
    }

    try {
      this._issueItem = this.orderMethodService.posIssueItem$.subscribe(data => {
        if (!data) {
      }
        if (data) {
          this.posIssueItem = data;
          this.initCredit()
          this.credit
        }
      })
    } catch (error) {
    }

    try {
      this._issueItem = this.orderMethodService.posIssuePurchaseItem$.subscribe(data => {
        if (!data) {
        }
        if (data) {
          this.purchaseOrderItem = data;
          this.initCredit()
        }
      })
    } catch (error) {
    }
  }

  initCredit() {
    let credit = {} as StoreCredit;
    if (this.purchaseOrderItem)  {
      if (credit) {
        credit.accountNumber = this.cardNum;
        credit.value = this.purchaseOrderItem.unitPrice
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private orderMethodService       : OrderMethodsService,
    private storeCreditMethodService : StoreCreditMethodsService,
    private orderService             : OrdersService,
    private posOrderItemService      : POSOrderItemServiceService,
    private siteService              : SitesService,
    private dialogRef                : MatDialogRef<StoreCreditIssueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {   this.currentTemplate = this.noItems  }

  ngOnInit() {
    this.currentTemplate = this.noItems
    this.initSubscriptions()
  }

  initForm() {
    this.inputForm = this.fb.group({
      itemName: [],
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._issueItem) { this._issueItem.unsubscribe()}
    if (this._order)     { this._order.unsubscribe() }
    if (this._search)    { this._search.unsubscribe() }
  }

  onCancel(event) {
    this.dialogRef.close()
  }

  setResults(event) {
    if (event) {
      const cardNum = event?.cardNum
      this.cardNum = event?.cardNum;
      const credit  =  this.initStoreCreditItem(null, cardNum)
      this.storeCreditMethodService.updateSearchModel(event)
    }
  }

  initStoreCreditItem(credit: StoreCredit, cardNum: string){
    if (!credit) {
      credit = {} as StoreCredit
      credit.orderID = this.order.id;
      if (this.order.clientID) {
        credit.clientID= this.order?.clientID;
      }
      if (cardNum) {
        credit.cardNum = cardNum
      }
      credit.type = 1;
    }

    if (!this.posIssueItem) {
      console.log('no pos issue item')
    }

    if (!this.purchaseOrderItem) {
      console.log('no purchaseOrderItem item')
    }

    if (this.posIssueItem) {
      if (!credit.value) {
        credit.value   =  this.posIssueItem.unitPrice;
      } else {
        credit.value   = credit.value + this.posIssueItem.unitPrice;
      }
    }

    if (this.purchaseOrderItem) {
      if (!credit.value) {
        credit.value   =  this.purchaseOrderItem.unitPrice;
      } else {
        credit.value   = credit.value + this.purchaseOrderItem.unitPrice;
      }
      console.log('purchaseOrderItem', credit.value)
    }

    console.log('initStoreCreditItem', credit)
    return credit
  }

  applyChange(amount) {
    console.log('amount', amount)
    let item
    if (this.posIssueItem) {
      item = this.posIssueItem;
    }
    if (this.purchaseOrderItem) {
      item = this.purchaseOrderItem
    }

    if (!item || !amount) { return };

    item.unitPrice = amount;
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.posOrderItemService.changeItemPrice(site, item).pipe(
      switchMap( data => {
        if (data) {
          if (data.resultMessage) {this.siteService.notify(data.resultMessage, 'Alert', 1500, 'red')}
        }
        this.orderService.updateOrderSubscription(data)
        this.toggleKeyValue = false
        return of(data)
      })
    );
  }

}

