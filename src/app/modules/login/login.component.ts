﻿import { CompanyService, AuthenticationService, AWSBucketService} from 'src/app/_services';
import { ICompany, IPOSOrder, IUser}  from 'src/app/_interfaces';
import { Component, Inject, Input, OnDestroy, OnInit, Optional, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from 'src/app/_animations';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { Subscription, switchMap , of, Observable, concatMap} from 'rxjs';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
// import { ElectronService } from 'ngx-electron';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { PollingService } from 'src/app/_services/system/polling.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ApiStatusDisplayComponent } from 'src/app/shared/widgets/api-status-display/api-status-display.component';
import { KeyboardButtonComponent } from 'src/app/shared/widgets/keyboard-button/keyboard-button.component';
import { LogoComponent } from 'src/app/shared/widgets/logo/logo.component';
import { EmployeesOnClockListComponent } from '../admin/employeeClockAdmin/employees-on-clock-list/employees-on-clock-list.component';
import { FastUserSwitchComponent } from '../profile/fast-user-switch/fast-user-switch.component';

@Component({
    selector   : 'login-dashboard',
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      MatLegacyCardModule,
      MatLegacyFormFieldModule,
      MatLegacyInputModule,
      MatLegacyButtonModule,
      MatDividerModule,
      MatLegacyProgressSpinnerModule,
      MatIconModule,
      MatCheckboxModule,
      LogoComponent,
      ApiStatusDisplayComponent,
      KeyboardButtonComponent,
      FastUserSwitchComponent,
      EmployeesOnClockListComponent
    ],
    templateUrl: './login.component.html',
    styleUrls  : ['./login.component.scss'],
    animations : [ fadeInAnimation ],
})

