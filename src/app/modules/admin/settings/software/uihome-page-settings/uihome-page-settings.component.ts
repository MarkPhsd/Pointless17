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

  backgroundImage: string;
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

        try {
          if (this.uiHomePage?.backgroundImage == null) {
            this.uiHomePage.backgroundImage = ''
          }

        } catch (error) {

        }
        try {
          if (this.uiHomePage?.tinyLogo == null) {
            this.uiHomePage.tinyLogo = ''
          }
        } catch (error) {

        }
        try {
          if (this.uiHomePage?.logoHomePage  == null) {
            this.uiHomePage.logoHomePage =''
          }
        } catch (error) {

        }





        this.backgroundImage = this.uiHomePage.backgroundImage;
        this.tinyLogo =  this.uiHomePage.tinyLogo;
        this.logoHomePage = this.uiHomePage.logoHomePage;

        this.initForm(data);
        return
      }
    });
    const form = this.inputForm
    this.inputForm = this.uISettingsService.initHomePageForm(form)
  }

  initForm(setting: ISetting) {
    const form = this.inputForm
    this.inputForm = this.uISettingsService.initHomePageForm(form)
    this.uISettingsService.setFormValue(form, setting, 'UIHomePageSettings').subscribe(
      data => {
        if (data) {
          const config = JSON.parse(data.text)
          this.inputForm = this.uISettingsService.initForms_Sub(form, data.name, config)
        }
      })
   }

  updateSetting(){
    if (!this.inputForm) {
      return
    }
    try {
      this.uISettingsService.saveConfig(this.inputForm, 'UIHomePageSettings').subscribe(data => {
        console.log('saved', data)
      })
    } catch (error) {
      console.log('errror', error)
    }
  }

  //image data
  received_Image(event) {
    this.backgroundImage = event
    this.inputForm.patchValue({backgroundImage: event})
  };

  received_Logo(event) {
    this.logoHomePage = event
    this.inputForm.patchValue({logoHomePage: event})
  };

  received_TinyLogo(event) {
    this.tinyLogo = event
    this.inputForm.patchValue({tinyLogo: event})
    console.log('this inputform', this.inputForm  )
  };

}
