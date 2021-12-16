import { Injectable } from '@angular/core';
import { Capacitor, Plugins } from '@capacitor/core';
import { ElectronService } from 'ngx-electron';

export interface platFormInfo {
  platForm            : string;
  isApp               : boolean;
  isAppElectron       : boolean;
  isElectronServiceInitiated : boolean;
  androidApp          : boolean;
  webMode             : boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  platFormInfo    = {}  as platFormInfo;
  private _apiUrl       : any;

  get isAppElectron() {
    const info = this.getPlatForm()
    return info.isAppElectron
  }

  get androidApp()    {
    const info = this.getPlatForm()
    if(info) {
      return info.androidApp
    }
  }
  get platForm()      {
    return Capacitor.getPlatform();
  }
  get webMode()       {
    return Capacitor.getPlatform();
  }
  get apiUrl()        {
    return localStorage.getItem('storedApiUrl');
  }

  constructor(
    private electronService     : ElectronService,) {
    this.initAPIUrl();
    if (!this._apiUrl) {this._apiUrl =''};
    this.getPlatForm();
    console.log('platFormInfo', this.platFormInfo)
  }

  initAPIUrl() {
    this._apiUrl =  localStorage.getItem('storedApiUrl');
  }

  getPlatForm(): platFormInfo {
    this.platFormInfo         = {} as platFormInfo
    this.platFormInfo.webMode = false

    try {
      const platForm            = Capacitor.getPlatform();
      this.platFormInfo.platForm = platForm
      if (platForm === 'android') {
        this.platFormInfo.androidApp = true
        this.platFormInfo.platForm = 'android'
      }
      if (this.electronService.isElectronApp) {
        this.platFormInfo.isAppElectron = true
        this.platFormInfo.platForm = 'electron'
      }
      return this.platFormInfo
    } catch (error) {
      return this.platFormInfo
    }
  }

}