export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('timeClockView')   timeClockView: TemplateRef<any>;
  @ViewChild('pinEntryView')    pinEntryView: TemplateRef<any>;
  @ViewChild('userEntryView')   userEntryView: TemplateRef<any>;
  @Input() statusMessage: string;
  initApp    = true

  setPinPad$ = this.authenticationService.setPinPad$.pipe(switchMap(data => {
    if (data) { this.togglePIN = true;  }
    return of(data)
  }))

  terminalSettings$: Observable<ITerminalSettings>;
  terminalSettings: ITerminalSettings;
  backgroundImage: any //'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'
  bucket         : string;
  spinnerLoading: boolean;
  compName   : string;
  company    = {} as ICompany;
  logo       = `assets/images/logo.png`;
  pinToken : string;
  loading    = false;
  submitted  = false;
  returnUrl  : string;
  orderCode  : string;
  error      = '';
  companyName: string;
  id         : any;
  dialogOpen: boolean;
  isApp     : boolean;
  loginForm : UntypedFormGroup;
  amI21     : any;
  errorMessage: string;
  counter   =0;
  loggedInUser : IUser;
  _user     : Subscription;
  togglePIN = false;
  _uISettings: Subscription;
  uiHomePageSetting: UIHomePageSettings;

  action$: Observable<any>;
  loginAction$: Observable<any>;
  loginAction: any;

  _loginStatus    : Subscription;
  loginStatusvalue: number;
  rememberMe: boolean;
  uiHome$: Observable<UIHomePageSettings>;

  device$ : Observable<ITerminalSettings>; //this.settingService.getDeviceSettings()
  isElectron: any;
  androidApp: boolean;
  smallDevice: boolean;

  get smallPOS() {
    if (this.smallDevice && this.androidApp) {
      return true
    }
    return false;
  }
  initSubscriptions() {
    this._user = this.authenticationService.user$.subscribe( user => {
      if (user)  { this.loggedInUser = user }
      if (!user) { this.loggedInUser = null; }
    })

    this._loginStatus = this.userSwitchingService.loginStatus$.subscribe( data => {
      if (!data) {
        this.loggedInUser = null;
        this.updateLoginStatus(null);
      }
      if (data) {
        this.loginStatusvalue = data;
        this.updateLoginStatus(data);
      }
    })

    this._uISettings = this.uiSettingService.homePageSetting$.subscribe( data => {
        if (data) {
          const image  = `${this.bucket}${data.backgroundImage}`
          this.assingBackGround(image)
          this.uiHomePageSetting = data;

          if (data?.pinPadDefaultOnApp) {
            localStorage.setItem('rememberMe', 'true')
            this.rememberMe = true;
          }
          if (data.logoHomePage) {
            this.logo = `${this.bucket}${data.logoHomePage}`;
          }

          if (this.isApp) {
            if (this.uiHomePageSetting.pinPadDefaultOnApp) {
              this.togglePIN = true;
              this.authenticationService.updatePinPad(this.uiHomePageSetting.pinPadDefaultOnApp)
            }
          }
        }
      }
    )
  }

  // convenience getter for easy access to form fields
  get f() {
    if (!this.loginForm) { this.initForm() }
    return this.loginForm.controls;
  }

  constructor(
        private fb                     : UntypedFormBuilder,
        private route                  : ActivatedRoute,
        private router                 : Router,
        private _renderer              : Renderer2,
        private authenticationService  : AuthenticationService,
        private userSwitchingService   : UserSwitchingService,
        private companyService         : CompanyService,
        private siteService            : SitesService,
        public  platformService        : PlatformService,
        private appInitService         : AppInitService,
        private uiSettingService       : UISettingsService,
        private awsBucketService       : AWSBucketService,
        private orderMethodsService    : OrderMethodsService,
        // private electronService        : ElectronService,
        private platFormService        : PlatformService,
        private settingService         : SettingsService,
        private paymentMethodsservice  : PaymentsMethodsProcessService,
        private pollingService: PollingService,
        @Optional() private dialogRef  : MatDialogRef<LoginComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    )
  {
    if (data)  { this.dialogOpen = true  }

    if (data?.orderCode)  {
      this.orderCode = data?.orderCode
    }
    if (data?.returnUrl) {
      this.returnUrl = data?.returnUrl;
    }

    console.log('openLoginDialog', data)
    if (!data) {  this.redirects();  }
  }

  async ngOnInit() {
    this.isApp      = this.platformService.isApp()
    this.isElectron = this.platformService.isAppElectron
    this.androidApp = this.platformService.androidApp

    if (window.innerWidth > 811) {
      this.smallDevice = false;
      this.siteService.smallDevice = false
    } else {
      this.smallDevice = true;
      this.siteService.smallDevice = true
    }

    const item = localStorage.getItem('loginAction')
    this.loginAction = JSON.parse(item)
    this.bucket = await this.awsBucketService.awsBucketURL()
    this.pinToken = localStorage.getItem('pinToken');
    if (localStorage.getItem('rememberMe') === 'true') {
      this.rememberMe = true;
    }
    this.initForm();
    this.initSubscriptions()
    if (!this.platformService.isApp())  { this.amI21 = true  }
    if ( this.platformService.isApp())  { this.amI21 = false }
    this.refreshTheme();
    this.statusMessage = ''
    this.refreshUIHomePageSettings();
    this.initDevice();

    if (!this.returnUrl) {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
    console.log('current returnurl', this.returnUrl)
  }

  initDevice() {
    const device = localStorage.getItem('devicename');
    if (device) {
      const site = this.siteService.getAssignedSite()
      this.device$ = this.settingService.getPOSDeviceSettings(site,device).pipe(switchMap(data => {
        this.zoom(data)
        return of(data)
      }))
    }
  }

  zoom(posDevice: ITerminalSettings)  {
    if (posDevice && posDevice?.electronZoom && posDevice?.electronZoom != '0') {
      this.uiSettingService.electronZoom(+posDevice.electronZoom)
    }
  }

  // async  openDrawerOne() {
  //   // const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
  //   // const response        = await emvTransactions.openCashDrawerOne()
  // }

  async openDrawerOne(): Promise<void> {
    try {
      const response = await (window as any).electron.openDrawerOne();
      console.log('Drawer One Response:', response);
    } catch (error) {
      console.error('Failed to open Drawer One:', error);
      this.siteService.notify(`Failed to open Drawer One: ${error}`, 'Close', 3000, 'red');
    }
  }

  async openDrawerTwo(): Promise<void> {
    try {
      const response = await (window as any).electron.openDrawerTwo();
      console.log('Drawer Two Response:', response);
    } catch (error) {
      console.error('Failed to open Drawer Two:', error);
      this.siteService.notify(`Failed to open Drawer Two: ${error}`, 'Close', 3000, 'red');
    }
  }

  refreshUIHomePageSettings() {
    const item$ = this.settingService.getUIHomePageSettings()
    this.uiHome$ = item$.pipe(switchMap(data => {
      this.uiHomePageSetting = data as UIHomePageSettings
      this.initCompanyInfo();
      this.initLogo();
      this.setPinPadDefault(this.uiHomePageSetting)
      return of(data)
    }));
  }

  get enableTimeClockView() {
    if (this.platformService.isApp()) {
      return this.timeClockView
    }
    return null
  }

  openTimeClock() {
    this.userSwitchingService.openTimeClock()
  }

  setPinPadDefault(uiHome) {
    if (this.platformService.isApp()) {
      if (uiHome.pinPadDefaultOnApp) {
        this.togglePIN = true;
        this.authenticationService.updatePinPad(uiHome.pinPadDefaultOnApp)
      }
    } else {
    }
  }

  ngOnDestroy(): void {
    this.statusMessage = ''
    try {
      if (this._user) { this._user.unsubscribe() }
      if (this._loginStatus) { this._loginStatus.unsubscribe()}
      if (this._uISettings) { this._uISettings.unsubscribe()}
      if (this._user) { this._user.unsubscribe()}
    } catch (error) {
       console.log('on Destroy Error')
    }
  }

  get tokenExists() {
    const item =localStorage.getItem('pinToken')
    if (item) { return true}
    return false
  }

  get loginMethodView() {
    if (this.togglePIN && this.tokenExists ) {
      return this.pinEntryView;
    }
    return this.userEntryView;
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  redirects() {
    if (this.redirectAPIUrlRequired()){ return }
    if (this.redirectUserLoggedIn())  { return }
  }

  switchUser() {
    this.userSwitchingService.openPIN({request: 'switchUser'})
  }

  setAPIAlt() {
    this.counter  = this.counter +1
    if (this.counter > 5) {
      this.counter = 0;
      this.closeDialog();
      this.router.navigate(['/apisetting']);
    }
  }

  initCompanyInfo() {
    this.compName    = this.appInitService.company;
  }

  initLogo() {
    if (this.bucket && this.uiHomePageSetting) {
      if (this.uiHomePageSetting && this.uiHomePageSetting.logoHomePage) {
        this.logo = `${this.bucket}${this.uiHomePageSetting.logoHomePage}`
      }
    }
  }

  redirectUserLoggedIn() {
    const user = this.authenticationService.userValue;
    if (user) {
      this.closeDialog();
      this.router.navigate(['/app-main-menu']);
      return true
    }
  }

  redirectAPIUrlRequired() {
    if (this.platformService.isApp())  {
      this.platformService.initAPIUrl();
      if (!this.platformService.apiUrl || this.platformService.apiUrl.length == 0) {
        this.closeDialog();
        this.router.navigate(['/apisetting']);
        return true
      }
    }
  }

  refreshTheme() {
    const theme =  localStorage.getItem('angularTheme');
    if ( theme === 'dark-theme') {
      this._renderer.addClass(document.body, 'dark-theme');
      this._renderer.removeClass(document.body, 'light-theme');
      localStorage.setItem('angularTheme', 'dark-theme')
      return
    }
    if ( theme != 'dark-theme') {
      this._renderer.addClass(document.body, 'light-theme');
      this._renderer.removeClass(document.body, 'dark-theme');
      localStorage.setItem('angularTheme', 'light-theme')
    }
  }

  forgetMe() {
    this.initForm();
    this.clearUserSettings();
    localStorage.removeItem('devicename')
    localStorage.removeItem('awsbucket')
    this.notifyEvent("Your settings have been removed from this device.", "Bye!");
    this.statusMessage = ''
  }

  browseMenu() {
    this.initForm();
    this.userSwitchingService.clearLoggedInUser()
    this.userSwitchingService.browseMenu();
    this.statusMessage = ''
    this.closeDialog();
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

  getCompanyInfo() {
    const site = this.siteService.getAssignedSite();
    this.companyService.getCompany(site).subscribe(data =>
      {
        if (data) {
          this.company  = data
          localStorage.setItem('company/compName', JSON.stringify(this.company.compName))
          localStorage.setItem('company/phone', JSON.stringify(this.company.phone))
          localStorage.setItem('company/address', JSON.stringify(this.company.compAddress1))
        }
      }
    );
  }

  registerUser()  {
    this.closeDialog();
    this.router.navigate(['/register-user']);
  }

  changePassword(){
    this.closeDialog();
    this.router.navigate(['/resetpassword']);
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

  updateLoginStatus(option: number) {
    return;

    if (option == 0) {
      this.submitted      = true;
      this.statusMessage  = ""
      this.spinnerLoading = true;
      return
    }

    if (option == 1) {
      this.statusMessage   = 'Error logging in. Please check your name and pasword.'
      this.spinnerLoading = false;
      this.initForm();
      return
    }

    if (option == 2) {
      this.statusMessage   = 'logging in...'
      this.spinnerLoading = true;
      // this.initForm();
      return
    }

    if (option == 3) {
      this.statusMessage = 'User name and password required.'
      this.spinnerLoading = false;
      this.initForm();
      return
    }

    if (option == 5) {
      this.loggedInUser.message == 'failed'
      this.loggedInUser.errorMessage = 'Error logging in.'
      this.statusMessage = "Service is not accessible, check connection."
      this.initForm();
      return
    }

    if (option == 6) {
      this.statusMessage   = ''
      this.spinnerLoading = false;
      this.initForm();
      return
    }
  }

  startProcessing() {
    this.submitted      = true;
    this.statusMessage  = "...loggining in"
    this.spinnerLoading = true;
  }

  updateRememberMe(checked: boolean) {
    this.rememberMe = checked
    if (this.rememberMe) {
      localStorage.setItem('rememberMe', 'true')
      return
    }
    localStorage.setItem('rememberMe', 'false')
  }

  pinLogin(event) {
    const pin = event.password;
    const user = event.username;
    this.dialogOpen = false
    this.submitLogin( user, pin)
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
            console.log('sheet exists', sheet?.id)
          } else {
            console.log('no sheet')
          }

          //if is app
          if (sheet) {
            if (this.loginApp(result)) {  return of('success') }
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

                  this.closeDialog();
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
                this.closeDialog();
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


  closeDialog() {
    // if (this.dialogOpen) {
    //   console.log('dialog open')
      try {
        this.dialogRef.close();
      } catch (error) {
        return of('error')
      }
    // }
  }

  setloginAction(): Observable<IPOSOrder> {
    return this.orderMethodsService.getLoginActions()
  }

  loginApp(result) {
    if (this.platformService.isApp()) {
      this.loggedInUser   = result.user;
      this.spinnerLoading = false
      return this.userSwitchingService.loginApp(result)
    }
    return false;
  }

  assingBackGround(image: string) {
    if (!image) {
      image = ''
     }
    const styles = { 'background-image': `url(${image})`  };
    this.backgroundImage = styles
    const i = 1
  }

  notifyEvent(message: string, action: string) {
    this.siteService.notify(message ,action , 2000)
  }

}

