import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject,  Observable, of, Subscription } from 'rxjs';
import { concatMap, switchMap,   } from 'rxjs/operators';
import { clientType, ISite, IUser, IUserProfile, UserPreferences } from 'src/app/_interfaces';
import { FastUserSwitchComponent } from 'src/app/modules/profile/fast-user-switch/fast-user-switch.component';
import { SitesService } from '../reporting/sites.service';
import { AuthenticationService, ContactsService, OrdersService } from '..';
import { POSPaymentService } from '../transactions/pospayment.service';
import { AppInitService } from './app-init.service';
import { PlatformService } from './platform.service';
import { EncryptionService } from '../encryption/encryption.service';
import { BalanceSheetMethodsService } from '../transactions/balance-sheet-methods.service';
import { ElectronService } from 'ngx-electron';
import { ToolBarUIService } from './tool-bar-ui.service';
import { UISettingsService } from './settings/uisettings.service';
import { ClientTypeService, IUserAuth_Properties } from '../people/client-type.service';
import { OrderMethodsService } from '../transactions/order-methods.service';
import { UserIdleService } from 'angular-user-idle';
import { ClientTableService } from '../people/client-table.service';
import { ClockInPanelComponent } from 'src/app/modules/admin/clients/clock-in-panel/clock-in-panel.component';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

export interface ElectronDimensions {
  height: string;
  width : string;
  depth : string;
}
export interface userLogin {
  userName: string;
  password: string;
}
@Injectable({
  providedIn: 'root'
})
export class UserSwitchingService implements  OnDestroy {

  loginData  : any;
  clientType : clientType

  user  : IUser;
  _user : Subscription

  isElectron: boolean;

  public  swapMenuWithOrderBoolean    :boolean;
  private _swapMenuWithOrder   = new BehaviorSubject<boolean>(null);
  public  swapMenuWithOrder$   = this._swapMenuWithOrder.asObservable();

  private _loginStatus         = new BehaviorSubject<number>(0);
  public  loginStatus$         = this._loginStatus.asObservable();

  private _clearloginStatus         = new BehaviorSubject<boolean>(null);
  public  clearloginStatus$         = this._clearloginStatus.asObservable();

  updateLoginStatus(value: number) {
    this._loginStatus.next(value)
  }

  initSubscriptions() {
    this._user = this.authenticationService.user$.subscribe(user => {
      this.user = user;
    })
  }

  //enter or chain observables here.
  promptBalanceSheet(user: IUser): Observable<any> {
    this.setUserInfo(user, user?.password)
    return this.sheetMethodsService.promptBalanceSheet(user)
  }

  constructor(
    private router           : Router,
    private http             : HttpClient,
    private siteService      : SitesService,
    private dialog           : MatDialog,
    private authenticationService: AuthenticationService,
    private orderService     : OrdersService,
    private orderMethodService: OrderMethodsService,
    private contactsService  : ContactsService,
    private sheetMethodsService: BalanceSheetMethodsService,
    private paymentService   : POSPaymentService,
    private snackBar         : MatSnackBar,
    private appInitService   : AppInitService,
    private route            : ActivatedRoute,
    private platformService  : PlatformService,
    private encryptionService: EncryptionService,
    private toolbarUIService : ToolBarUIService,
    private uiSettingService: UISettingsService,
    private electronService  : ElectronService,
    private clientTypeService: ClientTypeService,
    private clientTableService: ClientTableService,
    private userIdle: UserIdleService,
  ) {
    this.initSubscriptions();
    this.initializeAppUser();
  }

  ngOnDestroy(): void {
    if (this._user) { this._user.unsubscribe()}
  }


  openTimeClock() {
    let dialogRef: any;
    dialogRef = this.dialog.open(ClockInPanelComponent,
      { width    : '90vw',
        minWidth : '600px',
        height   : '90vh',
        minHeight: '650px',
      },
    )
    return dialogRef
  }

  initializeAppUser() {
    const temp = JSON.parse(localStorage.getItem('appUser')) as ElectronDimensions;
    if (temp) { return }
    const appUser = {} as ElectronDimensions;
    const user = JSON.stringify(appUser)
    localStorage.setItem('appUser', user)
    this.isElectron =  this.electronService.isElectronApp
  }

  async switchUser(): Promise<boolean> {
    //open dialog
    const request = {request: 'switchUser'}
    //should have be switch user
    this.openPIN(request);
    //allow pin entry with password
    return true
  }

  getUserTypeAuthorizations(id: number) {
    const site = this.siteService.getAssignedSite()
    return this.clientTypeService.getClientType(site, id).pipe(
      switchMap( data => {
        if (data) {
          this.authenticationService.updateUserAuths(JSON.parse(data.jsonObject))
          return of(data)
        }
      }
    ))
  }

