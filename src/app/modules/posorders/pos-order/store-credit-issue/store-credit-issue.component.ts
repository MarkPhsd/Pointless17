import { Component,Output,OnInit,
  Inject,
  ViewChild,
  TemplateRef,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { OrdersService } from 'src/app/_services';
import { Subscription, Observable, switchMap } from 'rxjs';
import { IPOSOrder, IPurchaseOrderItem, PosOrderItem,  } from 'src/app/_interfaces';
import { IStoreCreditSearchModel, StoreCredit, StoreCreditMethodsService, StoreCreditResultsPaged } from 'src/app/_services/storecredit/store-credit-methods.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-store-credit-issue',
  templateUrl: './store-credit-issue.component.html',
  styleUrls: ['./store-credit-issue.component.scss']
})
export class StoreCreditIssueComponent implements OnInit, OnDestroy {

  @Output() closeDialog = new EventEmitter();
  @ViewChild('storeCreditItems') storeCreditItems: TemplateRef<any>;
	@ViewChild('noItems')          noItems         : TemplateRef<any>;
  currentTemplate     : TemplateRef<any>;
  _order              : Subscription;
  order               : IPOSOrder;

  storeCreditSearch$  : Observable<StoreCreditResultsPaged>
  storeCreditSearch   : StoreCreditResultsPaged;
  searchModel         : IStoreCreditSearchModel;
  _search             : Subscription;
  _issueItem          : Subscription;
  posIssueItem        : PosOrderItem;
  purchaseOrderItem  : IPurchaseOrderItem;


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
        }
      })
    } catch (error) {
    }
  }

  constructor(
    private orderMethodService       : OrderMethodsService,
    private storeCreditMethodService : StoreCreditMethodsService,
    private orderService             : OrdersService,
    private dialogRef                : MatDialogRef<StoreCreditIssueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {   this.currentTemplate = this.noItems  }

  ngOnInit() {
    this.currentTemplate = this.noItems
    this.initSubscriptions()
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
    console.log('setResults', event)
    if (event) {
      const cardNum = event?.cardNum
      this.initStoreCreditItem(null, cardNum)
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
    if (this.purchaseOrderItem) {
      credit.value   = credit.value  + this.purchaseOrderItem.unitPrice;
    }
    return credit
  }


}

