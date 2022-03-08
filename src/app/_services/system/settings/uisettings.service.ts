import { Injectable, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISetting, IUser, IUserProfile } from 'src/app/_interfaces';
import { SitesService } from '../../reporting/sites.service';
import { SettingsService } from '../settings.service';

export interface TransactionUISettings {
  displayNotes   : boolean;
  displayView    : boolean;
  displayAdd     : boolean;
  displayQuantity: boolean;
  id:             number;
  lockOrders    : boolean;
  deleteUnClosedPrintedOrders: boolean;
  closeOrderTimeCutOff       : string;
  ordersRequireCustomer: boolean;
  validateCustomerLicenseID: boolean;
  defaultClientTypeID: number;

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


  updateHomePageSetting(ui: UIHomePageSettings) {
    this._homePageSetting.next(ui);
    this.uihomePageSetting = ui;
  }

  updateUISubscription(ui: TransactionUISettings) {
    this._transactionUISettings.next(ui);
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
      if (!data.text) {
      }
    })

    this.getSetting('UIHomePageSettings').subscribe(data => {
      const ui = {} as UIHomePageSettings
      if (data.text) {
        const ui = JSON.parse(data.text)
        this.updateUISubscription(ui)
        return
      }
      if (!data.text) {
      }
    })

    this.getDSIEMVSettings()

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

  ////////////// TransactionUISettings
  async  subscribeToCachedConfig(): Promise<TransactionUISettings> {
    const setting = await this.getSetting('UITransactionSetting').toPromise();
    const config = JSON.parse(setting.text) as TransactionUISettings
    this.updateUISubscription(config);
    return config
  }

  get homePageSetting(): UIHomePageSettings {
    if (this.uihomePageSetting) { return  this.uihomePageSetting }
  }
  // UITransactionSetting
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

  async  saveConfig(fb: FormGroup, name: string): Promise<ISetting>  {
    const setting = fb.value
    return await  this.setSetting(setting, name)
  }

  //save setting returns promise
  private async setSetting(uiSetting: any, name: string): Promise<ISetting> {
    const site    = this.siteService.getAssignedSite();
    const setting = {} as ISetting;

    console.log(name)
    console.log(uiSetting.id)
    console.log(uiSetting)
    if (!uiSetting || !uiSetting.id) { return setting }
    setting.id    = uiSetting.id
    setting.name  = name
    setting.text  = JSON.stringify(uiSetting);

    if ( name == 'UITransactionSetting' ) {
      this.updateUISubscription(uiSetting)
    }
    if ( name == 'UIHomePageSettings' ) {
      this.updateUISubscription(uiSetting)
    }
    if ( name == 'DSIEMVSetting' ) {
      this.updateUISubscription(uiSetting)
    }

    return await this.settingsService.putSetting(site, setting.id, setting).toPromise()

  }


  initHomePageForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id                    : [],
      brandsEnabled         : [],
      typesEnabled          : [],
      categoriesEnabled     : [],
      departmentsEnabled    : [],
      tierMenuEnabled       : [],
      itemsPerPage          : [''],
      menuItemSize          : [''],
      staffBrandsEnabled    : [''],
      staffCategoriesEnabled: [''],
      staffDeparmentsEnabled: [''],
      staffTierMenuEnabled  : [''],
      staffTypesEnabled     : [],
      backgroundImage       : [],
      logoHomePage          : [],
      displayCompanyName    : [],
      tinyLogo              : [''],
      wideOrderBar        : [''],
     })
    return fb
  }

  initDSIEMVForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      HostOrIP         : [],
      IpPort           : [],
      id               : [],
      MerchantID       : [],
      TerminalID       : [],
      OperatorID       : [],
      UserTrace        : [],
      TranCode         : [],
      SecureDevice     : [],
      ComPort          : [],
      PinPadIpAddress  : [],
      PinPadIpPort     : [],
      SequenceNo       : [],
      DisplayTextHandle: [],
    })
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
    fb.patchValue(config);
    return fb
  }

  initForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id                          : [],
      displayNotes                : [],
      displayView                 : [],
      displayAdd                  : [],
      displayQuantity             : [],
      deleteUnClosedPrintedOrders : [],
      closeOrderTimeCutOff        : [],
      ordersRequireCustomer       : [],
      validateCustomerLicenseID   : [],
     })
    return fb
  }

  initUITransactionsForm(config: TransactionUISettings, fb: FormGroup): FormGroup {
    fb = this.initForm(fb);
    fb.patchValue(config)
    return fb
  }

  async setFormValue(inputForm: FormGroup,
                     setting: ISetting,
                     text: any,
                     name: string): Promise<FormGroup> {

    inputForm = this.initForm(inputForm);
    if (!text) { setting = await this.initConfig(setting, name) }

    if (text) {
      const config = JSON.parse(text)
      config.id = setting.id;

      if (name == 'UITransactionSetting') {
        inputForm = this.initUITransactionsForm(config, inputForm);
      }

      if (name == 'UIHomePageSettings') {
        inputForm = this.initHomePageSettingsForm(config, inputForm);
      }

      if (name == 'DSIEMVSettings') {
        inputForm = this.initDSIEMVSettingsForm(config, inputForm);
      }

    }
    return inputForm
  }


  async initConfig(setting: ISetting, name: string): Promise<ISetting> {
    const ui = {} as TransactionUISettings

    if (!setting) {
      const site    = this.siteService.getAssignedSite();
      setting = await this.settingsService.getSettingByNameCachedNoRoles(site, name).pipe().toPromise()
    };

    if (!setting) {
      console.log(`Error UI ${name} setting not established`)
      return
    }

    ui.id = setting.id
    setting = await this.setSetting(ui, name)
    const config = JSON.parse(setting.text) // as TransactionUISettings

    if (name == 'UITransactionSetting') {
      this.updateUISubscription(config)
    }
    if (name == 'UIHomePageSettings') {
      this.updateHomePageSetting(config)
    }
    if (name == 'DSIEMVSettings') {
      this.updateDSIEMVSettings(config)
    }
    //DSIEMVSettings

    return setting
  }


}
