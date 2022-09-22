import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { IUser }  from 'src/app/_interfaces';
import { fadeInAnimation } from 'src/app/_animations';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss'],
})
export class ChangepasswordComponent implements OnInit {

  loginForm: FormGroup;
  loading   = false;
  submitted = false;
  returnUrl : string;
  error     = '';
  statusMessage: any;

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
          username:        ['', Validators.required],
          confirmpassword: ['', Validators.required],
          password:        ['', Validators.required],
          resetcode:       ['', Validators.required],
      });

      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.updatePassword()
  }

  updatePassword(){
    try {
      const user    = {} as IUser;
      user.username = this.f.username.value
      user.password = this.f.password.value
      user.token    = this.f.resetcode.value

      this.submitted = true;
      this.statusMessage = "Waiting"
      if (this.loginForm.invalid) {
          this.statusMessage = "Form fields invalid."
          return;
      }
      this.loading = true;

      if(this.f.password.value == this.f.confirmpassword.value){
        this.authenticationService.updatePassword(user).subscribe(data => { 
          this.statusMessage = "Updated. Routing to login."
          this.router.navigate(['/login']);
        })
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
