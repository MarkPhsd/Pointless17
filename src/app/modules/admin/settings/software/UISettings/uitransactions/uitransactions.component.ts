import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-uitransactions',
  templateUrl: './uitransactions.component.html',
  styleUrls: ['./uitransactions.component.scss']
})
export class UITransactionsComponent implements OnInit {

  inputForm  : FormGroup;
  uiSettings :  ISetting
  uiSettings$: Observable<ISetting>;
  uiTransactions = {} as TransactionUISettings;

  constructor(
      private uISettingsService: UISettingsService,
      private siteService      : SitesService,
      private settingsService  :SettingsService,
  ) {
    const site = this.siteService.getAssignedSite();
    this.uiSettings$ = this.settingsService.getSettingByName(site, 'UITransactionSetting')
  }

  ngOnInit() {
    console.log('UITransactionsComponent on init')
    this.uiSettings$.subscribe(data => {
      this.uiSettings = data;
      if (this.uiSettings) {
        this.initForm(this.uiSettings);
      }
    });
  }

  async initForm(setting: ISetting) {
    const form = this.inputForm
    console.log("uitransactions setting", setting)
    if (setting) {
      this.inputForm = await this.uISettingsService.setFormValue(form, setting, setting.text)
    }
  }

  async updateSetting(){
    const result =  await this.uISettingsService.saveTransactionUIConfig(this.inputForm)
  }

}
