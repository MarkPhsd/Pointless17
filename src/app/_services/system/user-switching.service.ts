import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Subscription } from 'rxjs';
import { map,  timeout } from 'rxjs/operators';
import { IUser } from 'src/app/_interfaces';
import { EmployeeService } from '../people/employee-service.service';
import { FastUserSwitchComponent } from 'src/app/modules/profile/fast-user-switch/fast-user-switch.component';
import { MatDialog } from '@angular/material/dialog';
import { SitesService } from '../reporting/sites.service';
import { AuthenticationService, ContactsService, OrdersService } from '..';
import { BalanceSheetService } from '../transactions/balance-sheet.service';
import { POSPaymentService } from '../transactions/pospayment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppInitService } from './app-init.service';
import { PlatformService } from './platform.service';
import { EncryptionService } from '../encryption/encryption.service';

export interface ElectronDimensions {
  height: string;
  width : string;
  depth : string;
}

@Injectable({
  providedIn: 'root'
})
export class UserSwitchingService {

  user  : IUser;
  _user : Subscription

  initSubscriptions() {
    this._user = this.authenticationService.user$.subscribe(user => {
      this.user = user;
    })
  }

  constructor(
    private router          : Router,
    private http            : HttpClient,
    private siteService     : SitesService,
    private employeeService : EmployeeService,
    private dialog          : MatDialog,
    private authenticationService: AuthenticationService,
    private orderService    : OrdersService,
    private contactsService : ContactsService,
    private balanceSheetService: BalanceSheetService,
    private paymentService  : POSPaymentService,
    private snackBar        : MatSnackBar,
    private appInitService  : AppInitService,
    private route           : ActivatedRoute,
    private platformService : PlatformService,
    private encryptionService: EncryptionService,
  ) {
    this.initSubscriptions();
    this.initializeAppUser();
  }

  initializeAppUser() {
    const temp = JSON.parse(localStorage.getItem('appUser')) as ElectronDimensions;
    if (temp) { return }

    const appUser = {} as ElectronDimensions;
    const user = JSON.stringify(appUser)
    localStorage.setItem('appUser', user)
  }

  async switchUser(): Promise<boolean> {
    //open dialog
    const request = {request: 'switchUser'}
    //should have be switch user
    this.openPIN(request);
    //allow pin entry with password
    return true
  }

  setAppUser() {
    //then we can set the user to the secret user
    const appUser = JSON.parse(localStorage.getItem('appUser')) as ElectronDimensions;

    const iUser = {} as IUser;
    iUser.username  = this.encryptionService.decrypt(appUser.height, appUser.depth)
    iUser.password = this.encryptionService.decrypt(appUser.width, appUser.depth)

    this.authenticationService.updateUser(iUser)
  }

  saveAppUser(appUser: ElectronDimensions) {
    // height: string;
    // width : string;
    // depth : string;

    appUser.height = this.encryptionService.encrypt(appUser.height, appUser.depth)
    appUser.width  = this.encryptionService.encrypt(appUser.width, appUser.depth)

    const user = JSON.stringify(appUser);
    localStorage.setItem('electronFeature', user);
  }

  pinEntryResults(pin: any) {
    //find employee
    const site = this.siteService.getAssignedSite()
    //secret user
    if (!this.user && !this.platformService.webMode) {
      this.setAppUser();
    }

    this.employeeService.getEmployeeByPIN(site, pin).subscribe
      (data =>
      {
        if (data) {
          if (data.employee && data.client) {

            let currentUser       = {} as IUser;
            const emp             = data.employee
            const client          = data.client;

            currentUser.password  = pin;
            currentUser.roles     = client.roles
            currentUser.roles     = client.roles.toLowerCase()
            currentUser.id        = client.id
            currentUser.employeeID= client.employeeID
            currentUser.username  = client.userName;
            currentUser.phone     = client.phone;
            currentUser.email     = client.email;

            const user = this.setUserInfo(currentUser, pin)
            this.authenticationService.updateUser(user)
            this.clearSubscriptions();
            return true;

          }
        }
      }
      , (err: HttpErrorResponse) => {
        this.snackBar.open("Try again.", "Failure", {verticalPosition: 'top', duration: 2000})
        console.log(err)
     })

  }

  async login(username: string, password: string) {

    const site = this.siteService.getAssignedSite()
    const apiUrl = await this.appInitService.apiBaseUrl()
    let url = `${apiUrl}/users/authenticate`

    this.clearSubscriptions();

    const userLogin = { username, password };

    return  this.http.post<any>(url, userLogin)
      .pipe(
        // timeout(5000),
        map(
          user => {
            console.log('user', user)
            if (user) {
              try {
                  const currentUser   = this.setUserInfo(user, password)
                  this.authenticationService.updateUser(currentUser)
                  return user
              } catch (error) {
                console.log('error', error)
                return EMPTY;
              }
            }
        }
        , (err: HttpErrorResponse) => {
            console.log(err)
            return err
      })
    )
  }

  setUserInfo(user: IUser, password) {
    const currentUser = {} as IUser;
    if (!user.roles) { user.roles = 'user' }
    if (!user.firstName) {
      user.firstName= user.username
    }
    localStorage.setItem("ami21", 'true')
    currentUser.password  = password;
    currentUser.roles     = user.roles
    currentUser.roles     = currentUser.roles.toLowerCase()
    currentUser.id        = user.id
    currentUser.employeeID= user.employeeID
    currentUser.username  = user.username;
    currentUser.phone     = user.phone;
    currentUser.email     = user.email;
    currentUser.token     = user.token;
    currentUser.errorMessage = user.errorMessage
    currentUser.message = user.message
    user.authdata = window.btoa(user.username + ':' + user.password);
    return currentUser
  }

  clearSubscriptions() {
    this.orderService.updateOrderSubscription(null);
    this.contactsService.updateSearchModel(null);
    this.balanceSheetService.updateBalanceSearchModel(null);
    this.balanceSheetService.updateBalanceSheet(null);
    this.paymentService.updatePaymentSubscription(null);
    this.paymentService.updateSearchModel(null);
  }

  navigateToOrders(){
    this.router.navigateByUrl('/pos-orders')
  }

  openPIN(request: any) {
    if (this.platformService.webMode) {return}

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

  processLogin(user: IUser) {
    //login the user based on the message response of the user.
    // console.log('user from Process login', user)
    if (user && user.message == undefined) {
      return 'user undefined'
    }

    if (user && !user.message) {
      return 'No message response from API.'
    }

    if (user.message === 'success') {
      this.loginToReturnUrl();
      return 'success'
    }

    //if account loccked out then change here.
    if (user.message.toLowerCase() === 'failed') {
      return user.errorMessage
    }
  }

  async  browseMenu() {
    this.router.navigate(['/app-main-menu']);
  }

  loginToReturnUrl() {
    let returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (returnUrl = '/') { returnUrl = '/app-main-menu' }
    if (returnUrl === '/login') {  returnUrl = '/app-main-menu'}
    if (returnUrl === '/apisetting') {    returnUrl = '/app-main-menu'}
    this.router.navigate([returnUrl]);
    this.browseMenu();
  }


}

