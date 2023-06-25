import { Component, EventEmitter, Inject, OnInit, Optional, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { of ,Subscription,switchMap,BehaviorSubject, Observable, catchError } from 'rxjs';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { AuthenticationService, } from 'src/app/_services';
import { Router } from '@angular/router';
import { ClientTypeService, IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { IClientTable } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ClientTableService } from 'src/app/_services/people/client-table.service';

@Component({
  selector: 'app-fast-user-switch',
  templateUrl: './fast-user-switch.component.html',
  styleUrls: ['./fast-user-switch.component.scss']
})
export class FastUserSwitchComponent implements OnInit {

  public _pinCode            = new BehaviorSubject<string>(null);
  public pinCode$            = this._pinCode.asObservable();
  action$: Observable<any>;
  inputForm: UntypedFormGroup;
  request  : string;
  requestData: any;
  loginAction: any;
  loginAction$: Observable<string>;
  spinnerLoading: boolean;
  dialogRefOption: any;
  @Output() outPutLogin = new EventEmitter();

  constructor(
    private dialog                 : MatDialog,
    private userSwitchingService   : UserSwitchingService,
    private authenticationService  : AuthenticationService,
    private clientTypeService      : ClientTypeService,
    private clientTableService     : ClientTableService,
    private siteService            : SitesService,
    private router                 : Router,
    private fb                     : UntypedFormBuilder,
    private _snackBar              : MatSnackBar,
    public  platformService        : PlatformService,
    @Optional()  dialogRef         : MatDialogRef<FastUserSwitchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    this.dialogRefOption = dialogRef
    if (data) {
      this.request = data.request
      this.requestData = data
    }
    console.log(this.requestData)
    const item = localStorage.getItem('loginAction')
    this.loginAction = JSON.parse(item)

  }

  ngOnInit(): void {
    console.log('')
  }

  enterPIN(event) {
    console.log('1', this.request, this.requestData)

    if (this.request && this.request === 'checkAuth') {
      this.performTempUserAction(event)
      return;
    }

    const userName = localStorage.getItem('pinToken')
    const login = {username: userName, password: event }

    if (this.request) {
      this.submitLogin(userName, event)
      this.onCancel();
      return;
    }

    if (login) {
      this.outPutLogin.emit(login);
      return;
    }

  }

  performTempUserAction(event)  {

    if (this.requestData.action) {
      this.action$ = this.getAuthUserByPIN(event).pipe(switchMap(data => {
        if (data) {
            let result = false;

            if (this.requestData.action === 'price' || this.requestData.action === 'subtotal') {
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
              this.siteService.notify(`Not authorized`, 'Close', 2000,'red' )
              this.dialogRefOption.close(false);
            }

            return of(data)
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
    const userLogin =   { userName: pin, password: pin };
    const currentUser = this.userSwitchingService.user;
    let client = {} as any;

    return this.userSwitchingService.authenticate(userLogin).pipe(
      switchMap(data => {
        this.authenticationService.overRideUser(data)
        // console.log('user', data)
        return this.clientTableService.getClient(site, data.id)
      })).pipe(switchMap(data => {
        client = data
        // console.log('client', data)
        return this.clientTypeService.getClientType(site, client.clientTypeID)
      })).pipe(switchMap(data => {
        // console.log('Auths', data, data.jsonObject)
        const item = {} as IUserAuth_Properties
        if (!data || !data.jsonObject) { return of(item) }
        const auths = JSON.parse(data.jsonObject) as IUserAuth_Properties;
        return of(auths)
      }))

  }

  onCancel() {
    this.inputForm = this.fb.group({
      itemName: []
    })
    if (this.inputForm) {
      this.inputForm.patchValue({itemName: ''})
    }
    console.log('closing on cancel')
    try {
      this.dialog.closeAll();
      // this.dialogRef.close();
    } catch (error) {
      console.log('error', error)
    }
  }

  submitLogin(userName: string, password: string) {

    this.loginAction$ = this.userSwitchingService.login(userName, password).pipe(
      switchMap(user =>
        {
          this._pinCode.next('');

          if (user && user.errorMessage) {
            this.notifyEvent(user.errorMessage, 'Failed Login');
            return of('failed')
          }

          if (user) {
            this.spinnerLoading = false;
            if (user.message && user.message === 'failed' ||
                (user.errorMessage ||
                (user.user && user.user.errorMessage))) {
              this.authenticationService.updateUser(null);
              this.onCancel()
              return of('failed')
            }

          if (this.platformService.isApp()) {
            if (this.loginApp(user)) {
              this.userSwitchingService.loginApp(user)
              this.onCancel()
              return of('success')
            }
          }

          if (user.message && user.message.toLowerCase() === 'success') {
              if (!this.loginAction) {
                // console.log('cancel 2')
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

              console.log('cancel 4')
              this.onCancel()

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

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }



}
