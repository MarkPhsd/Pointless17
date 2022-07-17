import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { ScaleInfo } from './scale-service.service';
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})

export class IPCService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;

  public _ipc: IpcRenderer | undefined;

  get isElectronApp(): boolean {
    try {
      // console.log('window.process.type', window.process.type)
    } catch (error) {

    }

    return !!(window && window.process && window.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectronApp) {
      this.ipcRenderer  = window.require('electron').ipcRenderer;
      this.webFrame     = window.require('electron').webFrame;
      this.childProcess = window.require('child_process');
      this.fs           = window.require('fs');
      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

   listPrinters() {
     if (this.isElectronApp && this._ipc) {
      // this._ipc.
     }
   }

   //move to feature service.
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
