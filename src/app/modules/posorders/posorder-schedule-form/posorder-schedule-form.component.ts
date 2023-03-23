import { Component, EventEmitter, OnInit,Output,Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IPOSOrder, IServiceType } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { Observable, } from 'rxjs';

@Component({
  selector: 'app-posorder-schedule-form',
  templateUrl: './posorder-schedule-form.component.html',
  styleUrls: ['./posorder-schedule-form.component.scss']
})
export class POSOrderScheduleFormComponent implements OnInit {

  @Output() OutPutSaveShippingTime = new EventEmitter();
  @Input() order     : IPOSOrder;
  @Input() inptuForm : FormGroup;
  scheduledDate       : string;
  serviceType$        : Observable<IServiceType>;
  @Input()  serviceType       : IServiceType;
  constructor(
    private orderService      : OrdersService,
    private serviceTypeService: ServiceTypeService,
    private sitesService      : SitesService,
    public platFormService    : PlatformService,
   ) { }

  ngOnInit(): void {
   const i = 0
   this.initServiceTypeInfo();
  }

  initServiceTypeInfo() {
    const site = this.sitesService.getAssignedSite();
    if (!this.order) {return}
    this.serviceType$ = this.serviceTypeService.getTypeCached(site, this.order.serviceTypeID)
  }

  saveShippingTime() {
    this.OutPutSaveShippingTime.emit(this.scheduledDate)
  }

}
