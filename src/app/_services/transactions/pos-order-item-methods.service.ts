import { Injectable } from '@angular/core';
import { OrdersService } from './orders.service';
import { POSOrderItemService } from './posorder-item-service.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { SitesService } from '../reporting/sites.service';
import { Observable, of, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PosOrderItemMethodsService {

  constructor(private orderService: OrdersService,
              private siteService: SitesService,
              private posOrderItemService: POSOrderItemService) {
        }

  saveSub(item: PosOrderItem, editField: string): Observable<IPOSOrder> {
    const site = this.siteService.getAssignedSite();
    let obs$: Observable<IPOSOrder>;

    if (item && site) {

      if (editField == 'quantity') {
        const site = this.siteService.getAssignedSite();
        obs$ = this.posOrderItemService.changeItemQuantity(site, item ).pipe(switchMap( data => {
          this.orderService.updateOrderSubscription(data)
          return of(data)
        }))
      }

      if (editField == 'price' || editField == 'unitPrice') {
        if (item) {
          obs$ = this.posOrderItemService.changeItemPrice(site, item).pipe(switchMap( data => {
            if (data) {
              if (data.resultMessage) {
                this.siteService.notify(data.resultMessage, 'Alert', 1500)
              }
            }
            this.orderService.updateOrderSubscription(data)
            return of(data)
          }))
        }
      }

      if (editField == 'subTotal' || editField == 'total') {
        if (item) {
          obs$ = this.posOrderItemService.changeItemSubTotal(site, item).pipe(switchMap( data => {
            if (data) {
              if (data.resultMessage) {
                this.siteService.notify(data.resultMessage, 'Alert', 1500)
              }
            }
            this.orderService.updateOrderSubscription(data)
            return of(data)
          }))
        }
      }

      if (editField == 'wholeSale') {
        if (item) {
          obs$ = this.posOrderItemService.changeItemCost(site, item).pipe(switchMap( data => {
            if (data) {
              if (data.resultMessage) {
                this.siteService.notify(data.resultMessage, 'Alert', 1500)
              }
            }
            this.orderService.updateOrderSubscription(data)
            return of(data)
          }))
        }
      }

      if (editField == 'wholeSaleCost') {
        if (item) {
          obs$ =  this.posOrderItemService.changeItemTotalCost(site, item).pipe(switchMap( data => {
            if (data) {
              if (data.resultMessage) {
                this.siteService.notify(data.resultMessage, 'Alert', 1500)
              }
            }
            this.orderService.updateOrderSubscription(data)
            return of(data)
          }))
        }
      }

      if (editField == 'modifierNote') {
        obs$ = this.posOrderItemService.changeModifierNote(site, item ).pipe(switchMap( data => {
          this.orderService.updateOrderSubscription(data)
          return of(data)
        }))
      }
    }

    return obs$;
  }


}
