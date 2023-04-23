import { Component, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective,FormControl ,NgForm, FormBuilder} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Observable, switchMap, of } from 'rxjs';
import { clientType, ISetting } from 'src/app/_interfaces';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
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
  testForm        : FormGroup;
  inputForm       : FormGroup;
  uiSettings      : ISetting
  uiSettings$     : Observable<ISetting>;
  message         : string;
  payPalEnabled   : boolean;
  uiTransactions  = {} as TransactionUISettings;
  uiTransactions$  : Observable<ISetting>;
  saving$ : Observable<any>;
  clientTypes$    : Observable<any>;
  clientTypes     : clientType[];
  vipCustomer$    : Observable<any>;
  action$         : Observable<unknown>;

  constructor(
      private uISettingsService: UISettingsService,
      private settingService   : SettingsService,
      private clientTypeService: ClientTypeService,
      private sitesService     : SitesService,
      private clienTableSerivce: ClientTableService,
      private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    const site           = this.sitesService.getAssignedSite();
    this.clientTypes$    = this.clientTypeService.getClientTypes(site);
    this.initUITransactionSettings()
    this.saving$  = null;

    this.testForm = this.fb.group({
      testVariable: [localStorage.getItem('testVariable')],
    })

    this.testForm.valueChanges.subscribe(data => {
       localStorage.setItem('testVariable' ,  this.testForm.controls['testVariable'].value)
    })
  }

  initUITransactionSettings() {
    this.uiTransactions$ = this.uISettingsService.getSetting('UITransactionSetting').pipe(
      switchMap( data => {
        this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
        this.initFormData(  this.uiTransactions )
        return of(data);
    }));
  }

  initFormData(data: TransactionUISettings) { 
    this.inputForm = this.uISettingsService.initForm(this.inputForm);
      if (data && data) {
        this.payPalEnabled = this.uiTransactions.payPalEnabled
        this.inputForm.patchValue( this.uiTransactions)
        this.getVipClient(this.uiTransactions.vipCustomerID)
      } else {
        this.uiTransactions  = {} as TransactionUISettings;
        this.inputForm.patchValue( this.uiTransactions)
        this.payPalEnabled = this.uiTransactions.payPalEnabled
        this.vipCustomer$ = null;
      }
  } 

  updateSetting(){
    if (!this.validateForm(this.inputForm)) {
      this.uISettingsService.notify('There is an error in these settings', 'Error')
      return
    }

    const transaction = this.inputForm.value as TransactionUISettings;

    if (transaction.id) {
      this.saving$ =  this.uISettingsService.saveConfig(this.inputForm, 'UITransactionSetting').pipe(
        switchMap(data => {
          this.uISettingsService.notify('Saved', 'Success')
          this.uISettingsService.updateUISubscription(transaction);
          return of(data)
        }
      ))
    }
  }


  resetTransactionSettings() { 
    this.action$ = this.settingService.resetUITransactionSettings().pipe(switchMap(data => { 
      this.initFormData(data)
      this.uiTransactions = data;
      this.uISettingsService.updateUISubscription(data);
      return of(data)
    }))
  } 
  
  getVipClient(id){
    if (id) {
      this.vipCustomer$ = this.clienTableSerivce.getClient(this.sitesService.getAssignedSite(), id)
    }
  }

  assignCustomer(event) {
    if (!this.inputForm || !event) {
      return
    }
    this.inputForm.patchValue({vipCustomerID: event.id})
    this.getVipClient(this.inputForm.value)
  }

  validateForm(form: FormGroup) {
    if (!this.inputForm.value) {
      this.uISettingsService.notify('Form has no value.', 'Problem Occured')
      return false;
    }
    this.message = ''
    const site = this.sitesService.getAssignedSite();
    const transaction = form.value as TransactionUISettings;

    if (!transaction.id) {
      const setting = {} as ISetting;
      setting.name = 'UITransactionSetting'
      setting.text =  JSON.stringify(transaction)
      const post$  =  this.settingService.postSetting(site, setting)
      this.saving$ = post$.pipe(
        switchMap(data => {
          this.uiSettings = data;
          transaction.id = data.id;
          this.inputForm.patchValue( {id: data.id} )
          this.message = 'Saved'
          this.uISettingsService.notify('Saved.', 'Saved')
          return  this.uISettingsService.saveConfig(this.inputForm, 'UITransactionSetting');
        })
      )
    }
    return true;
  }

}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
