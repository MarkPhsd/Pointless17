import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { ElectronService } from 'ngx-electron';
import { PlatformService } from './platform.service';
import { Capacitor } from '@capacitor/core';
// import { ipcRenderer } from 'electron';
import { NgZone } from '@angular/core';
import { SitesService } from '../reporting/sites.service';


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

  get platForm() {  return Capacitor.getPlatform(); }
  // private scaleSetup        = {} as ScaleSetup;
  // private scaleInfo         = {} as ScaleInfo;
  public scaleInfo : ScaleInfo;
  private _scaleInfo          = new BehaviorSubject<ScaleInfo>(null);
  public scaleInfo$           = this._scaleInfo.asObservable();
  isApp                       = false;
  isElectronServiceInitiated  = false
  private execProcess = null; // Store reference to process
  processID: number;

  updateSubscription(scaleInfo: ScaleInfo) {
    this.scaleInfo = scaleInfo;
    this._scaleInfo.next(scaleInfo);
  }

  // private electronService: ElectronService,
  constructor(
    private platformService: PlatformService,
    private siteService: SitesService,
    private _ngZone: NgZone
    ) {
      if (!this.platformService.isAppElectron) { return }
    this.readScaleEvent();
  }

  readScaleEvent() {
    if (!this.platformService.isAppElectron) { return }
    const scaleSetup = this.getScaleSetup()
    if (!scaleSetup || !scaleSetup.enabled) { return }
    this.outSideAngular(scaleSetup)
  }

  outSideAngular(scaleSetup: any): void {
    console.log('scale info from electron')
    this._ngZone.runOutsideAngular(() => {
      (window as any).electron.onScaleInfo((event: any, args: any) => {
        // console.log('outSideAngular Scale', args)
        this.updateScaleValues(args, scaleSetup.decimalPlaces);
      });
    });
  }

  updateScaleValues(args, decimalPlaces) {
    if (!args.weight) { args.weight = 0}
    const info         = {} as ScaleInfo;
    info.value         = this.getScaleWeighFormat(args?.weight, decimalPlaces);
    info.type          = args.type;
    info.mode          = args.mode;
    info.scaleStatus   = args.status;
    info.valueToDivide = args.valueToDivide;
    this.updateSubscription(info)
  }

  async readScale() {
    if (!this.platformService.isAppElectron) { return }
    const scaleInfo = this.getScaleInfo();
    if (!scaleInfo) { return }
    this.updateSubscription(scaleInfo)
    return  scaleInfo
  }

  getScaleWeighFormat(value: string, decimalPlaces: number): string {
    if (!this.platformService.isAppElectron) { return }
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
    // return this.getScaleSetup()
    return null
  }

  getScaleSetup(): ScaleSetup {
    if (!this.platformService.isAppElectron) { return }
    let scaleSetup =  JSON.parse(localStorage.getItem('ScaleSetup')) as ScaleSetup;
    console.log('scalesetup', scaleSetup)
    if (scaleSetup) { return scaleSetup; }
    scaleSetup = JSON.parse(localStorage.getItem('ScaleSetup'))
    console.log('getScaleSetup scalesetup', scaleSetup)
    return  scaleSetup
  }

  initializeScaleSetup() {
    if (!this.platformService.isAppElectron) { return }
    let scaleSetup                  = {}  as ScaleSetup;
    scaleSetup.decimalPlaces      = 2;
    scaleSetup.timer              = 250;
    scaleSetup.enabled            = true;
    this.updateScaleSetup(scaleSetup);
    return scaleSetup;
  }

  updateScaleSetup(scaleSetup: ScaleSetup) {
    localStorage.setItem('ScaleSetup', JSON.stringify(scaleSetup))
  }

  initScaleService() {
    const scale = this.getScaleSetup()
    if (scale &&  this.platformService.isAppElectron) {
      if (scale && scale.enabled) {
        this.startScaleApp();
      }
    }
  }

  async startScaleApp(): Promise<void> {
    if (!this.platformService.isAppElectron) { return  }

    const pathToExec = 'C:\\pointless\\restarter.exe scaleservice.exe'; // Update this as needed
    try {
      const response = await (window as any).electron.startApp(pathToExec);
      if (response && response.pid) {
        this.processID = response.pid;
        console.log('Scale app started with PID:', this.processID);
      }
    } catch (error) {
      console.error('Failed to start scale app:', error);
      this.siteService.notify(`Failed to start scale app: ${error}`, 'Close', 3000, 'red');
    }
  }

  killScaleProcess() {
    if (!this.processID) {
      return
    }
    this.killProcessById(this.processID)
  }

  public async killProcessById(processId: number): Promise<void> {
    if (!this.platformService.isAppElectron) {
      return;
    }

    try {
      const success = await (window as any).electron.killProcess(processId);
      if (success) {
        console.log(`Process ${processId} killed successfully`);
      }
    } catch (error) {
      console.error(`Failed to kill process ${processId}:`, error);
      this.siteService.notify(`Failed to kill process ${processId}: ${error}`, 'Close', 3000, 'red');
    }
  }

  async startProcess(name: string): Promise<void> {
    if (!this.platformService.isAppElectron) {   return;   }
    const pathToExec = `C:\\pointless\\${name}`; // Customize this path as needed
    try {
      const response = await (window as any).electron.startApp(pathToExec);
      if (response && response.pid) {
        this.execProcess = response.pid;
        console.log(`${name} started with PID:`, this.execProcess);
      }
    } catch (error) {
      console.error(`Failed to start ${name}:`, error);
      this.siteService.notify(`Failed to start ${name}: ${error}`, 'Close', 3000, 'red');
    }
  }

  public async killProcessByName(processName: string): Promise<void> {
    if (!this.platformService.isAppElectron) {
      return;
    }

    try {
      const success = await (window as any).electron.killProcessByName(processName);
      if (success) {
        console.log(`Process ${processName} killed successfully`);
      }
    } catch (error) {
      console.error(`Failed to kill process ${processName}:`, error);
      this.siteService.notify(`Failed to kill process ${processName}: ${error}`, 'Close', 3000, 'red');
    }
  }

}
