import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { IUser }  from 'src/app/_interfaces';
import { Observable} from 'rxjs'
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {

  loginForm: UntypedFormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  statusMessage: any;

  request$ : Observable<any>;

  @Input() ResetEmail: boolean
  //receive user
  @Input() user: IUser;
  homePageSetings: UIHomePageSettings
  initUIService() {
    this.uiSettings.getSetting('UIHomePageSettings').subscribe( data => {
        if (data) {
          this.homePageSetings  = JSON.parse(data.text) as UIHomePageSettings;
        }
      }
    )
  }

  constructor(
      private formBuilder: UntypedFormBuilder,
      private uiSettings: UISettingsService,
      private route: ActivatedRoute,
      private router: Router,
      private authenticationService: AuthenticationService
  )
  {
    // redirect to home if already logged in
    //    if (this.authenticationService.userValue) {
    //      this.router.navigate(['/']);
    //  }
  }

  ngOnInit() {
    this.initUIService()
    this.initForm();
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/changepassword';
  }

  initForm() { 
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
  });

  }
  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.requestResetToken();
  }

  requestResetToken(){
    try {

      this.submitted = true;
      this.statusMessage = "Waiting"
 
      if (this.loginForm.invalid) {
          this.statusMessage = "form fields invalid."
          return;
      }
      this.loading = true;
      
      this.request$ = this.authenticationService.requestPasswordResetToken(this.f.username.value)
      this.initForm();

    } catch (error) {
      this.statusMessage = "Password reset request failed."
    }

  }

  changePassword() { 
    this.router.navigate(['/changepassword']);
  }


}
