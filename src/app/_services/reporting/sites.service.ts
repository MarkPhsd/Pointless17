import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, Observable, of, switchMap, } from 'rxjs';
import { ISetting, ISite, IUser }   from 'src/app/_interfaces';
import { InterceptorSkipHeader } from 'src/app/_http-interceptors/basic-auth.interceptor';
import { AppInitService, IAppConfig } from '../system/app-init.service';
import { PlatformService } from '../system/platform.service';
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarVerticalPosition as MatSnackBarVerticalPosition } from '@angular/material/legacy-snack-bar';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TtsService } from '../system/tts-service.service';
@Injectable({
  providedIn: 'root'
})
export class SitesService {

  initialzedVoice: boolean;
  public  ipAddressCurrent : any;
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  sites: ISite[];
  site: ISite;
  apiUrl: any;

  public _user     = new BehaviorSubject<IUser>(null);
  public  user$    = this._user.asObservable();

  private _sites   = new BehaviorSubject<ISite[]>(null);
  public  sites$   = this._sites.asObservable();

  private _site    = new BehaviorSubject<ISite>(null);
  public  site$    = this._site.asObservable();

  smallDevice: boolean;
  phoneDevice: boolean;

  updateSitesSubscriber(site: ISite[]) {
    this._sites.next(site)
  }

  updateSiteSubscriber(site: ISite) {
    this._site.next(site)
  }

  get isAndroid() {
    return this.platformSevice.androidApp
  }

  get isApp() {
    if (this.platformSevice.androidApp) {
      return true
    }
    if (this.platformSevice.isAppElectron) {
      return true
    }
    return false
  }

  get isDev() {
    const site = this.getAssignedSite();
    if (site.url === 'https://localhost:44309/api') {
      return true;
    }
    return false;
  }

  constructor( private http            : HttpClient,
               private appInitService  : AppInitService,
               private platformSevice  : PlatformService,
               private httpClient      : HttpClient,
               private httpCache       : HttpClientCacheService,
               public  deviceService   : DeviceDetectorService,
               private ttsService      : TtsService ,
               private zone            : NgZone,
               private snackBar        : MatSnackBar,

    ) {
    this.apiUrl   = this.appInitService.apiBaseUrl();

  }

  getVoices() {
    return this.ttsService.getVoices()
  }

  getIpAddress(token: string): Observable<any> {

    console.log('token', token, this.ipAddressCurrent)
    if (this.ipAddressCurrent) {
      return of(this.ipAddressCurrent)
    }
    if (!token) { return of(null) }
    // const ipApiUrl = 'https://geolocation-db.com/json/'
    const ipApiUrl = `https://ipinfo.io/json?token=${token}`

    return this.http.get(ipApiUrl).pipe(switchMap(data => {
      const value = data as any;

      if (!data) {
        this.ipAddressCurrent = {id: 'uknown'}
        return of(this.ipAddressCurrent)
      }

      this.ipAddressCurrent = value
      return of(value)
    }))
  }


  checkDeviceFontScaling(): string {
    const devicePixelRatio = window.devicePixelRatio || 1;
    if (devicePixelRatio > 2) {
      return 'large text settings enabled';
    } else if (devicePixelRatio < 2) {
      return 'normal or small text settings';
    } else {
      return 'uses default text settings';
    }
  }

  getApplicationInfo(userName: string, ignoreAppCheck?: boolean) {
    try {
      const message = this.getApplicationObject(userName)
      const stringMessage = JSON.stringify(message)
      return stringMessage
    } catch (error) {
      console.log('error getapplication info', error)
    }

  }

  getApplicationObject(userName: string) {
    try {
      let location : any
      if (this.ipAddressCurrent) {
        location = this.ipAddressCurrent
      }
      const item   = this.deviceService.getDeviceInfo();
      const height = window.innerHeight;
      const width  = window.innerWidth;
      const scaling = this.checkDeviceFontScaling()
      const message = { userName: userName, location: location, width: width,  height: height,  scaling: scaling, info: item };
      return message
    } catch (error) {
      console.log('getapplicationobject error', error)
      return {}
    }

  }

  toCamelCase(str) {
    return str.replace(/_./g, s => s.charAt(1).toUpperCase()).replace(/^./, s => s.toLowerCase());
  }

