﻿import { CompanyService, AuthenticationService, AWSBucketService} from 'src/app/_services';
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

  backgroundImage: any //'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'
  bucket         : string;
  spinnerLoading: boolean;
  compName   : string;
  company    = {} as ICompany;
  logo       : string;

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
          console.log('logo', data.logoHomePage)
          if (data.logoHomePage) {
            this.logo = `${this.bucket}${data.logoHomePage}`;
            console.log(this.logo)
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

    this.initForm();
    this.initSubscriptions()
    // this.uiSettingService.subscribeToCachedHomePageSetting('UIHomePageSettings').subscribe(data =>  {


    if (!this.platformService.isApp()) { this.amI21 = true  }
    if (this.platformService.isApp())  { this.amI21 = false }

    this.refreshTheme()
    this.statusMessage = ''
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.refreshUIHomePageSettings();
  }

  async refreshUIHomePageSettings() {
    if (!this.bucket) {
      this.bucket = await this.awsBucketService.awsBucketURL()
    }
    this.uiSettingService.getSetting('UIHomePageSettings').subscribe(data =>  {
      this.uiHomePageSetting = JSON.parse(data.text) as UIHomePageSettings
      this.initCompanyInfo();
      this.initLogo();
    })
  }

  ngOnDestroy(): void {
    this.statusMessage = ''
    if (this._user) { this._user.unsubscribe() }
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
    if (this.bucket) {
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
    await this.clearUserSettings();
    this.notifyEvent("Your settings have been removed from this device.", "Bye!");
    this.statusMessage = ''
  }

  async  browseMenu() {
    this.userSwitchingService.browseMenu();
    this.statusMessage = ''
  }

  loginToReturnUrl() {
    this.spinnerLoading = false;
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

 async updateLoginStatus(option: number) {

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

 async startProcessing() {
    this.submitted      = true;
    this.statusMessage  = "...loggining in"
    this.spinnerLoading = true;
  }

 async onSubmit() {
    await this.startProcessing()
    if (!this.validateForm(this.loginForm)) { return }
    const userName = this.f.username.value;
    const password = this.f.password.value;
    await this.startProcessing()

    this.userSwitchingService.login(userName, password)
      .pipe()
      .subscribe(
        user =>
        {
          if (user) {
            console.log ('login user', user)
            if (user.message === 'failed' || (user.errorMessage || (user.user && user.user.errorMessage))) {
              this.updateLoginStatus(1)
              this.authenticationService.updateUser(null);
              return
            }

            if (this.platformService.isApp()) {  if (this.loginApp(user)) { return } }

            if (user.message && user.message.toLowerCase() === 'success') {
              this.userSwitchingService.processLogin(user)
              this.userSwitchingService.assignCurrentOrder(user)
              this.updateLoginStatus(6) //clearn login settings
              return
            }
          }
        },
        error => {
          this.updateLoginStatus(6)
          const message = `Login failed. ${error.message}. Service is not accesible. Check Internet.`
          this.statusMessage = message
          this.notifyEvent(message, 'error')
          return
        }
    );

    this.updateLoginStatus(6) //clearn login settings
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

