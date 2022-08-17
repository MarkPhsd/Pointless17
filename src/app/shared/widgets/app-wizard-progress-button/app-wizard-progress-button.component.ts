import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { AppStatus, SystemInitializationService } from 'src/app/_services/system/settings/app-wizard.service';

@Component({
  selector: 'wizard-progress-button',
  templateUrl: './app-wizard-progress-button.component.html',
  styleUrls: ['./app-wizard-progress-button.component.scss']
})
export class AppWizardProgressButtonComponent implements OnInit {

  user: IUser;
  _user: Subscription;
  _appWizard: Subscription;
  status: AppStatus;
  constructor(
              private authenticationService  :    AuthenticationService,
              private productButtonsService   : ProductEditButtonService,
              private appWizardService: SystemInitializationService) { }

  ngOnInit(): void {
 
    this._user = this.authenticationService.user$.subscribe(user => {
      this.user = user;
      if (user && user.roles === 'admin') { 
        this.appWizardService.initAppWizard();
        this.initSubscription()
      }
    })
  }

  initSubscription() { 
      this._appWizard = this.appWizardService.appWizardStatus$.subscribe(data => { 
      // this.status = data;
      this.status =  this.appWizardService.getStatusCount(data)
    })
  }

  navAppWizardStatus() {
    this.productButtonsService.openAppWizard()
  }


}
