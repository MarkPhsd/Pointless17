import { Injectable } from '@angular/core';
import { ToolBarUIService } from './tool-bar-ui.service';
import { OrdersService } from '../transactions/orders.service';
import { POSPaymentService } from '../transactions/pospayment.service';
import { BehaviorSubject } from 'rxjs';
import { OrderMethodsService } from '../transactions/order-methods.service';
@Injectable({
  providedIn: 'root'
})
export class SystemManagerService {

  //behavior subject
  //observable
  private  _accordionMenu       = new BehaviorSubject<number>(null);
  public   accordionMenu$       = this._accordionMenu.asObservable();

  constructor(
        public orderMethodsService: OrderMethodsService,
        private paymentService: POSPaymentService,
  ) { }

    updateAccordionStep(number) {
      this._accordionMenu.next(number)
    }

    unSubscribeEverything() {
      // this.toolbarUI.updateOrderBar(false);
      this.orderMethodsService.updateOrderSubscription(null)
      this.orderMethodsService.updateOrderSearchModel(null)
      this.paymentService.updatePaymentSubscription(null)

    }

}



