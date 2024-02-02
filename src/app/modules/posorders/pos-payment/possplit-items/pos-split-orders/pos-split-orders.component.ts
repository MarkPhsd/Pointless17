import { Component, OnInit , Input,OnChanges, EventEmitter, Output} from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-split-orders',
  templateUrl: './pos-split-orders.component.html',
  styleUrls: ['./pos-split-orders.component.scss']
})
export class PosSplitOrdersComponent implements OnInit,OnChanges {
  @Input() order: IPOSOrder;
  action$ : Observable<any>;
  posRefOrders$ : Observable<IPOSOrder[]>;
  // @Output() outPutSetGroup = new EventEmitter()
  constructor(
    private orderMethodsService: OrderMethodsService,
    private sitesService: SitesService,
    private orderService: OrdersService) { }

  ngOnInit(): void {
    this.getRefOrders()
  }

  ngOnChanges() {
    this.getRefOrders()
  }
  getRefOrders() {
    if (this.order) {
      const site = this.sitesService.getAssignedSite()
      if (this.order.productOrderRef) {
        this.posRefOrders$  = this.orderService.getRelatedSplitOrders(site, this.order.productOrderRef)
      } else {
        this.posRefOrders$ = null;
      }
    }
  }

   setActiveOrder(order: IPOSOrder) {
    const site = this.sitesService.getAssignedSite()
    const id = order?.id.toString()
    this.action$ = this.orderService.getOrder(site, id, order.history).pipe(switchMap(data => {
      this.orderMethodsService.setActiveOrder(data)
      return of(data)
    }));
  }


}
