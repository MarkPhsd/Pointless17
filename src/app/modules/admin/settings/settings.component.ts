import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdjustmentReasonsComponent } from 'src/app/shared/widgets/adjustment-reasons/adjustment-reasons.component';
import { IUser } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Router } from '@angular/router';
import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  get platForm() {  return Capacitor.getPlatform(); }

  showPaymentMethods = false;
  user:         IUser;
  role:         string;
  accordionStep = 0;

  constructor(
      private AuthenticationService: AuthenticationService,
      private dialog:          MatDialog,
      private router :         Router)
  { }

    ngOnInit() {
      this.getCurrentUser();
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
      this.accordionStep = index;
    }

    nextStep() {
      this.accordionStep++;
    }

    prevStep() {
      this.accordionStep--;
    }

    getCurrentUser() {
      this.AuthenticationService.user$.subscribe(data => {
        if (data) {
          this.user = data
          this.role = data.roles
        }
      })
    }


    openProductDialog(id: any) {
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

}
