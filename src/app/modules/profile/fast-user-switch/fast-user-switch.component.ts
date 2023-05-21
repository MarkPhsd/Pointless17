import { Component, EventEmitter, Inject, OnInit, Optional, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { of ,Subscription,switchMap,BehaviorSubject, Observable } from 'rxjs';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { AuthenticationService, } from 'src/app/_services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fast-user-switch',
  templateUrl: './fast-user-switch.component.html',
  styleUrls: ['./fast-user-switch.component.scss']
})
export class FastUserSwitchComponent implements OnInit {

  public _pinCode            = new BehaviorSubject<string>(null);
  public pinCode$            = this._pinCode.asObservable();

  inputForm: UntypedFormGroup;
  request  : string;
  requestData: any;
  loginAction: any;
  loginAction$: Observable<string>;
  spinnerLoading: boolean;

  @Output() outPutLogin = new EventEmitter();

  constructor(
    private dialog                 : MatDialog,
    private userSwitchingService   : UserSwitchingService,
    private authenticationService  : AuthenticationService,
    private router                 : Router,
    private fb                     : UntypedFormBuilder,
    private _snackBar              : MatSnackBar,
    public  platformService        : PlatformService,
    @Optional()  dialogRef         : MatDialogRef<FastUserSwitchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    if (data) {
      this.request = data.request
      this.requestData = data
    }

    const item = localStorage.getItem('loginAction')
    this.loginAction = JSON.parse(item)

  }

  ngOnInit(): void {
    console.log('')
  }

  enterPIN(event) {
    const userName = localStorage.getItem('pinToken')
    const login = {username: userName, password: event }
    if (this.request) {
      this.submitLogin(userName, event)
      return;
    }
    this.outPutLogin.emit(login);
    this.onCancel();
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
