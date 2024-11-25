import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { AppStatus, SystemInitializationService } from 'src/app/_services/system/settings/app-wizard.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'wizard-progress-button',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './app-wizard-progress-button.component.html',
  styleUrls: ['./app-wizard-progress-button.component.scss']
})
export class AppWizardProgressButtonComponent implements OnInit , OnDestroy{

  user: IUser;
  _user: Subscription;
  _appWizard: Subscription;
  status: AppStatus;

  constructor(
              private authenticationService   : AuthenticationService,
              private productButtonsService   : ProductEditButtonService,
              private appWizardService        : SystemInitializationService) { }

  ngOnInit(): void {
    this.initSubscription()
    this._user = this.authenticationService.user$.subscribe(user => {
      this.user = user;
      if (user && user.roles === 'admin') {
        this.appWizardService.initAppWizard();
      }
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._appWizard) { this._appWizard.unsubscribe()}
  }

  initSubscription() {
    this.appWizardService.appStatus$.subscribe(data => {
      // console.log( 'status', data)
      this.status = data;
    })
  }

  navAppWizardStatus() {
    this.productButtonsService.openAppWizard()
  }

}
