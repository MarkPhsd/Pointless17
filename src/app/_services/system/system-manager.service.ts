import { Injectable } from '@angular/core';
import { ToolBarUIService } from './tool-bar-ui.service';
import { OrdersService } from '../transactions/orders.service';
import { POSPaymentService } from '../transactions/pospayment.service';
@Injectable({
  providedIn: 'root'
})
export class SystemManagerService {

  constructor(
        private toolbarUI: ToolBarUIService,
        private orderService: OrdersService,
        private paymentService: POSPaymentService,
  ) { }

    // //

    unSubscribeEverything() {
      // this.toolbarUI.updateOrderBar(false);
      this.orderService.updateOrderSubscription(null)
      this.orderService.updateOrderSearchModel(null)
      this.paymentService.updatePaymentSubscription(null)

    }

}



