import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { map, switchMap, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IUser, IUserProfile } from 'src/app/_interfaces';
import { EmployeeService } from '../people/employee-service.service';
import { FastUserSwitchComponent } from 'src/app/modules/profile/fast-user-switch/fast-user-switch.component';
import { MatDialog } from '@angular/material/dialog';
import { SitesService } from '../reporting/sites.service';
import { AuthenticationService, ContactsService, MenuService, OrdersService } from '..';
import { BalanceSheetService } from '../transactions/balance-sheet.service';
import { POSPaymentService } from '../transactions/pospayment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppInitService } from './app-init.service';

@Injectable({
  providedIn: 'root'
})
export class UserSwitchingService {

  // private _user       = new BehaviorSubject<IUserProfile>(null);
  // public  user$       = this._user.asObservable();
  // private user        :  IUserProfile

  // updateUserSubscription(user: IUserProfile) {
  //   console.log('user subscription updated', user)
  //   this._user.next(user);
  //   if (!user) {
  //     this.clearSubscriptions();
  //   }
  // }
  // getCurrentUser(): IUserProfile { return this.user}

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
  ) {
  }

  async switchUser(): Promise<boolean> {
    //open dialog
    const request = {request: 'switchUser'}
    //should have be switch user
    this.openPIN(request);
    //allow pin entry with password
    return true
  }

  pinEntryResults(pin: any) {

    //find employee
    const site = this.siteService.getAssignedSite()
    this.employeeService.getEmployeeByPIN(site, pin).subscribe
      (data =>
      {
        console.log('user',data)
        if (data) {
          if (data.employee && data.client) {

            let currentUser       = {} as IUser;
            const emp      = data.employee
            const client   = data.client;

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

    const userLogin = { username, password };
    return  this.http.post<any>(url, userLogin)
      .pipe(
        timeout(5000),
        map(
          user => {
            if (user) {
              try {
                  // console.log('success')
                  console.log('user', user)
                  this.clearSubscriptions();
                  const currentUser = this.setUserInfo(user, password)
                  console.log('currentUser', currentUser)
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


}

