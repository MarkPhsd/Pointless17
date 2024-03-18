import { E } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, concatMap, Observable, of, switchMap } from 'rxjs';
import { PrintTemplatePopUpComponent } from 'src/app/modules/admin/settings/printing/reciept-pop-up/print-template-pop-up/print-template-pop-up.component';
import { IPOSOrder, ISetting, ISite, PosOrderItem } from 'src/app/_interfaces';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';
import { IPrinterLocation, PrinterLocationsService } from '../menu/printer-locations.service';
import { SitesService } from '../reporting/sites.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class PrepPrintingServiceService {

  printOrders : IPrintOrders[];

  constructor(
              private locationsService: PrinterLocationsService,
              private siteService: SitesService,
              private dialog            : MatDialog,
              private settingService: SettingsService,
              ) { }


  printLocations(order: IPOSOrder, printUnPrintedOnly: boolean,  expoName: string, templateID: number,
                cancelUpdateSubscription?: boolean): Observable<any> {

    const site = this.siteService.getAssignedSite();
    const locations$ = this.locationsService.getLocations();
    const printOrders = [] as IPrintOrders[]

    const posItems  = order.posOrderItems;
    if (!posItems) { return of(null)}

    const result$ = locations$.pipe(concatMap(data => {
      return of(data);
    })).pipe( concatMap (data => {
        data.forEach(location => {
          const newItems = [] as PosOrderItem[];
          if (posItems.length != 0) {
            posItems.forEach(data => {
              if (printUnPrintedOnly) {
                {if(data.printLocation == location.id && !data.printed) {
                    newItems.push(data)
                }}
              } else {
                {if(data.printLocation == location.id) {
                    newItems.push(data)
                }}
              }
              }
            )
          }
          if (newItems.length > 0) {

            const item = this.setOrder(newItems, order, location)
            printOrders.push(item)
          }
        }
      )

      //assign the expo
      if (expoName && templateID) {
        const location = {} as IPrinterLocation;
        location.name = expoName;
        location.printer = expoName;
        location.templateID = templateID;

        const printOrder = {} as IPrintOrders;
        printOrder.order = order;
        printOrder.location = location;
        const list = posItems.filter(data => {
          return !data.printed
        })
        if (list && list.length>0) {
          printOrder.order.posOrderItems = list;
          printOrders.push(printOrder)
        }
      }

      return of(printOrders)
    })).pipe( concatMap (printOrders => {
      if (!printOrders || printOrders.length == 0) { return of(null)}
      return this.printElectronTemplateOrder(printOrders)
    })
    ,catchError(data => {
      this.siteService.notify('Error in printing' + data.toString(), 'Close', 5000, 'red')
      return of(data)
    }))
    return result$
  }

  printElectronTemplateOrder(printOrderList:IPrintOrders[]): Observable<any> {
    try {
      const site = this.siteService.getAssignedSite()
      const styles$ = this.appyStylesCachedObservable(site)
      return styles$.pipe(concatMap(data => {
        return this.dialog.open(PrintTemplatePopUpComponent,
          { width:        '450px',
            minWidth:     '450px',
            height:       '600px',
            minHeight:    '600px',
            data : printOrderList,
          },
          ).afterClosed()
      }))
    } catch (error) {
      this.siteService.notify('error printElectronTemplateOrder :' + error.toString(), 'close', 5000, 'red')
    }
    return of(null)
  }

  appyStylesCachedObservable(site: ISite): Observable<ISetting> {
    const receiptStyle$ = this.settingService.getSettingByNameCachedNoRoles(site, 'ReceiptStyles')
    return  receiptStyle$.pipe(
      switchMap( data => {
          return of(this.setHTMLReceiptStyle(data))
        }
      )
    )
  }

  setHTMLReceiptStyle(receiptStyle) {
    if (receiptStyle) {
      const style = document.createElement('style');
      style.innerHTML = receiptStyle.text;
      document.head.appendChild(style);
      return receiptStyle
    }
    return null;
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
