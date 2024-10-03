import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, FormGroupDirective,UntypedFormControl ,NgForm, UntypedFormBuilder, FormGroup} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Observable, switchMap, of, ObservableNotification } from 'rxjs';
import { clientType, IProductCategory, IServiceType, ISetting } from 'src/app/_interfaces';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { AuthenticationService, IItemBasic, MenuService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EmailSMTPService } from 'src/app/_services/system/email-smtp';
import { IMenuButtonGroups, MBMenuButtonsService } from 'src/app/_services/system/mb-menu-buttons.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { DcapPayAPIService } from 'src/app/modules/payment-processing/services/dcap-pay-api.service';

@Component({
  selector: 'app-uitransactions',
  templateUrl: './uitransactions.component.html',
  styleUrls: ['./uitransactions.component.scss'],
})
export class UITransactionsComponent implements OnInit {
  testForm        : UntypedFormGroup;
  inputForm       : UntypedFormGroup;
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
  serviceType$    : Observable<IServiceType[]>;
  categories$     :  Observable<IProductCategory[]>;
  posDeviceList$ =  this.settingService.getPOSNames(this.sitesService.getAssignedSite());
  receiptList$    :  Observable<IItemBasic[]>;
  receiptList     : IItemBasic[];
  isAdmin: boolean
  payAPIKeyExists$ : Observable<any>;
  aquireKey$ : Observable<any>;
  payAPIKeyEnabled: boolean;
  disableNonCrediTip: boolean;

  menuButtonList$ : Observable<IMenuButtonGroups[]>;

  dcapSurchargeOptionList = this.uISettingsService.dcapSurchargeOptionList;
  constructor(
      private uISettingsService: UISettingsService,
      private settingService   : SettingsService,
      private serviceTypeService: ServiceTypeService,
      private clientTypeService: ClientTypeService,
      private sitesService     : SitesService,
      private clienTableSerivce: ClientTableService,
      private menuService: MenuService,
      private fb: UntypedFormBuilder,
      public labelingService: LabelingService,
      private paymentService: DcapPayAPIService,
      private authenticationService: AuthenticationService,
      private mbMenuGroupService: MBMenuButtonsService,
      private emailSMTPService: EmailSMTPService,
  ) {
  }


  emailDCApSettings() {
    const model = {emailTo: 'markp@pointlesspos.com', name: 'mark phillips'} as any
    this.action$ = this.emailSMTPService.emailDCAPProperties(model).pipe(switchMap(data => {
      this.sitesService.notify('Check email', 'close', 3000)
      return of(data)
    }))
  }
  ngOnInit() {

    this.isAdmin = this.authenticationService.isAdmin;
    const site           = this.sitesService.getAssignedSite();

    if (this.authenticationService.userValue) {
      this.clientTypes$    = this.clientTypeService.getClientTypes(site);
    }

    this.serviceType$    = this.serviceTypeService.getAllServiceTypes(site)

    this.categories$     = this.menuService.getCategoryListNoChildren(site);

    this.menuButtonList$ = this.mbMenuGroupService.getGroups(site);
    this.payAPIKeyExists();
    this.initUITransactionSettings()
    this.saving$  = null;
    this.testForm = this.fb.group({
      testVariable: [localStorage.getItem('testVariable')],
    })
    this.testForm.valueChanges.subscribe(data => {
       localStorage.setItem('testVariable' ,  this.testForm.controls['testVariable'].value)
    })
    this.receiptList$ = this.getReceiptList();
  }

  initUITransactionSettings() {
    this.uiTransactions$ = this.uISettingsService.getSetting('UITransactionSetting').pipe(
      switchMap( data => {
        this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
        this.initFormData(  this.uiTransactions )
        return of(data);
    }));
  }

  openPOSDevice(device: string) {
    const site         = this.sitesService.getAssignedSite()
    this.action$ = this.settingService.getPOSDeviceBYName(site, device).pipe(switchMap(data => {
      this.settingService.editPOSDevice(data)
      return of(data)
    }))
  }

  getReceiptList() {
    const site         = this.sitesService.getAssignedSite()
    return this.settingService.getReceipts(site).pipe(switchMap(data => {
      this.receiptList = data;
      return of(data)
    }))
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


  acquireInitialApiKey() {
    this.aquireKey$ = this.paymentService.acquireInitialApiKey().pipe(switchMap(data => {
      // this.publicKey = data.apiKey

      this.sitesService.notify(`Result  ${data?.message} - ${data?.returnCode}`,'close', 50000, 'green')
      this.payAPIKeyExists();

      return of(data)
    }))
  }

  acquireApiKey() {
    this.aquireKey$ = this.paymentService.acquireApiKey().pipe(switchMap(data => {
      // this.publicKey = data.apiKey
      this.sitesService.notify(`Result  ${data?.message} - ${data?.returnCode}`,'close', 50000, 'green')
      this.payAPIKeyExists();
      return of(data)
    }))
  }

  payAPIKeyExists() {
    this.payAPIKeyExists$ = this.paymentService.payAPIKeyExists().pipe(switchMap(data => {
      this.payAPIKeyEnabled = data;
      return of(data)
    }))
  }

  deleteKey( ) {

    const warn = window.confirm('Are you usre you want to delete the key? You may have to reset from your account')
    if (!warn) { return }
    this.payAPIKeyExists$ = this.paymentService.deleteKey().pipe(switchMap(data => {
      return  this.paymentService.payAPIKeyExists()
    }))
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
    if (!this.authenticationService.isAdmin) {
      this.sitesService.notify('Not authorized', 'Close', 2000)
    }
    const confirm = window.confirm('Resetting will remove all settings, email etc. You may want to backup your database before doing this. If your cache is enabled you may have to wait for a refresh. Please confirm')
    if (!confirm) {return}
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

  validateForm(form: UntypedFormGroup) {
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
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
