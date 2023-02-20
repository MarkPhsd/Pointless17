import { Component, OnDestroy, OnInit,Output , EventEmitter } from '@angular/core';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'pos-split-groups',
  templateUrl: './pos-split-groups.component.html',
  styleUrls: ['./pos-split-groups.component.scss']
})
export class PosSplitGroupsComponent implements OnInit , OnDestroy{
  @Output() outPutPaymentAmount = new EventEmitter();
  order: IPOSOrder;
  _order: Subscription;
  orderGroupTotal$: Observable<IPOSOrder>[];

  values = [0,1,2,3,4,5,6,7,8,9]
  constructor(public orderService: OrdersService,private siteService: SitesService  ) { }

  ngOnInit(): void {
    const i = 0;
    this._order = this.orderService.currentOrder$.subscribe(data => {
      this.order = data;
      this.getListOf();
    })
  }

  getListOf() {
    const site = this.siteService.getAssignedSite()
    if (!this.orderGroupTotal$) { this.orderGroupTotal$ = [] as Observable<IPOSOrder>[] }
    this.values.forEach(data => {
      // console.log('loaded', data, this.order.id)
      this.orderGroupTotal$.push(this.setGroupOrderTotal(site, this.order.id, data))
    })
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
    console.log('event in split group from receipt', event)
    this.outPutPaymentAmount.emit(event)
  }

  setGroupOrderTotal(site, orderID, groupID) {
    return this.orderService.getPOSOrderGroupTotal(site, orderID, groupID).pipe(
      switchMap(data => {
        // this.groupTotal = data.total;
        return of(data)
      })
    )
  }


}
