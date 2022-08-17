import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdjustmentReasonsComponent } from 'src/app/shared/widgets/adjustment-reasons/adjustment-reasons.component';
import { IUser } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { SystemManagerService } from 'src/app/_services/system/system-manager.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

    @ViewChild('accordionStep0') accordionStep0: TemplateRef<any>;
    @ViewChild('accordionStep1') accordionStep1: TemplateRef<any>;
    @ViewChild('accordionStep2') accordionStep2: TemplateRef<any>;
    @ViewChild('accordionStep3') accordionStep3: TemplateRef<any>;
    @ViewChild('accordionStep4') accordionStep4: TemplateRef<any>;
    @ViewChild('accordionStep5') accordionStep5: TemplateRef<any>;
    @ViewChild('accordionStep6') accordionStep6: TemplateRef<any>;
    @ViewChild('accordionStep7') accordionStep7: TemplateRef<any>;

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

    get currentAccordionStep() {
      switch ( this.accordionStep) {
        case 0:
          return this.accordionStep0;
          break;
        case 1:
          return this.accordionStep1;
          break;
        case 2:
          return this.accordionStep2;
          break;
        case 3:
          return this.accordionStep3;
          break;
        case 4:
          return this.accordionStep4;
          break;
        case 5:
          return this.accordionStep5;
          break;
        case 6:
          return this.accordionStep6;
          break;
        case 7:
          return this.accordionStep7;
          break;
        default:
          return this.accordionStep0;
          break;
      }
    }

    constructor(
        private AuthenticationService: AuthenticationService,
        private dialog               : MatDialog,
        private systemManagerService : SystemManagerService,
        private route                : ActivatedRoute,
      
        private router               : Router)
    {
      this.accordionStep = -1;
      this.initSubscriptions();
    }

    ngOnInit() {
      this.getCurrentUser();
      const step = this.route.snapshot.paramMap.get('accordionStep');
      if (step) { 
        this.accordionStep = +step;
        this.setStep(+step)
      }
    }

    ngOnDestroy(): void {
      if (this._accordionStep) { this._accordionStep.unsubscribe()}
    }

    routerNavigation(url: string) {
      this.router.navigate([url]);
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
    
    gotoPayments() {
      this.routerNavigation('payments')
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

    functionGroups() {
      this.router.navigate(['/function-group-list'])
    }
}
