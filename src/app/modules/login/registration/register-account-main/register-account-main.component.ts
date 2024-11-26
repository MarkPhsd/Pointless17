import { AuthenticationService} from 'src/app/_services';
import { ICompany }  from 'src/app/_interfaces';
import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Subscription, switchMap,of,Observable } from 'rxjs';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ApiStatusDisplayComponent } from 'src/app/shared/widgets/api-status-display/api-status-display.component';
import { LogoComponent } from 'src/app/shared/widgets/logo/logo.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthLoginService } from 'src/app/_services/system/auth-login.service';

@Component({
  selector: 'app-register-account-main',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatLegacyCardModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacyButtonModule,
    MatDividerModule,
    MatLegacyProgressSpinnerModule,
    LogoComponent,
    ApiStatusDisplayComponent
  ],
  templateUrl: './register-account-main.component.html',
  styleUrls: ['./register-account-main.component.scss']
})
export class RegisterAccountMainComponent implements OnInit,OnDestroy {

  backgroundImage: any;
  result$: Observable<any>;
  @Input() statusMessage: string;
  compName   : string;
  company    = {} as ICompany;
  logo       : string;
  loading    = false;
  submitted  = false;
  returnUrl  : string;
  error      = '';
  companyName: string;
  id         : any;
  _uISettings: Subscription;
  loginForm: UntypedFormGroup;
  bucket: string;
  uiHomePageSetting: UIHomePageSettings;
  message: string;

  initUIService() {
    this.uiSettings.getSetting('UIHomePageSettings').subscribe( data => {
        if (data) {
          this.uiHomePageSetting  = JSON.parse(data.text) as UIHomePageSettings;
        }
      }
    )
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  constructor(
      private fb: UntypedFormBuilder,
      private route: ActivatedRoute,
      private uiSettings: UISettingsService,
      private router: Router,
      private siteService: SitesService,
      private authenticationService: AuthenticationService,
      private _snackBar: MatSnackBar,
      private uiSettingService     : UISettingsService,
      private authLogin : AuthLoginService,
  ) {
    if (this.authenticationService.userValue) {
      this.router.navigate(['/app-main-menu']);
    }
  }

  ngOnDestroy() {
    this.message = ''
    this.submitted = false;
  }

  goBack(){
    this.submitted = false;
    this.router.navigate(['/login'])
  }

  initSubscription() {
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

  assingBackGround(image: string) {
    if (!image) {
      image = 'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'
     }
    const styles = { 'background-image': `url(${image})`  };
    this.backgroundImage = styles
    const i = 1
  }

 ngOnInit() {
    this.initUIService()
    this.message = ''
    this.submitted = false;
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initSubscription()
  }

  registerToken(){
    this.submitted = true;
    this.statusMessage = ""

    if (this.loginForm.invalid) { return }

    const userName = this.f.username.value;

    // authlogin =  new Injector(AuthLoginService)
    const site = this.siteService.getAssignedSite();
    const message = this.siteService.getApplicationInfo('user')
    const auth$ = this.authLogin.requestUserSetupToken(site, message, userName);

    this.result$ = auth$.pipe(
      switchMap(data => {
        this.submitted = false;
            if (data)  {
              if (data.message) {
                this.message = data.message;
                return of(data)
              }
              if (data.userExists ) {
                this.notifyEvent("User exists, you must request a new password.", "Alert")
                this.router.navigate(['/resetpassword'])
                return of(data)
              }
              this.router.navigate(['/register-token', { data: userName } ]);
            }
            return of(data)
          }
        )
      )

  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


}
