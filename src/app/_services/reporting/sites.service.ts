import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, Observable, } from 'rxjs';
import { ISite, IUser }   from 'src/app/_interfaces';

import { InterceptorSkipHeader } from 'src/app/_http-interceptors/basic-auth.interceptor';

import { AppInitService, IAppConfig } from '../system/app-init.service';
import { PlatformService } from '../system/platform.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SitesService {

  sites: ISite[];
  site: ISite;
  apiUrl: any;

  private _sites    = new BehaviorSubject<ISite[]>(null);
  public  sites$    = this._sites.asObservable();

  private _site    = new BehaviorSubject<ISite>(null);
  public  site$    = this._site.asObservable();

  updateSitesSubscriber(site: ISite[]) {
    this._sites.next(site)
  }

  updateSiteSubscriber(site: ISite) {
    this._site.next(site)
  }

  constructor( private http            : HttpClient,
               private auth            : AuthenticationService,
                
               private appInitService  : AppInitService,
               private platformSevice  : PlatformService,
               private httpClient      : HttpClient,
               private snackBar        : MatSnackBar,

    ) {
      
    this.apiUrl   = this.appInitService.apiBaseUrl()

  }

  getSites():  Observable<ISite[]> {
    this.apiUrl   = this.appInitService.apiBaseUrl()
    console.log('apiUrl', this.apiUrl)
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
    this.auth.updateUserX(user);
    return new HttpHeaders().set(InterceptorSkipHeader, '');
  }

   getAssignedSite(): ISite {

    try {
      let site = {} as ISite
      const url = localStorage.getItem("site.url")

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
      console.log(error)
      return null;
    }
    return null;

  }

 async setDefaultSite(): Promise<ISite> {
    let site = {} as ISite
    this.clearAssignedSite();

    //if is app and is installed, then it's going to be stored in
    if (!this.platformSevice.isApp()) {
      const data  = await this.httpClient.get('./assets/app-config.json').pipe().toPromise() as IAppConfig
      site.url    = data.apiUrl
      localStorage.setItem("site.url"    ,  site.url)
      localStorage.setItem("storedApiUrl",  site.url)
      localStorage.setItem("site.name",  site.name)
      return site;
    }

    if ( this.platformSevice.isApp() ) {
      site.url   = localStorage.getItem('storedApiUrl')
      this.snackBar.open('Set Default Site site.url ' + site.url, 'Success', {duration: 3000})
      localStorage.setItem("site.url", site.url)
      // this.snackBar.open(site.url, 'Default Site', {duration: 3000})
      return site
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

 async clearAssignedSite(){
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
    localStorage.removeItem('awsbucket')
  }

  //matching code in app-init-service.
  getLocalApiUrl() {
    const result = localStorage.getItem('storedApiUrl')
    // console.log('getLocalAPIURL', result)
    const site = {} as ISite;
    site.url = result
    if (result != null && result != '' ) {
      return result;
    }

    if (this.platformSevice.isApp() ) {
      localStorage.setItem('storedApiUrl', 'https://ccsposdemo.ddns.net/api')
      return localStorage.getItem('storedApiUrl')
    }
  }

  getCurrentCache(): number {

    if (this.auth.userValue) { 
      if (this.auth.userValue.roles === 'user' || this.auth.userValue.roles === '') { 
        return 10
      }
    }
    if (!this.auth.userValue) { 
      return 10
    }
  


    try {
      const appCache = JSON.parse(localStorage.getItem('appCache'));

      if (!appCache || appCache == 0) {
        if (this.auth.userValue.roles  === 'user')  { 
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

  setAssignedSiteByID(id: any): Observable<ISite> {
    return this.getSite(id)
  }

  notify(message: string, title: string, time: number){
    this.snackBar.open(message, title, {duration: time})
  }

}
