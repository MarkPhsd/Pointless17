import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { switchMap,   } from 'rxjs/operators';
import { clientType, IUser, IUserProfile, UserPreferences } from 'src/app/_interfaces';
import { EmployeeService } from '../people/employee-service.service';
import { FastUserSwitchComponent } from 'src/app/modules/profile/fast-user-switch/fast-user-switch.component';
import { MatDialog } from '@angular/material/dialog';
import { SitesService } from '../reporting/sites.service';
import { AuthenticationService, ContactsService, OrdersService } from '..';
import { POSPaymentService } from '../transactions/pospayment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppInitService } from './app-init.service';
import { PlatformService } from './platform.service';
import { EncryptionService } from '../encryption/encryption.service';
import { BalanceSheetMethodsService } from '../transactions/balance-sheet-methods.service';
import { ElectronService } from 'ngx-electron';
import { ToolBarUIService } from './tool-bar-ui.service';
import { UISettingsService } from './settings/uisettings.service';
import { ClientTypeService, IUserAuth_Properties } from '../people/client-type.service';

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

  updateLoginStatus(value: number) {
    this._loginStatus.next(value)
  }

  initSubscriptions() {
    this._user = this.authenticationService.user$.subscribe(user => {
      this.user = user;
    })
  }

  //enter or chain observables here.
  changeUser(user: IUser): Observable<any> {
    return this.sheetMethodsService.promptBalanceSheet(user)
  }

  constructor(
    private router           : Router,
    private http             : HttpClient,
    private siteService      : SitesService,
    private dialog           : MatDialog,
    private authenticationService: AuthenticationService,
    private orderService     : OrdersService,
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
  ) {
    this.initSubscriptions();
    this.initializeAppUser();
  }

  ngOnDestroy(): void {
    if (this._user) { this._user.unsubscribe()}
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

  getCurrentUser() {

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
    this.orderService.updateOrderSubscriptionClearOrder(0)
    this.orderService.updateOrderSearchModel(null);
    this.toolbarUIService.updateDepartmentMenu(0);
    this.authenticationService.logout();
  }

  pinEntryResults(pin: any) {
    //find employee

    const token =  localStorage.getItem('posToken')
    const site = this.siteService.getAssignedSite()

    return this.login(token, pin)
    //secret user
    // if (!this.user && !this.platformService.webMode) {
    //   this.setAppUser();
    // }

    // this.employeeService.getEmployeeByPIN(site, pin).subscribe
    //   (data =>
    //   {
    //     if (data) {
    //       if (data.employee && data.client) {

    //         let currentUser       = {} as IUser;
    //         const emp             = data.employee
    //         const client          = data.client;

    //         currentUser.password  = pin;
    //         currentUser.roles     = client.roles.toLowerCase()
    //         currentUser.id        = client.id
    //         currentUser.employeeID= client.employeeID
    //         currentUser.username  = client.userName;
    //         currentUser.phone     = client.phone;
    //         currentUser.email     = client.email;

    //         const user = this.setUserInfo(currentUser, pin)
    //         this.authenticationService.updateUser(user)
    //         this.clearSubscriptions();
    //         return true;

    //       }
    //     }
    //   }
    // )
  }

  authenticate(userLogin: userLogin): Observable<any> {
    const apiUrl =  this.appInitService.apiBaseUrl()
    const url = `${apiUrl}/users/authenticate`
    return this.http.post<any>(url, userLogin )
  }

  login(userName: string, password: string): Observable<any> {
    this.clearSubscriptions();
    this.authenticationService.clearUserSettings();
    const site = this.siteService.getAssignedSite()
    const userLogin = { userName, password } as userLogin;
    const timeOut   = 3 * 1000;

    return  this.authenticate(userLogin)
      .pipe(
        switchMap(
          user => {
          if (user && user.errorMessage) {
            const message = user?.errorMessage;
            this.snackBar.open(message, 'Failed Login', {duration: 1500})
            const item = {message: 'failed'}
            return of(item)
          }

          if (user) {
            if (user?.message.toLowerCase() === 'failed') {
              const user = {message: 'failed'}
              return of(user)
            }
            user.message = 'success'
            const currentUser = this.setUserInfo(user, password)
            this.uiSettingService.initSecureSettings();
            return of(user)
          } else {
            const user = {message: 'failed'} as IUser;
            return of(user)
          }
      })).pipe(switchMap(data => {
        // console.log(data)
        if (data?.message === 'failed') { return of(null)}
        return this.contactsService.getContact(site, data?.id)

      })).pipe(switchMap(data => {
        // console.log(data)
        if ( !data ) { return of( {message: 'failed'} ) }
        const item = localStorage.getItem('user')
        const user = JSON.parse(item) as IUser;

        if (data.clientType && data.clientType.jsonObject) {
          this.authenticationService.updateUserAuths(JSON.parse(data?.clientType?.jsonObject))
        }

        if ( this.platformService.isApp()  )  { return this.changeUser(user) }
        if ( !this.platformService.isApp() )  { return of(user)              }
      }
    ))
  }

  // getAuthorization()
  setUserInfo(user: IUser, password) {

    const currentUser = {} as IUser;
    if (!user.roles)     { user.roles = 'user' }
    if (!user.firstName) { user.firstName = user.username }
    localStorage.setItem("ami21", 'true')
    currentUser.password     = password;
    currentUser.roles        = user?.roles.toLowerCase()
    currentUser.id           = user.id
    currentUser.employeeID   = user.employeeID
    currentUser.username     = user.username;
    currentUser.phone        = user.phone;
    currentUser.email        = user.email;
    currentUser.token        = user.token;
    currentUser.firstName    = user?.firstName;
    currentUser.lastName     = user?.lastName;
    currentUser.errorMessage = user.errorMessage
    currentUser.message      = user.message

    if (user.preferences) {
      currentUser.userPreferences = JSON.parse(user.preferences) as UserPreferences;
      currentUser.preferences = user.preferences;
      if (!currentUser.userPreferences.swapMenuOrderPlacement) {
        currentUser.userPreferences.swapMenuOrderPlacement = false;
      }
    }

    if (!user.preferences) {
      currentUser.userPreferences =  {} as UserPreferences;
      currentUser.userPreferences.darkMode = false;
      currentUser.userPreferences.swapMenuOrderPlacement = false;
      currentUser.preferences = JSON.stringify(currentUser.userPreferences);
    }

    if (currentUser?.userPreferences.swapMenuOrderPlacement) {
      this.swapMenuWithOrder(currentUser.userPreferences.swapMenuOrderPlacement);
    } else {
      this.swapMenuWithOrder(false);
    }

    user.authdata = window.btoa(user.username + ':' + user.password);
    currentUser.authdata     = user.authdata
    localStorage.setItem('user', JSON.stringify(currentUser))
    this.authenticationService.updateUser(currentUser)

    return currentUser

  }

  setUserAuth(userAuth: string) {
    localStorage.setItem('userAuth', userAuth)
  }

  clearSubscriptions() {
    this.orderService.updateOrderSubscription(null);
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
        height:       '600px',
        minHeight:    '600px',
        data: request
      },
    )
  }

  swapMenuWithOrder(swap: boolean) {
    this.swapMenuWithOrderBoolean = swap;
    this._swapMenuWithOrder.next(swap)
  }

  processLogin(user: IUser, path : string) {

    if (user && user.message == undefined) {
      return 'user undefined'
    }
    // console.log('processlogin1')
    // if account loccked out then change here.
    if (user.message.toLowerCase() === 'failed') {
      return user.errorMessage
    }
    // console.log('processlogin2')
    if (user && !user.message) {
      return 'No message response from API.'
    }
    // console.log('processlogin3')
    if (path) {
      this.router.navigate([path]);
      return 'success'
    }
    // console.log('processlogin4')
    if (user.message === 'success') {
      // console.log('loginToReturnUrl')
      this.loginToReturnUrl();
      return 'success'
    }
    // console.log('processlogin5')
    this.setAppUser()
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

  assignCurrentOrder(user: IUserProfile)  {
    const site = this.siteService.getAssignedSite()
    if (user && user.roles == 'user' && user.id) {
      const order$ = this.orderService.getUserCurrentOrder(site, user.id)
      order$.subscribe(data => {
        this.orderService.updateOrderSubscription(data)
      })
    }
  }

  loginApp(user) {
    const currentUser   = user.user
    const sheet         = user.sheet

    if (sheet) {
      if (sheet.message) {
        this.siteService.notify(`Message ${sheet.message}`, `Error`, 20000)
        const result =   this.processLogin(currentUser, null)
        if (result === 'success') {
          return true;
        }
      }

      console.log('sheet.shiftStarted', sheet.shiftStarted)
      console.log('sheet.shiftStarted', sheet.endTime)

      if (sheet.shiftStarted == 0 ||  (sheet.shiftStarted == 1 && sheet.endTime)) {
        this.router.navigate(['/balance-sheet-edit', {id:sheet.id}]);
        return true
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

    this.router.navigate([returnUrl]);
    // console.log('returnUrl', returnUrl)
  }


}

