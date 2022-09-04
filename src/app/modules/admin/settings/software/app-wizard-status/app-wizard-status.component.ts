import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppStatus, IAppWizardStatus, SystemInitializationService } from 'src/app/_services/system/settings/app-wizard.service';

@Component({
  selector: 'app-app-wizard-status',
  templateUrl: './app-wizard-status.component.html',
  styleUrls: ['./app-wizard-status.component.scss']
})
export class AppWizardStatusComponent implements OnInit, OnDestroy {

  status: AppStatus;
  _appWizard: Subscription;
  inputForm: FormGroup;

  constructor(private fb: FormBuilder,
              private router: Router,
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

  initForm() {
    return this.fb.group( {
      disableAppWizard: [],
      setupCompany: [],

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
