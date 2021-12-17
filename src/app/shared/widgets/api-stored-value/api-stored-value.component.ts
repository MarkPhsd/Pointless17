import { Component, OnInit,NgZone  } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { AuthenticationService } from 'src/app/_services';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'api-stored-value',
  templateUrl: './api-stored-value.component.html',
  styleUrls: ['./api-stored-value.component.scss']
})
export class ApiStoredValueComponent implements OnInit {

  inputForm: FormGroup;
  currentAPIUrl : any;
  version: any;
  message: string;
  isElectronApp: boolean;

  constructor(
      private router               : Router,
      public platFormService       : PlatformService,
      private fb                   : FormBuilder,
      private authenticationService: AuthenticationService,
      private appInitService       : AppInitService,
      public electronService       : ElectronService,
      private platformService      : PlatformService,
      private ngZone: NgZone
    ) {

    this.currentAPIUrl = localStorage.getItem('storedApiUrl');

    console.log('redirectAPIUrlRequired isAppElectron', this.platformService.isAppElectron )
    console.log('redirectAPIUrlRequired androidApp',    this.platformService.androidApp )

    if (!this.platformService.isAppElectron || !this.platformService.androidApp)  {
      if (this.router.url === '/app-apisetting') {
        this.router.navigate(['/login'])
      }
    }

    this.initRender();
    this.getVersion();
    this.isElectronApp = this.electronService.isElectronApp;
  }

  initRender() {
    if (!this.electronService.isElectronApp) { return }
    this.electronService.ipcRenderer.on('getVersion', (event, arg) => {
      this.ngZone.run(() => {
          this.version = arg
      });
    })
  }

  ngOnInit(): void {
    const currentAPIUrl = localStorage.getItem('storedApiUrl');
    this.inputForm = this.fb.group({
      apiUrl: [currentAPIUrl],
    });

    console.log('App setting Init', currentAPIUrl)
    console.log('platFormService.webMode', this.platFormService.webMode)
  }

  setAPIUrl(){
    const apiUrl = this.inputForm.controls['apiUrl'].value
    const result =  this.appInitService.setAPIUrl(apiUrl)
    if (!result || result == '') {return}
    this.appInitService.init();
    this.authenticationService.clearUserSettings()
    this.currentAPIUrl = apiUrl;
  }

  checkForUpdate() {
    if (!this.electronService.isElectronApp) { return }
    this.electronService.ipcRenderer.send('getVersion', 'ping');
  }

  getVersion() {
    if (!this.electronService.isElectronApp) { return }
    this.electronService.ipcRenderer.send('getVersion', 'ping');
  }

  getPong(): any {
    if (!this.electronService.isElectronApp) { return }
    console.log('pong')
    this.electronService.ipcRenderer.addListener('asynchronous-message', (event, pong) => {
      console.log('ping',event, pong)
    });
    return null
  }
}


