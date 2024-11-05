import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})

export class IPCService {

  public _ipc: IpcRenderer | undefined;

  get isElectronApp(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor(private platformService: PlatformService) {
  }

   listPrinters() {
     if (this.isElectronApp && this._ipc) {
     }
   }

   getVersion(): any {
      // log.info('Requested Version')
      if (this._ipc) {
        this._ipc.on('getVersion', (event, data) => {
        console.log('getVersion event', event);
        console.log('getVersion data', data)
        return data
      });
   }
   return null
  }

  requestVersion(): any {
    if (this._ipc) {
      this._ipc.on('getVersion', (event, data) => {
        console.log('requestVersion  event', event);
        console.log('requestVersion data', data)
        return data
      }
    );
   }
   return null
  }

}
