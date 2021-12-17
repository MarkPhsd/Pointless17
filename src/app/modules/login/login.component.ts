import { CompanyService,AuthenticationService, AWSBucketService} from 'src/app/_services';
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

@Component({
    selector:   'login-dashboard',
    templateUrl:'./login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [ fadeInAnimation ],
  })

export class LoginComponent implements OnInit, OnDestroy {

  @Input() statusMessage: string;

  spinnerLoading: boolean;
  compName: string;
  company = {} as ICompany;
  logo: string;

  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  companyName: string;
  id: any;

  isApp    : boolean;
  loginForm: FormGroup;
  amI21: any;

  counter =0;
  loggedInUser : IUser;
  _user: Subscription;

  initSubscriptions() {
    this._user = this.authenticationService.user$.subscribe( user => {
      this.loggedInUser = user
    })
  }
  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private _renderer: Renderer2,
        private authenticationService: AuthenticationService,
        private userSwitchingService: UserSwitchingService,
        private _snackBar: MatSnackBar,
        private companyService: CompanyService,
        private siteService: SitesService,
        public platformService : PlatformService,
        private appInitService: AppInitService,
    )
  {
    this.redirects();
  }

  async ngOnInit() {
    if (!this.platformService.webMode) { this.amI21 = true  }
    if (this.platformService.webMode)  { this.amI21 = false }
    this.refreshTheme()
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initForm();
    await this.initCompanyInfo()
  }

  ngOnDestroy(): void {
    if (this._user) { this._user.unsubscribe()}
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  switchUser() {
    this.userSwitchingService.openPIN({request: 'switchUser'})
  }

  setAPIAlt() {
    if (this.platformService.isAppElectron || this.platformService.androidApp)  {
      this.counter  = this.counter +1
      if (this.counter > 5) {
        this.counter = 0;
        this.router.navigate(['/apisetting']);
      }
    }
  }

  async initCompanyInfo() {
    this.compName    = this.appInitService.company
    this.initLogo();
  }

  initLogo() {
    const logo    = this.appInitService.logo;
    if ( logo) {  this.logo = logo }
  }

  redirects() {
    if (this.redirectAPIUrlRequired())  { return }
    if (this.redirectUserLoggedIn())  { return }
  }

  redirectUserLoggedIn() {
    const user = this.authenticationService.userValue
    if (user) {
      this.router.navigate(['/app-main-menu']);
      return true
    }
  }

  redirectAPIUrlRequired() {
    if (this.platformService.isApp())  {
      this.platformService.initAPIUrl();
      if (this.platformService.apiUrl.length == 0) {
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

  async forgetMe() {
    this.clearUserSettings();
    this.notifyEvent("Your settings have been removed from this device.", "Bye!");
    this.siteService.clearAssignedSite();
    if (!this.platformService.webMode) { return }
    if (this.platformService.isAppElectron || this.platformService.androidApp)  {
      if (this.appInitService.appGateEnabled()) {
        this.router.navigate(['/appgate']);
      }
    }
  }

  async  browseMenu() {
    this.userSwitchingService.browseMenu()
  }

  loginToReturnUrl() {
    this.spinnerLoading = false;
    this.userSwitchingService.loginToReturnUrl()
  }

  clearUserSettings() {
    this.authenticationService.clearUserSettings()
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
      }, error  => {
      }
    );
  }

  registerUser(){
    this.router.navigate(['/register-user']);
  }

  changePassword(){
    this.router.navigate(['/resetpassword']);
  }

  loginElectronApp(user) {
    if (this.platformService.isAppElectron || this.platformService.androidApp) {
      this.loggedInUser = user.user
      this.spinnerLoading = false
      const currentUser = user.user
      const sheet = user.sheet
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

  async  onSubmit() {
    this.submitted = true;
    this.statusMessage = ""
    this.spinnerLoading = true;
    if (this.loginForm.invalid) {
      this.statusMessage = 'User name and password required.'
      return;
    }
    (this.userSwitchingService.login(this.f.username.value, this.f.password.value))
      .pipe()
      .subscribe(
        user =>
        {
          this.loading = false;
          this.loggedInUser = user

          if (this.loginElectronApp(user)) {
            return
          }

          if (this.loggedInUser && this.loggedInUser.message === 'success') {
            this.userSwitchingService.processLogin(user)
            this.spinnerLoading = false;
            this.initForm()
            return
          }

          if (this.loggedInUser && (this.loggedInUser.message  == 'failed')) {
            this.loggedInUser.message == 'failed'
            this.loggedInUser.errorMessage = 'Error logging in. '
            this.statusMessage = "Service is not accessible, check connection."
          }

        },
        error => {
          console.log('login error occured', error)
          this.spinnerLoading = false;
          this.statusMessage = `Login failed. ${error.message}. Service is not accesible. Check Internet.`
          this.loading = false;
          return
        }
    );
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}