  convertToCamel(obj: any) {
    if (Array.isArray(obj)) {
        return obj.map(this.convertToCamel);
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelCaseKey = this.toCamelCase(key);
            result[camelCaseKey] = this.convertToCamel(obj[key]);
            return result;
        }, {});
    }
    return obj;
  }

  get debugMode() {
    let appCache =  JSON.parse(localStorage.getItem('appCache')) as unknown as ISetting;
    if (appCache.webEnabled) {
      return true
    }
  }

  getDemoMode() :  Observable<string> {
    const site = this.getAssignedSite()

    const controller = '/system/'

    const endPoint = `getDemoMode`

    const parameters = ``

    const licenseNumber  = ``

    const url = `${site.url}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<any>(url);
  }

  getSitesCache() :  Observable<ISite[]> {
    this.apiUrl   = this.appInitService.apiBaseUrl()
    const endPoint = `/CCSSites/getsites`
    if (!this.apiUrl) {   this.apiUrl = this.getAssignedSite().url   }
    const url = `${this.apiUrl}${endPoint}`
    return  this.getSitesList(url)
  }

  getHeaderSite() :  Observable<ISite> {
    const endPoint = `/CCSSites/getsites`
    if (!this.apiUrl) {   this.apiUrl = this.getAssignedSite().url   }
    const url = `${this.apiUrl}${endPoint}`

    const sites$ = this.getSitesListCache(url)

    return  sites$.pipe(switchMap(data => {

      const assSite = this.getAssignedSite()
      const sites  = data.filter(item => {
        if (assSite.url) {
          return item.url == assSite.url;
        }
        return item == this.apiUrl;
      })

      const site = sites[0] // = {} as ISite;
      // console.log(site)
      return of(site)
    }))
  }

  getSites() :  Observable<ISite[]> {
    this.apiUrl   = this.appInitService.apiBaseUrl()
    const endPoint = `/CCSSites/getsites`
    if (!this.apiUrl) {   this.apiUrl = this.getAssignedSite().url   }
    const url = `${this.apiUrl}${endPoint}`
    return  this.getSitesList(url)
  }

  getSitesList(url : string):  Observable<ISite[]> {
    return this.http.get<ISite[]>(url).pipe(switchMap(data => {
      this.updateLocalStorageWithSites(data)
      return of(data)
    }))
  }

  getSitesListCache(url : string):  Observable<ISite[]> {
     this.apiUrl   = this.appInitService.apiBaseUrl()
    const endPoint = `/CCSSites/getsites`
    const options = { url: url, cacheMins: 45}
    return this.httpCache.get<ISite[]>(options);
  }


  getSite(id: number):  Observable<ISite> {
    if (!id) { return of(this.getAssignedSite())}
    const endPoint = `/CCSSites/`
    const params = `getSite?id=${id}`
    if (!this.apiUrl) {
      this.apiUrl = this.getAssignedSite().url
    }
    const url = `${this.apiUrl}${endPoint}${params}`
    return this.http.get<ISite>(url)
  }

  updateSite(id: number, site: ISite):  Observable<ISite> {

    if ( site.id === undefined  ) {  site.id= 0 }
    const endPoint = `/CCSSites/`
    const params = `putSite?id=${id}`
    if (!this.apiUrl) {
      this.apiUrl = this.getAssignedSite().url
    }
    const url = `${this.apiUrl}${endPoint}${params}`
    return this.http.put<ISite>(url, site)
  }

  addSite(site: ISite): Observable<ISite> {
    const endPoint = `/CCSSites/`
    const params = `postSite`
    if (!this.apiUrl) {
      this.apiUrl = this.getAssignedSite().url
    }
    const url = `${this.apiUrl}${endPoint}${params}`
    return this.http.post<ISite>(url, site)

  }

  deleteSite(id: number): Observable<any> {
    const endPoint = `/CCSSites/`
    const params = `deleteSite?id=${id}`
    if (!this.apiUrl) {
      this.apiUrl = this.getAssignedSite()
    }
    const url = `${this.apiUrl}${endPoint}${params}`
    return  this.http.delete<any>(url)
  }

  getSatelliteHeaders() {
    const username = localStorage.getItem("username")
    const password = localStorage.getItem("password")
    // const user = {} as IUser
    // this.authentication.updateUserX(user);
    return new HttpHeaders().set(InterceptorSkipHeader, '');
  }

  private updateLocalStorageWithSites(newSites: ISite[]): void {
    const savedSites: ISite[] = JSON.parse(localStorage.getItem('SiteList') || '[]');

    // Map for quick ID-based access
    const savedSitesMap = new Map<number, ISite>(savedSites.map(site => [site.id, site]));

    // Update or add new items
    newSites.forEach(site => {
      const savedSite = savedSitesMap.get(site.id);
      if (savedSite) {
        // Keep the user from the saved site, update other properties
        Object.assign(savedSite, site, { user: savedSite.user });
      } else {
        // Add new site
        savedSitesMap.set(site.id, site);
      }
    });

    // Filter out items that no longer exist
    const updatedSites = Array.from(savedSitesMap.values()).filter(savedSite =>
      newSites.some(site => site.id === savedSite.id)
    );

    localStorage.setItem('SiteList', JSON.stringify(updatedSites));
  }

   getAssignedSite(): ISite {
    try {
      let site = {} as ISite
      const url = localStorage.getItem("site.url")
      // console.log('url logging into', url)
      if (!url || url == undefined) {
        this.setDefaultSite();
      }

      if (url) {
        site.metrcURL           = localStorage.getItem('site.metrcURL')
        site.metrcLicenseNumber = localStorage.getItem('site.metrcLicenseNumber')
        site.url                = url
        site.name               = localStorage.getItem("site.name")
        site.id                 = parseInt(localStorage.getItem("site.id"))
      } else {
        site.url                = this.apiUrl
        site.name               = "local"
        site.id                 = 0
        site.metrcURL           = ''
        site.metrcLicenseNumber = ''
        site.id                 = parseInt(localStorage.getItem("site.id"))
      }
      return site
    } catch (error) {
      console.log('get assigned site error: ' + error)
      return {} as ISite;
    }

    return null;
  }

  setDefaultSite(): Observable<ISite> {
    let site = {} as ISite
    this.clearAssignedSite();

    //if is app and is installed, then it's going to be stored in
    if ( !this.platformSevice.isApp()) {
      return this.httpClient.get('./assets/app-config.json').pipe(
        switchMap(value => {
          const data = value as IAppConfig
          site.url    = data?.apiUrl
          localStorage.setItem("site.url"    ,  site.url)
          localStorage.setItem("storedApiUrl",  site.url)
          localStorage.setItem("site.name",     site.name)

          return of(site);
        }))
    }

    if ( this.platformSevice.isApp() ) {
      site.url   = localStorage.getItem('storedApiUrl')
      this.snackBar.open('Set Default Site site.url ' + site.url, 'Success', {duration: 3000})
      localStorage.setItem("site.url", site.url)
      return of(site)
     }
  }

  setAssignedSite(site: ISite){
    if (site) {
      localStorage.setItem("site.url", site.url)
      localStorage.setItem("site.name", site.name)
      localStorage.setItem("site.id", site.id.toString())
      localStorage.setItem("site.metrcURL", site.metrcURL)
      localStorage.setItem("site.name", site.name)
      localStorage.setItem("site.address", site.address)
      localStorage.setItem("site.city", site.city)
      localStorage.setItem("site.state", site.state)
      localStorage.setItem("site.zip", site.zip)
      localStorage.setItem("site.phone", site.phone);
      this.updateSiteSubscriber(site)
    }
  }

 clearAssignedSite(){
    if (!this.platformSevice.isApp) {
      localStorage.removeItem('storedApiUrl') //, site.url)
    }
    localStorage.removeItem("site.url") //, site.url)
    localStorage.removeItem("site.name") //, site.name)
    localStorage.removeItem("site.id") //, site.id.toString())
    localStorage.removeItem("site.metrcURL") //, site.metrcURL)
    localStorage.removeItem("site.name") //, site.name)
    localStorage.removeItem("site.address") //, site.address)
    localStorage.removeItem("site.city")//, site.phone) site.city)
    localStorage.removeItem("site.state")//, site.phone), site.state)
    localStorage.removeItem("site.zip") //, site.phone), site.zip)
    localStorage.removeItem("site.phone") //, site.phone)
    this.clearBucket();
  }
  clearBucket() {
    localStorage.removeItem('awsbucket')
  }

  //matching code in app-init-service.
  getLocalApiUrl() {
    const result = localStorage.getItem('storedApiUrl')
    const site = {} as ISite;
    site.url = result
    if (result != null && result != '' ) {
      return result;
    }

    if (this.platformSevice.isApp() ) {
      localStorage.setItem('storedApiUrl', 'https://pointlessposdemo.com/api')
      return localStorage.getItem('storedApiUrl')
    }
  }

  getCurrentCache(): number {

    if (this.userValue) {
      if (this?.userValue?.roles === 'user' || this?.userValue?.roles === '') {
        return 10
      }
    }
    if (!this.userValue) {
      return 10
    }

    try {
      const appCache = JSON.parse(localStorage.getItem('appCache')) as ISetting;
      appCache.value
      if (!appCache || +appCache?.value == 0) {
        if (this?.userValue?.roles  === 'user')  {
          return 10
        }
      }

      return   +appCache.value

    } catch (error) {

    }

    return 0

  }

  getCacheURI(url: string) {

    const  cache = this.getCurrentCache();

    if (cache == null) {  return  { url: url, cacheMins: 0 }   }
    if (cache == 0)    {  return  { url: url, cacheMins: 0 }   }

    return { url: url, cacheMins: cache }

  }

  get userValue(): IUser {
    if (!this._user.value) {
      const item = localStorage.getItem('user');
      if (item) {
        const nextUser =  JSON.parse(item)
        this._user.next(nextUser)
        return nextUser
      }
      if (!item) {
        return null
      }
    }
    return this._user.value;
  }

  setAssignedSiteByID(id: any): Observable<ISite> {
    return this.getSite(id)
  }

  notify(message: string, title: string, time: number, color?: string, vPOS?: string, speak?: string){
    if (color) {
      if (color === 'red') { color = 'mat-warn'}
      if (color === 'yellow') { color = 'mat-accent'}
      if (color === 'green') { color = 'mat-primary'}
      if (color === 'accent') { color = 'mat-accent'}
      if (color === 'warn') { color = 'mat-warn'}
      if (color === 'primary') { color = 'mat-primary'}
    }
    if (!color) { color = 'mat-primary'}
    if (!vPOS) { vPOS = 'bottom'}

    this.verticalPosition = vPOS as MatSnackBarVerticalPosition ;

    if (!time) {
      time = 10000
    }
    this.snackBar.open(
      message,
      title, {
        verticalPosition: this.verticalPosition,
        duration: time,
        panelClass: ['mat-toolbar', color]
      }
    );
    this.speak(speak)
  }

  speak(speak) {
    this.zone.run(() => {
      //   if (speak) {
      //     this.ttsService.addTextToQueue(speak)
      //   }
      // Ensure TTS is triggered even if called within a complex chain
      if (speak && speak.trim()) {
        console.log('Speaking:', speak);
        setTimeout(() => {
          let text = ''
          if (!this.initialzedVoice) {
             text = 'p ....'
             this.initialzedVoice= true;
          }
          this.ttsService.addTextToQueue(`{} ${speak}`); // Defer TTS call slightly
        }, 10); // Adjust the delay as needed
      }
    });

  }

  notifyObs(message: string, title: string, time: number, color?: string, vPOS?: string) : Observable<any> {
    this.notify(message,title, time, color, vPOS)
    return of(null)
  }

  addTextToQueue(message: string, voice: string) {
    this.ttsService.addTextToQueue(message, voice)
  }

  convertToArray(value: string | string[]): string[] {
    if (Array.isArray(value)) {
      // Check if the first element is a comma-separated string
      if (value.length === 1 && value[0].includes(',')) {
        return value[0].split(',').map(tag => tag.trim());
      }
      return value;
    } else if (typeof value === 'string') {
      // Handle single string input (edge case)
      return value.split(',').map(tag => tag.trim());
    }
    // Fallback: return an empty array if the input is invalid
    return [];
  }

}
