import {  Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { PlatformService } from './platform.service';
import { IPCService } from 'src/app/_services/system/ipc.service';
import { Capacitor } from '@capacitor/core';
import { T } from '@angular/cdk/keycodes';

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

  constructor(
    private electronService: ElectronService,
    private platformService: PlatformService,
    public IPCService :     IPCService
    ) {
    if (!this.IPCService.isElectronApp) { return }
    this.readScaleEvent();
  }

  readScaleEvent() {
    try {
      const scaleSetup = this.getScaleSetup()
      // console.log('scale setup', scaleSetup, this.platformService.isAppElectron)
      if (!scaleSetup || !scaleSetup.enabled) { return }
      // console.log('active')
      if (this.platformService.isAppElectron) {

        // console.log('electron ')
        this.electronService.ipcRenderer.on('scaleInfo', (event, args) =>

          {
            // console.log('events', event, args)
            const info         = {} as ScaleInfo;
            info.value         = this.getScaleWeighFormat(args.weight, scaleSetup.decimalPlaces);
            info.type          = args.type;
            info.mode          = args.mode;
            info.scaleStatus   = args.status;
            info.valueToDivide = args.valueToDivide

            // console.log('scale info', info)
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
    }
    return null
  }

  getScaleSetup(): ScaleSetup {
    if (!this.IPCService.isElectronApp) { return }
    let scaleSetup =  JSON.parse(localStorage.getItem('ScaleSetup')) as ScaleSetup;
    if (scaleSetup) { return scaleSetup; }
    scaleSetup = JSON.parse(localStorage.getItem('ScaleSetup'))
    return  scaleSetup
  }

  initializeScaleSetup() {
    if (!this.IPCService.isElectronApp) { return }
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

  startScaleApp() {
    try {
      if ( !this.platformService.isAppElectron) { return }
    } catch (error) {
      return;
    }
    if (!this.platformService.isAppElectron) { return }
    const childProcess = this.electronService.remote.require('child_process');
    const pathToExec = 'C:\\pointless\\restarter.exe scaleservice.exe'; // Update this to your executable path
    this.execProcess = childProcess.exec(pathToExec, function (err, data) {
      if(err) {
        console.error(err);
        return;
      }
      console.log(data.toString());
    });
    if (this.execProcess) {
      this.processID = this.execProcess.pid;
    }
  }

  killScaleProcess() {
    console.log('pid', this.processID)
    if (!this.processID) {
      console.log('processID')
      return
    }
    this.killProcessById(this.processID)
  }

  public killProcessById(processId: number) {
    if (!this.electronService.isElectronApp) { return}
      const childProcess = this.electronService.remote.require('child_process');

      // Command that kills the process with the given process ID
      let command = `taskkill /PID ${processId} /F`;

      childProcess.exec(command, (err, stdout, stderr) => {

        if (err) {
          console.error('Error:', err);
          return;
        }

        if (stderr) {
          console.error('Stderr:', stderr);
          return;
        }

        console.log('std Out', stdout);
      });
    }


  startProcess(name: string) {
    try {
      if ( !this.platformService.isAppElectron) { return }
    } catch (error) {
      return;
    }
    if (!this.platformService.isAppElectron) { return }
    const childProcess = this.electronService.remote.require('child_process');
    const pathToExec = `C:\\pointless\\${name}`; // Update this to your executable path
    this.execProcess = childProcess.exec(pathToExec, function (err, data) {
      if(err) {
        console.error(err);
        return;
      }
      console.log(data.toString());
    });
  }


  public killProcessByName(processName: string) {
    try {
      if (!this.platformService.isAppElectron) { return }
    } catch (error) {
      return;
    }
    const childProcess = this.electronService.remote.require('child_process');
    // Command that gets the IDs of all processes with the given name
    let command = `taskkill /F /IM ${processName} /T`;

    try {
      childProcess.exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        if (stderr) {
          console.error(stderr);
          return;
        }
        console.log(stdout);
      });
    } catch (error) {

    }

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
