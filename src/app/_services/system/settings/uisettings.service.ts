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

export interface UIHomePageSettings {
  brandsEnabled: boolean;
  categoriesEnabled: boolean;
  typesEnabled: boolean;
  departmentsEnabled: boolean;
  tierMenuEnabled   : boolean;
}

@Injectable({
  providedIn: 'root'
})

export class UISettingsService {

  private _transactionUISettings  = new BehaviorSubject<TransactionUISettings>(null);
  public  transactionUISettings$  = this._transactionUISettings.asObservable();

  private _homePageSetting         = new BehaviorSubject<UIHomePageSettings>(null);
  public  homePageSetting$        = this._homePageSetting.asObservable();

  updateHomePageSetting(ui: UIHomePageSettings) {
    this._homePageSetting.next(ui);
  }

  updateUISubscription(ui: TransactionUISettings) {
    this._transactionUISettings.next(ui);
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

  }

  ////////////// TransactionUISettings
  async  subscribeToCachedConfig(): Promise<TransactionUISettings> {
    const setting = await this.getSetting('UITransactionSetting').toPromise();
     const config = JSON.parse(setting.text) as TransactionUISettings
    this.updateUISubscription(config);
    return config
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
    if (user && user.username && user.token) {
      return this.settingsService.getSettingByName(site, name)
    }
    if (!user) {
      return this.settingsService.getSettingByNameNoRoles(site, name)
    }
  }

  async  saveConfig(fb: FormGroup, name: string): Promise<ISetting>  {
    const setting = fb.value
    return await  this.setSetting(setting, name)
  }

  //save setting returns promise
  private async setSetting(uiSetting: any, name: string): Promise<ISetting> {
    const site    = this.siteService.getAssignedSite();
    const setting = {} as ISetting;

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

    return await this.settingsService.putSetting(site, setting.id, setting).toPromise()

  }

  initForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id             : [],
      displayNotes   : [],
      displayView    : [],
      displayAdd     : [],
      displayQuantity: [],
     })
    return fb
  }

  initHomePageForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id                : [],
      brandsEnabled     : [],
      typesEnabled      : [],
      categoriesEnabled : [],
      departmentsEnabled: [],
      tierMenuEnabled   : [],
     })
    return fb
  }

  initHomePageSettingsForm(config: any, fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id                : [config.id],
      brandsEnabled     : [config.brandsEnabled],
      typesEnabled      : [config.typesEnabled],
      categoriesEnabled : [config.categoriesEnabled],
      departmentsEnabled: [config.departmentsEnabled],
      tierMenuEnabled   : [config.tierMenuEnabled],
     })
    return fb
  }

  initUITransactionsForm(config: TransactionUISettings, fb: FormGroup): FormGroup {

    fb = this._fb.group({
      id             : [config.id],
      displayNotes   : [config.displayNotes],
      displayView    : [config.displayView],
      displayAdd     : [config.displayAdd],
      displayQuantity: [config.displayQuantity]
     })
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
    return setting
  }


}
