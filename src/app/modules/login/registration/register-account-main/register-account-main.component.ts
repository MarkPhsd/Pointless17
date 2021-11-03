import { CompanyService,AuthenticationService} from 'src/app/_services';
import { ICompany }  from 'src/app/_interfaces';
import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from 'src/app/_animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-register-account-main',
  templateUrl: './register-account-main.component.html',
  styleUrls: ['./register-account-main.component.scss']
})
export class RegisterAccountMainComponent implements OnInit {

  @Input() statusMessage: string;

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
  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private authenticationService: AuthenticationService,
      private companyService: CompanyService,
      private _snackBar: MatSnackBar,
      private sitesService: SitesService,
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.userValue) {
      this.router.navigate(['/app-main-menu']);
    }
  }

  goBack(){

    this.router.navigate(['/login'])
  }

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
    });

    this.getCompanyInfo();
    // get return url from route parameters or default to '/'

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.company) {
      this.compName = this.company.compName
    }

    this.logo = `${environment.logo}`
    this.compName = `${environment.company}`

  }

  async onSubmit(){
    this.submitted = true;
    this.statusMessage = ""

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    // this.router.navigate(["/adminbranditem/", {id:id}]);
    const result =  this.authenticationService.requestUserSetupToken(this.f.username.value).pipe().toPromise()
    if (result)  {
      this.router.navigate(['/register-token', { data: JSON.stringify(result) } ]);
    }

  }

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

}
