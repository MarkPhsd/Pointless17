import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyLabel } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinner, MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySliderModule } from '@angular/material/legacy-slider';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { StripeAPISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { FormSelectListComponent } from 'src/app/shared/widgets/formSelectList/form-select-list.component';
import { ValueFieldsComponent } from '../../products/productedit/_product-edit-parts/value-fields/value-fields.component';

import { MatIconModule } from '@angular/material/icon';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SimpleTinyComponent } from 'src/app/_components/tinymce/tinymce.component';

@Component({
  selector: 'app-stripe-settings',
  standalone:true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,
    FormSelectListComponent,MatIconModule,
    AppMaterialModule,SimpleTinyComponent,
    ValueFieldsComponent,MatLegacyProgressSpinnerModule,MatLegacyButtonModule,
    MatLegacyInputModule,MatLegacySliderModule,MatLegacyCardModule,MatDividerModule],
  templateUrl: './stripe-settings.component.html',
  styleUrls: ['./stripe-settings.component.scss']
})
export class StripeSettingsComponent implements OnInit {

  stripeEnabled    : boolean;
  inputForm  : UntypedFormGroup;
  uiSettings : ISetting;
  uiSettings$: Observable<ISetting>;
  stripeAPISettings = {} as StripeAPISettings;
  paymentAgreement: string;

  constructor(private uISettingsService: UISettingsService,
              private fb: FormBuilder,
              private matSnack         : MatSnackBar) { }

  ngOnInit(): void {


    this.uISettingsService.getSetting('StripeAPISettings').subscribe(data => {
      if (data) {
        this.uiSettings = data;
        this.stripeAPISettings   = JSON.parse(data.text) as StripeAPISettings
        if (!this.stripeAPISettings) {
          this.stripeAPISettings = {}  as StripeAPISettings;
          this.stripeAPISettings.apiKey = 'please fill to use';
          this.stripeAPISettings.apiSecret = 'please fill to use';
          this.stripeAPISettings.enabled = false;
          this.paymentAgreement = 'Please complete these, they will instruct your client about the payment and refund policy.'
        }
        this.stripeEnabled = this.stripeAPISettings.enabled;
        this.stripeAPISettings.id = data.id;
        this.initForm(this.stripeAPISettings);
        this.paymentAgreement = this.stripeAPISettings.paymentAgreement;
      }
    });
  }

  initForm(setting: StripeAPISettings) {
    const form = this.inputForm
    this.inputForm = this.initStripeAPISettingsForm(setting, form)
   }

   initStripeAPISettingsForm(config: any, fb: UntypedFormGroup): UntypedFormGroup {
    fb = this.fb.group({
      id               : [''],
      apiSecret        : [''],
      apiKey           : [''],
      enabled          : [''],
      paymentAgreement : [''],
    })
    if (!config) { return fb}
    fb.patchValue(config)
    return fb
  }

   updateSetting(){
    if (!this.inputForm) {
      this.matSnack.open('Save failed - Invalid form data.', 'Failed');
      return
    }

    // this.inputForm.patchValue({paymentAgreement: this.paymentAgreement})
    this.uISettingsService.setSetting(this.inputForm.value, 'StripeAPISettings').subscribe(
      {
        next: data => {
          this.matSnack.open('Save ', 'Sucess');
        },
        error: err => {
          this.matSnack.open(`Save failed ${err}` , 'Failed');
        }
      }
    )

  }
}