  setAppUser() {
    const appUser = JSON.parse(localStorage.getItem('appUser')) as ElectronDimensions;
    const iUser = {} as IUser;
    iUser.username  = this.encryptionService.decrypt(appUser.height, appUser.depth)
    iUser.password = this.encryptionService.decrypt(appUser.width, appUser.depth)
  }


  saveAppUser(appUser: ElectronDimensions) {
    appUser.height = this.encryptionService.encrypt(appUser.height, appUser.depth)
    appUser.width  = this.encryptionService.encrypt(appUser.width, appUser.depth)
    const user = JSON.stringify(appUser);
    localStorage.setItem('electronFeature', user);
  }

  clearLoggedInUser() {
    this.orderMethodService.updateOrderSubscriptionClearOrder(0)
    this.orderMethodService.updateOrderSearchModel(null);
    this.toolbarUIService.updateDepartmentMenu(0);
    this._clearloginStatus.next(true)
    this.authenticationService.logout(this.uiSettingService.homePageSetting?.pinPadDefaultOnApp);
  }

  pinEntryResults(pin: any) {
    //find employee
    const token =  localStorage.getItem('posToken')
    const site = this.siteService.getAssignedSite()
    return this.login(token, pin, false)
  }

  authenticate(userLogin: userLogin): Observable<IUser> {
    const apiUrl =  this.appInitService.apiBaseUrl()
    const url = `${apiUrl}/users/authenticate`
    return this.http.post<any>(url, userLogin ).pipe(switchMap(data => {
      // console.log('data', data)
      if (data?.errorMessage) {
        this.siteService.notify(`${data?.message} ${data?.errorMessage}`, 'Close', 10000, 'red')
      } else { data.errorMessage = null}
      return of(data)
    }))
  }

  userAutFailed(user) : any {
    let message = user?.errorMessage;
    if (user?.errorMessage && !user.message) {
      user.message = 'User not found.'
    }
    // console.log('failed login',user?.errorMessage , user)
    if (user?.errorMessage) {
      this.snackBar.open(`${user?.errorMessage} ${user?.message}`, 'Failed Login', {duration: 4500})
    }

    return {user: user, sheet: null}
  }

  processTimeClockLogin(user: string, password: string): Observable<any>  {
    return this.login(user,password, true)
  }

  initalizeLogin() {
    this.clearSubscriptions();
    this.authenticationService.clearUserSettings();
    this.authenticationService.authenticationInProgress = true;
  }

  didItemFail(item) {
    if (item?.message == 'failed' || item?.errorMessage === 'Auth Failed' ) {
      return true
    }
    if (item.errorMessage && item?.errorMessage != '') {
      return true
    }
    return false;
  }

  login(userName: string, password: string, clockInOnly: boolean): Observable<any> {

    this.initalizeLogin()
    const site = this.siteService.getAssignedSite();
    const userLogin = { userName, password };
    const timeOut = 3000;
    const  deviceName = localStorage.getItem('devicename');

    // Authentication stream
    let auth$ = this.authenticate(userLogin).pipe(
      concatMap(user => {

        console.log('authenticate ', user)
        if (this.didItemFail(user)) {
          console.log('auth failed')
          this.authenticationService.authenticationInProgress = false;
          user.errorMessage = 'Auth Failed'
          const result = this.userAutFailed(user) as IUserProfile
          return of(result);
        }
        user.message = 'success';
        user.errorMessage = null;
        const currentUser = this.setUserInfo(user, password);
        this.uiSettingService.initSecureSettings();
        return this.contactsService.getContact(site, user?.id);
      })
    );

    // Authorization update stream
    let updateAuth$ = auth$.pipe(
      concatMap(data => {
        console.log('submit 3', data)
        if (this.didItemFail(data)) {
          data.errorMessage = 'Auth Failed'
          return of(this.userAutFailed(data));
        }
        this.authenticationService.updateUserAuths(
          data?.clientType?.jsonObject ? JSON.parse(data?.clientType?.jsonObject) : null
        );
        data.message = 'success';
        return of(data);
      })
    );

    // Handle balance sheet or pass through user data
    let balanceSheet$ = updateAuth$.pipe(
      concatMap(user => {
        console.log('submit 4', user)
        if (this.didItemFail(user)) {
          this.authenticationService.authenticationInProgress = false;
          user.errorMessage = 'Auth Failed'
          return of(this.userAutFailed(user));
        }

        user.message = 'success'
        const userSheet = {sheet: null, user: user}

        if (clockInOnly) return of(userSheet);

        if  ( this.platformService.isApp() && deviceName ) {
          return this.promptBalanceSheet(user)
        }

        // console.log('submit with no balancesheet', clockInOnly, userSheet)

        return of(userSheet);
      })
    );

    // Final result handling
    let result$ = balanceSheet$.pipe(
      concatMap(data => {
        console.log('submit 5', data)
        if (this.didItemFail(data)) {
          this.authenticationService.authenticationInProgress = false;
          return of(this.userAutFailed(data));
        }
        return of(data);
      })
    );

    return result$;

}

