import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { clientType, ClientType, IClientTable, IUserProfile } from 'src/app/_interfaces';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { ClientTypeService, IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ValueFieldsComponent } from '../../../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { ProfileMedInfoComponent } from '../profile-med-info/profile-med-info.component';
import { StatusLookupComponent } from '../status-lookup/status-lookup.component';

@Component({
  selector: 'app-profile-demographics',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
  ValueFieldsComponent,
  ProfileMedInfoComponent,
  StatusLookupComponent,
  SharedPipesModule],
  templateUrl: './demographics.component.html',
  styleUrls: ['./demographics.component.scss']
})
export class ProfileDemographicsComponent implements OnInit, OnDestroy {
  enableLimitsView : boolean;
  _uiTransactionSettings: Subscription;
  uiTransactionSettings : TransactionUISettings;

  @Input() clientType   : ClientType;
  @Input() inputForm    : UntypedFormGroup;
  @Input() isAuthorized : boolean;
  @Input() isStaff      : boolean;
  @Input() client       : IClientTable;
  @Input() enableMEDClients: boolean;
  @Input() auths: IUserAuth_Properties;

  clientTypes$: Observable<clientType[]>;

  constructor(
    private siteService       : SitesService,
    private clientTypeService : ClientTypeService,
    public labelingService: LabelingService,
    private uiSettingsService : UISettingsService,) { }

  ngOnInit(): void {
    this.initSubscriptions();
    const site        = this.siteService.getAssignedSite();
    this.clientTypes$ = this.clientTypeService.getClientTypes(site);
  }

  initSubscriptions() {
    // this.client.clientTypeID
    this.uiSettingsService.transactionUISettings$.subscribe(data => {
      this.enableLimitsView  =false;
      if (data) {
        this.uiTransactionSettings = data;
        this.enableLimitsView = data.enableLimitsView
      }
    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._uiTransactionSettings) { this._uiTransactionSettings.unsubscribe()}
  }

}
