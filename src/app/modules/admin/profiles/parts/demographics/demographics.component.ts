import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IClientTable, IUserProfile } from 'src/app/_interfaces';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-profile-demographics',
  templateUrl: './demographics.component.html',
  styleUrls: ['./demographics.component.scss']
})
export class ProfileDemographicsComponent implements OnInit, OnDestroy {
  enableLimitsView : boolean;
  _uiTransactionSettings: Subscription;
  uiTransactionSettings : TransactionUISettings;


  @Input() inputForm    : FormGroup;
  @Input() isAuthorized : boolean;
  @Input() isStaff      : boolean;
  @Input() client       : IClientTable;
  @Input() enableMEDClients: boolean;

  constructor( private uiSettingsService : UISettingsService,) { }

  ngOnInit(): void {
    console.log('')
    this.initSubscriptions();
  }


  initSubscriptions() {

    this._uiTransactionSettings  = this.uiSettingsService.transactionUISettings$.subscribe(data => {
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
