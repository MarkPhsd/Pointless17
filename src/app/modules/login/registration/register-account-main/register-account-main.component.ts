import { AuthenticationService} from 'src/app/_services';
import { ICompany }  from 'src/app/_interfaces';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Subscription, switchMap,of,Observable } from 'rxjs';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-register-account-main',
  templateUrl: './register-account-main.component.html',
  styleUrls: ['./register-account-main.component.scss']
})
export class RegisterAccountMainComponent implements OnInit {

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
  loginForm: FormGroup;
  bucket: string;
  uiHomePageSetting: UIHomePageSettings;

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
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private uiSettings: UISettingsService,
      private router: Router,
      private authenticationService: AuthenticationService,
      private _snackBar: MatSnackBar,
      private uiSettingService     : UISettingsService,
  ) {
    if (this.authenticationService.userValue) {
      this.router.navigate(['/app-main-menu']);
    }

  }

  goBack(){
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
    const auth$ =this.authenticationService.requestUserSetupToken(userName);

    const result$ = auth$.pipe(
      switchMap(data => {
      if (data)  {
        console.log('registerToken,', data)
        if (data.userExists ) {
          this.notifyEvent("User exists, you must request a new password.", "Alert")
          this.router.navigate(['/resetpassword'])
          return;
        }
        this.router.navigate(['/register-token', { data: userName } ]);
      }
      this.submitted = false
      return of(data)
    }))

    this.result$ = result$;

  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


}
