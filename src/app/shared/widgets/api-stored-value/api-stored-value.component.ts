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

  constructor(
      private router               : Router,
      public platFormService       : PlatformService,
      private fb                   : FormBuilder,
      private authenticationService: AuthenticationService,
      private appInitService       : AppInitService,
      private electronService      : ElectronService,
      private ngZone: NgZone
    ) {

    this.currentAPIUrl = localStorage.getItem('storedApiUrl');
    if (this.router.url === '/app-apisetting'  && this.platFormService.webMode) {
      this.router.navigate(['/login'])
    }

    this.initRender();
    this.getVersion();
  }

  initRender() {
    if (!this.electronService.isElectronApp) { return }
    this.electronService.ipcRenderer.on('asynchronous-reply', (event, arg) => {
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
    console.log('App setting Init')

    // this.getVersion()

  }

  setAPIUrl(){
    const apiUrl = this.inputForm.controls['apiUrl'].value
    localStorage.setItem('storedApiUrl', apiUrl)
    const result =  this.appInitService.setAPIUrl(apiUrl)
    if (!result) {return}
    this.appInitService.init();
    this.authenticationService.clearUserSettings()
    this.currentAPIUrl = apiUrl;
  }

  getVersion() {
    if (!this.electronService.isElectronApp) { return }
    this.electronService.ipcRenderer.send('asynchronous-message', 'ping');
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


