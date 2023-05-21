import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { StripeAPISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-stripe-settings',
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
    this.inputForm = this.uISettingsService.initStripeAPISettingsForm(setting, form)
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
