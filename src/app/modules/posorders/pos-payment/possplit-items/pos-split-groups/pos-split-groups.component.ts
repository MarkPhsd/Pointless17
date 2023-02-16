import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';

@Component({
  selector: 'pos-split-groups',
  templateUrl: './pos-split-groups.component.html',
  styleUrls: ['./pos-split-groups.component.scss']
})
export class PosSplitGroupsComponent implements OnInit , OnDestroy{

  order: IPOSOrder;
  _order: Subscription;

  constructor(public orderService: OrdersService  ) { }

  ngOnInit(): void {
    const i = 0;
    this._order = this.orderService.currentOrder$.subscribe(data => {
      // console.log('split groups updated')
      this.order = data;
    })
  }

  ngOnDestroy() {
    if (this._order) {
      this._order.unsubscribe()
    }
  }

}
