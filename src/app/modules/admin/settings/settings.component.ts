import {  Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdjustmentReasonsComponent } from 'src/app/shared/widgets/adjustment-reasons/adjustment-reasons.component';
import { IUser } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { SystemManagerService } from 'src/app/_services/system/system-manager.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  get platForm() {  return Capacitor.getPlatform(); }

  showPaymentMethods = false;
  user          :  IUser;
  role          :  string;
  accordionStep = -1;
  _accordionStep: Subscription;

  initSubscriptions() {
    this._accordionStep  = this.systemManagerService.accordionMenu$.subscribe( step => {
      this.accordionStep = step;
    })
  }

    constructor(
        private AuthenticationService: AuthenticationService,
        private dialog               : MatDialog,
        private systemManagerService : SystemManagerService,
        private router               : Router)
    {
      this.accordionStep = -1;
      this.initSubscriptions();
    }

    ngOnInit() {
      this.getCurrentUser();
    }

    ngOnDestroy(): void {
      //Called once, before the instance is destroyed.
      //Add 'implements OnDestroy' to the class.
      if (this._accordionStep) { this._accordionStep.unsubscribe()}
    }
    routerNavigation(url: string) {
      this.router.navigate([url]);
    }

    clientTypesList() {
      this.routerNavigation('client-type-list')
    }

    serviceTypeList() {
      this.routerNavigation('service-type-list')
    }

    gotoPayments() {
      this.routerNavigation('payments')
    }

    setStep(index: number) {
      this.systemManagerService.updateAccordionStep(index)
    }

    nextStep() {
      this.accordionStep += 1;
      this.systemManagerService.updateAccordionStep(this.accordionStep)
    }

    prevStep() {
      this.accordionStep += -1;
      this.systemManagerService.updateAccordionStep(this.accordionStep)
    }

    getCurrentUser() {
      this.AuthenticationService.user$.subscribe(data => {
        if (data) {
          this.user = data
          this.role = data.roles
        }
      })
    }

    openAdjustmentDialog(id: any) {
      const dialogConfig = [
        { data: { id: 1 } }
      ]
      const dialogRef = this.dialog.open(AdjustmentReasonsComponent,
        { width:  '400px',
          height: '300px',
          data : {id: id}
        },
      )
      dialogRef.afterClosed().subscribe(result => {

      });
    }

    openMenuManager() {
      this.router.navigate(['/side-menu-layout'])
    }

    openLabelPrintTest() {
      this.router.navigate(['/label1by8'])
    }

    openGeoTracking() {
      this.router.navigate(['/location'])
    }

    togglePaymentMethodsList() {
      // this.showPaymentMethods= !this.showPaymentMethods
      this.router.navigate(['/edit-payment-method-list'])
    }

    functionGroups() {
      this.router.navigate(['/function-group-list'])
    }
}
// this.router.navigate(['function-group-edit', {id:id}])
