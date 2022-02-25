import { Component, OnInit , Input} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IPOSOrder, IServiceType, ISite } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'pos-order-notes',
  templateUrl: './pos-order-notes.component.html',
  styleUrls: ['./pos-order-notes.component.scss']
})
export class PosOrderNotesComponent implements OnInit {

  @Input() order    : IPOSOrder;
  @Input() inputForm: FormGroup;
  serviceType$      : Observable<IServiceType>;
  @Input() serviceType: IServiceType;

  constructor(
    private serviceTypeService: ServiceTypeService,
    private sitesService      : SitesService,
    public platFormService   : PlatformService,) { }

  ngOnInit(): void {
    this.initServiceTypeInfo()
  }

  initServiceTypeInfo() {
    const site = this.sitesService.getAssignedSite();
    if (!this.order) {return}
    this.serviceType$ = this.serviceTypeService.getTypeCached(site, this.order.serviceTypeID)
  }
}
