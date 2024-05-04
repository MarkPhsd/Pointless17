import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { of ,switchMap,BehaviorSubject, Observable, catchError } from 'rxjs';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { AuthenticationService, } from 'src/app/_services';
import { Router } from '@angular/router';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IUserProfile } from 'src/app/_interfaces';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { UIHomePageSettings,  } from 'src/app/_services/system/settings/uisettings.service';
import { BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'app-fast-user-switch',
  templateUrl: './fast-user-switch.component.html',
  styleUrls: ['./fast-user-switch.component.scss']
})
export class FastUserSwitchComponent implements OnInit {

  phoneDevice         : boolean;
  smallDevice         :   boolean;
  public _pinCode            = new BehaviorSubject<string>(null);
  public pinCode$            = this._pinCode.asObservable();
  action$: Observable<any>;
  inputForm: UntypedFormGroup;
  request  : string;
  requestData: any;
  loginAction: any;
  loginAction$: Observable<any>;
  spinnerLoading: boolean;
  dialogRefOption: any;
  @Output() outPutLogin = new EventEmitter();
  @Input() disableUserStatus: boolean;

  uiHomePage: UIHomePageSettings;
  uiHome$: Observable<UIHomePageSettings>;
  balanceSheet$:  Observable<any>;
  isLocked = false;
  UIisLocked: boolean
  employeeAllowed: number;
  sheet: IBalanceSheet;

  constructor(
    private dialog                 : MatDialog,
    private userSwitchingService   : UserSwitchingService,
    private authenticationService  : AuthenticationService,
    private siteService            : SitesService,
    private settingsService        : SettingsService,
    private fb                     : UntypedFormBuilder,
    private _snackBar              : MatSnackBar,
    private router                 : Router,
    private balanceSheetService   : BalanceSheetService,
    public  platformService        : PlatformService,
    private toolbarUIService       : ToolBarUIService,
    @Optional()  dialogRef         : MatDialogRef<FastUserSwitchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    this.dialogRefOption = dialogRef
    if (data) {
      this.request = data.request
      this.requestData = data
    }
    const item = localStorage.getItem('loginAction')
    this.loginAction = JSON.parse(item)
  }

  ngOnInit(): void {
    this.isLocked = false;
    this.UIisLocked = false
    this.smallDevice = false;
    this.phoneDevice = false;
    if (811 >= window.innerWidth ) {
      this.smallDevice = true
    }
    if (500 >= window.innerWidth ) {
      this.smallDevice = false;
      this.phoneDevice = true
    }
    this.getBalanceSheet();
    this.getUIHome( !this.request || this.request != 'checkAuth');
  }

  //this feature determins if we shouldset the locked feature
  getUIHome(checkForLock: boolean) {
    if (this.platformService.isApp()) {
      this.uiHome$ = this.settingsService.getUIHomePageSettings().pipe(switchMap(data => {
          this.uiHomePage = data;
            if (checkForLock) {
                this.UIisLocked = data.lockTerminalToBalanceSheet;
            }
            return of(data)
          }
        )
      )
    } else {
      this.uiHome$ = of(null)
    }
  }

  getBalanceSheet() {
    if (this.platformService.isApp()) {
      const site = this.siteService.getAssignedSite()
      const device = localStorage.getItem('devicename')
      this.balanceSheet$ = this.balanceSheetService.isDeviceInUse(site, device).pipe(switchMap(data => {
        this.isLocked = false;

        this.employeeAllowed = 0
        if (this.uiHomePage?.lockTerminalToBalanceSheet) {
          if (data && data.name != 'open') {
            this.isLocked = true;
            this.employeeAllowed = data.id
          }
        }
        return of(data)
      }))
      return ;
    }
    this.balanceSheet$ = of(null)
  }

  enterPIN(event) {
    const userName = localStorage.getItem('pinToken')
    const login    = {username: userName, password: event }
    this.initForm();

    if (this.disableUserStatus) {
      this.outPutLogin.emit(login);
      return;
    }

    if (this.request && this.request === 'checkAuth') {
      this.performTempUserAction(event)
      return;
    }

    if (userName && login) {
      this.submitLogin(userName, event, this.employeeAllowed)
      return;
    }

    if (login) {
      this.outPutLogin.emit(login);
      return;
    }
  }

