import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { BehaviorSubject, Observable, of, } from 'rxjs';
import { ISetting, ISite, IUser }   from 'src/app/_interfaces';
import { SitesService } from '../reporting/sites.service';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { AdjustmentReason } from './adjustment-reasons.service';
import { AppInitService } from './app-init.service';
import { IItemBasic } from '..';
import { DSIEMVSettings, StripeAPISettings, TransactionUISettings, UIHomePageSettings } from './settings/uisettings.service';
import { EmailModel } from '../twilio/send-grid.service';
import { UserAuthorizationService } from './user-authorization.service';

interface IIsOnline {
  result: string;
}

export interface ITerminalSettings {
  medicalRecSales : number;
  receiptPrinter  : string;
  labelPrinter    : string;
  labelPrinter2   : string;
  enabled         : boolean;
  name            : string;
  deviceName      : string;
  resetOrdersFilter   : boolean;
  cardPointeHSN       : string;
  sSISecureDevice     : string;
  btPrinter           : string;
  bluetoothDeviceName : string;
  electronZoom        : string;
  triposLaneID        : string;
  enableScale         : boolean;
  enableExitLabel     : boolean;
}

@Injectable({
  providedIn: 'root'
})

export class SettingsService {

  private _TerminalSettings     = new BehaviorSubject<ITerminalSettings>(null);
  public  terminalSettings$      = this._TerminalSettings.asObservable();
  terminalSettings : ITerminalSettings;

  get deviceName() {
    return localStorage.getItem('devicename');
  }

  apiUrl: any;

  updateTerminalSetting(data: ITerminalSettings) {
    this.terminalSettings = data;
    this._TerminalSettings.next(data);
  }

  constructor( private http: HttpClient,
               private httpCache: HttpClientCacheService,
               private siteService: SitesService,
               private appInitService  : AppInitService,
               private userAuthorizationService     : UserAuthorizationService,
               ) {
     this.apiUrl =  this.appInitService.apiBaseUrl()
  }

