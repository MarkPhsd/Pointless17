import { Component,Input } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { UISettingsService,UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';
import {Observable, of, switchMap} from 'rxjs'
import { ActivatedRoute } from '@angular/router';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
@Component({
  selector: 'online-payment-completed',
  templateUrl: './online-payment-completed.component.html',
  styleUrls: ['./online-payment-completed.component.scss']
})
export class OnlinePaymentCompletedComponent {
  @Input() order: IPOSOrder;
  uiHomePageSetting: UIHomePageSettings;
  ui$ : Observable<UIHomePageSettings>;
  logo       = `assets/images/logo.png`;
  id: number;
  orderCode : string;
  order$: Observable<IPOSOrder>;
  history: boolean;
  serviceIsScheduled: boolean;
  constructor(
    private route: ActivatedRoute,
    private orderService: OrdersService,
    private orderMethodsService: OrderMethodsService,
    private siteService: SitesService,
    private uiSettingService: UISettingsService,
    private serviceTypeService: ServiceTypeService,
    private settingService: SettingsService,) { 

      this.id = +this.route.snapshot.paramMap.get('id');
      this.orderCode = this.route.snapshot.paramMap.get('orderCode');
      if (this.route.snapshot.paramMap.get('history')) { 
        this.history = true;
      }
  
      this.ui$ = of(this.uiSettingService.getUIHomePageSettings()).pipe(switchMap(data => {
        if (!data) {
          return this.settingService.getUIHomePageSettings()
        }
        return of(data)
      }))

      this.getOrder()
  }


  getOrder() { 
      const site = this.siteService.getAssignedSite();

      let order$ : Observable<IPOSOrder>;
      if (this.id) { 
        order$ = this.orderService.getOrder(site, this.id.toString(), this.history)
      }
      if (this.orderCode) { 
        order$ = this.orderService.getQROrder(site, this.orderCode)
      }

      this.order$ = order$.pipe(switchMap(data => { 
        this.order = data;
        return this.serviceTypeService.getTypeCached(site, data?.serviceTypeID)
      })).pipe(switchMap(data => {

          if ( data && data.scheduleInstructions ||
            ( this.order && this.order.preferredScheduleDate) ||
            ( data && data.shippingInstructions) ||
            ( data?.deliveryService )
            ) {
            this.serviceIsScheduled = true
          }
          return of(this.order)
      }))
  
  }

}
