import { AuthenticationService, IUserExists} from 'src/app/_services';
import { ICompany, IUser }  from 'src/app/_interfaces';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';

@Component({
  selector: 'app-register-account-existing-user-with-token',
  templateUrl: './register-account-existing-user-with-token.component.html',
  styleUrls: ['./register-account-existing-user-with-token.component.scss']
})
export class RegisterAccountExistingUserWithTokenComponent implements OnInit {

  @Input() statusMessage: string;
  @Input() userName: string;

  compName: string;
  company = {} as ICompany;
  logo: string;

  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  companyName: string;
  id: any;

  loginForm: FormGroup;
  userExists: IUserExists;

  userPhoneOrEmail: string;
  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private _snackBar: MatSnackBar,
      private authenticationService: AuthenticationService,
      private sitesService: SitesService,
      private appInitService: AppInitService
  ) {
    this.userName =  JSON.parse( this.route.snapshot.paramMap.get('data') )
  }

  ngOnInit(): void {
    this.initForm();
    this.getCompanyInfo();
    this.initLogo()
  }

  initForm() {
    this.loginForm = this.fb.group({
      token            : ['', Validators.required],
      userName         : [this.userName, Validators.required],
      password         : ['', Validators.required],
      confirmPassword  : ['', Validators.required],
    });
  }

  initLogo() {
    const logo        = this.appInitService.logo;
    if ( logo)  {  this.logo   = logo}
    this.compName = `${this.appInitService.company}`
  }

  getCompanyInfo() {
    const site = this.sitesService.getAssignedSite();
  }

  goBack(){
    this.initForm()
    this.router.navigate(['/login'])
  }

  onSubmit(){
    this.submitted = true;
    this.statusMessage = ""

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    if(this.f.password.value != this.f.confirmPassword.value) {
       this.statusMessage = "Passwords do not match."
    }

    //user: IUser
    const user = {} as IUser;

    if (user) {

      if (this.userExists) {
        user.phone = this.userExists.phone
        user.email = this.userExists.email
        user.type = this.userExists.type
      }

      user.username = this.f.userName.value
      user.password = this.f.password.value
      user.token  = this.f.token.value

      if (user.email) {
        user.type ="email"
      }
      if (user.phone) {
        user.type = "phone"
      }

      this.authenticationService.assignUserNameAndPassword(user).subscribe(
        data =>
        {
          this.initForm()
          if (data.userExists) {
            this.notifyEvent(`${data} . You may login`, 'Success')
            this.router.navigate(['/']);
          } else {
            this.statusMessage = "User not found."
          }
        },
        error => {
          this.initForm()
          this.statusMessage = "Error connecting"
          this.error = error;
          console.log(error)
          this.loading = false;
       });
    }

  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


}
