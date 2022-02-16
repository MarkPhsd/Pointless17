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
}

declare var window: any;

@Injectable()
export class AppInitService  {

  appConfig         = {} as IAppConfig;
  private apiUrl    : any;
  public  useAppGate: boolean;
  public  logo       : string;
  public  company    : string;
  // public get appConfig
  private httpClient: HttpClient;

  constructor(handler: HttpBackend,
              private platFormService: PlatformService,
              private _snackbar: MatSnackBar,
              private platformService: PlatformService,
              private router: Router,) {

    this.platFormService.getPlatForm()
    this.httpClient = new HttpClient(handler);
    this.init();
  }

  isApp(): boolean {
    if (this.platformService.isAppElectron || this.platformService.androidApp)  {
      return true
    }
    return false
  }
  //for distributed apps.
  //also make a setting that can be applied.
  //that setting can be local storage.
  //and it can override this value.
  //this can be assigned in settings after an initial login.

  async init() {
    // console.log('app-init.ervice init', )
    this.apiUrl = this.getLocalApiUrl();
    const data  = await this.httpClient.get('assets/app-config.json').pipe().toPromise() as IAppConfig

    if ( !this.platFormService.isApp()  ) {
      if ( this.apiUrl === undefined && this.isApp() ){
        this.useAppGate = false
        this.router.navigate(['/apisetting']);
        return
      }
    }

    if ( !this.platFormService.isApp()  ) {
      if (data) {
        this.apiUrl     = data.apiUrl
        if (!data.apiUrl) {
          this._snackbar.open('Using demo data', 'Alert', {duration: 3000} )
          this.apiUrl     = "https://ccsposdemo.ddns.net:4443/api"
          data.apiUrl     = "https://ccsposdemo.ddns.net:4443/api"
          this.setAPIUrl(this.apiUrl)
        }
        this.useAppGate = data.useAppGate
        this.logo       = data.logo;
        this.company    = data.company
        this.appConfig  = data ;
      }
    }

    if ( this.platFormService.isApp()  ) {
      if (!data ) {
        this._snackbar.open('Using demo data', 'Alert', {duration: 3000} )
        this.apiUrl           = "https://ccsposdemo.ddns.net:4443/api"
        this.useAppGate       = false;
        this.logo             = "http://cafecartel.com/temp/logo.png";
        this.company          = 'Pointless'
        this.appConfig.apiUrl = this.apiUrl;
        this.useAppGate       = false;
        this.appConfig.logo   = this.logo;
        this.appConfig.company= 'Pointless'
      }
      if (this.apiUrl) {
      }
    }
  }

  setAPIUrl(apiUrl): string {

    if (apiUrl) {
      try {
        const url = new URL(apiUrl);
        if (url) {
          localStorage.setItem('storedApiUrl', apiUrl)
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
    if (result != null && result != '' ) {
      return result;
    }

    if (this.isApp() && !result ) {
       this._snackbar.open('Using demo data  - getLocalApiUrl', 'Alert', {duration: 3000} )
      localStorage.setItem('storedApiUrl', 'https://ccsposdemo.ddns.net:4443/api')
      return localStorage.getItem('storedApiUrl')
    }
  }

  setAssignedSite(apiUrl) {
    const site = {} as ISite
    site.url = apiUrl;
    localStorage.setItem("site.url", apiUrl)
  }

  appInUse() {
    return !this.platFormService.webMode
  }

  apiBaseUrl() {
    this.init();
    const urlSaved = this.getLocalApiUrl();
    if (this.isApp() && urlSaved != undefined) {
      this.apiUrl =  urlSaved
      return   this.apiUrl
    }

    if (!this.isApp())  {
      return this.appConfig.apiUrl;
    }

    if (!this.apiUrl) {
      this.apiUrl = this.getLocalApiUrl();
      if ( this.apiUrl ){
        return  this.apiUrl
      }
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

}
