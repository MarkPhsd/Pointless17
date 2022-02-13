import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class IPCService {

  private _ipc: IpcRenderer | undefined;
  private isElectron: boolean;

  get isElectronApp() { return this.isElectron }

  constructor() {
    return

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
}
