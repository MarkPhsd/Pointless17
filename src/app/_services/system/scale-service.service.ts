import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from 'ngx-electron';

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
    ) {

    //set a scale timer that can be adjusted. set to local storage.
    // this.readScaleOnInterval();
    this.readScaleEvent();
  }


  // readScaleOnInterval() {
  //   const scaleSetup = this.getScaleSetup()

  //   if (!scaleSetup || !scaleSetup.enabled) { return }
  //   if (this.electronService.remote != null) {
  //     this.isElectronServiceInitiated = true
  //     setInterval( () => {
  //       this.electronService.ipcRenderer.on('scaleInfo', (event, args) => {
  //         const info         = {} as ScaleInfo;
  //         info.value         = this.getScaleWeighFormat(args.weight, scaleSetup.decimalPlaces);
  //         info.type          = args.type;
  //         info.mode          = args.mode;
  //         info.scaleStatus   = args.status;
  //         info.valueToDivide = args.valueToDivide
  //         this.updateSubscription(info)
  //       });
  //     },
  //     +scaleSetup.timer * 1000)
  //   }
  // }

  readScaleEvent() {
    const scaleSetup = this.getScaleSetup()
    if (!scaleSetup || !scaleSetup.enabled) { return }
    if (this.electronService.remote != null) {
    this.electronService.ipcRenderer.on('scaleInfo', (event, args) =>
        {
          const info         = {} as ScaleInfo;
          info.value         = this.getScaleWeighFormat(args.weight, scaleSetup.decimalPlaces);
          info.type          = args.type;
          info.mode          = args.mode;
          info.scaleStatus   = args.status;
          info.valueToDivide = args.valueToDivide
          // console.log('info', info)
          // console.log('event', event)
          this.updateSubscription(info)
        },
      );
    }
  }

  getScaleWeighFormat(value: string, decimalPlaces: number): string {
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
    this.electronService.ipcRenderer.on('scaleInfo', (event, scaleInfo) => {
      return scaleInfo
    });
    return null
  }

  getScaleSetup(): ScaleSetup {
    let scaleSetup =  JSON.parse(localStorage.getItem('ScaleSetup')) as ScaleSetup;

    if (scaleSetup) { return scaleSetup; }

    if (!scaleSetup) {
      this.initializeScaleSetup();
    }

    scaleSetup = JSON.parse(localStorage.getItem('ScaleSetup'))
    return  scaleSetup
  }

  async readScale() {
    if (this.isElectronServiceInitiated) {
      const scaleInfo = this.getScaleInfo();
      this.updateSubscription(scaleInfo)
      return  scaleInfo
    }
    return  null;
  }

  initializeScaleSetup() {
    let scaleSetup = {}  as ScaleSetup;
    scaleSetup.decimalPlaces      = 2;
    scaleSetup.timer              = 500;
    scaleSetup.enabled            = true;
    this.updateScaleSetup(scaleSetup);
    // console.log('scale setup', scaleSetup)
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