  performTempUserAction(event)  {
    const action = this.requestData?.requestData?.action;
    if (this.requestData.action || action) {
      this.action$ = this.getAuthUserByPIN(event).pipe(switchMap(data => {
        if (data) {
            let result = false;
            if (this.requestData.action === 'price' || this.requestData.action === 'subTotal') {
              if (data.changeItemPrice) {  result = true }
            }

            if (action && action === 'saleAuth') {
              if (data.changeItemPrice) {  result = true }
            }

            if (this.requestData.action === 'refundItem') {
              if (data.refundItem) {  result = true}
            }

            if (this.requestData.action === 'voidItem') {
              if (data.voidItem) { result = true  }
            }

            if (this.requestData.action === 'voidPayment') {
              if (data.voidPayment) { result = true  }
            }

            if (this.requestData.action === 'voidOrder') {
              if (data.voidOrder) { result = true  }
            }

            if (result) {
              this.dialogRefOption.close(true);
            } else {
              this.dialogRefOption.close(false);
            }

            return of(data)
          }
          if (!data) {
            this.siteService.notify(`Not authorized`, 'Close', 2000,'red' )
            return of(null)
          }
        }
      ), catchError(data => {
        this.siteService.notify(`Error ${data.toString()}`, 'Close', 2000,'red' )
        return of(data)
      }))
      // this.dialog.closeAll();
      return;
    }
  }

  //gets temporary user so that we can get the auth. Then sets back the user
  //to the current user. This allows us to authenticate a user without having to
  //actually log out and log in.
  getAuthUserByPIN(pin: string): Observable<IUserAuth_Properties> {
    const site = this.siteService.getAssignedSite()
    const userName    = localStorage.getItem('pinToken')
    const userLogin   = { userName: userName, password: pin };
    const currentUser = this.userSwitchingService.user;
    return this.userSwitchingService.authenticateLogin(userLogin)
  }

  logout() {
    this.userSwitchingService.clearLoggedInUser();
    this.smallDeviceLimiter();
  }

  smallDeviceLimiter() {
    if (this.smallDevice) { this.toolbarUIService.updateOrderBar(false) }
  }

  onCancel() {
    this.initForm();
    try {
      this.dialog.closeAll();
    } catch (error) {
      console.log('error', error)
    }
  }

  initForm() {
    this.inputForm = this.fb.group({
      itemName: []
    })
    if (this.inputForm) {
      this.inputForm.patchValue({itemName: ''})
    }
  }

  checkBalanceSheet(user: IUserProfile) {
    //the reason we aren't using the user is because
    //we are using the basic auth to identify the user
    // itwill check both the device and the user in this api call.
    // if (user?.id) {
      const site = this.siteService.getAssignedSite()
      const device = localStorage.getItem('devicename')
      return  this.balanceSheetService.getCurrentUserBalanceSheet(site, device ).pipe(switchMap(data => {
        // console.log('checkBalanceSheet', data)
        if (data) {
          // console.log('data.shiftStarted', data.shiftStarted)
          if (!data.shiftStarted  || data.shiftStarted == 0) {
            // balance-sheet-edit
            this.router.navigate(['/balance-sheet-edit']);
          } else  {
            this.router.navigate(['/app-main-menu']);
          }
          this.onCancel();
        }
        return of(data)
      }))
    // }
    return of(null)
  }

  submitLogin(userName: string, password: string, employeeIDAllowed?: number) {

    this.loginAction$ = this.userSwitchingService.login(userName, password, false).pipe(
      switchMap(data =>
        {

          if (!data) {
            this.notifyEvent('Failed Login', 'Failed Login');
            return of('failed')
          }

          let user : IUserProfile

          if (data.user) {  user = data.user } else {  user = data;   }
          this._pinCode.next('');

          if (user?.errorMessage) {
            this.notifyEvent(user.errorMessage, 'Failed Login');
            return of('failed')
          }

          if (user && user.roles && ( user.roles.toLowerCase() != 'admin' || user.roles.toLowerCase() != 'manager')) {
            if (employeeIDAllowed && employeeIDAllowed != 0) {
              if (user.id != employeeIDAllowed) {
                  this.siteService.notify(`${user.errorMessage}, You are not allowed to use this terminal until the shift is closed.`, "close", 6000 , 'red'  );
                  return of('failed')
              }
            }
          }

          if (user) {
            this.spinnerLoading = false;
            if (user.message && user.message === 'failed' ||
                (user.errorMessage )) {
              this.authenticationService.updateUser(null);
              this.onCancel();
              return of('failed')
            }
            if (this.platformService.isApp()) {
              this.loginApp(user)
              return this.checkBalanceSheet(user)
            }

            if (user.message && user.message.toLowerCase() === 'success') {
              if (!this.loginAction) {
                this.userSwitchingService.assignCurrentOrder(user)
              }
              let pass = false
              if (this.loginAction) {
                if (this.loginAction.name === 'setActiveOrder') {
                  this.userSwitchingService.processLogin(user, '/pos-payment')
                  pass = true
                }
              }
              if (!pass) {
                this.userSwitchingService.processLogin(user, '')
              }
              return of('success')
            }
          }
          this.onCancel()
          return of('error')
        }
    ))
  }

  loginApp(user) {
    if (this.platformService.isApp()) {
      this.spinnerLoading = false
      return this.userSwitchingService.loginApp(user)
    }
  }

  openTimeClock() {
    const dialog = this.userSwitchingService.openTimeClock()
    try {
      dialog.afterclosed( data => {
        this.userSwitchingService.clearLoggedInUser()
      })
    } catch (error) {
      console.log('dialog ref error')
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
