import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';

@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {

  platForm:     string;
  isApp         : boolean;
  isAppElectron       =   false;
  isElectronServiceInitiated : boolean;
  androidApp          = false;
  webMode             = false;

  constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
  ) {
   }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const user = this.authenticationService.userValue;

    if (user) {
        // logged in so return true
        //determine the variables for allowing - manager, user, admin, other?
        return true;
    }

    // // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }




}
