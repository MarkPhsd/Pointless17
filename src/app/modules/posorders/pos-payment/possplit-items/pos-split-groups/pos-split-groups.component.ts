import { Component, OnDestroy, OnInit,Output , EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { concatMap, Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-split-groups',
  templateUrl: './pos-split-groups.component.html',
  styleUrls: ['./pos-split-groups.component.scss']
})
export class PosSplitGroupsComponent implements OnInit , OnDestroy{

  @Output() outPutPaymentAmount = new EventEmitter();
  @Input() order: IPOSOrder;
  _order: Subscription;
  orderGroupTotal$: Observable<IPOSOrder>[];

  values = [];

  constructor(public  orderMethodsService: OrderMethodsService,
              private orderService: OrdersService,
              private cd : ChangeDetectorRef,
              private siteService: SitesService  ) { }

  ngOnInit(): void {
    const i = 0;
    this.refresh()
  }

  refresh() {
    this._order =  this.orderMethodsService.currentOrder$.subscribe(data => {
      if (!data) {
        this.order  = null;
        this.values = null;
        return
      }
      this.order = null
      this.cd.detectChanges();
      this.order  = data;
      this.values = this.getUniqueSplitGroupIDs(this.order)
      this.getListOf();
    })
  }

  updateOrder() {
    this.order = null
    this.cd.detectChanges();
    this.orderMethodsService.updateOrder(this.orderMethodsService.currentOrder)
  }
  _refresh() {
    // console.log('_refresh')
    this.values = this.getUniqueSplitGroupIDs(this.order)
    this.getListOf();
  }

  getSplitOrderTotal(groupID: number) {
    let order =  this.order;
    let groupTotal = 0;
    let total = {total: 0, groupID: groupID}
    order.posOrderItems.forEach(data => {
        if (data.splitGroupID == groupID) {
          groupTotal += +data.total +
                        // +data.taxTotal +
                        +data.gratuity +
                        +data?.itemCashDiscount +
                        +data.itemOrderCashDiscount +
                        +data.itemLoyaltyPointDiscount +
                        +data.itemOrderPercentageDiscount +
                        +data?.itemPercentageDiscountValue }
    })

    total = {total: groupTotal, groupID: groupID}
    return of(total)
  }

  getSplitOrderTotalItems(groupID: number) {
    let order =  this.order;
    let groupTotal = 0;
    let total = {total: 0, groupID: groupID}
    order.posOrderItems.filter(data => {
        if (data.splitGroupID == groupID) {
          return data
        }
    })

    total = {total: groupTotal, groupID: groupID}
    return of(total)
  }

  getListOf() {
    const site = this.siteService.getAssignedSite()
    if (this.order) {
      if (!this.orderGroupTotal$) { this.orderGroupTotal$ = [] as Observable<IPOSOrder>[] }
      // if (this.isSplit) { return }
      this.values.forEach(groupID => {
        this.orderGroupTotal$.push(this.setGroupOrderTotal(site, this.order.id,  +groupID));
      })
    }
  }

  setGroupOrderTotal(site, orderID: number, groupID: number) {
    return this.orderService.getPOSOrderGroupTotal(site, orderID, groupID).pipe(
     concatMap(data => {
      //  console.log('setGroupOrderTotal', groupID, data.total, data?.posOrderItems.length)

       return of(data)
     })
    )
  }
  get isSplit() {
    if (this.order.productOrderRef == this.order.id || this.order.productOrderRef == 0) {
      return false
    }
    return true
  }

  getUniqueSplitGroupIDs(order: IPOSOrder): number[] {
    const uniqueIDs = new Set<number>();
    for (const item of order.posOrderItems) {
        uniqueIDs.add(+item.splitGroupID);
    }
    const list =  Array.from(uniqueIDs).sort();

    return list

  }

  ngOnDestroy() {
    if (this._order) {
      this._order.unsubscribe()
    }
  }

  isGreaterThanZero(posOrderItems : PosOrderItem[],value): boolean {
    const items = posOrderItems.filter(data => {
      return data.splitGroupID == value
    })
    if (items.length>0) { return true }
    return false;
  }

  submitPaymentAmount(value, orderTotal: number) {
    this.outPutPaymentAmount.emit({amount: orderTotal, groupID: value})
  }

  makePayment(event) {
    this.outPutPaymentAmount.emit(event)
  }




}
