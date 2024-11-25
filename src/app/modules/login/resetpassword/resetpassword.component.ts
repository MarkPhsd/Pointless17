import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { IUser }  from 'src/app/_interfaces';
import { Observable, of, switchMap} from 'rxjs'
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatLegacyCardModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacyButtonModule,
    MatIconModule,
    MatDividerModule,
    MatLegacyProgressSpinnerModule,
    RouterModule
  ],
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
  processing: boolean;

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
      private siteService: SitesService,
      private authenticationService: AuthenticationService
  )
  {
    // redirect to home if already logged in
    //    if (this.authenticationService.userValue) {
    //      this.router.navigate(['/']);
    //  }
  }

  ngOnInit() {
    this.request$ = null;
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
      this.processing = true;

      this.request$ = this.authenticationService.requestPasswordResetToken(this.f.username.value).pipe(
        switchMap(data => {
          this.processing = false
          if (data?.userExists) {
            this.siteService.notify('Please check your phone or email for a reset code.', 'Close', 5000, 'green')
            this.changePassword(this.f.username.value)
          } else {
            this.initForm();
          }
          return of(data)
        }
        )
      )


    } catch (error) {
      this.statusMessage = "Password reset request failed."
    }

  }

  changePassword(userName: string) {
    this.router.navigate(['/changepassword', {userName: userName}]);
  }


}
