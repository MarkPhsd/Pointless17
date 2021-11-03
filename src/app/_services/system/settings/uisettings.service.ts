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
  public transactionUISettings$        = this._transactionUISettings.asObservable();

  updateUISubscription(ui: TransactionUISettings) {
    this._transactionUISettings.next(ui);
  }

  constructor(
      private _fb            : FormBuilder,
      private siteService    : SitesService,
      private settingsService: SettingsService) {

    const site = this.siteService.getAssignedSite();
    this.settingsService.getSettingByNameCached(site, 'UITransactionSetting').subscribe(data => {
      const ui = {} as TransactionUISettings
      if (data.text) {
        const ui = JSON.parse(data.text)
        this.updateUISubscription(ui)
        return
      }
      this.updateUISubscription(ui)
    })

  }

  getTransactionUISettings(cached: boolean): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    if (cached)  {  return  this.settingsService.getSettingByNameCached(site, 'UITransactionSetting') }
    if (!cached) { return this.settingsService.getSettingByName(site, 'UITransactionSetting')}
  }

  async  saveTransactionUIConfig(fb: FormGroup): Promise<ISetting>  {
    const transactionUISettings = fb.value
    return await  this.setTransactionUISetting(transactionUISettings )
  }

  //save setting returns promise
  private async setTransactionUISetting(transactionUISettings: TransactionUISettings): Promise<ISetting> {

    const site    = this.siteService.getAssignedSite();

    const setting = {} as ISetting;
    setting.id    = transactionUISettings.id
    setting.name  = "UITransactionSetting"
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

  setFormValue(inputForm: FormGroup, setting: ISetting, text: any): FormGroup {
    inputForm = this.initForm(inputForm);
    const config = JSON.parse(text) as TransactionUISettings
    config.id = setting.id;
    console.log('setFormValue', config)
    inputForm = this.setFormValues(config, inputForm);
    return inputForm
  }


  setFormValues(config: TransactionUISettings, fb: FormGroup): FormGroup {
    console.log(config, fb)
    fb = this._fb.group({
      id             : [config.id],
      displayNotes   : [config.displayNotes],
      displayView    : [config.displayView],
      displayAdd     : [config.displayAdd],
      displayQuantity: [config.displayQuantity]
     })
    return fb
  }

}


// const controller = "/settings/"

// const endPoint = 'gets';

// const uri = `${site.url}${controller}${endPoint}${parameters}`

// if (appCache) {
//   if (appCache.value) {
//     const url = { url: uri, cacheMins: 0}
//     return  this.httpCache.get<TransactionUISettings>(url)
//   }
// }

// return this.http.get<TransactionUISettings>(uri);
