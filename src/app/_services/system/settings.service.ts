import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, } from 'rxjs';
import { ISetting, ISite, IUser }   from 'src/app/_interfaces';
import { SitesService } from '../reporting/sites.service';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { AdjustmentReason } from './adjustment-reasons.service';
import { AppInitService } from './app-init.service';
import { IItemBasic } from '..';

interface IIsOnline {
  result: string;
}

@Injectable({
  providedIn: 'root'
})

export class SettingsService {
  apiUrl: any;

  constructor( private http: HttpClient,
               private httpCache: HttpClientCacheService,
               private auth: AuthenticationService,
               private siteService: SitesService,
               private appInitService  : AppInitService,
               ) {
     this.apiUrl =  this.appInitService.apiBaseUrl()
  }

  isAPIOnline(): Observable<any> {

    const controller = "/values/"

    const endPoint = 'getIsOnline';

    const url = `${this.apiUrl}${controller}${endPoint}`

    return this.http.get<any>(url, { observe: 'response'}  )

  }

  getPOSNames(site: ISite):  Observable<ISetting[]> {

    const controller = '/settings/'

    const endPoint = 'getListOfPOSComputers'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ISetting[]>(url);

  }

  getSettingsByDescription(site: ISite, description: String):  Observable<ISetting[]> {

    const controller = "/settings/"

    const endPoint = 'GetSettingsByDescription';

    const parameters = `?description=${description}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ISetting[]>(url);

  }

  getSettingsByDescriptionBasic(site: ISite, description: String):  Observable<IItemBasic[]> {

    const controller = "/settings/"

    const endPoint = 'getSettingsByDescriptionBasic';

    const parameters = `?description=${description}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IItemBasic[]>(url);

  }

