import { Component, OnInit,Input,OnChanges,OnDestroy, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrdersService } from 'src/app/_services';

@Component({
  selector: 'pos-order-schedule-description',
  templateUrl: './pos-order-schedule-description.component.html',
  styleUrls: ['./pos-order-schedule-description.component.scss']
})
export class PosOrderScheduleDescriptionComponent implements OnInit,OnChanges,OnDestroy {

  @Output() outPutDiscount = new EventEmitter();
  @Input()  scheduleID: number;
  schedule$: Observable<IPriceSchedule>
  schedule : IPriceSchedule;

  //get each subscription. - the json object saved?
  _order : Subscription;
  order  : IPOSOrder;

  purchasedCount = 0;
  discounted     = 0;
  site: ISite;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(order => {
      this.order = order;
      this.processItemsInSchedule(this.scheduleID, order);

    })

    const site = this.siteService.getAssignedSite();
    this.priceScheduleService.getPriceSchedule(site, this.scheduleID).subscribe( data => {
      this.schedule = data
      if (this.order) {

      }
    })
    const i = 0;

  }

  constructor( private priceScheduleService: PriceScheduleService,
               private ordermethodsService : OrderMethodsService,
               private orderService        : OrdersService,
               private siteService         : SitesService)
  { }

  ngOnInit(): void {
    const i = 0;
    this.initSubscriptions();
    const site = this.siteService.getAssignedSite();
  }

  ngOnChanges() {
    const i = 0;
  }

  ngOnDestroy(): void {
    if (this._order) { this._order.unsubscribe()}
  }

  discount(event) {
    this.outPutDiscount.emit(event)
  }

  processItemsInSchedule(id: number, order: IPOSOrder) {

    if (!order) { return }

    let items = order.posOrderItems.filter(
      data =>
       data.scheduleID                == id
    )
    items = items.filter(
      data =>
       data.isSchedule_DiscountMember  == 1
    )

    items = items.filter(
      data =>
       data.scheduleDiscount_GroupValue  == 0
    )

    let i = 0

    console.log(items)
    items.forEach(item => { i += item.quantity })

    this.purchasedCount = i
    console.log('item count',   i)
  }

}


