import { CompanyService, AuthenticationService, AWSBucketService} from 'src/app/_services';
import { ICompany, IUser }  from 'src/app/_interfaces';
import { Component, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from 'src/app/_animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { Subscription } from 'rxjs';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
    selector   : 'login-dashboard',
    templateUrl: './login.component.html',
    styleUrls  : ['./login.component.scss'],
    animations : [ fadeInAnimation ],
})

export class LoginComponent implements OnInit, OnDestroy {

  @Input() statusMessage: string;
  initApp    = true
  togglePIN: boolean;

  backgroundImage: any //'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'
  bucket         : string;
  spinnerLoading: boolean;
  compName   : string;
  company    = {} as ICompany;
  logo       = `assets/images/logo.png`;

  loading    = false;
  submitted  = false;
  returnUrl  : string;
  error      = '';
  companyName: string;
  id         : any;

  isApp     : boolean;
  loginForm : FormGroup;
  amI21     : any;

  counter   =0;
  loggedInUser : IUser;
  _user     : Subscription;

  _uISettings: Subscription;
  uiHomePageSetting: UIHomePageSettings;

  _loginStatus    : Subscription;
  loginStatusvalue: number;

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
        public platformService       : PlatformService,
        private appInitService       : AppInitService,
        private uiSettingService     : UISettingsService,
        private awsBucketService     : AWSBucketService,

    )
  {
    this.redirects();
  }

  async ngOnInit() {

    this.bucket = await this.awsBucketService.awsBucketURL()

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

  async initCompanyInfo() {
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

  async  forgetMe() {
    this.initForm();
    await this.clearUserSettings();
    this.notifyEvent("Your settings have been removed from this device.", "Bye!");
    this.statusMessage = ''
  }

  async  browseMenu() {
    this.initForm();
    this.userSwitchingService.browseMenu();
    this.statusMessage = ''
  }

  loginToReturnUrl() {
    // this.spinnerLoading = false;
    this.userSwitchingService.loginToReturnUrl();
    this.statusMessage = ''
  }

  async clearUserSettings() {
    this.authenticationService.clearUserSettings();
    await this.siteService.setDefaultSite();
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
    const user = event.user;
    this.submitLogin(user,pin)
  }

  onSubmit() {
    if (!this.validateForm(this.loginForm)) { return }
    this.spinnerLoading = true;
    const userName = this.f.username.value;
    const password = this.f.password.value;
    this.submitLogin(userName,password)
  }

  submitLogin(userName: string, password: string) {

    this.userSwitchingService.login(userName, password)
      .subscribe({
       next: user =>
        {
          // console.log('user', user)
          this.initForm();
          if (user && user.errorMessage) {
            this.notifyEvent(user.errorMessage, 'Failed Login')
            return;
          }

          if (user) {
            this.spinnerLoading = false;
            if (user.message === 'failed' || (user.errorMessage || (user.user && user.user.errorMessage))) {
              this.authenticationService.updateUser(null);
              return
            }

            if (this.platformService.isApp()) {
              if (this.loginApp(user)) {
              return
            } }

            if (user.message && user.message.toLowerCase() === 'success') {
              this.userSwitchingService.processLogin(user)
              this.userSwitchingService.assignCurrentOrder(user)
              return
            }

          }
        },
       error: error => {
          this.updateLoginStatus(6)
          const message = `Login failed. ${error.errorMessage}. Service is not accesible. Check Internet.`
          this.statusMessage = message
          this.notifyEvent(message, 'error')
          this.initForm();
          return
        }
      })
    ;

  }

  loginApp(user) {
    if (this.platformService.isApp()) {
      this.loggedInUser   = user.user
      this.spinnerLoading = false
      const currentUser   = user.user
      const sheet         = user.sheet
      this.userSwitchingService.processLogin(currentUser)
      if (sheet) {
        if (sheet.message) {
          this.notifyEvent(`Message ${sheet.message}`, `Error`)
          return false
        }
        if (sheet.shiftStarted == 0) {
          this.router.navigate(['/balance-sheet-edit', {id:sheet.id}]);
          return true
        }
      }
    }
  }

  testCredit() {
    // this.router.navigate('payments')
    this.router.navigate(['/payments'])
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

