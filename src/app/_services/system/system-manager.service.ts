import { Injectable } from '@angular/core';
import { ToolBarUIService } from './tool-bar-ui.service';
import { OrdersService } from '../transactions/orders.service';
import { POSPaymentService } from '../transactions/pospayment.service';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SystemManagerService {

  //behavior subject
  //observable
  private  _accordionMenu       = new BehaviorSubject<number>(null);
  public   accordionMenu$       = this._accordionMenu.asObservable();

  constructor(
        private toolbarUI: ToolBarUIService,
        private orderService: OrdersService,
        private paymentService: POSPaymentService,
  ) { }

    updateAccordionStep(number) {
      this._accordionMenu.next(number)
    }

    unSubscribeEverything() {
      // this.toolbarUI.updateOrderBar(false);
      this.orderService.updateOrderSubscription(null)
      this.orderService.updateOrderSearchModel(null)
      this.paymentService.updatePaymentSubscription(null)

    }

}



