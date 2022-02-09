import { Component, Input } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';

@Component({
  selector: 'app-order-header',
  templateUrl: './order-header.component.html',
  styleUrls: ['./order-header.component.scss']
})
export class OrderHeaderComponent  {

  @Input() order: IPOSOrder
  isOrderClaimed: boolean;

  constructor(
             private  ordersService:   OrdersService,
    ) {

    this.ordersService.currentOrder$.subscribe(data => {
      this.isOrderClaimed = this.ordersService.IsOrderClaimed
    })

  }


}
