import { Injectable, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
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

    const site = this.siteService.getAssignedSite();

    this.getSetting('UITransactionSetting').subscribe(data => {
      const ui = {} as TransactionUISettings
      if (data.text) {
        const ui = JSON.parse(data.text)
        this.updateUISubscription(ui)
        return
      }
      if (!data.text) { }
    })

    this.getSetting('UIHomePageSettings').subscribe(data => {
      const ui = {} as UIHomePageSettings
      if (data.text) {
        const ui = JSON.parse(data.text)
        this.updateUISubscription(ui)
        return
      }
      if (!data.text) { }
    })

    this.getStripeAPISettings();

    this.getDSIEMVSettings()
  }

  getStripeAPISettings() {
    this.getSetting('StripeAPISettings').subscribe(data => {
      let ui = {} as StripeAPISettings
      if (data.text) {
       ui = JSON.parse(data.text) as StripeAPISettings
      }
      ui.id = data.id;
      this.updateStripeAPISettings(ui)
    })
  }

  getDSIEMVSettings() {
    this.getSetting('DSIEMVSettings').subscribe(data => {
      const ui = {} as DSIEMVSettings
      if (data.text) {
        const ui = JSON.parse(data.text)
        this.updateDSIEMVSettings(ui)
        return
      }
      if (!data.text) {
      }
    })

    this.getSetting('DSIEMVAndroidSettings').subscribe(data => {
      const ui = {} as DSIEMVAndroidSettings
      if (data.text) {
        const ui = JSON.parse(data.text)
        this.updateDSIEMVAndroidSettings(ui)
        return
      }
      if (!data.text) {
      }
    })

  }

  ////////////// subscribeToStripedCachedConfig
  async  subscribeToStripedCachedConfig(): Promise<StripeAPISettings> {
    const setting = await this.getSetting('StripeAPISettings').toPromise();
    const config = JSON.parse(setting.text) as StripeAPISettings
    this.updateStripeAPISettings(config);
    return config
  }

  async  subscribeToCachedConfig(): Promise<TransactionUISettings> {
    const setting = await this.getSetting('UITransactionSetting').toPromise();
    const config = JSON.parse(setting.text) as TransactionUISettings
    this.updateUISubscription(config);
    return config
  }

  get homePageSetting(): UIHomePageSettings {
    if (this.uihomePageSetting) { return  this.uihomePageSetting }
  }

  async  subscribeToCachedHomePageSetting(name: string): Promise<any> {
    const setting = await this.getSetting(name).toPromise();
    const config = JSON.parse(setting.text) as UIHomePageSettings
    this.updateHomePageSetting(config);
    return config
  }

  getSetting(name: string): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    const user =  JSON.parse(localStorage.getItem('user')) as IUser

    if (user && user.username && user.token && (user.roles != '' && user.roles != 'user' )) {
      return this.settingsService.getSettingByName(site, name)
    }

    return this.settingsService.getSettingByNameNoRoles(site, name)
  }

  saveConfig(fb: FormGroup, name: string): Observable<ISetting>  {
    const setting = fb.value
    return this.setSetting(setting, name)
  }

  setSetting(uiSetting: any, name: string): Observable<ISetting> {
    const site    = this.siteService.getAssignedSite();
    const setting = {} as ISetting;

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
      staffDeparmentsEnabled: [''],
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
      enabled: [''],
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
      inputForm = this.initUITransactionsForm(config, inputForm);
    }

    if (name == 'UIHomePageSettings') {
      inputForm = this.initHomePageSettingsForm(config, inputForm);
    }

    if (name == 'DSIEMVSettings') {
      inputForm = this.initDSIEMVSettingsForm(config, inputForm);

    }

    if (name == 'StripeAPISettings') {
      inputForm = this.initStripeAPISettingsForm(config, inputForm);
    }
    return inputForm
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
