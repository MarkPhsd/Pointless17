import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from 'src/app/_interfaces';
import { AppInitService } from './app-init.service';
import { PlatformService } from './platform.service';

export interface IUserExists {
  id:           number;
  userExists:   boolean;
  firstInitial: string;
  lastInitial:  string;
  userName:     string;
  type:         string;
  phone:        string;
  email:        string;
  message:      string;
  employeeID:   number;
}

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    public  externalAPI         : boolean;

    private _user               = new BehaviorSubject<IUser>(null);
    public  user$               = this._user.asObservable();

    private _userx              = new BehaviorSubject<IUser>(null);
    public  userx$              = this._userx.asObservable();

    apiUrl: any;

    updateUser(user: IUser) {
      // console.log('AuthenticationService user updated', user)
      this._user.next(user)
      localStorage.setItem('user', JSON.stringify(user));
    }

    updateUserX(user: IUser) {
      this._userx.next(user)
      localStorage.setItem('userx', JSON.stringify(user));
    }

    constructor(
        private router          : Router,
        private http            : HttpClient,
        private appInitService  : AppInitService,
        private platFormservice : PlatformService,
    ) {

      this.apiUrl = this.appInitService.apiBaseUrl()
      const userx = JSON.parse(JSON.parse(localStorage.getItem('userx'))) as IUser;
      const user  = JSON.parse(localStorage.getItem('user')) as IUser;
      this.updateUser(user);
      this.updateUserX(userx)
    }

    // if paged refreshed, try to reset the user.
    public get userValue(): IUser {

      // console.log('getting user')

      if (!this._user.value) {
        // console.log('getting user  not set, retrieving from local storage')
        const item = localStorage.getItem('user');
        if (!item) {
          //will return undefined or null;
          return this._user.value;
        }
        if (item) {
          const nextUser =  JSON.parse(item)
          this.updateUser(nextUser);
          return nextUser
        }
      }

      // console.log('user Value exists', this._user.value)

      return this._user.value;
    }

    public get userxValue(): IUser {
      if ( !this._userx.value ) {
        const user = JSON.parse(localStorage.getItem('userx')) as IUser;
        user.roles = user.roles.toLowerCase();
        // this.userSubject.next(user);
      }
      return this._userx.value;
    }

    setUserSubject(user:IUser) {
      if (!user || !user.password || !user.username) {
        return
      }
      user.authdata = window.btoa( `${user.username}:${user.password}`);
      localStorage.setItem("ami21", 'true');
      this.updateUser(user);
    }

    logout() {
      // remove user from local storage to log user out
      this.clearUserSettings();
      // console.log('user settings cleared')
      if (this.platFormservice.webMode) {
        if (this.appInitService.appGateEnabled) {
          this.router.navigate(['/appgate']);
          // console.log('route to app gate')
          return
        }
      }

      // console.log('route to login')
      this.router.navigate(['/login']);

    }

    clearUserSettings(){
      localStorage.removeItem("ami21");
      localStorage.removeItem('user');
      this.updateUser(null);
      this.updateUserX(null);
    }

    requestUserSetupToken(userName: string): Observable<IUserExists> {
      let url = `${this.apiUrl}/users/RequestUserSetupToken`
      return  this.http.post<any>(url, {userName: userName})
    };

    requestPasswordResetToken(userName: string): any  {
      let url = `${this.apiUrl}/users/RequestPasswordResetToken`
      url = url + "?username=" + userName
      this.http.post<any>(url, {userName: userName}).subscribe(
        data => {
        return data
      },
        error => {
        return error
      })
    };

    assignUserNameAndPassword(user: IUser): Observable<IUserExists>  {
      let url = `${this.apiUrl}/users/CreateNewUserName`
      return  this.http.post<any>(url, user)
    };

    updatePassword(user: IUser): any {
      let url = `${this.apiUrl}/users/updatePassword`
      return this.http.post<any>(url, { token: user.resetCode, userName: user.username, password: user.password } )
      .subscribe(
          data => {
          return "Password updated.";
        },
          error => {
          return error
        }
      )
    }

    _updatePassword(user: IUser) {
      const url = `${this.apiUrl}/users/updatePassword`
      return this.http.post<any>(url, { token: user.resetCode, userName: user.username, password: user.password } )
      .subscribe(
          data => {
          return "Password updated.";
        },
          error => {
          return error
        }
      )
    }

}
