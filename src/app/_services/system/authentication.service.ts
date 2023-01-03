import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IUser } from 'src/app/_interfaces';
import { AppInitService } from './app-init.service';
import { PlatformService } from './platform.service';
import { ToolBarUIService } from './tool-bar-ui.service';
import { LoginComponent } from 'src/app/modules/login';
import { SitesService} from 'src/app/_services/reporting/sites.service';
import { MatDialog } from '@angular/material/dialog';
import { IUserAuth_Properties } from '../people/client-type.service';

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


// Public Property UserExists As Boolean
// Public Property FirstInitial As String
// Public Property LastInitial As String
// Public Property UserName As String
// Public Property phone As String
// Public Property email As String
// Public Property type As String
// Public Property message As String

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    apiUrl                      : any;
    public  externalAPI         : boolean;

    private _user               = new BehaviorSubject<IUser>(null);
    public  user$               = this._user.asObservable();


    private _userx              = new BehaviorSubject<IUser>(null);
    public  userx$              = this._userx.asObservable();

    userAuths           : IUserAuth_Properties;  
    _userAuths           = new BehaviorSubject<IUserAuth_Properties>(null);
    public  userAuths$   = this._userAuths.asObservable();
  
    updateUserAuths(userAuths : IUserAuth_Properties ) {
      this._userAuths.next(userAuths)
      if (userAuths) { 
        localStorage.setItem('userAuth', JSON.stringify(userAuths));
      }
    }
  
    updateUser(user: IUser) {
      this._user.next(user)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      this.siteSerivce._user.next(user)
    }

    updateUserX(user: IUser) {
      this._userx.next(user)
      localStorage.setItem('userx', JSON.stringify(user));
    }

    constructor(
        private router           : Router,
        private http             : HttpClient,
        private appInitService   : AppInitService,
        private platFormservice  : PlatformService,
        private toolbarUIService : ToolBarUIService,
        private siteSerivce      : SitesService,
        private dialog           : MatDialog,
  
    ) {

      this.apiUrl = this.appInitService.apiBaseUrl()
      const userx = JSON.parse(JSON.parse(localStorage.getItem('userx'))) as IUser;
      const user  = JSON.parse(localStorage.getItem('user')) as IUser;

      const userAuth = JSON.parse(localStorage.getItem('userAuth'));
      this.updateUserAuths(userAuth)
      this.updateUser(user);
      this.updateUserX(userx)
    }

    public get userValue(): IUser {
      if (!this._user.value) {
        const item = localStorage.getItem('user');
        if (item) {
          const nextUser =  JSON.parse(item)
          this._user.next(nextUser)
          return nextUser
        }
        if (!item) {
          return null
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

    openLoginDialog() {
      let width    = '455px'
      // if (this.smallDevice) {

      // }
      console.log('dialog open')

      let dialogRef: any;
      dialogRef = this.dialog.open(LoginComponent,
        { width    : width,
          minWidth : width,
          height   : '650px',
          minHeight: '650px',
          data:    'openLogin'
        },
      )

      return dialogRef;

    }

    clearSubscriptions() {
      // this.orderService.updateOrderSubscription(null)
      // this.orderService.updateOrderSearchModel(null);
    }

    clearUserSettings(){
      localStorage.removeItem("ami21");
      localStorage.removeItem('user');
      localStorage.removeItem('userx');
      localStorage.removeItem('userAuth')
      // localStorage.removeItem('site')
      localStorage.removeItem('orderSubscription');
      // localStorage.removeItem('loginAction')
      // https://localhost:44309  /api
      // localStorage.removeItem('storedApiUrl')
      this.updateUser(null);
      this.updateUserX(null);
    }

    requestUserSetupToken(userName: string): Observable<IUserExists> {

      const api = this.siteSerivce.getAssignedSite().url
      const url = `${api}/users/RequestUserSetupToken`

      console.log(url)
      return  this.http.post<any>(url, {userName: userName})
    };

    requestPasswordResetToken(userName: string): Observable<any>  {

      const api = this.siteSerivce.getAssignedSite().url
      const url = `${api}/users/RequestPasswordResetToken`

      return this.http.post<any>(url, {userName: userName})
    };

    assignUserNameAndPassword(user: IUser): Observable<IUserExists>  {

      const api = this.siteSerivce.getAssignedSite().url
      const url = `${api}/users/CreateNewUserName`

      return  this.http.post<any>(url, user)
    };

    createTempUser() : Observable<any> {
      //check local storage.
      //if local user exists then return that as observable

      const user = localStorage.getItem('user');
      if (user) {
        return of(user);
      }

      const api = this.siteSerivce.getAssignedSite().url
      const url = `${api}/users/CreateTempUser`
      return  this.http.get<any>(url);

    }

    updatePassword(user: IUser): Observable<any> {
      const api = this.siteSerivce.getAssignedSite().url
      const url = `${api}/users/updatePassword`
      return  this.http.post<any>(url, user)
    }

}
