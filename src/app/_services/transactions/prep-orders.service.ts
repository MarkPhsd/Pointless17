import { Injectable } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';

@Injectable({
  providedIn: 'root'
})
export class PrepOrdersService {

  constructor() { }

  getTimeOpen(orderTime: string) {
    return 0
  }

  completItems(orderID: number) {

  }

  completionItem(item: IPOSOrderItem) {

  }

  reDoItem(item: IPOSOrderItem) {

  }

  notifyCustomerOrderPrepared(order: IPOSOrder) {

  }

  notifyCustomerItemOutofStock(item: IPOSOrderItem, order: IPOSOrder) {

  }

}
