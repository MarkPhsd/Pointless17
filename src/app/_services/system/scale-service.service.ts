import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from 'ngx-electron';

export interface ScaleInfo {
  value      : number;
  type       : string;
  mode       : string;
  scaleStatus: string;
  scaleMode  : string;
}

@Injectable({
  providedIn: 'root'
})
export class ScaleService  {

  scaleInfo = {} as ScaleInfo;
  private _scaleInfo          = new BehaviorSubject<ScaleInfo>(null);
  public scaleInfo$           = this._scaleInfo.asObservable();
  isApp                       = false;
  isElectronServiceInitiated  = false

  update(scaleInfo: ScaleInfo) {
    this._scaleInfo.next(scaleInfo);
  }

  constructor(
    private electronService: ElectronService,
    ) {
    if (this.electronService.remote != null) {
      this.isElectronServiceInitiated = true
      const  scaleInfo = {} as ScaleInfo;
      //  console.log('Service Initiated constructor', this.isElectronServiceInitiated)
      setInterval( () => {
        if (this.isElectronServiceInitiated) {
          this.electronService.ipcRenderer.on('scaleType', (event, args) => {
            // console.log('scaleType', args)
            scaleInfo.type = args
          });
          this.electronService.ipcRenderer.on('scaleWeight', (event, args) => {
            // console.log('scaleWeight', args)
            scaleInfo.value = args
          });
          this.electronService.ipcRenderer.on('scaleMode', (event, args) => {
            // console.log('scaleMode', args)
            scaleInfo.mode = args
          });
          // console.log(scaleInfo)
          this.update(scaleInfo)
      }} , 250)
    }
  }

  // ngOnInit() {
  //   this.readScale();
  // }

  readScale() {
    const  scaleInfo = {} as ScaleInfo;

    if (this.isElectronServiceInitiated) {
      this.electronService.ipcRenderer.on('scaleType', (event, args) => {
        // console.log('scaleType', args)
        scaleInfo.type = args
      });
      this.electronService.ipcRenderer.on('scaleWeight', (event, args) => {
        // console.log('scaleWeight', args)
        scaleInfo.value = parseInt(args)
      });
      this.electronService.ipcRenderer.on('scaleMode', (event, args) => {
        // console.log('scaleMode', args)
        scaleInfo.mode = args
      });
      this.electronService.ipcRenderer.on('scaleStatus', (event, args) => {
        // console.log('scaleMode', args)
        scaleInfo.scaleStatus = args
      });

      this.electronService.ipcRenderer.on('scaleMode', (event, args) => {
        scaleInfo.scaleMode = args
      });

      this.update(scaleInfo)
      return  scaleInfo;

    }
  }

}
