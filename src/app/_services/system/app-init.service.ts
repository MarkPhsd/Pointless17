import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformService } from 'src/app/_services/system/platform.service';

declare var window: any;

@Injectable()
export class AppInitService  {

  private appConfig: any;
  private apiUrl: any;
  private useAppGate: boolean;

  private httpClient: HttpClient;

  constructor(handler: HttpBackend,
              private platFormService: PlatformService,
              private router: Router,) {
    this.platFormService.getplatFormInfo()
    this.httpClient = new HttpClient(handler);
  }

  //for distributed apps.
  //also make a setting that can be applied.
  //that setting can be local storage.
  //and it can override this value.
  //this can be assigned in settings after an initial login.

  async init() {

    //if app then set the app if appvalue doesn't exist
    this.apiUrl = this.getLocalApiUrl();

    if (this.appInUse) {
      if ( this.apiUrl ){
        // if there is no API then the user needs to input one.
        //we also have to have a way to change or clear the API, just in case.
        // redirect to home if already logged in
        this.useAppGate = false
        this.router.navigate(['/app-apisetting']);
        return
      }
    }

    this.appConfig = await this.httpClient.get('/assets/app-config.json').toPromise();
    this.apiUrl = this.appConfig.apiUrl

  }

  appInUse() {
    return !this.platFormService.webMode
  }

  getLocalApiUrl() {
    if ( localStorage.getItem('storedApiUrl')) {
      return localStorage.getItem('storedApiUrl');
    }
    return ''
  }

  apiBaseUrl() {

    if (this.apiUrl) { return this.apiUrl };

    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.apiUrl;
  }

  appGateEnabled() {
    if (this.apiUrl) {return false}
    return this.appConfig.useAppGate;
  }

  appGateMessage() {
    return this.appConfig.appGateMessage;
  }

}
