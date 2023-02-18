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
  values = [0,1,2,3,4,5,6,7,8,9]
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
