import { ChangeDetectionStrategy,Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
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

  constructor(
      private uISettingsService: UISettingsService,
      private settingService   : SettingsService,
      private sitesService     : SitesService,
  ) {
  }

  ngOnInit() {

    this.uISettingsService.getSetting('UITransactionSetting').subscribe(data => {
      this.inputForm = this.uISettingsService.initForm(this.inputForm)

      try {
        if (data && data.text) {
          this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
          this.inputForm.patchValue( this.uiTransactions)
          console.log('this.inputForm.', this.inputForm.value)
        } else {
          this.uiTransactions  = {} as TransactionUISettings;
          this.inputForm.patchValue( this.uiTransactions)
          console.log('this.inputForm2.', this.inputForm.value)
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
    // console.log(form.value)
    // if (form.valid) {
    //   this.uISettingsService.notify('Form not valid.', 'Problem Occured')
    //   return false;
    // }

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
