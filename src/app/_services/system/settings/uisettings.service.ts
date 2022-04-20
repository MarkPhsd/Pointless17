import { Injectable, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { ISetting, IUser, IUserProfile } from 'src/app/_interfaces';
import { SitesService } from '../../reporting/sites.service';
import { SettingsService } from '../settings.service';

export interface TransactionUISettings {
  id:             number;
  displayNotes   : boolean;
  displayView    : boolean;
  displayAdd     : boolean;
  displayQuantity: boolean;
  lockOrders    : boolean;
  deleteUnClosedPrintedOrders: boolean;
  closeOrderTimeCutOff       : string;
  ordersRequireCustomer: boolean;
  validateCustomerLicenseID: boolean;
  defaultClientTypeID: number;
  enablMEDClients: boolean;
  enableLimitsView: boolean;

  prefixBarcodeLabel : string;
  mAXOrdersOpen: string;
  loyaltyPointSystemValue: string;
  lotPreBarCode: string;
  creditRecieptMinimum: string;
  buyerAmountDiscount: string;
  idleTime: string;
  highTipInputPercentage: string;
  
}

export interface StripeAPISettings {
  id: number;
  apiKey     : string;
  apiSecret: string;
  enabled: boolean;
}

export interface DSIEMVSettings {
  id        : number;
  HostOrIP  : string;
  IpPort    : string;
  MerchantID: string;
  TerminalID: string;
  OperatorID: string;
  UserTrace : string;
  TranCode  : string;
  SecureDevice: string;
  ComPort   : string;
  PinPadIpAddress: string;
  PinPadIpPort: string;
  SequenceNo: string;
  DisplayTextHandle: string;
  enabled: boolean;
}

export interface DSIEMVAndroidSettings {

}

export interface WebAppSettings {
  usersEnabled: Boolean;
}

export interface InstalledAppSettings {
  defaultReceipt     : string;
  promptBalanceSheet: boolean;
}

export interface MetrcSettings {
  enabled: boolean;
}

export interface EndOfDayProcedures {

}

export interface RStream {
  CmdResponse: CmdResponse;
}

export interface CmdResponse{
  ResponseOrigin: string;
  DSIXReturnCode: string;
  CmdStatus: string;
  TextResponse: string;
  SequenceNo: string;
  UserTrace: string;
}

export interface UIHomePageSettings {
  id                : number;
  brandsEnabled     : boolean;
  categoriesEnabled : boolean;
  typesEnabled      : boolean;
  departmentsEnabled: boolean;
  tierMenuEnabled   : boolean;
  staffBrandsEnabled : boolean;
  staffCategoriesEnabled: boolean;
  staffDepartmentsEnabled: boolean;
  staffTierMenuEnabled  : boolean;
  staffTypesEnabled   : boolean;
  menuItemSize        : number; //pixels
  itemsPerPage        : number;
  backgroundImage     : string;
  tinyLogo            : string;
  logoHomePage        : string;  //  : [config.logoHomePage],
  displayCompanyName  : string;  //     : [config.displayCompanyName],
  wideOrderBar        : boolean;
}

@Injectable({
  providedIn: 'root'
})

export class UISettingsService {

  private _transactionUISettings  = new BehaviorSubject<TransactionUISettings>(null);
  public  transactionUISettings$  = this._transactionUISettings.asObservable();

  private _homePageSetting         = new BehaviorSubject<UIHomePageSettings>(null);
  public  homePageSetting$        = this._homePageSetting.asObservable();
  private uihomePageSetting         : UIHomePageSettings

  private _DSIEMVSettings         = new BehaviorSubject<DSIEMVSettings>(null);
  public  dsiEMVSettings$        = this._DSIEMVSettings.asObservable();

  private _DSIEMVAndroidSettings         = new BehaviorSubject<DSIEMVAndroidSettings>(null);
  public  dsiEMVAndroidSettings$        = this._DSIEMVAndroidSettings.asObservable();


  private _StripeAPISettings         = new BehaviorSubject<StripeAPISettings>(null);
  public  stripeAPISettings$        = this._StripeAPISettings.asObservable();

  updateHomePageSetting(ui: UIHomePageSettings) {
    this._homePageSetting.next(ui);
    this.uihomePageSetting = ui;
  }

  updateUISubscription(ui: TransactionUISettings) {
    this._transactionUISettings.next(ui);
  }

  updateStripeAPISettings(ui: StripeAPISettings) {
    this._StripeAPISettings.next(ui);
  }

  updateDSIEMVSettings(ui: DSIEMVSettings) {
    this._DSIEMVSettings.next(ui)
  }

  updateDSIEMVAndroidSettings(ui: DSIEMVAndroidSettings) {
    this._DSIEMVAndroidSettings.next(ui)
  }

  constructor(
      private _fb            : FormBuilder,
      private siteService    : SitesService,
      private settingsService: SettingsService) {

    this.getTransactionUISettings();
    this.subscribeToStripedCachedConfig();
    this.getDSSIEmvSettings();
    this.getUIHomePageSettings();
  }

  getTransactionUISettings() { 
    this.settingsService.getUITransactionSetting().subscribe(data => { 
      this._transactionUISettings.next(data)
    })
  }

  getUIHomePageSettings() { 
    this.settingsService.getUIHomePageSettings().subscribe(data => { 
      this._homePageSetting.next(data)
    })
  }

  getDSSIEmvSettings() { 
     this.settingsService.getDSIEMVSettings().subscribe(data => { 
      this._DSIEMVSettings.next(data)
    })
  }
  ////////////// subscribeToStripedCachedConfig
  subscribeToStripedCachedConfig()  {
   this.settingsService.getStripeAPISetting().subscribe(data => { 
      this.updateStripeAPISettings(data);
   });
  }

  get homePageSetting(): UIHomePageSettings {
    if (this.uihomePageSetting) { return  this.uihomePageSetting }
  }

  getSetting(name: string): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    const user =  JSON.parse(localStorage.getItem('user')) as IUser

    if (user && user.username && user.token && (user.roles != '' && user.roles != 'user' )) {
      return this.settingsService.getSettingByName(site, name)
    }

    return this.settingsService.getSettingByNameNoRoles(site, name)
  }

  getDSIEMVSettings(name: string): Observable<DSIEMVSettings> {
    this.settingsService.getDSIEMVSettings().subscribe(data => { 
      this.updateDSIEMVSettings(data);
   });
    return this.settingsService.getDSIEMVSettings()
  }

  saveConfig(fb: FormGroup, name: string): Observable<ISetting>  {
    const setting = fb.value

    if (!setting || (!setting.id || setting.id === '')) {
      this.getSetting(name).pipe(
        switchMap(data => {
        setting.id = data.id;
        return this.setSetting(setting, name)
      })).subscribe(data => {
        return this.setSetting(setting, name)
      })
    }

    return this.setSetting(setting, name)

  }

  setSetting(uiSetting: any, name: string): Observable<ISetting> {
    const site    = this.siteService.getAssignedSite();
    const setting = {} as ISetting;
    console.log(uiSetting);

    if (!uiSetting || !uiSetting.id) { return null }
    setting.id    = uiSetting.id
    setting.name  = name
    setting.text  = JSON.stringify(uiSetting);

    if ( name == 'UITransactionSetting' ) {
      this.updateUISubscription(uiSetting)
    }
    if ( name == 'UIHomePageSettings' ) {
      this.updateHomePageSetting(uiSetting)
    }
    if ( name == 'DSIEMVSetting' ) {
      this.updateDSIEMVAndroidSettings(uiSetting)
    }
    if ( name == 'StripeAPISettings' ) {
      this.updateStripeAPISettings(uiSetting)
    }

    return this.settingsService.putSetting(site, setting.id, setting)
  }

  initHomePageForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id                    : [''],
      brandsEnabled         : [''],
      typesEnabled          : [''],
      categoriesEnabled     : [''],
      departmentsEnabled    : [''],
      tierMenuEnabled       : [''],
      itemsPerPage          : [''],
      menuItemSize          : [''],
      staffBrandsEnabled    : [''],
      staffCategoriesEnabled: [''],
      staffDepartmentsEnabled: [''],
      staffTierMenuEnabled  : [''],
      staffTypesEnabled     : [''],
      backgroundImage       : [''],
      logoHomePage          : [''],
      displayCompanyName    : [''],
      tinyLogo              : [''],
      wideOrderBar          : [''],
     })
    return fb
  }

  initDSIEMVForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      HostOrIP         : [''],
      IpPort           : [''],
      MerchantID       : [''],
      TerminalID       : [''],
      OperatorID       : [''],
      UserTrace        : [''],
      TranCode         : [''],
      SecureDevice     : [''],
      ComPort          : [''],
      PinPadIpAddress  : [''],
      PinPadIpPort     : [''],
      SequenceNo       : [''],
      DisplayTextHandle: [''],
      enabled          : [''],
    })
    return fb
  }

  initStripeAPISettingsForm(config: any, fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id               : [''],
      apiSecret        : [''],
      apiKey           : [''],
      enabled          : [''],
    })
    if (!config) { return fb}
    fb.patchValue(config)
    return fb
  }

  initDSIEMVSettingsForm(config: any, fb: FormGroup): FormGroup {
    if (!config) { return this.initDSIEMVForm(fb)};
    fb = this._fb.group({
      id               : [config.id],
      HostOrIP         : [config.DisplayTextHandle],
      IpPort           : [config.IpPort],
      MerchantID       : [config.MerchantID],
      TerminalID       : [config.TerminalID],
      OperatorID       : [config.OperatorID],
      UserTrace        : [config.UserTrace],
      TranCode         : [config.TranCode],
      SecureDevice     : [config.SecureDevice],
      ComPort          : [config.ComPort],
      PinPadIpAddress  : [config.PinPadIpAddress],
      PinPadIpPort     : [config.PinPadIpPort],
      SequenceNo       : [config.SequenceNo],
      DisplayTextHandle: [config.DisplayTextHandle]
    })
    return fb
  }

  initHomePageSettingsForm(config: any, fb: FormGroup): FormGroup {
    if (!config) { return this.initHomePageForm(fb) }
    fb = this.initHomePageForm(fb);
    console.log('init Home Page', config)
    fb.patchValue(config);
    return fb
  }

  initForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id                          : [''],
      displayNotes                : [''],
      displayView                 : [''],
      displayAdd                  : [''],
      displayQuantity             : [''],
      deleteUnClosedPrintedOrders : [''],
      closeOrderTimeCutOff        : [''],
      ordersRequireCustomer       : [''],
      validateCustomerLicenseID   : [''],
      defaultClientTypeID         : [''],
      enablMEDClients             : [''],
      enableLimitsView            : [''],
      
      prefixBarcodeLabel          : [''],
      maxOrdersOpen               : [''],
      lotPreBarCode               : [''],
      buyerAmountDiscount         : [''],
      idleTime                    : [''],
      creditRecieptMinimum        : [''],
      highTipInputPercentage      : [''],
     })
    return fb
  }

  initUITransactionsForm(config: TransactionUISettings, fb: FormGroup): FormGroup {
    fb = this.initForm(fb);
    fb.patchValue(config)
    return fb
  }

  setFormValue(inputForm: FormGroup,
                     setting: ISetting,
                     name: string): Observable<ISetting> {
    inputForm = this.initForm(inputForm);
    return  this.initConfig(setting, name)
  }

  initForms_Sub(inputForm: FormGroup, name: string, config: any): FormGroup {
    if (name == 'UITransactionSetting') {
      return this.initUITransactionsForm(config, inputForm);
    }

    if (name == 'UIHomePageSettings') {
      return this.initHomePageSettingsForm(config, inputForm);
    }

    if (name == 'DSIEMVSettings') {
      return this.initDSIEMVSettingsForm(config, inputForm);
    }

    if (name == 'StripeAPISettings') {
      return this.initStripeAPISettingsForm(config, inputForm);
    }
  }

  initConfig(setting: ISetting, name: string): Observable<ISetting> {
    const ui = {} as TransactionUISettings

    if (!setting || setting.id) {
      const site    = this.siteService.getAssignedSite();
      return this.settingsService.getSettingByNameCachedNoRoles(site, name).pipe()
    };

    ui.id = setting.id
    return this.setSetting(ui, name)

  }

  updateUIJSONSetting(name: string, settingText: string) {
    const config = JSON.parse(settingText) // as TransactionUISettings

    if (name == 'UITransactionSetting') {
      this.updateUISubscription(config)
    }
    if (name == 'UIHomePageSettings') {
      this.updateHomePageSetting(config)
    }
    if (name == 'DSIEMVSettings') {
      this.updateDSIEMVSettings(config)
    }
    if (name == 'StripeAPISettings') {
      this.updateStripeAPISettings(config)
    }
  }


}