  //items, payments, order 1, 2, 3
  getVoidReasons(site: ISite, filter: number):  Observable<AdjustmentReason[]> {

    const controller = '/AdjustmentReasons/'

    const endPoint = 'getReasonsByFilter'

    const parameters = `?filter=${filter}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<AdjustmentReason[]>(url)

  }

  getSetting(site: ISite, id: number):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'getSetting';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ISetting>(url);

  }

  deleteSetting(site: ISite, id: number):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'deleteSetting';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<ISetting>(url);

  }


  deleteSettingByName(site: ISite, name: string) {
    const controller = "/settings/"

    const endPoint = 'deleteSettingByName';

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<ISetting>(url);
  }


  getLabels(site: ISite):  Observable<ISetting[]> {

    return this.getSettingsByDescription(site, 'labels')

  }

  getReceipts(site: ISite):  Observable<IItemBasic[]> {

    return this.getSettingsByDescriptionBasic(site, 'receiptLayouts')

  }

  getPrepReceipts(site: ISite):  Observable<ISetting[]> {

    return this.getSettingsByDescription(site, 'prepreceipt')

  }

  getReceiptStyles(site: ISite):  Observable<ISetting[]> {

    return this.getSettingsByDescription(site, 'receiptStyles')

  }

  getSettingByName(site: ISite, name: String):  Observable<ISetting> {

    const user =  JSON.parse(localStorage.getItem('user')) as IUser
    // console.log('user', user)
    if (!user || !user.roles ||  !user.username ) {
      return this.getSettingByNameNoRoles(site, name)
    }

    // console.log(`getSettingByName user name: ${name}`, user)

    const controller = "/settings/"

    const endPoint = 'getSettingByName';

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ISetting>(url);

  }


  getSettingByNameNoRoles(site: ISite, name: String):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'getSettingByNameNoRoles';

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ISetting>(url);

  }

  getSettingBySetting(site: ISite, setting: ISetting):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'getSettingBySetting';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<ISetting>(url, setting);

  }

  putSetting(site: ISite, id: number, setting : ISetting):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'putSetting';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<ISetting>(url, setting);

  }

  postSetting(site: ISite,  setting: ISetting):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'postSetting';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<ISetting>(url, setting);

  }

  getOrderAssociatedWithTablet(site: ISite):  Observable<ISetting[]> {
    const controller = "/settings/"
    const endPoint = 'getOrderAssociatedWithTablet'
    const parameters = ''
    const url = `${site.url}${controller}${endPoint}${parameters}`
    return  this.http.get<ISetting[]>(url);
  }

  async  saveSetting(site: ISite, setting: ISetting): Promise<ISetting>  {
    if (setting.id == undefined)  {
      return await this.postSetting(site,setting).pipe().toPromise()
    }
    if (setting.id) {
      return await this.putSetting(site, setting.id, setting).toPromise()
    }
  }

  //default values
  async setText(site: ISite, setting: ISetting): Promise<ISetting>  {
    let setting$ = this.getSettingBySetting(site, setting)
    let _setting = await setting$.pipe().toPromise()
    if (!_setting || _setting.id === 0) {
      _setting     = await this.saveSetting(site, _setting)
    }
    if (_setting) {
      setting.id = _setting.id
      return _setting// don't need to re-save if it exists.
    }
  }

  //this returns the setting and adds if if it wasn't int he datbase.
  // including a default value will assign if if the setting hasn't beeen created.
  async getSettingPromiseByName(site: ISite, name: string, defaultValue: number) {
    let setting        =  {} as ISetting;
    setting.name       =  name
    setting.value      =  defaultValue.toString();
    return await this.setText(site, setting)
  }

  async getSettingPromise(site: ISite, setting: ISetting) {
    return await this.setText(site, setting)
  }

  ////////////////
  async setDefaultZPLText(site: ISite): Promise<ISetting> {
    let setting         = {} as ISetting;
    setting.name        = 'ZPLTemplate'
    setting.text        = await this.getDefaultZPLText()
    setting.description = 'Labels'
    setting.option2     = '2'
    setting.option3     = '3'
    return await this.setText(site, setting)
  }

  async getDefaultZPLText() {
    const oberservable$ = this.http.get('assets/htmlTemplates/labelZPL.txt', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
  }
  ////////////////

  async getDefaultReceiptPrinter(site: ISite) : Promise<ISetting> {
    let setting        = {} as ISetting;
    setting.name       = 'Receipt Default'
    let setting$       = this.getSettingByName(site, setting.name)
    let _setting       = await setting$.pipe().toPromise()
    return _setting;
  }

  ////////////////
  async setDefaultReceiptLayout(site: ISite): Promise<ISetting> {
    let setting        =  {} as ISetting;
    setting.name       =  'Receipt Default'
    setting.text       =  await this.getDefaultReceiptItemLayout()
    setting.option6    =  await this.getDefaultReceiptHeaderLayout()
    setting.option5    =  await this.getDefaultReceiptFooterLayout()
    setting.option7    =  await this.getDefaultReceiptPaymentLayout()
    setting.option8    =  await this.getDefaultReceiptsubFooterLayout()
    setting.description = 'ReceiptLayouts'
    return await this.setText(site, setting)
  }

  async getDefaultReceiptItemLayout() {
    const oberservable$ = this.http.get('assets/htmlTemplates/receiptTemplateItems.html', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
  }
  async getDefaultReceiptHeaderLayout() {
    const oberservable$ = this.http.get('assets/htmlTemplates/receiptTemplateHeader.html', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
  }
  async getDefaultReceiptFooterLayout() {
    const oberservable$ = this.http.get('assets/htmlTemplates/receiptTemplateFooter.html', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
  }
  async getDefaultReceiptsubFooterLayout() {
    const oberservable$ = this.http.get('assets/htmlTemplates/receiptTemplatesubFooter.html', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
  }
  async getDefaultReceiptPaymentLayout() {
    const oberservable$ = this.http.get('assets/htmlTemplates/receiptTemplatePayments.html', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
  }
  ////////////////

  ////////////////
  async setDefaultReceiptStyles(site: ISite): Promise<ISetting> {
    let setting         = {} as ISetting;
    setting.name        = 'ReceiptStyles'
    setting.text        = await this.getDefaultReceiptStyles();
    setting.description = 'ReceiptStyles'
    return  await this.setText(site, setting)
  }

  async getDefaultReceiptStyles() {
    const oberservable$ = this.http.get('assets/htmlTemplates/receiptStyles.txt', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
  }
  ////////////////

  //////////////////
  async initCacheTime(site: ISite): Promise<ISetting> {
    const data = await this.getSettingByName(site,"CacheTime").pipe().toPromise()
    if (data) {return data }
    let setting = {} as ISetting;
    setting.name = "CacheTime"
    setting.value = '10000'
    setting.boolean = false
    return  await this.postSetting(site, setting).pipe().toPromise();
  }

  async initAppCache(): Promise<ISetting> {
    // var person = { "name": "billy", "age": 23};
    // localStorage.setItem('person', JSON.stringify(person)); //stringify object and store
    // var retrievedPerson = JSON.parse(localStorage.getItem('person'));
    let setting = {} as ISetting;
    let appCache = JSON.parse(localStorage.getItem('appCache'));
    if (appCache) {
       setting.value = appCache
       return await setting
      }

    try {
      const site = this.siteService.getAssignedSite();

      const data      = await this.getSettingByName(site,"CacheTime").pipe().toPromise()
      localStorage.setItem('appCache', JSON.stringify(data));
      if (data) {return await data }

      setting.name    = "CacheTime"
      setting.value   = '10000'
      setting.boolean = false

      const cache     =  await this.postSetting(site, setting).pipe().toPromise();
      localStorage.setItem('appCache', JSON.stringify(cache));

      return await cache

    } catch (error) {
      console.log(error)
    }
  }

  getCacheURI(url: string) {
    const  cache = this.getCurrentCache();
    if (cache == null) {
      return  { url: url, cacheMins: 0 }
    }
    return { url: url, cacheMins: parseInt(cache.value) }
  }

  getCurrentCache(): ISetting {
    try {
      const appCache = JSON.parse(localStorage.getItem('appCache'));
      // console.log('initAppCache', appCache)
      return appCache

    } catch (error) {
      console.log(error)
    }

  }

  getSettingByNameCached(site: ISite, name: String):  Observable<ISetting> {
    let appCache =  JSON.parse(localStorage.getItem('appCache'))

    const controller = "/settings/"

    const endPoint = 'getSettingByName';

    const parameters = `?name=${name}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    if (appCache) {
      if (appCache.value) {
        const url = { url: uri, cacheMins: 0}
        return  this.httpCache.get<ISetting>(url)
      }
    }

    return this.http.get<ISetting>(uri);

  }

