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

  platFormInfo = {}  as platFormInfo;

  private _platForm: string;
  private _webMode : boolean
  private _isAppElectron: boolean;
  private _androidApp   : boolean;
  private _apiUrl       : any;

  get isAppElectron() { return this._isAppElectron}
  get androidApp()    { return this._androidApp}
  get platForm()      { return this._platForm}
  get webMode()       { return this._webMode}
  get apiUrl()        { return this._apiUrl }

  constructor(
      private electronService     : ElectronService,) {
      this._apiUrl =  localStorage.getItem('storedApiUrl');
      if (!this._apiUrl) {this._apiUrl =''};

     this.getPlatForm();
  }

  getplatFormInfo(): platFormInfo {

    const platFormInfo = this.platFormInfo;

    platFormInfo.androidApp = this._androidApp
    platFormInfo.isAppElectron = this._isAppElectron

    if (platFormInfo.androidApp || platFormInfo.isAppElectron) {
      this._webMode = false
      return
    }

    platFormInfo.webMode = this._webMode;

    return platFormInfo

  }

  getPlatForm() {

    this._platForm        =  Capacitor.getPlatform();
    const platForm        = this._platForm;
    this._webMode = false

    if (platForm === 'android') {
      this._androidApp = true
      return false
    }

    if (this.electronService.isElectronApp) {
      this._platForm = 'electron'
      this._isAppElectron = true;
      return
    }

    if (platForm === 'web') {
      this._webMode = true
      return
    }

  }

}
