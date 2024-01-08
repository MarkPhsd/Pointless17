import { OnInit,  Component } from '@angular/core';
import { ISetting,  } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormGroup } from '@angular/forms';
import { FbSettingsService } from 'src/app/_form-builder/fb-settings.service';
import { SystemService } from 'src/app/_services/system/system.service';
import { AuthenticationService } from 'src/app/_services';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-cache-settings',
  templateUrl: './cache-settings.component.html',
  styleUrls: ['./cache-settings.component.scss']
})
export class CacheSettingsComponent implements OnInit {

  cacheTime         :    string;
  cacheEnabled      :    boolean;
  cacheTimeSetting  = {} as  ISetting;
  cacheForm         : UntypedFormGroup;
  currentCache      : ISetting;
  cacheSizeCurrent  : string;
  cacheTimeSetting$ : Observable<ISetting>;
  cacheSize : number;

  constructor(
              private settingsService:   SettingsService,
              private sitesService:      SitesService,
              private fbSettingsService: FbSettingsService,
              private authenticationService:  AuthenticationService,
              private systemService:     SystemService,
              )
    { }

  ngOnInit() {
    this.initCacheTime();
    this.cacheSizeCurrent = this.systemService.getUsedLocalStorageSpace()
    const item = this.cacheSizeCurrent.replace('KB', '');
    this.cacheSize        = +item
  }

  initCacheTime(){
    const site        = this.sitesService.getAssignedSite();

    this.cacheTimeSetting$ =  this.settingsService.initCacheTimeObs(site).pipe(switchMap(data => {
      this.cacheTimeSetting = data;
      if (this.cacheTimeSetting ) {
        this.cacheForm  = this.fbSettingsService.initForm(this.cacheForm)
        this.cacheForm  = this.fbSettingsService.intitFormData(this.cacheForm, data)
      }
      return of(data)
    }))

  }

  deleteLocalStorage() {
    localStorage.clear();
    this.authenticationService.logout(false);
  }

  updateCacheTime() {
    if (this.cacheTimeSetting && this.cacheForm) {
      const site = this.sitesService.getAssignedSite();
      this.cacheTimeSetting = this.cacheForm.value;

      if (this.cacheTimeSetting.webEnabled) {
        this.cacheTimeSetting.webEnabled = 1
      } else {
        this.cacheTimeSetting.webEnabled = 0
      }


      this.settingsService.putSetting(site, this.cacheTimeSetting.id, this.cacheTimeSetting ).subscribe( data => {
        this.cacheTimeSetting = data
        localStorage.setItem('appCache', JSON.stringify(data));
        console.log('set app cache', localStorage.getItem('appCache'))
        this.currentCache = data
      })
    }
  }

  clearCacheTime() {

  }

}
