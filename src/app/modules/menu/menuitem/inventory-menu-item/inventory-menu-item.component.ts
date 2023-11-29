import { Component, Input, OnInit } from '@angular/core';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { IInventoryAssignment, InventoryAssignmentService, InventoryFilter, InventorySearchResultsPaged } from 'src/app/_services/inventory/inventory-assignment.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector: 'inventory-menu-item',
  templateUrl: './inventory-menu-item.component.html',
  styleUrls: ['./inventory-menu-item.component.scss']
})
export class InventoryMenuItemComponent implements OnInit {

  // @Input() productID: number;
  @Input() productID: number;
  @Input() posDevice:  ITerminalSettings;
  inventoryItems$: Observable<InventorySearchResultsPaged>;
  inventoryList : IInventoryAssignment[];
  addItem$: Observable<any>;

   constructor(
    private siteService        : SitesService,
    private serviceTypeService : ServiceTypeService,
    private orderMethodService : OrderMethodsService,
    private inventoryService   : InventoryAssignmentService) { }

  ngOnInit(): void {
    
    // this.addItem$ = this.addNewOrder();

    if (this.productID) { 
      const site = this.siteService.getAssignedSite()
      this.inventoryItems$ = this.inventoryService.getAvalibleInventory(site, this.productID, true).pipe(switchMap(data => {
        console.log('daresults', data.results) 
        this.inventoryList = data.results
        return of(data)
      }),catchError(data => { 
        this.siteService.notify(`Error: ${data.toString()}`, 'close', 6000, 'red')
        return of(data)
      }));
    }
  }

  addNewOrder() {
    const site = this.siteService.getAssignedSite();
    if (this.posDevice) {
      if (this.posDevice.defaultOrderTypeID  && this.posDevice.defaultOrderTypeID != 0) {
        const serviceType$ = this.serviceTypeService.getType(site, this.posDevice.defaultOrderTypeID)
        return serviceType$.pipe(switchMap(data => {
            return of(data)
        })).pipe(switchMap(data => {
            const order$ = this.getNewOrder(site, null)
            return order$
        }))
      }
    }
    return this.getNewOrder(site, null)
  }

  getNewOrder(site, serviceType) {
    const order = this.orderMethodService.order;
    if (order) { return of(order)}
    return this.orderMethodService.newOrderWithPayloadMethod(site, serviceType).pipe(
      switchMap(data => {
        return of(data)
    }))
  }

  // addItemToOrder(sku: string) {
  //   const site = this.siteService.getAssignedSite();
  //   const order$   = this.addNewOrder();

  //   this.addItem$  =  order$.pipe(switchMap(order => {  
  //       this.orderMethodService.order = order;
  //       console.log('orderAdded')
  //       return this.orderMethodService.scanBarcodedItem(site, order, sku, 1,   null, 
  //                                                       null, null,  null,null,null)
  //   })).pipe(switchMap(data => { 
  //       console.log('newitem switchMap', data)
  //       return of(data)
  //   })),catchError(data => { 
  //       console.log('error occured')
  //       this.siteService.notify(`Error ${data.toString()}`, 'close', 69000, 'red')
  //       return of(data)
  //   })
  // }

  addItemToOrder(sku: string) {
    const site = this.siteService.getAssignedSite();
  
    this.addItem$ = this.addNewOrder().pipe(
      switchMap(order => {
        this.orderMethodService.order = order;
        console.log('orderAdded');
        return this.orderMethodService.scanBarcodedItem(site, order, sku, 1, null, null, null, null, null, null);
      }),
      switchMap(data => {
        console.log('newitem switchMap', data);
        return of(data);
      }),
      catchError(data => {
        console.log('error occurred');
        this.siteService.notify(`Error ${data.toString()}`, 'close', 69000, 'red');
        return of(data);
      })
    );
  }
  
}
