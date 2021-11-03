import { CompanyService,AuthenticationService, IUserExists} from 'src/app/_services';
import { ICompany, IUser }  from 'src/app/_interfaces';
import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from 'src/app/_animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { SitesService } from 'src/app/_services/reporting/sites.service';

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
      private companyService: CompanyService,
      private sitesService: SitesService,
  ) {

    // this.id = this.route.snapshot.paramMap.get('id');
    this.userExists = JSON.parse( this.route.snapshot.paramMap.get('data') )

    console.log(this.userExists)

    if (this.userExists) {
      // redirect to home if already logged in
      if (this.authenticationService.userValue) {
        this.router.navigate(['/app-main-menu']);
      }
    }

  }

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      token: ['', Validators.required],
      userName: [this.userName, Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });

    this.getCompanyInfo();
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.company === undefined) {
    } else {
      this.compName = this.company.compName
    }

    this.logo = `${environment.logo}`
    this.compName = `${environment.company}`
  }

  goBack(){
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
          if (data.userExists) {
            this.notifyEvent(`${data} . You may login`, 'Success')
            this.router.navigate(['/']);
          } else {
            this.statusMessage = "User not found."
          }
        },
        error => {
          this.statusMessage = "Error connecting"
          this.error = error;
          console.log(error)
          this.loading = false;
       });
    }

  }

  // { path: 'register-existing-user', component: RegisterAccountExistingUserComponent, data: { animation: 'isLeft'}},
  // { path: 'register-token', component: RegisterAccountExistingUserWithTokenComponent, data: { animation: 'isLeft'}},
  // { path: 'register-user', component: RegisterAccountMainComponent, data: { animation: 'isLeft'}},

  getCompanyInfo() {
    try {
        const site = this.sitesService.getAssignedSite();
        this.companyService.getCompany(site).subscribe(data =>
        {
          this.company  = data
          localStorage.setItem('company/compName', JSON.stringify(this.company.compName))
          localStorage.setItem('company/phone', JSON.stringify(this.company.phone))
          localStorage.setItem('company/address', JSON.stringify(this.company.compAddress1))
        }, error  => {
          this.statusMessage ="Offline"
        }
      );

    } catch (error) {
      this.statusMessage ="Offline"
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


}