  getSettingByNameCachedNoRoles(site: ISite, name: String):  Observable<ISetting> {
    let appCache =  JSON.parse(localStorage.getItem('appCache'))

    const controller = "/settings/"

    const endPoint = 'getSettingByNameCachedNoRoles';

    const parameters = `?name=${name}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    if (appCache) {
      if (appCache.value) {
        const url = { url: uri, cacheMins: 0}
        return  this.httpCache.get<ISetting>(url)
      }
    }

    return this.http.get<ISetting>(uri);

  }

  // async initSetting(){

  //   if (!this.settingName) {return};
  //   if (!this.settingFieldName) {return};

  //   const site = this.sitesService.getAssignedSite();
  //   this.setting = await this.settingService.getSettingByName(site, this.settingName).pipe().toPromise();

  //   if (this.setting) {
  //     this.settingValue = this.setting.boolean;
  //     this.inputForm  = this.fbSettingsService.initForm(this.inputForm)
  //     this.inputForm  = this.fbSettingsService.intitFormData(this.inputForm, this.setting)
  //   }


  // }

  // updateSetting() {
  //   if (this.setting && this.inputForm) {
  //     const site = this.sitesService.getAssignedSite();
  //     this.setting = this.inputForm.value;
  //     this.settingService.putSetting(site, this.setting.id, this.setting ).subscribe( data => {
  //       this.setting = data
  //       if (this.cacheSettingLocal) {
  //         localStorage.setItem(this.settingName, JSON.stringify(data));
  //       }
  //     })
  //   }
  // }


}




