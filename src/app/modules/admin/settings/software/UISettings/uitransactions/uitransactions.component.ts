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
      private siteService      : SitesService,
      private uISettingsService: UISettingsService,
      private settingsService  :SettingsService,
  ) {
  }

  ngOnInit() {
    this.uISettingsService.getSettings(false).subscribe(data => {
      if (data) {
        this.initForm(data);
      }
    });
  }

  async initForm(setting: ISetting) {
    const form = this.inputForm
    this.inputForm = await this.uISettingsService.setFormValue(form, setting, setting.text)
  }

  async updateSetting(){
    const result =  await this.uISettingsService.saveConfig(this.inputForm)
  }

}
