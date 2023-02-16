import { Component, Input , OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { of, switchMap, Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrepPrintingServiceService } from 'src/app/_services/system/prep-printing-service.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-order-header',
  templateUrl: './order-header.component.html',
  styleUrls: ['./order-header.component.scss']
})
export class OrderHeaderComponent implements OnInit  {

  @Input() mainPanel = false;
  @Input() order: IPOSOrder
  isOrderClaimed: boolean;
  href: string;
  hidePrint = false;
  action$: Observable<any>;

  constructor(
             private  ordersService:   OrdersService,
             private router: Router,
             public printingService: PrintingService,
             public platFormService: PlatformService,
             private orderMethodsService: OrderMethodsService,
             public prepPrintingService: PrepPrintingServiceService,
    ) {

    this.ordersService.currentOrder$.subscribe(data => {
      this.isOrderClaimed = this.ordersService.IsOrderClaimed
    })

  }

  ngOnInit() {
    this.href = this.router.url;
    this.hidePrint = false;
    if (this.href.substring(0, '/pos-payment'.length ) === '/pos-payment') {
      this.hidePrint = true;
      return;
    }
  }


  sendOrder() {
    this.action$ = this.prepPrintingService.sendToPrep(this.order).pipe(
      switchMap(data => {
        this.clearOrder()
        console.log('sendOrder', data)
        return of(data)
      })
    )

  }
  clearOrder() {
    this.orderMethodsService.clearOrder()
  }

}
