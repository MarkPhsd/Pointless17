import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { IPOSOrder, IServiceType, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector: 'posorder-service-type',
  templateUrl: './posorder-service-type.component.html',
  styleUrls: ['./posorder-service-type.component.scss']
})
export class POSOrderServiceTypeComponent implements OnInit {

  @Input() inputForm: FormGroup;
  serviceTypes$        : Observable<IServiceType[]>;
  order                : IPOSOrder;
  _order               : Subscription;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private orderService      : OrdersService,
    private sitesService      : SitesService,
    private platFormService   : PlatformService,
    private serviceTypeService: ServiceTypeService, ) { }

  ngOnInit(): void {
    console.log('')
  }

  getPaymentMethods(site: ISite) {
    const paymentMethods$ = this.serviceTypeService.getSaleTypesCached(site);

    if (this.platFormService.isApp()) {
      this.serviceTypes$ = paymentMethods$
      return
    }

    paymentMethods$.subscribe(data => {
      if (!this.platFormService.isApp()) {
        const list = data.filter( item => item.onlineOrder == true)
        this.serviceTypes$ = of(list)
        return
      }
    })

  }

  applyServiceType(item: IServiceType) {

    if (this.order) {
      this.order.serviceType = item.name;
      this.order.serviceTypeID = item.id;
      this.orderService.updateOrderSubscription(this.order)
    }

  }

}
