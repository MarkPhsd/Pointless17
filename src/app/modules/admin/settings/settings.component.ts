import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { AdjustmentReasonsComponent } from 'src/app/shared/widgets/adjustment-reasons/adjustment-reasons.component';
import { IUser } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemManagerService } from 'src/app/_services/system/system-manager.service';
import { Subscription } from 'rxjs';
import { PointlessCCDSIEMVAndroidService } from '../../payment-processing/services';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { StripeSettingsComponent } from './stripe-settings/stripe-settings.component';
import { UIHomePageSettingsComponent } from './software/uihome-page-settings/uihome-page-settings.component';
import { UITransactionsComponent } from './software/UISettings/uitransactions/uitransactions.component';
import { CardPointSettingsComponent } from '../../payment-processing/cardPointe/card-point-settings/card-point-settings.component';
import { CacheSettingsComponent } from './database/cache-settings/cache-settings.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyLabel } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySliderModule } from '@angular/material/legacy-slider';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';
import { FormSelectListComponent } from 'src/app/shared/widgets/formSelectList/form-select-list.component';
import { ValueFieldsComponent } from '../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { EmailSettingsComponent } from './email-settings/email-settings.component';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { InstalledPrintersComponent } from './printing/installed-printers/installed-printers.component';
import { DatabaseSchemaComponent } from './database/database-schema/database-schema.component';
import { EbaySettingsComponent } from './software/ebay-settings/ebay-settings.component';
import { ApiStoredValueComponent } from 'src/app/shared/widgets/api-stored-value/api-stored-value.component';
import { DeviceInfoComponent } from './device-info/device-info.component';
import { CSVImportComponent } from './database/csv-import/csv-import.component';
import { ExportDataComponent } from './database/export-data/export-data.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SoftwareSettingsComponent } from './software/software.component';
import { IonicGeoLocationComponent } from 'src/app/shared/widgets/ionic-geo-location/ionic-geo-location.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,
    CardPointSettingsComponent,InstalledPrintersComponent,DatabaseSchemaComponent,
    EbaySettingsComponent,ApiStoredValueComponent,DeviceInfoComponent,
    StripeSettingsComponent,UIHomePageSettingsComponent,UITransactionsComponent,
    UploaderComponent,EmailSettingsComponent,CacheSettingsComponent,
    CSVImportComponent,ExportDataComponent,
    InventoryComponent,
    SoftwareSettingsComponent,
    IonicGeoLocationComponent,
    FormSelectListComponent,MatExpansionModule,
    ValueFieldsComponent,MatLegacyProgressSpinnerModule,MatLegacyButtonModule,MatIconModule,
    MatLegacyInputModule,MatLegacySliderModule,MatLegacyCardModule,MatDividerModule],

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
    @ViewChild('accordionStep8') accordionStep8: TemplateRef<any>;

    @ViewChild('processorItem1') processorItem1: TemplateRef<any>;
    @ViewChild('processorItem2') processorItem2: TemplateRef<any>;
    @ViewChild('processorItem3') processorItem3: TemplateRef<any>;
    @ViewChild('processorItem4') processorItem4: TemplateRef<any>;

    processorSelection: TemplateRef<any>;
    showAndroid: boolean;

    get platForm() {
      return this.platFormService.getPlatForm().platForm;
    }

    blueToothDeviceList: any;
    showPaymentMethods = false;
    user          :  IUser;
    role          :  string;
    accordionStep = -1;
    _accordionStep: Subscription;
    _homePage     : Subscription;
    uiHomePage    : UIHomePageSettings;

    initSubscriptions() {
      this._accordionStep  = this.systemManagerService.accordionMenu$.subscribe( step => {
        this.accordionStep = step;
      })

      this._homePage = this.uisettingService.homePageSetting$.subscribe(data => {
        this.uiHomePage = data
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
        case 8:
          return this.accordionStep8;
          break;
        default:
          return this.accordionStep0;
          break;
      }
    }

    constructor(
        private uisettingService     : UISettingsService,
        private AuthenticationService: AuthenticationService,
        private dialog               : MatDialog,
        private systemManagerService : SystemManagerService,
        private route                : ActivatedRoute,
        private dSIEMVAndroidService : PointlessCCDSIEMVAndroidService,
        private platFormService      : PlatformService,
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
      this.listAsyncDevices()
    }

    listAsyncDevices() {
      if (this.platForm === 'android') {   this.listBTDevices()   }
    }

    ngOnDestroy(): void {
      if (this._accordionStep) { this._accordionStep.unsubscribe()}
    }

    async listBTDevices() {
      this.blueToothDeviceList = await this.dSIEMVAndroidService.listBTDevices();
    }

    routerNavigation(url: string) {
      this.router.navigate([url]);
    }


    processorselect(index: number) {

      switch ( index) {
        case 1:
          this.processorSelection  =  this.processorItem1;
          break;
        case 2:
          // this.showAndroid = true;
          this.processorSelection  =  this.processorItem2;
          break;
        case 3:
          this.processorSelection  = this.processorItem3;
          break;
        case 4:
          this.processorSelection  = this.processorItem4;
          break;
        }
    }


    setStep(index: number) {

      console.log('setStep',this.accordionStep);

      if( index == this.accordionStep ) {
        this.accordionStep = -1
        this.systemManagerService.updateAccordionStep(index)
        console.log('accordionStep',this.accordionStep);
        return;
      }
      console.log('accordionStep', index);
      this.accordionStep = index;
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

    clientTypesList() {
      this.routerNavigation('client-type-list')
    }

}
