import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FbSettingsService } from 'src/app/_form-builder/fb-settings.service';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'app-edit-settings',
  templateUrl: './edit-settings.component.html',
  styleUrls: ['./edit-settings.component.scss']
})
export class EditSettingsComponent implements OnInit {

  @Input() inputForm        : UntypedFormGroup;
  @Input() setting          : ISetting;
  @Input() settingName      : string;
  @Input() settingFieldName : string;
  @Input() cacheSettingLocal: boolean;
  @Input() fieldType = 'text'
  settingValue  : boolean;

  constructor(
      private settingService: SettingsService,
      private sitesService  : SitesService,
      private fbSettingsService: FbSettingsService,
      private fb: UntypedFormBuilder
  ) {

  }

  ngOnInit(): void {
    console.log('')
    this.initSetting();
  }

  async initSetting(){

    if (!this.settingName) {return};
    if (!this.settingFieldName) {return};

    const site = this.sitesService.getAssignedSite();
    this.setting = await this.settingService.getSettingByName(site, this.settingName).pipe().toPromise();

    if (this.setting) {
      this.settingValue = this.setting.boolean;
      this.inputForm  = this.fbSettingsService.initForm(this.inputForm)
      this.inputForm  = this.fbSettingsService.intitFormData(this.inputForm, this.setting)
    }


  }

  updateSetting() {
    if (this.setting && this.inputForm) {
      const site = this.sitesService.getAssignedSite();
      this.setting = this.inputForm.value;
      this.settingService.putSetting(site, this.setting.id, this.setting ).subscribe( data => {
        this.setting = data
        if (this.cacheSettingLocal) {
          localStorage.setItem(this.settingName, JSON.stringify(data));
        }
      })
    }
  }

}
