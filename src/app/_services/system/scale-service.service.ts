import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { ElectronService } from 'ngx-electron';
import { PlatformService } from './platform.service';
import { IPCService } from 'src/app/_services/system/ipc.service';
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

// declare global {
//   interface Window {
//     electron: {
//       readScaleEvent: (callback: (args: any) => void) => void;
//     };
//   }
// }


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
    public IPCService :     IPCService,
    private siteService: SitesService,
    private _ngZone: NgZone
    ) {
    if (!this.IPCService.isElectronApp) { return }
    this.readScaleEvent();
  }

  readScaleEvent() {
    if (!this.IPCService.isElectronApp) { return }
    const scaleSetup = this.getScaleSetup()
    if (!scaleSetup || !scaleSetup.enabled) { return }

    this.outSizeAngular(scaleSetup)

    // this.electronService.ipcRenderer.on('scaleInfo', (event, args) =>
    //   {
    //     this.updateScaleValues(args, scaleSetup.decimalPlaces)
    //   }
    // );

  }

  outSizeAngular(scaleSetup: any): void {
    this._ngZone.runOutsideAngular(() => {
      (window as any).electron.onScaleInfo((event: any, args: any) => {
        this.updateScaleValues(args, scaleSetup.decimalPlaces);
      });
    });
  }

  // outSizeAngular(scaleSetup) {
  //   this._ngZone.runOutsideAngular(() => {
  //     this.electronService.ipcRenderer.on('scaleInfo', (event, args) =>
  //     {
  //         this.updateScaleValues(args, scaleSetup.decimalPlaces)
  //       }
  //     );
  //   })
  // }

  //move to feature service.
  //  readScaleEventIPC(): ScaleInfo {
  //   if (!this.IPCService.isElectronApp) { return }

  //   this.electronService.ipcRenderer.on('scaleWeight', (event, args) => {
  //     console.log(args);
  //   });
  //   // If you need to request data from the main process:
  //   this.electronService.ipcRenderer.send('request-scaleWeight');
  // }

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

  // startScaleApp() {
  //   if ( !this.platformService.isAppElectron) { return }
  //   const childProcess = this.electronService.remote.require('child_process');
  //   const pathToExec = 'C:\\pointless\\restarter.exe scaleservice.exe'; // Update this to your executable path
  //   this.execProcess = childProcess.exec(pathToExec, function (err, data) {
  //     if(err) {
  //       console.error(err);
  //       return;
  //     }
  //   });

  //   if (this.execProcess) {
  //     this.processID = this.execProcess.pid;
  //   }
  // }

  async startScaleApp(): Promise<void> {
    if (!this.platformService.isAppElectron) {
      return;
    }

    const pathToExec = 'C:\\pointless\\restarter.exe scaleservice.exe'; // Update this as needed
    try {
      const response = await (window as any).electron.startScaleApp(pathToExec);
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

  // public killProcessById(processId: number) {
  //   if (!this.platformService.isAppElectron) { return}
  //     const childProcess = this.electronService.remote.require('child_process');
  //     let command = `taskkill /PID ${processId} /F`;
  //     childProcess.exec(command, (err, stdout, stderr) => {
  //       if (err) {
  //         console.error('Error:', err);
  //         return;
  //       }
  //       if (stderr) {
  //         return;
  //       }
  //     });
  //   }

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


  // startProcess(name: string) {
  //   try {
  //     if ( !this.platformService.isAppElectron) { return }
  //   } catch (error) {
  //     return;
  //   }
  //   if (!this.platformService.isAppElectron) { return }
  //   const childProcess = this.electronService.remote.require('child_process');
  //   const pathToExec = `C:\\pointless\\${name}`; // Update this to your executable path
  //   this.execProcess = childProcess.exec(pathToExec, function (err, data) {
  //     if(err) {
  //       console.error(err);
  //       return;
  //     }
  //     console.log(data.toString());
  //   });
  // }
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


  // public killProcessByName(processName: string) {
  //   try {
  //     if (!this.platformService.isAppElectron) { return }
  //   } catch (error) {
  //     return;
  //   }
  //   const childProcess = this.electronService.remote.require('child_process');
  //   // Command that gets the IDs of all processes with the given name
  //   let command = `taskkill /F /IM ${processName} /T`;

  //   try {
  //     childProcess.exec(command, (err, stdout, stderr) => {
  //       if (err) {
  //         console.error(err);
  //         return;
  //       }
  //       if (stderr) {
  //         console.error(stderr);
  //         return;
  //       }
  //       console.log(stdout);
  //     });
  //   } catch (error) {

  //   }
  // }

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
