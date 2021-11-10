import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from '../../reporting/sites.service';
import { SettingsService } from '../settings.service';

export interface TransactionUISettings {
  displayNotes   : boolean;
  displayView    : boolean;
  displayAdd     : boolean;
  displayQuantity: boolean;
  id:             number;
}

@Injectable({
  providedIn: 'root'
})

export class UISettingsService {

  private _transactionUISettings       = new BehaviorSubject<TransactionUISettings>(null);
  public  transactionUISettings$        = this._transactionUISettings.asObservable();

  updateUISubscription(ui: TransactionUISettings) {
    this._transactionUISettings.next(ui);
  }

  constructor(
      private _fb            : FormBuilder,
      private siteService    : SitesService,
      private settingsService: SettingsService) {

    const site = this.siteService.getAssignedSite();
    this.settingsService.getSettingByNameCached(site, ' ').subscribe(data => {
      const ui = {} as TransactionUISettings
      if (data.text) {
        const ui = JSON.parse(data.text)
        this.updateUISubscription(ui)
        return
      }
    })

  }

  async  subscribeToCachedConfig(): Promise<TransactionUISettings> {
    const site = this.siteService.getAssignedSite();
    const setting = await this.settingsService.getSettingByNameCached(site, 'UITransactionSetting').toPromise();
    const config = JSON.parse(setting.text) as TransactionUISettings
    this.updateUISubscription(config);
    return config
  }

  getSettings(cached: boolean): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    if (cached)  { return this.settingsService.getSettingByNameCached(site, 'UITransactionSetting') }
    if (!cached) { return this.settingsService.getSettingByName(site, 'UITransactionSetting')}
  }

  async  saveConfig(fb: FormGroup): Promise<ISetting>  {
    const transactionUISettings = fb.value
    return await  this.setSetting(transactionUISettings)
  }

  //save setting returns promise
  private async setSetting(transactionUISettings: TransactionUISettings): Promise<ISetting> {
    const site    = this.siteService.getAssignedSite();
    const setting = {} as ISetting;
    setting.id    = transactionUISettings.id
    setting.name  = "UITransactionSetting"
    // console.log('transactionUISettings', transactionUISettings)
    setting.text  = JSON.stringify(transactionUISettings);
    this.updateUISubscription(transactionUISettings)
    return await this.settingsService.putSetting(site, setting.id, setting).toPromise()
  }

  initForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id             : [],
      displayNotes   : [],
      displayView    : [],
      displayAdd     : [],
      displayQuantity: []
     })
    return fb
  }

  async setFormValue(inputForm: FormGroup, setting: ISetting, text: any): Promise<FormGroup> {
    inputForm = this.initForm(inputForm);
    if (!text) {
      setting = await this.initConfig(setting)
    }
    const config = JSON.parse(text) as TransactionUISettings
    config.id = setting.id;
    inputForm = this.setFormValues(config, inputForm);
    return inputForm
  }


  setFormValues(config: TransactionUISettings, fb: FormGroup): FormGroup {
    // console.log(config, fb)
    fb = this._fb.group({
      id             : [config.id],
      displayNotes   : [config.displayNotes],
      displayView    : [config.displayView],
      displayAdd     : [config.displayAdd],
      displayQuantity: [config.displayQuantity]
     })
    return fb
  }

  async initConfig(setting: ISetting): Promise<ISetting> {
    const ui = {} as TransactionUISettings
    ui.id = setting.id
    setting = await this.setSetting(ui)
    const config = JSON.parse(setting.text) as TransactionUISettings
    this.updateUISubscription(config)
    return setting
  }

}
