import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { IUser }  from 'src/app/_interfaces';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  statusMessage: any;

  @Input() ResetEmail: boolean
  //receive user
  @Input() user: IUser;

  constructor(
      private formBuilder: FormBuilder,
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
      this.loginForm = this.formBuilder.group({
          username: ['', Validators.required],
      });

      // get return url from route parameters or default to '/'
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/changepassword';
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

      this.authenticationService.requestPasswordResetToken(this.f.username.value);
      this.statusMessage = "Password reset request token, please check your email or phone."
      this.router.navigate(['/changepassword']);

    } catch (error) {
      this.statusMessage = "Password reset request failed."

    }

  }



}
