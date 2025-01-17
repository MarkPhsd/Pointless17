import { CommonModule } from '@angular/common';
import { Component, OnInit,NgZone  } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'api-stored-value',
  standalone: true,
  imports: [CommonModule,
            ReactiveFormsModule,
            FormsModule,
            AppMaterialModule,
            MatLegacyCardModule,
            MatLegacyFormFieldModule,
            MatLegacyButtonModule],
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
      private platformService      : PlatformService,
      private siteService          : SitesService,
      private ngZone               : NgZone,
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

  ngOnInit(): void {

    this.inputForm = this.fb.group({
      apiUrl: [],
    });

    let currentAPIUrl = localStorage.getItem('storedApiUrl');

    if (currentAPIUrl) {
      currentAPIUrl = currentAPIUrl.replace( 'https://', '')
      currentAPIUrl = currentAPIUrl.replace( '/api', '')
    }

    this.inputForm.patchValue({apiUrl:currentAPIUrl});

    this.inputForm.valueChanges.subscribe(data => {
      this.newAPI  = `https://${data.apiUrl}/api`
    })
  }

  typeHttps() {
    const value = this.inputForm.controls['apiUrl'].value;
    this.inputForm.patchValue({apiUrl: 'https://'})
  }

  typeAPI() {
    const value = this.inputForm.controls['apiUrl'].value;
    let url = `${value}/api`
    this.inputForm.patchValue({apiUrl: url})
  }

  //for electrononly
  initRender(): void {
    try {
      if (!this.platformService.isAppElectron) {
        return;
      }

      (window as any).electron.onGetVersion((arg: any) => {
        this.ngZone.run(() => {
          this.version = arg;
          this.electronVersion = arg;
        });
      });

    } catch (error) {
      console.log('init render error')
    }
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
    this.matSnack.open('checkNode ' + this.platFormService.isAppElectron, 'status')
  }

  checkForUpdate() {
    if (!this.platFormService.isAppElectron) { return }
  }


  checkIfIsElectron() {
    this.matSnack.open('Is Electron ' +   this.platFormService.isAppElectron, 'status')
  }

  getVersion(): void {
    try {
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
    } catch (error) {
      console.log('get version api stored value', error)
    }
  }

  getPong(): any {
    try{
      // if (!this.platFormService.isAppElectron) { return }
      //   this.IPCService._ipc.addListener('asynchronous-message', (event, pong) => {
      // });
      return null
    } catch (error) {
      this.version  = error
    }
  }
}


