import { Injectable } from '@angular/core';
import { OrdersService } from './orders.service';
import { POSOrderItemService } from './posorder-item-service.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { SitesService } from '../reporting/sites.service';
import { Observable, of, switchMap } from 'rxjs';
import { OrderMethodsService } from './order-methods.service';
@Injectable({
  providedIn: 'root'
})
export class PosOrderItemMethodsService {


  constructor(private orderService: OrdersService,
              public orderMethodsService: OrderMethodsService,
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
          this.orderMethodsService.updateOrderSubscription(data)
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
              this.orderMethodsService.updateOrderSubscription(data)
            }
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
            this.orderMethodsService.updateOrderSubscription(data)
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
            this.orderMethodsService.updateOrderSubscription(data)
            return of(data)
          }))
        }
      }

      if (editField == 'wholeSaleCost' || editField === 'wholeSaleTotal') {
        if (item) {
          obs$ =  this.posOrderItemService.changeItemTotalCost(site, item).pipe(switchMap( data => {
            if (data) {
              if (data.resultMessage) {
                this.siteService.notify(data.resultMessage, 'Alert', 1500)
              }
            }
            this.orderMethodsService.updateOrderSubscription(data)
            return of(data)
          }))
        }
      }

      if (editField == 'modifierNote') {
        obs$ = this.posOrderItemService.changeModifierNote(site, item ).pipe(switchMap( data => {
          this.orderMethodsService.updateOrderSubscription(data)
          return of(data)
        }))
      }
    }

    return obs$;
  }

  saveItem(item: PosOrderItem, editField: string) {
    const site = this.siteService.getAssignedSite()
    if (editField == 'modifierNote') {
      return this.posOrderItemService.putItem(site, item )
    }
    return of(null)
  }

  calcPackageNumber(quantity: number, multiplier: number) {
    // console.log('calcPackageNumber', quantity, multiplier)
    if (!multiplier|| multiplier == 0)  { return quantity}
    const packagesNeeded = Math.ceil(quantity / multiplier);
    return packagesNeeded;

  }


}
