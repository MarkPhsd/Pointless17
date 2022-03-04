import { Component, OnInit,Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AWSBucketService } from 'src/app/_services';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
  _uISettings      : Subscription;
  @Input() uiHomePageSetting: UIHomePageSettings;
  @Input() logo   = '';
  @Input() bucket = '';
  company  = '';

  @Input() logoSize = 'small'

  initSubscriptions() {
      this._uISettings = this.uiSettingService.homePageSetting$.subscribe( data => {
        if (data) {
          this.uiHomePageSetting = data;
        }
      }
    )
  }

  constructor(
   private uiSettingService      : UISettingsService,
    private awsBucketService     : AWSBucketService,
  ) { }

  async ngOnInit() {
    if (!this.bucket) {this.bucket = await this.awsBucketService.awsBucketURL()}
    if (this.logo && this.bucket && this.uiHomePageSetting) {
      this.initCompanyInfo();
      return;
    }
    this.initSubscriptions();
    this.refreshUIHomePageSettings();
  }

  async refreshUIHomePageSettings() {
    this.uiSettingService.getSetting('UIHomePageSettings').subscribe(data =>  {
      this.uiHomePageSetting = JSON.parse(data.text) as UIHomePageSettings
      this.initCompanyInfo();
    })
  }

  async initCompanyInfo() {

    if (this.bucket) {
      if (!this.logoSize ) { this.logoSize  = 'large'}
        if (this.logoSize === 'large') {
          this.logo = this.uiHomePageSetting?.logoHomePage
        }
        if (this.logoSize === 'small') {
          this.logo = this.uiHomePageSetting?.tinyLogo
        }
        const logo = `${this.bucket}${this.logo}`
        this.logo = logo

    }
  }

}
