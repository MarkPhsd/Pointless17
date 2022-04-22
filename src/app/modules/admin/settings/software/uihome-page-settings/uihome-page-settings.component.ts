import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'uihome-page-settings',
  templateUrl: './uihome-page-settings.component.html',
  styleUrls: ['./uihome-page-settings.component.scss']
})
export class UIHomePageSettingsComponent implements OnInit {

  backgroundImage: string;
  logoHomePage: string;
  tinyLogo    :     string;
  inputForm   : FormGroup;
  uiSettings  : ISetting;
  uiSettings$ : Observable<ISetting>;
  uiHomePage  : UIHomePageSettings;

  constructor(
    private settingsService  : SettingsService,
    private uISettingsService: UISettingsService) { }

  ngOnInit() {
    const form = this.inputForm
    this.inputForm = this.uISettingsService.initHomePageForm(form)
    this.settingsService.getUIHomePageSettings().subscribe(data => {
      if (data) {
        this.uiHomePage   = data
        this.initializeImages(this.uiHomePage)
        this.initForm(this.uiHomePage);
        return
      }
    });
  }

  initializeImages(data: UIHomePageSettings) {
    try {
      if (data.backgroundImage) {
        this.backgroundImage = data.backgroundImage;
      }
    } catch (error) {
    }

    try {
      if (data.tinyLogo) {
        this.tinyLogo =  data.tinyLogo;
      }
    } catch (error) {
    }

    try {
      if (data.logoHomePage) {
        this.logoHomePage = data.logoHomePage;
      }
    } catch (error) {
    }
  }

  initForm(data: UIHomePageSettings) {
    if (this.inputForm) {
      const form = this.inputForm;
      this.inputForm.patchValue(data)
      return
    }
  }

  updateSetting(){
    if (!this.inputForm) {
      console.log('Error Input Form Null')
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

  };

}
