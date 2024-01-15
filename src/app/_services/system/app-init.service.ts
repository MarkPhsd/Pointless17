import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ISite } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
export interface IAppConfig {
  apiUrl : string
  useAppGate: boolean;
  logo: string;
  company: string;
  appUrl: string;
  appGateMessage: string;
  googleTrackingKey: string;
}

declare var window: any;

@Injectable()
export class AppInitService  {

  initialized       = false;
  appConfig         = {} as IAppConfig;
  private apiUrl    : any;
  public  useAppGate: boolean;
  public  logo       : string;
  public  company    : string;
  // public get appConfig
  private httpClient: HttpClient;

  isApp(): boolean {
    if (this.platformService.isAppElectron || this.platformService.androidApp)  {
      return true
    }
    return false
  }

  constructor(handler: HttpBackend,
              private platFormService: PlatformService,
              private _snackbar: MatSnackBar,
              private platformService: PlatformService,
              private router: Router,) {
    this.platFormService.getPlatForm()
    this.httpClient = new HttpClient(handler);
    this.init();
  }

  //for distributed apps.
  //also make a setting that can be applied.
  //that setting can be local storage.
  //and it can override this value.
  //this can be assigned in settings after an initial login.

  async getGoogleTrackingID() { 
    const config = await this.httpClient.get('assets/app-config.json').toPromise()  as IAppConfig
    return config.googleTrackingKey    
  }

  async init() {

    const rememberMe =  localStorage.getItem('rememberMe');
    this.apiUrl      = this.getLocalApiUrl();
    const isApp      = this.platFormService.isApp();

    if (!rememberMe || rememberMe != 'true') {
      this.clearUserSettings();
    }

    if (!rememberMe || rememberMe != 'true') {
      if (!this.initialized && isApp ) {
        this.initialized = true;
        this.router.navigate(['/login']);
        return;
      }
    }

    const config = await this.httpClient.get('assets/app-config.json').toPromise()  as IAppConfig

    if ( !isApp && config) {
      //we can use this for the online free site so anyone can use a site for their own store.
      if (  config.apiUrl === undefined ||  config.apiUrl === 'domain'){
        this.useAppGate = false
        this.router.navigate(['/apisetting']);
        return
      }

      if (!config.apiUrl) {
        this.apiUrl     = "https://pointlessposdemo.com/api"
        config.apiUrl     = "https://pointlessposdemo.com/api"
        this.setAPIUrl(this.apiUrl)
      }

      this.useAppGate = config.useAppGate
      this.logo       = config.logo;
      this.company    = config.company
      this.appConfig  = config ;

      // if someone already set the api.
      if (!this.apiUrl) {
        this.apiUrl     = config.apiUrl;
        return;
      }

      return;
    }

    if ( isApp && !this.apiUrl ) {

    }

    if ( isApp && !this.apiUrl ) {

      if (!this.platformService.androidApp && !this.platformService.isAppElectron){
        this._snackbar.open('Using demo data', 'Close', {duration: 3000} )
      }

      this.apiUrl           = "https://pointlessposdemo.com/api"
      this.useAppGate       = false;
      this.logo             = "http://pointlesspos.com/temp/logo.png";
      this.company          = 'Pointless'
      this.appConfig.apiUrl = this.apiUrl;
      this.useAppGate       = false;
      this.appConfig.logo   = this.logo;
      this.appConfig.company= 'Pointless'
      this.setAPIUrl(this.apiUrl)
      return;
    }

    if (this.apiUrl) {
      return;
    }

  }

  setAPIUrl(apiUrl): string {

    if (apiUrl) {
      try {
        const url = new URL(apiUrl);
        if (url) {
          localStorage.setItem('storedApiUrl', apiUrl);
          localStorage.setItem("site.url"    , apiUrl)
          this.setAssignedSite(apiUrl)
          return apiUrl;
        }
      } catch (error) {
        this._snackbar.open('Url not formed properly.' + error, 'Failure')
      }
    }
    return ''
  }

  //matching code in Site service
  //matching code in app-init-service.
  getLocalApiUrl() {
    const result = localStorage.getItem('storedApiUrl')
    const site = {} as ISite;
    site.url = result
    if (this.isApp() && !result ) {
      this.router.navigate(['/apisetting']);
      return ;
    }
    return site.url;
  }

  setAssignedSite(apiUrl) {
    const site = {} as ISite
    site.url = apiUrl;
    localStorage.setItem("site.url", apiUrl)
    localStorage.setItem('storedApiUrl', apiUrl)
  }

  appInUse() {
    return !this.platFormService.webMode
  }

  apiBaseUrl() {

    const urlSaved = this.getLocalApiUrl();

    if (this.isApp() && urlSaved ) {
      this.apiUrl =  urlSaved
      return   this.apiUrl
    }

    if (urlSaved) { return urlSaved; }

    if (!this.isApp() && this.appConfig && this.appConfig.apiUrl)  {
      return this.appConfig.apiUrl;
    }

    if ((!this.appConfig || !this.apiUrl) && this.isApp()) {
      this.useAppGate = false
      this.router.navigate(['/apisetting']);
      return ''
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

  clearUserSettings(){
    localStorage.removeItem("ami21");
    localStorage.removeItem('user');
    localStorage.removeItem('userx');
    localStorage.removeItem('site')
    localStorage.removeItem('orderSubscription')
  }

}

