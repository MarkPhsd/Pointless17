import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { ScaleInfo } from './scale-service.service';

@Injectable({
  providedIn: 'root'
})
export class IPCService {

  private _ipc: IpcRenderer | undefined;
  private isElectron: boolean;

  get isElectronApp() { return this.isElectron }

  constructor() {
    if (window.require) {
      try {
        this._ipc       = window.require('electron').ipcRenderer;
        this.isElectron = true;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
   }

   listPrinters() {
     if (this.isElectron && this._ipc) {
      // this._ipc.
     }
   }

   readScale(): ScaleInfo {
     if (this._ipc) {
      //  this._ipc.on('scaleReadInfo')
       this._ipc.on('scaleInfo', (event, scaleInfo) => {
        return scaleInfo
      });
    }
    return null
   }

   getVersion(): ScaleInfo {
    if (this._ipc) {
     //  this._ipc.on('scaleReadInfo')
      this._ipc.on('getVersion', (event, scaleInfo) => {
       return scaleInfo
     });
   }
   return null
  }


}
