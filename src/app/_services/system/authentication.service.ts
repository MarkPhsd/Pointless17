import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IUser, UserPreferences } from 'src/app/_interfaces';
import { AppInitService } from './app-init.service';
import { PlatformService } from './platform.service';
import { ToolBarUIService } from './tool-bar-ui.service';
import { LoginComponent } from 'src/app/modules/login';
import { SitesService} from 'src/app/_services/reporting/sites.service';
import { MatDialog } from '@angular/material/dialog';
import { IUserAuth_Properties } from '../people/client-type.service';
import { ThemesService } from './themes.service';
import { UIHomePageSettings } from './settings/uisettings.service';
import { color } from 'highcharts';

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

export interface IDeviceInfo {
  phoneDevice: boolean;
  smallDevice: boolean;
}
@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    baseColor = '#F5F5F5'; // Starting color
    gradient: string;


    //used for ebay oAuth.
    ebayHeader: any;

    apiUrl                      : any;
    public  externalAPI         : boolean;

    private _setPinPad        = new BehaviorSubject<boolean>(null);
    public  setPinPad$        = this._setPinPad.asObservable();

    public _userTemp          = new BehaviorSubject<IUser>(null);
    public  userTemp$         = this._userTemp.asObservable();

    public _user              = new BehaviorSubject<IUser>(null);
    public  user$             = this._user.asObservable();

    private _userx            = new BehaviorSubject<IUser>(null);
    public  userx$            = this._userx.asObservable();

    // userAuths            : IUserAuth_Properties;
    _userAuths                = new BehaviorSubject<IUserAuth_Properties>(null);
    public  userAuths$        = this._userAuths.asObservable();

    _userAuthstemp            = new BehaviorSubject<IUserAuth_Properties>(null);
    public  _userAuthstemp$   = this._userAuthstemp.asObservable();

    _deviceInfo: IDeviceInfo;

    updatePinPad(value: boolean) {
      this._setPinPad.next(value)
    }
    get userAuths() {

      if (this._userAuths.value) {
        return this._userAuths.value
      }

      const item = localStorage.getItem('userAuth');
      if (!item) {
        return {} as IUserAuth_Properties
      }
      return JSON.parse(item)
    }

    updateUserAuths(userAuths : IUserAuth_Properties ) {
      this._userAuths.next(userAuths)
      if (userAuths) {
        this.setUserAuth(JSON.stringify(userAuths));
      }
    }

    setUserAuth(userAuth: string) {
      localStorage.setItem('userAuth', userAuth)
    }

    updateUserAuthstemp(userAuths : IUserAuth_Properties ) {
      this._userAuthstemp.next(userAuths)
      if (userAuths) {
        localStorage.setItem('userAuthstemp', JSON.stringify(userAuths));
      }
    }

    updateDeviceInfo(item: IDeviceInfo) {
      this._deviceInfo = item
    }

    get deviceInfo(): IDeviceInfo {
      return this._deviceInfo;
    }

    updateUser(user: IUser) {
      if (!user ){
        this._user.next(null)
        this.siteSerivce._user.next(null)
        return
      }
      if (!user.userPreferences) {
        user.userPreferences = {} as UserPreferences;
      }
      if ( !user.userPreferences.firstTime_FilterOrderInstruction) {
         user.userPreferences.firstTime_FilterOrderInstruction = false
      }
      if ( !user.userPreferences.firstTime_notifyShowAllOrders) {
        user.userPreferences.firstTime_notifyShowAllOrders = false
      }
      this._user.next(user)
      this.siteSerivce._user.next(user)
    }

    updatePreferences(preferences: UserPreferences) {
      // this.themeService.setDarkLight(preferences.darkMode);
    }

    updateUserX(user: IUser) {
      this._userx.next(user)
      try {
        if (user.preferences) {
          const pref = JSON.parse(user.preferences) as UserPreferences
          user.userPreferences = pref;
        }
      } catch (error) {

      }
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

    public overRideUser(user) {
      this._userTemp.next(user);
      // if (!user) { this.userValue }
    }

    decodeAuth(data) {
      if (!data) { return }
      const encodedUriComponent = data.code
      const decodedUriComponent = decodeURIComponent(encodedUriComponent);
      return decodedUriComponent;
    }

    public get userValue(): IUser {

      if (this._userTemp) {
        if ( this._userTemp.value) {
          return this._userTemp.value;
        }
      }

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

    setUserValue(user) {
      this._user.next(user)
    }

    setUserNoSubscription(user) {

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
    public get isAdmin(): boolean {
      try {
        if  (this.userValue  != null) {
          if  (this.userValue &&
          (this.userValue.roles === 'admin' )) {
            return true
          }
        }
      } catch (error) {
        console.log('error', error)
      }
      return false
    }

    public get isCustomer(): boolean {
      try {
        if  (this.userValue  != null) {
          if  (this.userValue &&
          (this.userValue.roles === 'user' )) {
            return true
          }
        }
      } catch (error) {
        console.log('error', error)
      }
      return false
    }
    public get isUser(): boolean {
      try {
        if  (this.userValue  != null) {
          if  (this.userValue &&
          (this.userValue.roles === 'user' )) {
            return true
          }
        }
      } catch (error) {
        console.log('error', error)
      }
      return false
    }
    public get isStaff(): boolean {
      try {
        if  (this.userValue  != null) {
          if  (this.userValue &&
          (this.userValue.roles === 'admin' || this.userValue.roles === 'manager' || this.userValue.roles === 'employee' )) {
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

    logout(pinPadDefaultOnApp: boolean) {
      this.clearUserSettings();
      this.toolbarUIService.updateOrderBar(false)
      this.toolbarUIService.updateToolBarSideBar(false)
      // console.log('cleared user settings go to login.isapp:', this.platFormservice.isApp())
      if (!this.platFormservice.isApp()) {

        if (!this.appInitService?.useAppGate) {
          this.router.navigate(['/login']);
          this.setPinPadLogIn(pinPadDefaultOnApp);
          return;
        }
        if (this.appInitService.useAppGate) {
          try {
            this.router.navigate(['/appgate']);
            this.setPinPadLogIn(pinPadDefaultOnApp)
          } catch (error) {
            console.log('log out error', error)
          }
          return
        }

      }

      try {
        this.router.navigate(['/login']);
        this.setPinPadLogIn(pinPadDefaultOnApp)
      } catch (error) {
        console.log('log out error', error)
      }

      this.clearSubscriptions()
    }

    setPinPadLogIn(pinPadDefaultOnApp: boolean) {
      if (this.platFormservice.isApp()) {
        if (pinPadDefaultOnApp) {
          this._setPinPad.next(true)
        }
      }
    }

    openLoginDialog() {
      let width    = '455px'
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
      localStorage.removeItem('orderSubscription');
      this.updateUser(null);
      this.updateUserX(null);
    }

    requestUserSetupToken(userName: string): Observable<IUserExists> {

      const api = this.siteSerivce.getAssignedSite().url
      const url = `${api}/users/RequestUserSetupToken`

      // console.log(url)
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


    //get app toolbar
    getAppToolBarStyle(color: string, width: number) {

      const list = this.generateGradient(color)
      return  `
        #scrollstyle_1::-webkit-scrollbar {
          width: 35px;
          background-color: #F5F5F5;
          overflow-x: hidden;
          overflow-y: auto;
        }

        #scrollstyle_1::-webkit-scrollbar-track {
          -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
          background-color: #F5F5F5;
          border-radius: 10px;
        }

        #scrollstyle_1::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background-color: #6475ac;
          background-image: -webkit-gradient(linear,
                                             left bottom,
                                             left top,
                                             color-stop(0.44, ${list[0]}),
                                             color-stop(0.72, ${list[1]}),
                                             color-stop(0.86, ${list[2]}));
        }
      `;

    }


    private generateGradient(baseHex: string): any[] {
    // Convert base color to HSL
    let [h, s, l] = this.hexToHSL(baseHex);

    // Calculate the new lightness for the "less dark" color.
    // Ensure that the lightness does not exceed 100%
    let lighterL = Math.min(l + 10, 100); // Increase lightness for the lighter color
    let lessDarkL = Math.min(lighterL * 1.31, 100); // Make the last color 20% less dark than the lighter color

    // Generate three color stops from the base color
    let colors = [
      this.hslToHex(h, s, Math.max(l - 20, 0)), // Darker
      this.hslToHex(h, Math.max(s - 20, 0), l), // Less saturated
      this.hslToHex(h, s, lessDarkL) // 20% less dark than what would have been the lighter color
    ];

      let list = []
      list.push(colors[0])
      list.push(colors[1])
      list.push(colors[2])
      return  list
      // Create a CSS gradient string
      // return `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
    }

    private hexToHSL(H: string): [number, number, number] {
      // Convert hex to RGB first
      let r = 0, g = 0, b = 0;
      if (H.length == 4) {
        r = parseInt(H[1] + H[1], 16);
        g = parseInt(H[2] + H[2], 16);
        b = parseInt(H[3] + H[3], 16);
      } else if (H.length == 7) {
        r = parseInt(H[1] + H[2], 16);
        g = parseInt(H[3] + H[4], 16);
        b = parseInt(H[5] + H[6], 16);
      }

      // Then convert RGB to HSL
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max == min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    hslToHex(h: number, s: number, l: number): string {
      s /= 100;
      l /= 100;

      let c = (1 - Math.abs(2 * l - 1)) * s,
          x = c * (1 - Math.abs((h / 60) % 2 - 1)),
          m = l - c / 2,
          r = 0,
          g = 0,
          b = 0;

      if (0 <= h && h < 60) {
          r = c; g = x; b = 0;
      } else if (60 <= h && h < 120) {
          r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
          r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
          r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
          r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
          r = c; g = 0; b = x;
      }

      // Convert to Hex and ensure 2 digits by padding
      let rs = Math.round((r + m) * 255).toString(16).padStart(2, '0');
      let gs = Math.round((g + m) * 255).toString(16).padStart(2, '0');
      let bs = Math.round((b + m) * 255).toString(16).padStart(2, '0');

      return `#${rs}${gs}${bs}`;
    }
}
