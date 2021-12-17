import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ISite } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { SitesService } from '../reporting/sites.service';

declare var window: any;

@Injectable()
export class AppInitService  {

  appConfig         : any;
  private apiUrl    : any;
  public  useAppGate: boolean;
  public logo       : string;
  public company    : string;
  // public get appConfig
  private httpClient: HttpClient;

  constructor(handler: HttpBackend,
              private platFormService: PlatformService,
              private _snackbar: MatSnackBar,
              private platformService: PlatformService,

              private router: Router,) {

    this.platFormService.getPlatForm()
    this.httpClient = new HttpClient(handler);
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

    // if (apiUrl) {this.setAPIUrl(apiUrl)}
    this.apiUrl = this.getLocalApiUrl();
    console.log(this.apiUrl)
    console.log('routing to apisetting from app-init init is app:', this.isApp())

    if ( !this.apiUrl && this.isApp() ){
      console.log('routing to apisetting from app-init')
      this.useAppGate = false
      this.router.navigate(['/apisetting']);
      return
    }

    if (this.platFormService.webMode) {
      try {
        this.appConfig  = await this.httpClient.get('/assets/app-config.json').toPromise();
        this.apiUrl     = this.appConfig.apiUrl
        this.useAppGate = this.appConfig.useAppGate
        this.logo       = this.appConfig.logo;
        this.company    = this.appConfig.company
      } catch (error) {
        this.useAppGate = false
        this.router.navigate(['/apisetting']);
      }
    }
  }

  getLocalApiUrl() {
    const result = localStorage.getItem('storedApiUrl')
    const site = {} as ISite;
    site.url = result
    if (result != '' ) {
      return result;
    }
    return ''
  }


  setAPIUrl(apiUrl): string {
    if (apiUrl ) {
      try {
        const url = new URL(apiUrl);
        if (url) {
          localStorage.setItem('storedApiUrl', apiUrl)
          this.setAssignedSite(apiUrl)
          console.log('setAPIURL ', apiUrl)
          return apiUrl;
        }
      } catch (error) {
        this._snackbar.open('Url not formed properly.' + error, 'Failure')
      }
    }
    return ''
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
    console.log('apiBaseUrl ', this.isApp(), this.apiUrl,this.appConfig.apiUrl, localStorage.getItem('storedApiUrl'))

    if (this.isApp() && this.apiUrl) {
      this.apiUrl =  localStorage.getItem('storedApiUrl')
      return   this.apiUrl
    }
    if (!this.isApp())  {
      return this.appConfig.apiUrl;
      if (this.apiUrl) { return this.apiUrl };
    }

    if (!this.apiUrl) {
      this.apiUrl = localStorage.getItem('storedApiUrl')
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
