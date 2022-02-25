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

  urlImageMain: string;
  logoHomePage: string;
  tinyLogo:     string;
  inputForm  : FormGroup;
  uiSettings : ISetting;
  uiSettings$: Observable<ISetting>;
  uiHomePage = {} as UIHomePageSettings;

  constructor(private uISettingsService: UISettingsService) { }

  ngOnInit(): void {
    this.uISettingsService.getSetting('UIHomePageSettings').subscribe(data => {
      if (data) {
        this.uiHomePage   = JSON.parse(data.text) as UIHomePageSettings
        this.urlImageMain = this.uiHomePage.backgroundImage
        this.tinyLogo     = this.uiHomePage.tinyLogo
        this.logoHomePage = this.uiHomePage.logoHomePage
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

  //image data
  received_Image(event) {
    if (!event) { return }
    this.urlImageMain = event
    this.inputForm.patchValue({backgroundImage: event})
  };

  received_Logo(event) {
    if (!event) { return }
    this.logoHomePage = event
    this.inputForm.patchValue({logoHomePage: event})
  };


  received_TinyLogo(event) {
    if (!event) { return }
    this.tinyLogo = event
    this.inputForm.patchValue({tinyLogo: event})
  };

}
