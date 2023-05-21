import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { IPOSOrder, IServiceType, ISite, ServiceType } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector: 'posorder-service-type',
  templateUrl: './posorder-service-type.component.html',
  styleUrls: ['./posorder-service-type.component.scss']
})
export class POSOrderServiceTypeComponent implements OnDestroy  {

  inputForm            : UntypedFormGroup;
  serviceTypes$        : Observable<IServiceType[]>;
  order                : IPOSOrder;
  _order               : Subscription;
  serviceTypes         : IServiceType[]
  @Output() outPutSelectServiceType = new EventEmitter();
  item: any;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private orderService      : OrdersService,
    private sitesService      : SitesService,
    private userAuthorization: UserAuthorizationService,
    public platFormService   : PlatformService,
    private serviceTypeService: ServiceTypeService, ) {

    this.initSubscriptions();
    const site = this.sitesService.getAssignedSite();
    this.getPaymentMethods(site);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if ( this._order) { this._order.unsubscribe()}
  }

  getPaymentMethods(site: ISite) {
    const serviceTypes$ = this.serviceTypeService.getSaleTypes(site);
    this.serviceTypes$ = serviceTypes$

    if (this.platFormService.isApp()) {
      this.serviceTypes$ = serviceTypes$
      return
    }
    serviceTypes$.subscribe(data => {
      if (!this.platFormService.isApp()) {
        let list = data.filter( item => item.onlineOrder == true ) as IServiceType[]
        
        if (!this.userAuthorization.isManagement) { 
          list = list.filter.call(item => item.managerRequired )
        }

        this.serviceTypes$ = of(list)
        this.serviceTypes  = list;
        return
      }

      if (!data) {
        this.serviceTypes$ = of(data)
      }
    })
  }

  applyServiceType(item: IServiceType) {
    // this.item = item
    if (this.order && item) {
      // this.order.serviceType = item.name;
      // this.order.serviceTypeID = item.id;
      // this.orderService.updateOrderSubscription(this.order)
      this.outPutSelectServiceType.emit(item)
    }
  }

}
