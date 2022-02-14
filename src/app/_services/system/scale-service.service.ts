import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { PlatformService } from './platform.service';
import { IPCService } from 'src/app/_services/system/ipc.service';

export interface ScaleInfo {
  value        : string;
  type         : string;
  mode         : string;
  scaleStatus  : string;
  valueToDivide: string;
}

export interface ScaleSetup {
  timer             : number;
  decimalPlaces     : number;
  enabled           : boolean;
}

@Injectable({
  providedIn: 'root'
})

export class ScaleService  {

  // private scaleSetup        = {} as ScaleSetup;
  // private scaleInfo         = {} as ScaleInfo;
  private _scaleInfo          = new BehaviorSubject<ScaleInfo>(null);
  public scaleInfo$           = this._scaleInfo.asObservable();
  isApp                       = false;
  isElectronServiceInitiated  = false

  updateSubscription(scaleInfo: ScaleInfo) {
    this._scaleInfo.next(scaleInfo);
  }

  constructor(
    private electronService: ElectronService,
    private platformService: PlatformService,
    private IPCService :     IPCService,
    ) {
      if (!this.IPCService.isElectronApp) { return }
      this.readScaleEvent();
  }

  readScaleEvent() {
    try {
      const scaleSetup = this.getScaleSetup()
      if (!scaleSetup || !scaleSetup.enabled) { return }
      if (this.platformService.isAppElectron) {
      this.electronService.ipcRenderer.on('scaleInfo', (event, args) =>
          {
            const info         = {} as ScaleInfo;
            info.value         = this.getScaleWeighFormat(args.weight, scaleSetup.decimalPlaces);
            info.type          = args.type;
            info.mode          = args.mode;
            info.scaleStatus   = args.status;
            info.valueToDivide = args.valueToDivide
            this.updateSubscription(info)
          },
        );
      }
    } catch (error) {
      console.log('error read scale' , error)
    }
  }

  async readScale() {
    if (!this.IPCService.isElectronApp) { return }

    const scaleInfo = this.getScaleInfo();
    if (!scaleInfo) { return }
    this.updateSubscription(scaleInfo)
    return  scaleInfo

  }

  getScaleWeighFormat(value: string, decimalPlaces: number): string {
    if (!this.IPCService.isElectronApp) { return }
    try {
      // console.log(value)
      value = value.replace('[', '')
      // console.log(value)
      value = value.replace(']', '')
      // console.log(value)
      value = (+value * 1).toString(); //remove leading zeros on small numbers
      // console.log(value)
      value = parseFloat(value).toFixed(decimalPlaces); //set number of decimal places to show
      // console.log(value)
      return value;
    } catch (error) {
      return '-1';
    }
  }

  getScaleInfo(): ScaleInfo {
    if (this.IPCService.isElectronApp) {

      // this.electronService.ipcRenderer.on('scaleInfo', (event, scaleInfo) => {
      //   return scaleInfo
      // });
      return this.IPCService.readScale()
    }
    return null
  }

  getScaleSetup(): ScaleSetup {
    if (!this.IPCService.isElectronApp) { return }
    let scaleSetup =  JSON.parse(localStorage.getItem('ScaleSetup')) as ScaleSetup;

    if (scaleSetup) { return scaleSetup; }

    if (!scaleSetup) {
      this.initializeScaleSetup();
    }

    scaleSetup = JSON.parse(localStorage.getItem('ScaleSetup'))
    return  scaleSetup
  }

  initializeScaleSetup() {
    if (!this.IPCService.isElectronApp) { return }
    let scaleSetup                  = {}  as ScaleSetup;
    scaleSetup.decimalPlaces      = 2;
    scaleSetup.timer              = 500;
    scaleSetup.enabled            = true;
    this.updateScaleSetup(scaleSetup);
    return scaleSetup;
  }

  updateScaleSetup(scaleSetup: ScaleSetup) {
    localStorage.setItem('ScaleSetup', JSON.stringify(scaleSetup))
  }

}

      // this.electronService.ipcRenderer.on('scaleType', (event, args) => {
      //   // console.log('scaleType', args)
      //   scaleInfo.type = args
      // });
      // this.electronService.ipcRenderer.on('scaleWeight', (event, args) => {
      //   // console.log('scaleWeight', args)
      //   scaleInfo.value = parseInt(args)
      // });
      // this.electronService.ipcRenderer.on('scaleMode', (event, args) => {
      //   // console.log('scaleMode', args)
      //   scaleInfo.mode = args
      // });
      // this.electronService.ipcRenderer.on('scaleStatus', (event, args) => {
      //   // console.log('scaleMode', args)
      //   scaleInfo.scaleStatus = args
      // });

      // this.electronService.ipcRenderer.on('scaleMode', (event, args) => {
      //   scaleInfo.scaleMode = args
      // });
