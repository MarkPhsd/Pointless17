import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
@Component({
  selector: 'uihome-page-settings',
  templateUrl: './uihome-page-settings.component.html',
  styleUrls: ['./uihome-page-settings.component.scss'],
})
export class UIHomePageSettingsComponent implements OnInit {

  backgroundImage: string;
  logoHomePage: string;
  tinyLogo    :     string;
  inputForm   : FormGroup;
  uiSettings  : ISetting;
  uiSettings$ : Observable<ISetting>;
  uiHomePage  : UIHomePageSettings;

  showEmailSettings = false;

  constructor(
    private settingsService  : SettingsService,
    private uISettingsService: UISettingsService) { }

  ngOnInit() {

    this.settingsService.getUIHomePageSettingsNoCache().subscribe(
      {next:
        data => {
        if (data) {
          this.inputForm = this.uISettingsService.initHomePageForm(this.inputForm)
          if (this.inputForm) {
            this.uiHomePage   = data as UIHomePageSettings
            this.inputForm.patchValue(data)
            this.initializeImages(this.uiHomePage)
          }
          return
        } else {
          this.inputForm = this.uISettingsService.initHomePageForm(this.inputForm);
          this.initializeImages(this.uiHomePage)
          this.initForm(this.uiHomePage);
        }
      },
      error: error => {
        console.log('error initializing settings')
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
      this.inputForm.patchValue(data)
      return
    }
  }

  updateSetting(){
    try {
      this.uISettingsService.saveConfig(this.inputForm, 'UIHomePageSettings').subscribe(data => {
        this.uiHomePage = JSON.parse(data.text) as UIHomePageSettings;
        this.uISettingsService.notify('Saved', 'Success')
      })
    } catch (error) {
      this.uISettingsService.notify(`Saved ${error}`, 'Success')
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
