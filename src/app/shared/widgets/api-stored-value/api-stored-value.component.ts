import { Component, OnInit,NgZone  } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
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

  inputForm: FormGroup;
  currentAPIUrl  : any;
  version        : any;
  message        : string;
  isElectronApp  : boolean;
  electronVersion: string;
  isApp          : boolean;

  constructor(
      private router               : Router,
      public  platFormService      : PlatformService,
      private fb                   : FormBuilder,
      private authenticationService: AuthenticationService,
      private appInitService       : AppInitService,
      public  electronService      : ElectronService,
      private platformService      : PlatformService,
      private siteService          : SitesService,
      private ngZone               : NgZone,
      private IPCService           : IPCService,
    ) {

    this.currentAPIUrl = localStorage.getItem('storedApiUrl');

    if (this.platformService.isApp())  {
      if (this.router.url === '/app-apisetting') {
        this.router.navigate(['/login'])
      }
    }

    this.initRender();
    this.getVersion();
    this.isElectronApp = this.electronService.isElectronApp;
    this.isApp = this.platformService.isApp();
  }

  //for electrononly
  initRender() {
    try {
      if (!this.platFormService.isAppElectron) { return }
      this.IPCService._ipc.invoke('getVersion', (event, arg) => {
        this.ngZone.run(() => {
            this.version = arg
            this.electronVersion = arg
        });
      })
    } catch (error) {
      this.version  = 'unknown error'
    }
  }

  ngOnInit(): void {
    const currentAPIUrl = localStorage.getItem('storedApiUrl');
    this.inputForm = this.fb.group({
      apiUrl: [currentAPIUrl],
    });
  }

  async  setAPIUrl(){

    await this.clearUserSettings();
    this.authenticationService.clearUserSettings()

    const apiUrl = this.inputForm.controls['apiUrl'].value
    const result =  this.appInitService.setAPIUrl(apiUrl)

    if (!result || result == '') {return}

    this.appInitService.init();
    this.currentAPIUrl = apiUrl;
  }

  async clearUserSettings() {
    this.authenticationService.clearUserSettings();
    await this.siteService.clearAssignedSite();
  }

  checkForUpdate() {
    if (!this.electronService.isElectronApp) { return }
    this.IPCService._ipc.send('getVersion', 'ping');

    this.IPCService._ipc.addListener('getVersion', (event, pong) => {
      this.electronVersion = event;
      this.version = event;
    });
  }

  getVersion() {
    try{
      if (!this.platFormService.isAppElectron) { return }
      this.IPCService._ipc.sendSync('getVersion', 'ping');
    } catch (error) {
      this.version  = error
    }
  }

  getPong(): any {
    try{
      if (!this.electronService.isElectronApp) { return }
        this.IPCService._ipc.addListener('asynchronous-message', (event, pong) => {
      });
      return null
    } catch (error) {
      this.version  = error
    }
  }
}


