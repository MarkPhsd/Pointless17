import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PlatformService } from 'src/app/_services/system/platform.service';

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
              private router: Router,) {

    this.platFormService.getPlatForm()
    this.httpClient = new HttpClient(handler);
  }

  isApp(): boolean {
    if (!this.platFormService.webMode) {
      return true
    }
  }
  //for distributed apps.
  //also make a setting that can be applied.
  //that setting can be local storage.
  //and it can override this value.
  //this can be assigned in settings after an initial login.

  async init() {

    // if (apiUrl) {this.setAPIUrl(apiUrl)}
    this.apiUrl = this.getLocalApiUrl();

    if (this.isApp) {
      if ( !this.apiUrl ){
        // if there is no API then the user needs to input one.
        //we also have to have a way to change or clear the API, just in case.
        // redirect to home if already logged in
        this.useAppGate = false
        this.router.navigate(['/apisetting']);
        return
      }
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
    if (result != '' ) {
      return result;
    }
    return ''
  }

  setAPIUrl(apiUrl): string {
    if (apiUrl ) {
      try {
        const url = new URL(apiUrl);
        localStorage.setItem('storedApiUrl', apiUrl)
        const result = localStorage.getItem('storedApiUrl')
        console.log('new APIUrl', result)
        return result
      } catch (error) {
        this._snackbar.open('Url not formed properly.' + error, 'Failure')
      }
    }
    return ''
  }

  appInUse() {
    return !this.platFormService.webMode
  }

  apiBaseUrl() {
    if (this.apiUrl) { return this.apiUrl };

    if (!this.apiUrl) {
      this.apiUrl = localStorage.getItem('storedApiUrl')
    }

    if (!this.appConfig) {

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
