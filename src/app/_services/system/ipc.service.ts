import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { ScaleInfo } from './scale-service.service';
import { BrowserWindow, app } from '@electron/remote';
// import { shell } from 'electron';

declare global {
  interface Window {
    ipcRenderer: IpcRenderer
  }
}

export const { ipcRenderer } = window;


@Injectable({
  providedIn: 'root'
})

export class IPCService {
  // shell: typeof shell;
  public _ipc: IpcRenderer | undefined;
  // private isElectron: boolean;

  get isNodeRequired() {return window.require}

  get isElectronApp() {
      if (app) {
        return true
      }
      return false
   }

  constructor() {
    if ((window).require) {
      try {

      } catch (e) {
        // throw e;
    }
  }}

   listPrinters() {
    //  if (this.isElectron && this._ipc) {
    //   // this._ipc.
    //  }
   }

   readScale(): ScaleInfo {
     if (this._ipc) {
       this._ipc.on('readScale', (event, data) => {
        console.log('scaleInfo event', data);
        console.log('scaleInfo data', data)
        return data
      });
    }
    return null
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
