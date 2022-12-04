import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';
import { IPrinterLocation, PrinterLocationsService } from '../menu/printer-locations.service';
import { SitesService } from '../reporting/sites.service';
import { OrdersService } from '../transactions/orders.service';
import { PlatformService } from './platform.service';
import { PrintingService } from './printing.service';

@Injectable({
  providedIn: 'root'
})
export class PrepPrintingServiceService {

  printOrders : IPrintOrders[];

  constructor(
              private locationsService: PrinterLocationsService,
              private siteService: SitesService,
              private printingService: PrintingService) { }

  printLocations(order: IPOSOrder): Observable<any> { 
    const site = this.siteService.getAssignedSite();
    const locations$ = this.locationsService.getLocations();
    const printOrders = [] as IPrintOrders[]
    const posItems  = order.posOrderItems;

    const result$ = locations$.pipe(switchMap(data => { 
      return of(data);
    })).pipe(switchMap(data => { 
        data.forEach(location => { 
          const newItems = [] as PosOrderItem[];
          posItems.forEach(data =>
            {if(data.printLocation == location.id) { 
                newItems.push(data)
            }}
          )
          
          if (newItems.length > 0) { 
            const item = this.setOrder(newItems, order, location)
            printOrders.push(item)
          }
        }
      )
      return of(printOrders)
    })).pipe(switchMap(sections => { 
      return this.printingService.printDocuments(sections)
    }))
    return result$
  }

  setOrder(newItems: PosOrderItem[], order: IPOSOrder, location: IPrinterLocation): IPrintOrders {
    let newOrder = { ...order };
    newOrder.posOrderItems = newItems 
    const item = {} as IPrintOrders;
    item.location = location;
    item.order = newOrder;
    return item
  }



}
