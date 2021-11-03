import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'api-stored-value',
  templateUrl: './api-stored-value.component.html',
  styleUrls: ['./api-stored-value.component.scss']
})
export class ApiStoredValueComponent implements OnInit {
  inputForm: FormGroup;
  currentAPIUrl : any;
  constructor(
      private router               : Router,
      public platFormService       : PlatformService,
      private fb                   : FormBuilder,
      private authenticationService: AuthenticationService,
    ) {
      this.currentAPIUrl = localStorage.getItem('storedApiUrl');
      if (this.router.url === '/app-apisetting'  && this.platFormService.webMode) {
        this.router.navigate(['/login'])
      }
   }

  ngOnInit(): void {
    console.log('')
    this.inputForm = this.fb.group({
      apiUrl: [''],
    });
  }

  setAPIUrl(){
    const apiUrl = this.inputForm.controls['apiUrl'].value
    localStorage.setItem('storedApiUrl', apiUrl)
    this.authenticationService.clearUserSettings()
    this.currentAPIUrl = apiUrl;
  }

}
