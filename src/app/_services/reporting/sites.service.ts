import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, Observable, of, switchMap, } from 'rxjs';
import { ISetting, ISite, IUser }   from 'src/app/_interfaces';
import { InterceptorSkipHeader } from 'src/app/_http-interceptors/basic-auth.interceptor';
import { AppInitService, IAppConfig } from '../system/app-init.service';
import { PlatformService } from '../system/platform.service';
import { MatSnackBar, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SitesService {


  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  sites: ISite[];
  site: ISite;
  apiUrl: any;

  public _user               = new BehaviorSubject<IUser>(null);
  public  user$               = this._user.asObservable();

  private _sites    = new BehaviorSubject<ISite[]>(null);
  public  sites$    = this._sites.asObservable();

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

  constructor( private http            : HttpClient,
               private authentication  : AuthenticationService,
               private appInitService  : AppInitService,
               private platformSevice  : PlatformService,
               private httpClient      : HttpClient,
               private snackBar        : MatSnackBar,

    ) {

    this.apiUrl   = this.appInitService.apiBaseUrl()

  }

  get debugMode() {
    // if (this.platformSevice.i)
    let appCache =  JSON.parse(localStorage.getItem('appCache')) as unknown as ISetting;
    if (appCache.webEnabled) {
      return true
    }
  }

  getSites():  Observable<ISite[]> {
    this.apiUrl   = this.appInitService.apiBaseUrl()
    const endPoint = `/CCSSites/getsites`

    if (!this.apiUrl) {
      this.apiUrl = this.getAssignedSite().url
    }
    const url = `${this.apiUrl}${endPoint}`

    return this.http.get<ISite[]>(url)

  }

  getSite(id: number):  Observable<ISite> {

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
    const user = {} as IUser
    this.authentication.updateUserX(user);
    return new HttpHeaders().set(InterceptorSkipHeader, '');
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
      return null;
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
          localStorage.setItem("site.name",  site.name)
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

    // console.log('auth user authentication', this.userValue)

    if (this.userValue) {
      if (this?.userValue?.roles === 'user' || this?.userValue?.roles === '') {
        return 10
      }
    }
    if (!this.userValue) {
      return 10
    }

    try {
      const appCache = JSON.parse(localStorage.getItem('appCache'));

      if (!appCache || appCache == 0) {
        if (this?.userValue?.roles  === 'user')  {
          return 10
        }
      }

      return  appCache

    } catch (error) {
      // console.log(error)
    }

    return 0

  }

  getCacheURI(url: string) {

    const  cache = this.getCurrentCache();

    if (cache == null) {  return  { url: url, cacheMins: 0 }   }

    return { url: url, cacheMins: cache }

  }

  get userValue(): IUser {
    if (!this._user.value) {
      const item = localStorage.getItem('user');
      // console.log('get item', item)
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

  notify(message: string, title: string, time: number, color?: string, vPOS?: string){
    if (color) {
      if (color === 'red') { color = 'mat-warn'}
      if (color === 'yellow') { color = 'mat-accent'}
      if (color === 'green') { color = 'mat-primary'}
      if (color === 'accent') { color = 'mat-accent'}
      if (color === 'warn') { color = 'mat-warn'}
      if (color === 'primary') { color = 'mat-primary'}
    }
    if (!color) { color = 'mat-primary'}
    // console.log('color', color)
    if (!vPOS) { vPOS = 'bottom'}

    this.verticalPosition = vPOS as MatSnackBarVerticalPosition ;

    this.snackBar.open(
      message,
      title, {
        verticalPosition: this.verticalPosition,
        duration: time,
        panelClass: ['mat-toolbar', color]
      }
    );
  }

  notifyObs(message: string, title: string, time: number, color?: string, vPOS?: string) : Observable<any> {
    this.notify(message,title, time, color, vPOS)
    return of(null)
  }

}
