import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { IUser }  from 'src/app/_interfaces';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';

@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatLegacyCardModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatIconModule,
    MatLegacyButtonModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss'],
})
export class ChangepasswordComponent implements OnInit {

  loginForm: UntypedFormGroup;
  loading   = false;
  submitted = false;
  returnUrl : string;
  error     = '';
  statusMessage: any;
  userName: string;
  resetToken: string;
  //receive user
  @Input() user: IUser;
  action$ : Observable<any>;

  constructor(
      private formBuilder: UntypedFormBuilder,
      private route: ActivatedRoute,
      private siteService: SitesService,
      private router: Router,
      private authenticationService: AuthenticationService
  )
  {
    // redirect to home if already logged in
    //    if (this.authenticationService.userValue) {
    //      this.router.navigate(['/']);
    //  }

    this.userName =   this.route.snapshot.paramMap.get('userName');
    this.resetToken =   this.route.snapshot.paramMap.get('resetToken');
  }

  ngOnInit() {
      this.loginForm = this.formBuilder.group({
          username:        [this.userName, Validators.required],
          confirmpassword: ['', Validators.required],
          password:        ['', [Validators.required, this.passwordValidator]],
          resetcode:       [this.resetToken, Validators.required],
      });



      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }


  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  // Custom validator function
  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[\W]/.test(password);
    const isValidLength = password.length >= 6;

    const isValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isValidLength;

    return isValid ? null : { passwordStrength: true };
  }

  onSubmit() {
    this.updatePassword()
  }

  updatePassword(){

    if (!this.passwordValidator) {
      this.loading = false;
      return false;
    }

    try {
      const user    = {} as IUser;
      user.username = this.f.username.value.trim()
      user.password = this.f.password.value.trim()
      user.token    = this.f.resetcode.value.trim()

      this.submitted = true;
      this.statusMessage = "Waiting"
      if (this.loginForm.invalid) {
          this.statusMessage = "Form fields invalid."
          return;
      }
      this.loading = true;

      if(this.f.password.value == this.f.confirmpassword.value){
        this.action$ = this.authenticationService.updatePassword(user).pipe(
          switchMap(data => {
          this.statusMessage = data?.message
          this.siteService.notify(data?.message, 'Close', 10000 )
          this.router.navigate(['/login']);
          return of(data)
        }))
      }else
      {
        this.statusMessage = "Passwords do not match."
      }

    } catch (error) {
      this.statusMessage = "Password reset request failed."
      console.log("Error", error)
    }

  }

}
