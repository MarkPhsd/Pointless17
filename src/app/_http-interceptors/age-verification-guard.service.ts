import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Capacitor} from '@capacitor/core';
import { ElectronService } from 'ngx-electron';
import { AppInitService } from '../_services/system/app-init.service';

@Injectable({ providedIn: 'root' })

export class AgeVerificationGuardService {

  platForm     : string;
  webMode      : any;
  isAppElectron: boolean;
  androidApp   : boolean;

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private appInitService  : AppInitService,
) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.platForm != 'web') { return true }

    if (!this.appInitService.appGateEnabled) { return true; }

    const amI21 = localStorage.getItem('ami21')

    if (amI21 === undefined || amI21 != 'true') {
      this.router.navigate(['/appgate'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    // if (amI21 === undefined || amI21 != 'true') {
    //   this.router.navigate(['/app-app-gate'], { queryParams: { returnUrl: state.url } });
    //   return true;
    // }
  }

  getPlatForm() {

    this.platForm         =  Capacitor.getPlatform();
    const platForm        = this.platForm;

    if (platForm === 'android') {
      this.androidApp = true
      this.webMode = 'android'
      return
    }

    if (platForm === 'web') {
      this.webMode = true
    }

    if (this.electronService.isElectronApp) {
      this.webMode = false
      this.platForm = 'electron'
      return
    }

    // const result = this.electronService.remote
    // const isElectron = (result != null);

    // if (isElectron) {
    //   this.platForm = 'electron'
    //   this.isAppElectron = true;
    //   return
    // }

  }

}
