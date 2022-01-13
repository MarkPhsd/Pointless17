import { CompanyService,AuthenticationService} from 'src/app/_services';
import { ICompany }  from 'src/app/_interfaces';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppInitService } from 'src/app/_services/system/app-init.service';

@Component({
  selector: 'app-register-account-main',
  templateUrl: './register-account-main.component.html',
  styleUrls: ['./register-account-main.component.scss']
})
export class RegisterAccountMainComponent implements OnInit {

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

  loginForm: FormGroup;
  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private authenticationService: AuthenticationService,
      private appInitService: AppInitService,
      private sitesService: SitesService,
  ) {
    if (this.authenticationService.userValue) {
      this.router.navigate(['/app-main-menu']);
    }
    this.initLogo();
  }

  goBack(){
    this.router.navigate(['/login'])
  }

  initLogo() {
    const logo        = this.appInitService.logo;
    if ( logo)  { this.logo   = logo }
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.logo = `${this.appInitService.logo}`
    this.compName = `${this.appInitService.company}`
  }

  async onSubmit(){
    this.submitted = true;
    this.statusMessage = ""
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    const result = await this.authenticationService.requestUserSetupToken(this.f.username.value).pipe().toPromise()
    if (result)  {
      this.router.navigate(['/register-token', { data: result.userName } ]);
    }
  }



}
