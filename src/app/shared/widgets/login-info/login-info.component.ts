import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { concatMap, Observable, of } from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PollingService } from 'src/app/_services/system/polling.service';
import { UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'app-login-info',
  templateUrl: './login-info.component.html',
  styleUrl: './login-info.component.scss'
})
export class LoginInfoComponent implements OnInit{
  action$ :  Observable<any>;
  @Input() disableGuestOption: boolean;
  @Input() uiHomePageSetting: UIHomePageSettings;
  @Input() smallDevice: boolean;
  @Output() outPutCompleted = new EventEmitter()
  isApp: boolean;
  isElectron: boolean;
  androidApp: boolean;
  statusMessage: string;
  spinnerLoading: boolean;
  loading    :boolean // false;
  submitted  :boolean;
  loginForm : UntypedFormGroup;
  returnUrl: string;
  loginAction$: Observable<any>;
  loginAction: any;
  orderCode: any;
  dialogOpen: boolean;
  errorMessage: string;
  rememberMe: boolean;

  get f() {
    if (!this.loginForm) { this.initForm() }
    return this.loginForm.controls;
  }

  constructor(
    private fb                     : UntypedFormBuilder,
    private authenticationService  : AuthenticationService,
    private userSwitchingService   : UserSwitchingService,
    private siteService            : SitesService,
    public  platformService        : PlatformService,
    private orderMethodsService    : OrderMethodsService,
    private paymentMethodsservice  : PaymentsMethodsProcessService,
    private pollingService          : PollingService,

  ) {}

  ngOnInit(): void {
    // console.log('')
    this.isApp      = this.platformService.isApp()
    this.isElectron = this.platformService.isAppElectron
    this.androidApp = this.platformService.androidApp
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  browseMenu() {
    this.initForm();
    this.userSwitchingService.clearLoggedInUser()
    this.userSwitchingService.browseMenu();
    this.statusMessage = ''
    this.outPutCompleted.emit(true);
  }

  updateRememberMe(checked: boolean) {
    this.rememberMe = checked
    if (this.rememberMe) {
      localStorage.setItem('rememberMe', 'true')
      return
    }
    localStorage.setItem('rememberMe', 'false')
  }

  loginToReturnUrl() {
    this.userSwitchingService.loginToReturnUrl();
    this.statusMessage = ''
  }

  clearUserSettings() {
    this.spinnerLoading = false;
    this.authenticationService.clearUserSettings();
    this.orderMethodsService.clearOrderSubscription();
  }

  validateForm(inputForm: UntypedFormGroup) : boolean {
    try {
      if (inputForm.invalid) {
        this.userSwitchingService.updateLoginStatus(3)
        return false;
      }
    } catch (error) {
      console.log('error occured', error)
      return false
    }
    return true
  }


  onSubmit() {
    if (!this.validateForm(this.loginForm)) { return }
    this.spinnerLoading = true;
    const userName = this.f.username.value;
    const password = this.f.password.value;
    this.dialogOpen = false
    this.submitLogin(userName,password)
  }

  submitLogin(userName: string, password: string) {
    this.errorMessage = ''
    this.loginAction$ = this.userSwitchingService.login(userName, password, false).pipe(concatMap(result =>
        {

          // console.log('result', result)
          try {
            this.pollingService.clearPoll();
            this.spinnerLoading = false;
            this.paymentMethodsservice._sendOrderAndLogOut.next(null);
          } catch (error) {
            console.log('subscriber error', error)
          }

          this.initForm();
          //if is app then result is a combination of user and sheet
          //if is not app then result is the user.
          let user = result?.user ;
          let sheet = result?.sheet as IBalanceSheet;
          this.authenticationService.authenticationInProgress = false;

          if (user) {
            // console.log('usermessage', user?.message, user?.errorMessage)
          } else {
            console.log('no user')
          }

          if (sheet) {
            // console.log('sheet exists', sheet?.id)
          } else {
            console.log('no sheet')
          }

          if (result && result.username != undefined) { user = result }

          try {
            if (user) {

              if (user && user?.errorMessage === 'failed') {
                this.siteService.notify('Login failed', 'Close', 3000, 'red')
                this.authenticationService.authenticationInProgress = false;
                this.clearUserSettings()
                this.authenticationService.updateUser(null);
                return of('failed')
              }

              if (this.returnUrl) {
                if (result && result?.message && result?.message === 'success') {

                  let returnUrl = 'app-main-menu'
                  if (this.returnUrl) {
                    returnUrl = this.returnUrl
                  }

                  if (this.orderCode) {
                    const data = {orderCode: this.orderCode}
                    this.userSwitchingService.processLogin(user, returnUrl, data)
                  }

                  if (!this.orderCode) {
                    const data = {orderCode: this.orderCode}
                    this.userSwitchingService.processLogin(user, returnUrl)
                  }

                  this.outPutCompleted.emit(true);
                  return of('success')
                }
              }

              if (user && ( user?.message === 'success' || (result?.message === 'success'))) {

                let pass = false
                this.authenticationService.authenticationInProgress = false;
                if (!this.loginAction) {  this.userSwitchingService.assignCurrentOrder(user) }
                let returnUrl = 'app-main-menu'

                if (this.loginAction?.name === 'setActiveOrder') {
                  returnUrl = '/pos-payment'
                }
                if (this.returnUrl) {
                  returnUrl = this.returnUrl
                }

                if (this.orderCode) {
                  const data = {orderCode: this.orderCode}

                  this.userSwitchingService.processLogin(user, returnUrl, data)
                } else {
                  this.userSwitchingService.processLogin(user, returnUrl)
                }

                pass = true
                this.outPutCompleted.emit(true);

                return of('success')
              }
            }
          } catch (error) {
            console.log('subscriber error', error)
          }
          return of(null)
        }

    ))
  }

}