  getDeviceSettings(deviceName: string): Observable<ISetting> {
    const site = {} as ISite;
    site.url = this.apiUrl;
    return this.getSettingByName(site, deviceName);
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

  getSettingCached(site: ISite, id: number):  Observable<ISetting> {

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

    return this.getSettingsByDescription(site, 'receiptLayouts')

  }

  getPrepReceipts(site: ISite):  Observable<ISetting[]> {

    return this.getSettingsByDescription(site, 'prepreceipt')

  }

  getReceiptStyles(site: ISite):  Observable<ISetting[]> {

    return this.getSettingsByDescription(site, 'receiptStyles')

  }

  getPOSDeviceBYName(site: ISite, name: String):  Observable<ISetting> {

    if (!name) { return of(null)};

    const controller = "/settings/"

    const endPoint = 'getPOSDeviceBYName';

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ISetting>(url);

  }

  getSettingByName(site: ISite, name: String):  Observable<ISetting> {

    if (!name) { return }
    const user =  JSON.parse(localStorage.getItem('user')) as IUser
    if (!user || !user.roles ||  !user.username ) {
      return this.getSettingByNameNoRoles(site, name)
    }

    const controller = "/settings/"

    const endPoint = 'getSettingByName';

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ISetting>(url);

  }

  // getSettingByNameCached(site: ISite, name: String):  Observable<ISetting> {

  //   if (!name) { return }
  //   const user =  JSON.parse(localStorage.getItem('user')) as IUser
  //   if (!user || !user.roles ||  !user.username ) {
  //     return this.getSettingByNameNoRoles(site, name)
  //   }

  //   const controller = "/settings/"

  //   const endPoint = 'getSettingByName';

  //   const parameters = `?name=${name}`

  //   const url = `${site.url}${controller}${endPoint}${parameters}`

  //   const uri = { url: url, cacheMins: 120}

  //   return this.httpCache.get<ISetting>(uri);

  //   return this.http.get<ISetting>(url);

  // }

  getSettingByNameNoRoles(site: ISite, name: String):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'getSettingByNameNoRoles';

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: url, cacheMins: 0}
    return this.httpCache.get<ISetting>(options);

  }

  getDSIEMVSettings():  Observable<DSIEMVSettings> {

    if (!this.userAuthorizationService.user) {  of(null)  }

    //get device name
    const deviceName = this.deviceName

    if (!deviceName) {
      const dSIEMVSettings = {} as DSIEMVSettings;
      return of(dSIEMVSettings);
    }

    const site =  this.siteService.getAssignedSite()

    const controller = "/DSISettings/"

    const endPoint = 'getDSIEMVSettings';

    const parameters = `?deviceName=${deviceName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // const options = { url: url, cacheMins: 60};

    return this.http.get<DSIEMVSettings>(url);

  }

  getStripeAPISetting():  Observable<StripeAPISettings> {

    if (!this.userAuthorizationService.user) {  of(null)  }

    const site =  this.siteService.getAssignedSite();

    const controller = "/settings/"

    const endPoint = 'getStripeAPISetting';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: url, cacheMins: 60};

    return this.http.get<StripeAPISettings>(url);

  }

  getUIHomePageSettings():  Observable<UIHomePageSettings> {

    const site =  this.siteService.getAssignedSite();

    const controller = "/settings/"

    const endPoint = 'getUIHomePageSettings';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as any;
    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const uri = { url: url, cacheMins: appCache.value}
        return  this.httpCache.get<UIHomePageSettings>(uri)
      }
    }

    return this.http.get<UIHomePageSettings>(url);

  }

  getUIHomePageSettingsNoCache():  Observable<UIHomePageSettings> {

    const site =  this.siteService.getAssignedSite();

    const controller = "/settings/"

    const endPoint = 'getUIHomePageSettings';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // const options = { url: url, cacheMins: 60};

    return this.http.get<UIHomePageSettings>(url);

  }

  getEmailModel():  Observable<EmailModel> {

    const site =  this.siteService.getAssignedSite();

    const controller = "/settings/"

    const endPoint = 'getEmailModel';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: url, cacheMins: 60};

    return this.httpCache.get<EmailModel>(options);

  }

  getUITransactionSetting():  Observable<TransactionUISettings> {

    if (!this.userAuthorizationService.user) {  of(null)  }
    const user = this.userAuthorizationService.user;
    if (!user || !user.roles ) {return  of(null) };

    const site =  this.siteService.getAssignedSite();

    const controller = "/settings/"

    const endPoint = 'getUITransactionSetting';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: url, cacheMins: 60};

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as any;
    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const uri = { url: url, cacheMins: appCache.value}
        return  this.httpCache.get<TransactionUISettings>(uri)
      }
    }

    return this.http.get<TransactionUISettings>(url);

  }

  getSettingBySetting(site: ISite, setting: ISetting):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'getSettingBySetting';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<ISetting>(url, setting);

  }

  putSetting(site: ISite, id: number, setting : ISetting):  Observable<ISetting> {

    if (!id) { return null}

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

  saveSettingObservable(site: ISite, setting: ISetting): Observable<ISetting>  {
    if (setting.id  == 0 || setting.id == undefined)  {
      return  this.postSetting(site, setting)
    }
    if (setting.id) {
      return  this.putSetting(site, setting.id, setting)
    }
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
      return _setting
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
    setting.option11   =  await this.getDefaultReceiptCreditPaymentLayout()
    setting.option10   =  await this.getDefaultReceiptWICEBTPaymentLayout()
    setting.option8    =  await this.getDefaultReceiptsubFooterLayout()

    setting.description = 'ReceiptLayouts'
    return await this.setText(site, setting)
  }

  // setDefaultReceiptLayoutObservable(site: ISite): Promise<ISetting> {
  //   // let setting        =  {} as ISetting;
  //   // setting.name       =  'Receipt Default'
  //   // setting.text       =  await this.getDefaultReceiptItemLayout()
  //   // setting.option6    =  await this.getDefaultReceiptHeaderLayout()
  //   // setting.option5    =  await this.getDefaultReceiptFooterLayout()
  //   // setting.option7    =  await this.getDefaultReceiptPaymentLayout()
  //   // setting.option11   =  await this.getDefaultReceiptCreditPaymentLayout()
  //   // setting.option10   =  await this.getDefaultReceiptWICEBTPaymentLayout()
  //   // setting.option8    =  await this.getDefaultReceiptsubFooterLayout()

  //   // setting.description = 'ReceiptLayouts'
  //   // return await this.setText(site, setting)
  // }

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
  async getDefaultReceiptCreditPaymentLayout() {
    const oberservable$ = this.http.get('assets/htmlTemplates/receiptTemplateCreditPayments.html', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
  }
  async getDefaultReceiptWICEBTPaymentLayout() {
    const oberservable$ = this.http.get('assets/htmlTemplates/receiptTemplateWICEBTPayments.html', {responseType: 'text'});
    return await oberservable$.pipe().toPromise()
    // const source$ = interval(2000).pipe(take(10));
    // // const source$ = oberservable$.pipe(take(1));
    // const finalNumber = await lastValueFrom(source$);
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
    if (data) { return data }
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
    if (!cache || cache == null) {
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

    const controller = "/settings/"

    const endPoint = 'getSettingByName';

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as any;
    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const uri = { url: url, cacheMins: appCache.value}
        return  this.httpCache.get<ISetting>(uri)
      }
    }

    return this.http.get<ISetting>(url);

  }

  getSettingByNameCachedNoRoles(site: ISite, name: String):  Observable<ISetting> {

    const controller = "/settings/"

    const endPoint = 'GetSettingByNameNoRoles';

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as any;
    // console.log('get setting cached or not ', appCache)
    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const uri = { url: url, cacheMins: appCache.value}
        return  this.httpCache.get<ISetting>(uri)
      }
    }

    return this.http.get<ISetting>(url);

  }

}