  // getAuthorization()
  setUserInfo(user: IUser, password) {

    const currentUser = {} as IUser;
    if (!user) { return {}}
    if (!user.roles)     { user.roles = 'user' }
    if (!user.firstName) { user.firstName = user.username }

    localStorage.setItem("ami21", 'true')

    currentUser.password     = password;
    if (!user?.roles) {
      user.roles = 'client'
    }
    currentUser.roles        = user?.roles.toLowerCase()
    currentUser.id           = user.id
    currentUser.employeeID   = user.employeeID
    currentUser.username     = user.username;
    currentUser.phone        = user.phone;
    currentUser.email        = user.email;
    currentUser.firstName    = user?.firstName;
    currentUser.lastName     = user?.lastName;
    currentUser.errorMessage = user.errorMessage
    currentUser.message      = user.message

    currentUser.token        = user?.token;
    if (user.preferences) {
      try {
        currentUser.userPreferences = JSON.parse(user.preferences) as UserPreferences;
      } catch (error) {
        currentUser.userPreferences = {} as  UserPreferences;
      }

      try {
        if (!currentUser.userPreferences.swapMenuOrderPlacement) {
          currentUser.userPreferences.swapMenuOrderPlacement = false;
        }
        if (!currentUser.userPreferences.showAllOrders) {
          currentUser.userPreferences.showAllOrders = false;
        }

        if (currentUser?.userPreferences.swapMenuOrderPlacement) {
          this.swapMenuWithOrder(currentUser.userPreferences?.swapMenuOrderPlacement);
        } else {
          this.swapMenuWithOrder(false);
        }
      } catch (error) {

      }
    }

    if (!user.preferences) {
      currentUser.userPreferences               =  {} as UserPreferences;
      currentUser.userPreferences.darkMode      = false;
      currentUser.userPreferences.swapMenuOrderPlacement = false;
      currentUser.userPreferences.showAllOrders = false;
      currentUser.preferences = JSON.stringify(currentUser?.userPreferences);
    }

    user.authdata            = window.btoa(user.username + ':' + user.password);
    currentUser.authdata     = user?.authdata
    localStorage.setItem('user', JSON.stringify(currentUser))
    this.authenticationService.updateUser(currentUser)
    this.getStoredUser()
    return currentUser
  }

  getStoredUser() {
    // console.log('get user info', JSON.parse(localStorage.getItem('user')))
    return JSON.parse(localStorage.getItem('user'))
  }

  clearSubscriptions() {
    this.orderMethodService.clearOrderSubscription();
    this.orderMethodService.updateOrderSubscription(null);
    this.contactsService.updateSearchModel(null);
    this.sheetMethodsService.updateBalanceSearchModel(null);
    this.sheetMethodsService.updateBalanceSheet(null);
    this.paymentService.updatePaymentSubscription(null);
    this.paymentService.updateSearchModel(null);
  }

  navigateToOrders(){
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigateByUrl('/pos-orders')
  }

  openPIN(request: any) {

    if (!this.platformService.isApp) {return}
    let dialogRef: any;
    dialogRef = this.dialog.open(FastUserSwitchComponent,
      { width:        '550px',
        minWidth:     '550px',
        height:       '700px',
        minHeight:    '700px',
        data: request
      },
    )
  }

  authCheck(request: any) {
    let dialogRef: any;
    dialogRef = this.dialog.open(FastUserSwitchComponent,
      { width:        '550px',
        minWidth:     '550px',
        height:       '700px',
        minHeight:    '700px',
        data: request
      },
    )
    return dialogRef
  }

  swapMenuWithOrder(swap: boolean) {
    this.swapMenuWithOrderBoolean = swap;
    this._swapMenuWithOrder.next(swap)
  }


  processPaymentLink(path : string) {
    const [route, params] = path.split(';');
    const paramParts = params.split('=');
    const paramName = paramParts[0];
    const orderCode = paramParts[1];

    // Ensure the paramName is 'orderCode' before navigating
    if (paramName === 'orderCode' && orderCode) {
      // Navigate using the extracted route and order code

      // this.router.navigate(["/menuitems-infinite/", {subCategoryID:item.id }])

      this.router.navigate( [route.toString() ,  { orderCode:  orderCode} ] );
    }
  }

