import { Component, OnInit , Input} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { IPOSOrder, IServiceType, ISite } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'pos-order-notes',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './pos-order-notes.component.html',
  styleUrls: ['./pos-order-notes.component.scss']
})
export class PosOrderNotesComponent implements OnInit {

  @Input() order    : IPOSOrder;
  @Input() inputForm: UntypedFormGroup;
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
