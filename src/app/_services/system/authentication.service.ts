import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from 'src/app/_interfaces';
import { AppInitService } from './app-init.service';
import { PlatformService } from './platform.service';
import { OrdersService } from '..';
import { ToolBarUIService } from './tool-bar-ui.service';
import { LoginComponent } from 'src/app/modules/login';

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

    apiUrl                      : any;
    public  externalAPI         : boolean;

    private _user               = new BehaviorSubject<IUser>(null);
    public  user$               = this._user.asObservable();

    private _userx              = new BehaviorSubject<IUser>(null);
    public  userx$              = this._userx.asObservable();

    updateUser(user: IUser) {
      this._user.next(user)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
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
        private toolbarUIService : ToolBarUIService,
    ) {

      this.apiUrl = this.appInitService.apiBaseUrl()
      const userx = JSON.parse(JSON.parse(localStorage.getItem('userx'))) as IUser;
      const user  = JSON.parse(localStorage.getItem('user')) as IUser;
      this.updateUser(user);
      this.updateUserX(userx)
    }

    public get userValue(): IUser {
      if (!this._user || !this._user.value) {
        const item = localStorage.getItem('user');
        if (!item) {
          return this._user.value;
        }
        if (item) {
          const nextUser =  JSON.parse(item)
          this.updateUser(nextUser);
          return nextUser
        }
      }
      return this._user.value;
    }

    public get isAuthorized(): boolean {
      try {
        if  (this.userValue  != null) {
          if  (this.userValue &&
          (this.userValue.roles === 'admin' || this.userValue.roles === 'manager')) {
            return true
          }
        }
      } catch (error) {
        console.log('error', error)
      }

      // console.log('this.user no Value', this.userValue)
      return false
    }

    public get userxValue(): IUser {
      if ( !this._userx.value ) {
        const user = JSON.parse(localStorage.getItem('userx')) as IUser;
        user.roles = user.roles.toLowerCase();
      }
      return this._userx.value;
    }

    setUserSubject(user:IUser) {
      if (!user || !user.password || !user.username) {return}
      user.authdata = window.btoa( `${user.username}:${user.token}`);
      localStorage.setItem("ami21", 'true');
      this.updateUser(user);
    }

    logout() {
      this.clearUserSettings();
      this.toolbarUIService.updateOrderBar(false)
      this.toolbarUIService.updateToolBarSideBar(false)
      if (!this.platFormservice.isApp()) {
        if (this.appInitService.useAppGate) {
          try {
            this.router.navigate(['/appgate']);
          } catch (error) {
            console.log('log out error', error)
          }
          return
        }
      }

      try {
        this.router.navigate(['/login']);
      } catch (error) {
        console.log('log out error', error)
      }

      this.clearSubscriptions()
    }

    clearSubscriptions() {
      // this.orderService.updateOrderSubscription(null)
      // this.orderService.updateOrderSearchModel(null);
    }

    clearUserSettings(){
      localStorage.removeItem("ami21");
      localStorage.removeItem('user');
      localStorage.removeItem('userx');
      localStorage.removeItem('site')
      localStorage.removeItem('orderSubscription')
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
      return this.http.post<any>(url, { token: user.token, userName: user.username, password: user.password } )
      .subscribe({
        next: data => {
          return "Password updated.";
        },
        error:  error => {
          return error
        }
      })
    }

    _updatePassword(user: IUser) {
      const url = `${this.apiUrl}/users/updatePassword`
      return this.http.post<any>(url, { token: user.token, userName: user.username, password: user.password } )
      .subscribe( {
        next: data => {
          return "Password updated.";
        },
        error:  error => {
          return error
        }
      }

      )
    }

}
