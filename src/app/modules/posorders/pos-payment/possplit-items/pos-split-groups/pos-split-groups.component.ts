import { Component, OnDestroy, OnInit,Output , EventEmitter, Input } from '@angular/core';
import { Observable, of, Subscription, switchMap } from 'rxjs';
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

  values = []

  constructor(public orderMethodsService: OrderMethodsService,
              private orderService: OrdersService,
              private siteService: SitesService  ) { }

  ngOnInit(): void {
    const i = 0;
    this._order = this.orderMethodsService.currentOrder$.subscribe(data => {
      this.order = data;
      this.values = this.getUniqueSplitGroupIDs(this.order)
      this.getListOf();
    })
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
    return Array.from(uniqueIDs);
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

  setGroupOrderTotal(site, orderID: number, groupID: number) {
     return this.orderService.getPOSOrderGroupTotal(site, orderID, groupID).pipe(
      switchMap(data => {
        // console.log('group total', data)
        return of(data)
      })
    )
  }


}
