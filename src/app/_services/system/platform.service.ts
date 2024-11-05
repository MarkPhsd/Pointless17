import { Injectable } from '@angular/core';
import { Capacitor} from '@capacitor/core';

export interface platFormInfo {
  platForm            : string;
  isApp               : boolean;
  isAppElectron       : boolean;
  isElectronServiceInitiated : boolean;
  androidApp          : boolean;
  webMode             : boolean;
}

@Injectable({providedIn: 'root'})

export class PlatformService {

  get scrollStyleWide() {
    if (this.isApp) {
      if (this.isAppElectron)  {
        return 'scrollstyle_1'
      }
    }
    return ''
  }

  platFormInfo    = {}  as platFormInfo;
  private _apiUrl       : any;

  get isAppElectron() {
    // console.log(window?.process?.versions?.electron)
    return !!(window['electron'] && window['electron'].isElectron)
    // return !!(window && window.process && window.process.versions && window.process.versions.electron);
  }

  get androidApp()    {
    const info = this.getPlatForm()
    if(info.androidApp) {
      return true
    }
    return false
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

  isApp(): boolean {
    if (this.isAppElectron || this.androidApp)  {
      return true
    }
    return false
  }

  constructor(

     ) {
    this.initAPIUrl();
    if (!this._apiUrl) {this._apiUrl =''};
    this.getPlatForm();
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
      if (this.isAppElectron) {
        this.platFormInfo.isApp = true;
        this.platFormInfo.isAppElectron = true;
        this.platFormInfo.platForm = 'electron'
      }
      return this.platFormInfo

    } catch (error) {
      return this.platFormInfo
    }
  }

}
