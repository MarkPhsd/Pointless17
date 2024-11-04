import { Component, OnInit,NgZone  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
// import { ElectronService } from 'ngx-electron';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { IPCService } from 'src/app/_services/system/ipc.service';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'api-stored-value',
  templateUrl: './api-stored-value.component.html',
  styleUrls: ['./api-stored-value.component.scss']
})
export class ApiStoredValueComponent implements OnInit {

  inputForm: UntypedFormGroup;
  currentAPIUrl  : any;
  version        : any;
  message        : string;
  isElectronApp  : boolean;
  electronVersion: string;
  isApp          : boolean;
  newAPI: string;
  constructor(
      private router               : Router,
      public  platFormService      : PlatformService,
      private fb                   : UntypedFormBuilder,
      private authenticationService: AuthenticationService,
      private appInitService       : AppInitService,
      // public  electronService      : ElectronService,
      private platformService      : PlatformService,
      private siteService          : SitesService,
      private ngZone               : NgZone,
      private IPCService           : IPCService,
      private matSnack             : MatSnackBar,
    ) {

    this.currentAPIUrl = localStorage.getItem('storedApiUrl');

    if (this.platformService.isApp())  {
      if (this.router.url === '/app-apisetting') {
        this.router.navigate(['/login'])
      }
    }

    this.initRender();
    this.getVersion();
    this.isElectronApp = this.platFormService.isAppElectron;
    this.isApp = this.platformService.isApp();
  }

  typeHttps() {
    const value = this.inputForm.controls['apiUrl'].value;
    this.inputForm.patchValue({apiUrl: 'https://'})
  }

  typeAPI() {
    //apiUrl
    const value = this.inputForm.controls['apiUrl'].value;
    let url = `${value}/api`
    this.inputForm.patchValue({apiUrl: url})
  }

  //for electrononly
  initRender(): void {
    if (!this.platformService.isAppElectron) {
      return;
    }

    (window as any).electron.onGetVersion((arg: any) => {
      this.ngZone.run(() => {
        this.version = arg;
        this.electronVersion = arg;
      });
    });
  }

  ngOnInit(): void {
    let currentAPIUrl = localStorage.getItem('storedApiUrl');

    if (currentAPIUrl) {
      currentAPIUrl = currentAPIUrl.replace( 'https://', '')
      currentAPIUrl = currentAPIUrl.replace( '/api', '')
    }

    this.inputForm = this.fb.group({
      apiUrl: [currentAPIUrl],
    });
    this.inputForm.valueChanges.subscribe(data => {
      this.newAPI  = `https://${data.apiUrl}/api`
    })
  }

  setAPIUrl(){
    this.clearUserSettings();
    this.authenticationService.clearUserSettings()
    localStorage.setItem('rememberMe', 'true')
    const apiUrl = this.inputForm.controls['apiUrl'].value
    const url = `https://${apiUrl}/api`
    const result =  this.appInitService.setAPIUrl(url)
    if (!result || result == '') {return}
    this.appInitService.init();
    this.currentAPIUrl = url;
  }

  clearUserSettings() {
    this.authenticationService.clearUserSettings();
    this.siteService.clearBucket();
  }

  checkNode() {
    this.matSnack.open('checkNode ' + this.IPCService.isElectronApp, 'status')
  }

  checkForUpdate() {
    if (!this.platFormService.isAppElectron) { return }
    this.IPCService._ipc.send('getVersion', 'ping');

    this.IPCService._ipc.addListener('getVersion', (event, pong) => {
      this.electronVersion = event;
      this.version = event;
    });
  }


  checkIfIsElectron() {
    this.matSnack.open('Is Electron ' +  this.IPCService.isElectronApp, 'status')
  }

  getVersion(): void {
    if (!this.platformService.isAppElectron) {
      return;
    }

    // Send the version request
    (window as any).electron.getVersion();

    // Listen for the version response
    (window as any).electron.onVersionResponse((version: string) => {
      this.ngZone.run(() => {
        this.version = version;
        this.electronVersion = version;
      });
    });
  }

  getPong(): any {
    try{
      if (!this.platFormService.isAppElectron) { return }
        this.IPCService._ipc.addListener('asynchronous-message', (event, pong) => {
      });
      return null
    } catch (error) {
      this.version  = error
    }
  }
}


