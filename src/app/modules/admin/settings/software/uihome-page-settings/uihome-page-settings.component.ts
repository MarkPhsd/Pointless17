import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'uihome-page-settings',
  templateUrl: './uihome-page-settings.component.html',
  styleUrls: ['./uihome-page-settings.component.scss']
})
export class UIHomePageSettingsComponent implements OnInit {

  inputForm  : FormGroup;
  uiSettings : ISetting;
  uiSettings$: Observable<ISetting>;
  uiHomePage = {} as UIHomePageSettings;

  constructor(private uISettingsService: UISettingsService) { }

  ngOnInit(): void {
    this.uISettingsService.getSetting('UIHomePageSettings').subscribe(data => {
      if (data) {
        this.initForm(data);
      }
    });
  }

  async initForm(setting: ISetting) {
    const form = this.inputForm
    this.inputForm = this.uISettingsService.initHomePageForm(form)
    this.inputForm = await this.uISettingsService.setFormValue(form, setting, setting.text, 'UIHomePageSettings')
  }

  async updateSetting(){
    const result =  await this.uISettingsService.saveConfig(this.inputForm, 'UIHomePageSettings')
  }

}
