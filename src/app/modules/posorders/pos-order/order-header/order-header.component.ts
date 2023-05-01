import { Component, Input , OnChanges, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { NgxPayPalModule } from 'ngx-paypal';
import { of, switchMap, Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrepPrintingServiceService } from 'src/app/_services/system/prep-printing-service.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-order-header',
  templateUrl: './order-header.component.html',
  styleUrls: ['./order-header.component.scss']
})
export class OrderHeaderComponent implements OnInit , OnChanges {

  @Input() qrOrder: boolean;
  @Input() uiTransactionSettings  = {} as TransactionUISettings;
  @Input() mainPanel : boolean;
  @Input() order: IPOSOrder
  @Input() isUserStaff = false

  isOrderClaimed: boolean;
  href: string;
  hidePrint = false;
  action$: Observable<any>;

  constructor(
             private ordersService:   OrdersService,
             public  router: Router,
             public  printingService: PrintingService,
             public  platFormService: PlatformService,
             private orderMethodsService: OrderMethodsService,
             private siteService : SitesService,
             public  authenticationService: AuthenticationService,
             public  prepPrintingService: PrepPrintingServiceService,
    ) {

    this.ordersService.currentOrder$.subscribe(data => {
      this.isOrderClaimed = this.ordersService.IsOrderClaimed
    })


  }

  ngOnInit() {
    this.href = this.router.url;
    this. refreshPrintOption()
  }

  ngOnChanges() {
    this.refreshPrintOption()
  }

  refreshPrintOption() {
    this.hidePrint = false;
    if (this.router.url.substring(0, '/currentorder'.length ) === '/currentorder') {
      this.hidePrint = true;
      return;
    }
  }

  reSendOrder() {
    this.action$ = this.orderMethodsService.sendToPrep(this.order, true).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  sendOrder() {
    this.action$ = this.orderMethodsService.sendToPrep(this.order, true).pipe(
      switchMap(data => {
        this.clearOrder()
        return of(data)
      })
    )
  }

  clearOrder() {
    this.orderMethodsService.clearOrder()
  }

  assignPriceColumn(value: number){
    const site = this.siteService.getAssignedSite()
    if (this.order) {
      this.order.priceColumn = value
      console.log(this.order.id,value)
      this.action$ = this.ordersService.setOrderPriceColumn(this.order.id, value).pipe(
        switchMap(data => {
          // this.siteService.notify(`Price Column Set: ${value}`, 'Result', 2000)
          this.order.priceColumn = data;
          this.ordersService.updateOrder(this.order)
          return of(data)
        })
      )
    }
  }


}
