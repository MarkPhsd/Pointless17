import { Component, OnInit,OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-order-price-schedule-info',
  templateUrl: './pos-order-price-schedule-info.component.html',
  styleUrls: ['./pos-order-price-schedule-info.component.scss']
})
export class PosOrderPriceScheduleInfoComponent implements OnInit,OnChanges {
  //subscribe to the current order

  //get the unique scheduleID's from the order ITems

  //get each subscription. - the json object saved?
  _order : Subscription;
  order  : IPOSOrder;

  schedules     : any[];
  expanded      : boolean;
  showSchedules = false;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(order => {
      this.order = order;
      this.processOrder(order);
    })
  }
  constructor(private ordermethodsService: OrderMethodsService,
              private orderService            : OrdersService,
    ) { }

  ngOnInit(): void {
    this.initSubscriptions();
    const i = 0;
  }

  expand() { 
    this.expanded = !this.expanded
    this.showSchedules = !this.showSchedules;
  }
  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // this.processOrder(this.order)
    const i = 0;
  }

  processOrder(order:IPOSOrder) {
    if (!order) { return };
    const items = order.posOrderItems;

    const scheduleAry = []
    items.forEach(data => {
      scheduleAry.push(data.scheduleID)
    })
    if (!scheduleAry) { return }

    const schedules = [... new Set(scheduleAry)]
    if (!schedules || schedules[0] == null) {
      this.schedules = null;
      return
    }

    this.schedules = schedules

  }


}
