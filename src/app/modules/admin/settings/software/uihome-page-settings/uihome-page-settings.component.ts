import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { catchError, Observable, of, switchMap } from 'rxjs';
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
  uiHomePage$ : Observable<any>
  uiHomePage  : UIHomePageSettings;
  saving$     : Observable<any>;
  message     : string;
  showEmailSettings = false;

  constructor(
    private settingsService  : SettingsService,
    private uISettingsService: UISettingsService) { }

  ngOnInit() {

    this.saving$  = null;

    this. uiHomePage$ = this.settingsService.getUIHomePageSettingsNoCache().pipe(
      switchMap(
        data => {
        if (data) {
          this.inputForm = this.uISettingsService.initHomePageForm(this.inputForm)
          if (this.inputForm) {
            this.uiHomePage   = data as UIHomePageSettings
            this.inputForm.patchValue(data)
            this.initializeImages(this.uiHomePage)
          }

        } else {
          this.inputForm = this.uISettingsService.initHomePageForm(this.inputForm);
          this.initializeImages(this.uiHomePage)
          this.initForm(this.uiHomePage);
        }
        return of(this.uiHomePage)
      })),catchError( error => {
        console.log(error  + ' error initializing settings')
        return of(error)
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
    this.message = ''
    this.saving$ = this.uISettingsService.saveConfig(this.inputForm, 'UIHomePageSettings').pipe(
      switchMap(data => {
        this.uiHomePage = JSON.parse(data.text) as UIHomePageSettings;
        this.message    = 'Saved'
        this.uISettingsService.notify('Saved', 'Success')
        return of(this.uiHomePage)
    }))
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
