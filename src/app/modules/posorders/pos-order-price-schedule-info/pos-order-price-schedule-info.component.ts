import { Component, OnInit,OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PosOrderScheduleDescriptionComponent } from './pos-order-schedule-description/pos-order-schedule-description.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'pos-order-price-schedule-info',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    PosOrderScheduleDescriptionComponent,
  ],
  templateUrl: './pos-order-price-schedule-info.component.html',
  styleUrls: ['./pos-order-price-schedule-info.component.scss']
})
export class PosOrderPriceScheduleInfoComponent implements OnInit,OnChanges,OnDestroy {
  //subscribe to the current order
  //get the unique scheduleID's from the order ITems
  //get each subscription. - the json object saved?
  _order : Subscription;
  order  : IPOSOrder;

  schedules     : any[];
  expanded      : boolean;
  showSchedules = false;

  initSubscriptions() {
    this._order = this.ordermethodsService.currentOrder$.subscribe(order => {
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

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) { this._order.unsubscribe()}
  }

  expand() {
    this.expanded      = !this.expanded
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
    if (items) {
      items.forEach(data => {
        scheduleAry.push(data.scheduleID)
      })
    }

    if (!scheduleAry) { return }

    const schedules = [... new Set(scheduleAry)]
    if (!schedules || schedules[0] == null) {
      this.schedules = null;
      return
    }

    if (schedules[0] == 0) {
      this.schedules = null;
      return;
    }

    this.schedules = schedules

  }


}
