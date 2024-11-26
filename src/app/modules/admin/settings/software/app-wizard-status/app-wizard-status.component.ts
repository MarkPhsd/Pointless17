import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenusService } from 'src/app/_services/system/menus.service';
import { AppStatus, IAppWizardStatus, SystemInitializationService } from 'src/app/_services/system/settings/app-wizard.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-app-wizard-status',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './app-wizard-status.component.html',
  styleUrls: ['./app-wizard-status.component.scss']
})
export class AppWizardStatusComponent implements OnInit, OnDestroy {

  status: AppStatus;
  _appWizard: Subscription;
  inputForm: UntypedFormGroup;
  action$: Observable<any>;

  constructor(private fb: UntypedFormBuilder,
              private router: Router,
              private userAuth: UserAuthorizationService,
              private menuService: MenusService,
              private siteService: SitesService,
              private dialogRef: MatDialogRef<AppWizardStatusComponent>,
              public appWizardService: SystemInitializationService) { }

  ngOnInit(): void {
    this.inputForm = this.initForm();
    this.appWizardService.initAppWizard();
    this.initSubscription()
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._appWizard) { this._appWizard.unsubscribe()}
  }

  initSubscription() {
    this._appWizard = this.appWizardService.appWizardStatus$.subscribe(data => {
      if (!data) {data = {} as IAppWizardStatus}
      this.inputForm.patchValue(data)
      this.status =  this.appWizardService.getStatusCount(data)
    })
  }

  initializeSideMenu() {
    const user = this.userAuth.user;
    const site = this.siteService.getAssignedSite()
    this.action$ = this.menuService.createMainMenu(user, site).pipe(switchMap(data => {
      this.siteService.notify('Menu Updated - you may need to restart the app to see the side menu.' , 'Close', 3000, 'green')
      return of(data)
    }))
  }
  initForm() {
    return this.fb.group( {
      disableAppWizard: [],
      setupCompany: [],
      initializeSideMenu: [],
      setupItemsTypes: [],
      configureGenericItemType: [],
      importProducts		: [],
      //requires 1st two
      addedTax			: [],
      associateItemTaxes	: [],
      setupItemTaxes		: [],
      setupPaymentTypes	: [],
      setupTransactionTypes: [],
      setupFirstItem		: [],
      confirmReceipt		: [],

      setupUserType		: [],
      setupAuthorizations : [],
      setupFirstEmployee	: [],
      setupMerchantAccount: [],

      setupAdjustments	: [],

      firstSale: [],
      firstBalanceSheet: [],
      firstCloseOfDay: [],
      posTerminalSetup: [],
    })
  }

  disable() {
    // this.appWizardService.iAppWizardStatus  = this.inputForm.value;
    // this.appWizardService.iAppWizardStatus.disableAppWizard = true;
    // this.appWizardService._AppWizardStatus.next( this.appWizardService.iAppWizardStatus)
    this.updateValues()
    this.exit()
  }

  exit() {
    this.dialogRef.close();
  }

  view(type: string) {
    this.router.navigate([type])
    this.updateValues()
    this.exit()
  }

  itemTypeEdit(step: number) {
    if (!step) { step = 0}
    const item = { accordionStep: step }
    this.router.navigate([ 'item-types', item ])
    this.updateValues()
    this.exit()
  }

  openSettings(step) {
    const item = { accordionStep: step}
    this.router.navigate(['app-settings', item])
    this.updateValues()
    this.exit()
  }

  updateValues() {
    if (!this.inputForm.value) { return };
    const status = this.inputForm.value as IAppWizardStatus;
    this.appWizardService.iAppWizardStatus = status;
    this.appWizardService.saveAppWizard(status).subscribe(data => {
      this.appWizardService.appWizardSetting = data;
      const app = JSON.parse(data.text);
      this.appWizardService.getStatusCount(app)
    })
  }
}
