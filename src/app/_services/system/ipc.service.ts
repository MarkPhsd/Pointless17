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
    if (window.require) {
      try {
        this._ipc       = window.require('electron').ipcRenderer;
      } catch (e) {
        // throw e;
      }
    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
   }


   listPrinters() {
    //  if (this.isElectron && this._ipc) {
    //   // this._ipc.
    //  }
   }

   readScale(): ScaleInfo {
     if (this._ipc) {
       this._ipc.on('scaleInfo', (event, scaleInfo) => {
        return scaleInfo
      });
    }
    return null
   }

   getVersion(): any {
    if (this._ipc) {
      this._ipc.on('getVersion', (event, data) => {
       return data
     });
   }
   return null
  }

  requestVersion(): any {
    if (this._ipc) {

      this._ipc.on('getVersion', (event, data) => {
       return data
     });
   }
   return null
  }

}
