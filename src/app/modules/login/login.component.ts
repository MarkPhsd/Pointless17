import { CompanyService, AuthenticationService, AWSBucketService, ThemesService, OrdersService} from 'src/app/_services';
import { ICompany, IPOSOrder, IUser, IUserProfile }  from 'src/app/_interfaces';
import { Component, Inject, Input, OnDestroy, OnInit, Optional, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from 'src/app/_animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { Subscription, switchMap , of, Observable} from 'rxjs';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { SplashScreenStateService } from 'src/app/_services/system/splash-screen-state.service';
import { IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY } from '@angular/cdk/overlay/overlay-directives';

@Component({
    selector   : 'login-dashboard',
    templateUrl: './login.component.html',
    styleUrls  : ['./login.component.scss'],
    animations : [ fadeInAnimation ],
})

export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild('pinEntryView')    pinEntryView: TemplateRef<any>;
  @ViewChild('userEntryView')   userEntryView: TemplateRef<any>;
  @Input() statusMessage: string;
  initApp    = true

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
  error      = '';
  companyName: string;
  id         : any;
  dialogOpen: boolean;
  isApp     : boolean;
  loginForm : FormGroup;
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

  _loginStatus    : Subscription;
  loginStatusvalue: number;
  loginAction: any;
  rememberMe: boolean;

  async initSubscriptions() {
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
          if (data.logoHomePage) {
            this.logo = `${this.bucket}${data.logoHomePage}`;
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
        private fb                   : FormBuilder,
        private route                : ActivatedRoute,
        private router               : Router,
        private _renderer            : Renderer2,
        private authenticationService: AuthenticationService,
        private userSwitchingService : UserSwitchingService,
        private _snackBar            : MatSnackBar,
        private companyService       : CompanyService,
        private siteService          : SitesService,
        public  platformService       : PlatformService,
        private appInitService       : AppInitService,
        private uiSettingService     : UISettingsService,
        private awsBucketService     : AWSBucketService,
        private splashScreenStateService: SplashScreenStateService,
        private orderMethodsService:   OrderMethodsService,
        @Optional() private dialogRef  : MatDialogRef<LoginComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    )
  {
    if (data) {
      this.dialogOpen = true
    }

    if (!data) {
      this.redirects();
    }
  }

  async ngOnInit() {

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

    this.refreshTheme()
    this.statusMessage = ''

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.refreshUIHomePageSettings();

    setTimeout(() => {
      this.splashScreenStateService.stop();
    }, 1000);

  }

  refreshUIHomePageSettings() {
    this.uiSettingService.getSetting('UIHomePageSettings').subscribe(data =>  {
      this.uiHomePageSetting = JSON.parse(data.text) as UIHomePageSettings
      this.initCompanyInfo();
      this.initLogo();
    })
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

  get loginMethodView() {
    // console.log(this.togglePIN)
    if (this.togglePIN) {
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
    if (this.platformService.isApp())  {
      this.counter  = this.counter +1
      if (this.counter > 5) {
        this.counter = 0;
        this.router.navigate(['/apisetting']);
      }
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
      this.router.navigate(['/app-main-menu']);
      return true
    }
  }

  redirectAPIUrlRequired() {
    if (this.platformService.isApp())  {
      this.platformService.initAPIUrl();
      if (!this.platformService.apiUrl || this.platformService.apiUrl.length == 0) {
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
    localStorage.clear()
    this.clearUserSettings();
    this.notifyEvent("Your settings have been removed from this device.", "Bye!");
    this.statusMessage = ''
  }

   browseMenu() {
    this.initForm();
    this.userSwitchingService.browseMenu();
    this.statusMessage = ''
  }

  loginToReturnUrl() {
    // this.spinnerLoading = false;
    this.userSwitchingService.loginToReturnUrl();
    this.statusMessage = ''
  }

  clearUserSettings() {
    this.authenticationService.clearUserSettings();
    // await this.siteService.setDefaultSite();
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

  registerUser()  { this.router.navigate(['/register-user']);}

  changePassword(){ this.router.navigate(['/resetpassword']);}

  validateForm(inputForm: FormGroup) : boolean {
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
    this.submitLogin( user, pin)
  }

  onSubmit() {
    if (!this.validateForm(this.loginForm)) { return }
    this.spinnerLoading = true;
    const userName = this.f.username.value;
    const password = this.f.password.value;
    this.submitLogin(userName,password)
  }

  submitLogin(userName: string, password: string) {
    this.errorMessage = ''
    this.loginAction$ = this.userSwitchingService.login(userName, password).pipe(
      switchMap(result =>
        {

          console.log('result of submit login', result);

          this.initForm();
          if (result && result.errorMessage) {
            this.notifyEvent(result.errorMessage, 'Failed Login');
            return of('failed')
          }

          //if is app then result is a combination of user and sheet
          //if is not app then result is the user.
          let user = result?.user ;
          let sheet = result?.sheet as IBalanceSheet;

          //if there is a sheet we login here with the user to prompt the sheet if needed.
          if (sheet) {
            if (this.loginApp(result)) {
              return of('success')
            }
          }

          if (result && result.username != undefined) {   user = result }

          if (user) {
            this.spinnerLoading = false;

            if (user && user?.errorMessage === 'failed') {
              this.authenticationService.updateUser(null);
              return of('failed')
            }

            if (user && user?.message && user?.message.toLowerCase() === 'success') {
              let pass = false

              if (!this.loginAction) {
                this.userSwitchingService.assignCurrentOrder(user)
              }

              if (this.loginAction) {
                if (this.loginAction.name === 'setActiveOrder') {
                  this.userSwitchingService.processLogin(user, '/pos-payment')
                  pass = true
                }
              }

              if (!pass) {
                this.userSwitchingService.processLogin(user, '')
              }

              this.closeDialog();
              return of('success')
            }
          }
        }
    ))
  }

  closeDialog() {
    if (this.dialogOpen) {
      try {
        this.dialogRef.close();
      } catch (error) {
        return of('error')
      }
    }
  }

  setloginAction(): Observable<IPOSOrder> {
    return this.orderMethodsService.getLoginActions()
  }

  loginApp(user) {
    if (this.platformService.isApp()) {
      this.loggedInUser   = user.user;
      this.spinnerLoading = false
      return this.userSwitchingService.loginApp(user)
    }
    return false;
  }

  assingBackGround(image: string) {
    if (!image) {
      image = 'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'
     }
    const styles = { 'background-image': `url(${image})`  };
    this.backgroundImage = styles
    const i = 1
  }


  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

