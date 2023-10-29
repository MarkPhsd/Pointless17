import { Component, OnInit,Input, OnDestroy } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { AWSBucketService } from 'src/app/_services';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector   : 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit, OnDestroy {
  _uISettings               : Subscription;
  @Input() uiHomePageSetting: UIHomePageSettings;
  @Input() logo   = '';
  @Input() bucket = '';
  @Input() logoSize = 'small'
  company  = '';
  bucket$: Observable<any>;
  logoImage: string;

  constructor(
   private uiSettingService      : UISettingsService,
    private awsBucketService     : AWSBucketService,
  ) { }

  ngOnDestroy(): void {
    if (this._uISettings) { this._uISettings.unsubscribe()}
  }

  ngOnInit() {
    if (!this.bucket) {
      if (this.uiSettingService.homePageSetting) {
        if (this.logoSize == 'small') {
          this.logoImage = this.uiHomePageSetting?.tinyLogo ;
        }
        if (this.logoSize == 'medium') {
          this.logoImage = this.uiHomePageSetting?.logoHomePage;
        }
        if (this.logoSize == 'large') {
          this.logoImage = this.uiHomePageSetting?.logoHomePage;
        }
        if (!this.logoSize) {
          this.logoImage = this.uiHomePageSetting?.tinyLogo ;
        }
        if (!this.logo) {
          this.logoImage = this.uiHomePageSetting?.logoHomePage;
        }
      }

      this.uiSettingService.homePageSetting
      this.bucket$ =  this.awsBucketService.getAWSBucketObservable().pipe(
        switchMap(data => {
          this.bucket = data?.preassignedURL;
          this.initLogoImage();
          return of(data)
        })
      )
    }

    if (this.bucket) {
      this.refreshUIHomePageSettings()
    }

  }

  refreshUIHomePageSettings() {
    this.uiSettingService.getSetting('UIHomePageSettings').subscribe(data =>  {
      this.uiHomePageSetting = JSON.parse(data.text) as UIHomePageSettings
      this.initLogoImage();
    })
  }

  initLogoImage() {
    console.log(this.bucket, this.logo, this.logoSize)
    console.log('bucket', this.bucket)

    if (!this.logoSize ) { this.logoSize  = 'large'}

    if (this.bucket) {
        if (this.logoSize === 'large') {
          this.logo = this.uiHomePageSetting?.logoHomePage
        }
        if (this.logoSize === 'small') {
          this.logo = this.uiHomePageSetting?.tinyLogo
        }

        if (this.logoImage) {
          const logo = `${this.bucket}${this.logoImage}`
          this.logo = logo
          return;
        }
        const logo = `${this.bucket}${this.logo}`
        this.logo = logo
    }
  }

  initLogo() {
    if (this.logo && this.bucket && this.uiHomePageSetting) {
      this.initLogoImage();
      return;
    }
  }

}
