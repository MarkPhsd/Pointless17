import { ChangeDetectionStrategy,Component, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective,FormControl ,NgForm} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Observable, switchMap } from 'rxjs';
import { clientType, ISetting } from 'src/app/_interfaces';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-uitransactions',
  templateUrl: './uitransactions.component.html',
  styleUrls: ['./uitransactions.component.scss'],
})
export class UITransactionsComponent implements OnInit {

  inputForm       : FormGroup;
  uiSettings      : ISetting
  uiSettings$     : Observable<ISetting>;
  uiTransactions  = {} as TransactionUISettings;
  clientTypes$    :  Observable<any>;
  clientTypes     : clientType[];

  constructor(
      private uISettingsService: UISettingsService,
      private settingService   : SettingsService,
      private clientTypeService: ClientTypeService,
      private sitesService     : SitesService,
  ) {
  }

  ngOnInit() {
    const site = this.sitesService.getAssignedSite();
    this.clientTypes$ = this.clientTypeService.getClientTypes(site);

    this.uISettingsService.getSetting('UITransactionSetting').subscribe(data => {
      this.inputForm = this.uISettingsService.initForm(this.inputForm)

      try {
        if (data && data.text) {
          this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
          this.inputForm.patchValue( this.uiTransactions)
        } else {
          this.uiTransactions  = {} as TransactionUISettings;
          this.inputForm.patchValue( this.uiTransactions)
        }
      } catch (error) {
        console.log('error', error)
      }

    });
  }

  updateSetting(){
    if (!this.validateForm(this.inputForm)) { return }
    const transaction = this.inputForm.value as TransactionUISettings;
    if (transaction.id) {
      this.uISettingsService.saveConfig(this.inputForm, 'UITransactionSetting').subscribe(data => {
          this.uISettingsService.notify('Saved', 'Success')
          this.uISettingsService.updateUITransactionSubscription(transaction)
        }
      )
    }
  }

  validateForm(form: FormGroup) {
    if (!this.inputForm.value) {
      this.uISettingsService.notify('Form has no value.', 'Problem Occured')
      return false;
    }

    const site = this.sitesService.getAssignedSite();
    const transaction = form.value as TransactionUISettings;
    if (!transaction.id) {
      const setting = {} as ISetting;
      setting.name = 'UITransactionSetting'
      setting.text =  JSON.stringify(transaction)
      const post$  =  this.settingService.postSetting(site, setting)
      post$.pipe(
        switchMap(data => {
          this.uiSettings = data;
          transaction.id = data.id;
          this.inputForm.patchValue( {id: data.id} )
          return  this.uISettingsService.saveConfig(this.inputForm, 'UITransactionSetting');
        })
      ).subscribe(data => {
        this.uISettingsService.notify('Saved', 'Success')
      })

    }

    return true;
  }

}

// uiSettings      :  ISetting
// uiSettings$     : Observable<ISetting>;
// uiTransactions  = {} as TransactionUISettings;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
