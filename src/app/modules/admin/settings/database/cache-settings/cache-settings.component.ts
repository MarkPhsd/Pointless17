import { AfterViewInit,  Component } from '@angular/core';
import { ISetting,  } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormGroup } from '@angular/forms';
import { FbSettingsService } from 'src/app/_form-builder/fb-settings.service';

@Component({
  selector: 'app-cache-settings',
  templateUrl: './cache-settings.component.html',
  styleUrls: ['./cache-settings.component.scss']
})
export class CacheSettingsComponent implements AfterViewInit {

  cacheTime         :    string;
  cacheEnabled      :    boolean;
  cacheTimeSetting  = {} as  ISetting;
  cacheForm         : FormGroup;
  currentCache      : ISetting;

  constructor(
              private settingsService:   SettingsService,
              private sitesService:      SitesService,
              private fbSettingsService: FbSettingsService,
              )
    { }

  async ngAfterViewInit() {
    this.currentCache = await this.settingsService.initAppCache();
    await this.initCacheTime();
  }

  async initCacheTime(){
    const site        = this.sitesService.getAssignedSite();
    this.cacheTimeSetting = await this.settingsService.initCacheTime(site)
    if (this.cacheTimeSetting) {
      this.cacheForm  = this.fbSettingsService.initForm(this.cacheForm)
      this.cacheForm  = this.fbSettingsService.intitFormData(this.cacheForm, this.cacheTimeSetting)
    }
  }

  updateCacheTime() {
    if (this.cacheTimeSetting && this.cacheForm) {
      const site = this.sitesService.getAssignedSite();
      this.cacheTimeSetting = this.cacheForm.value;
      this.settingsService.putSetting(site, this.cacheTimeSetting.id, this.cacheTimeSetting ).subscribe( data => {
        this.cacheTimeSetting = data
        localStorage.setItem('appCache', JSON.stringify(this.cacheTimeSetting.value));
        this.currentCache = data
      })
    }
  }

  clearCacheTime() {

  }

}