  processLogin(user: IUser, path : string) {

    if (!user) {
      console.log('no user', user)
      return 'user undefined'
    }

    if (path.startsWith('/qr-payment')) {
      this.processPaymentLink(path)
      return;
    }

    if (user && user.message == undefined) {
      console.log('no user', user)
      return 'user undefined'
    }

    // if account loccked out then change here.
    if (user?.message.toLowerCase() === 'failed') {
      return user.errorMessage
    }

    if (user && !user.message) {
      return 'No message response from API.'
    }

    if (path) {
      this.router.navigate([path]);
      return 'success'
    }

    if (user.message === 'success') {
      this.loginToReturnUrl();
      return 'success'
    }

    this.setAppUser()
    this.userIdle.resetTimer()
  }

  loginToURL(path) {
    let returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (path) {
      this.router.navigate([path])
    }

    if (returnUrl) {
      this.router.navigate([returnUrl])
    }

    this.loginToReturnUrl()
  }


  authenticateLogin(userLogin) {

    //logs in
    //sets preferences
    //sets uers auths.
    //set current order (for regular customers)
    const site = this.siteService.getAssignedSite()
    return this.authenticate(userLogin).pipe(switchMap(data => {

      if (data && data.errorMessage) {
        this.siteService.notify('Message: Error: ' + data.errorMessage, 'close', 2000, 'red' )
        return of(null)
      }

      if (!data) {
        this.siteService.notify('Error: ' + 'No user identified.', 'close', 2000, 'red' )
        return of(null)
      }

      if (data && !data.id) {
        this.siteService.notify('Message: Error: No ID for user found.', 'close', 2000, 'red' )
        return of(null)
      }

      this.authenticationService.overRideUser(data)
      return this.getClientForAuthOverRide(site, data?.id, true)
    })).pipe(switchMap(data => {
      return this.setAuthAndClientTypeForAuthOverRide(site, data.clientTypeID)
     }
    ))
  }

  getClientForAuthOverRide(site: ISite, id:number, overRidePreferences?: boolean) {
    return this.clientTableService.getClient(site, id).pipe(switchMap(data => {
        if (!data || (data.clientTypeID == 0 ||  !data.clientTypeID)) {
          this.siteService.notify('Client not or type found - no authorizations will be assigned.', 'close', 2000, 'red')
          return of(null)
        }
        if (!overRidePreferences) {
          const item = JSON.parse(data?.preferences) as UserPreferences;
          this.authenticationService.updatePreferences(item)
        }
        return of(data);
    }))
  }

  setAuthAndClientTypeForAuthOverRide(site: ISite, id: number) {
    return this.clientTypeService.getClientType(site, id).pipe(switchMap(data => {
      if (!data) {
        this.siteService.notify('User auths not determined', 'close', 2000, 'red')
        return of(null)
      }

      const item = {} as IUserAuth_Properties
      if (!data || !data.jsonObject) { return of(item) }
      const auths = JSON.parse(data.jsonObject) as IUserAuth_Properties;
      this.authenticationService.updateUserAuthstemp(auths);

      return of(auths)

    }))
  }

  assignCurrentOrder(user: IUserProfile)  {
    const site = this.siteService.getAssignedSite()
    if (user && user.roles == 'user' && user.id) {
      const order$ = this.orderService.getUserCurrentOrder(site, user.id)
      order$.subscribe(data => {
        if (!data) {return of(null)}
        if (data.toString().toLowerCase() === 'no order') {return of(null)}
        this.orderMethodService.updateOrderSubscription(data)
      })
    }
  }

  loginApp(user) {
    const currentUser   = user.user
    const sheet         = user.sheet

    // console.log(user)
    if (sheet) {
      if (sheet.message) {
        this.siteService.notify(`Message ${sheet.message}`, `Error`, 20000)
        const result =   this.processLogin(currentUser, null)
        if (result === 'success') {
          return true;
        }
      }

      if (!sheet.shiftStarted || sheet.shiftStarted == 0 ||  (sheet.shiftStarted == 1 && sheet.endTime)) {
        this.router.navigate(['/balance-sheet-edit', {id:sheet.id}]);
        return true
      }
      if (sheet.shiftStarted) {
        this.router.navigate(['/main-menu']);
      }
    }
    return false
  }

  initUserFeatures() {
    this.uiSettingService.initSecureSettings();
  }

  browseMenu() {
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigate(['/app-main-menu']);
  }

  loginToReturnUrl() {

    let returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.platformService.isApp()) {
      if (returnUrl === '/login') {  returnUrl = '/pos-orders'}
    }

    if (!this.platformService.isApp()) {
      if (returnUrl = '/') { returnUrl = '/app-main-menu' }
      if (returnUrl === '/login') {  returnUrl = '/app-main-menu'}
    }

    // console.log('returnUrl', returnUrl)
    this.router.navigate([returnUrl]);

  }


}

