import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { ScaleInfo } from './scale-service.service';

@Injectable({
  providedIn: 'root'
})

export class IPCService {

  public _ipc: IpcRenderer | undefined;
  private isElectron: boolean;

  get isElectronApp() { return this.isElectron }

  constructor() {
    if ((window).require) {
      try {
<<<<<<< HEAD

      } catch (e) {
        // throw e;
    }
  }}
=======
        this._ipc       = window.require('electron').ipcRenderer;
        this.isElectron = true;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
   }
>>>>>>> parent of 6173ff66... Not working

   listPrinters() {
     if (this.isElectron && this._ipc) {
      // this._ipc.
     }
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
