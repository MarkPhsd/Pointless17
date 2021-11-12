import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, } from 'rxjs';
import { ISetting, ISite, IUser }   from 'src/app/_interfaces';
import { environment } from 'src/environments/environment';
import { InterceptorSkipHeader } from 'src/app/_http-interceptors/basic-auth.interceptor';
import { SettingsService } from '../system/settings.service';
import { AppInitService } from '../system/app-init.service';

@Injectable({
  providedIn: 'root'
})
export class SitesService {

  sites: ISite[];
  site: ISite;
  apiUrl: any;

  constructor( private http: HttpClient,
               private auth: AuthenticationService,
               private appInitService  : AppInitService,
               ) {
      this.apiUrl   = this.appInitService.apiBaseUrl()
     }

  getSites():  Observable<ISite[]> {

    const endPoint = `/CCSSites/getsites`

    const url = `${this.apiUrl}${endPoint}`

    return this.http.get<ISite[]>(url)

  }

  getSite(id: number):  Observable<ISite> {

    const endPoint = `/CCSSites/`

    const params = `getSite?id=${id}`

    const url = `${this.apiUrl}${endPoint}${params}`

    return this.http.get<ISite>(url)

  }

  updateSite(id: number, site: ISite):  Observable<ISite> {

    if ( site.id === undefined  ) {  site.id= 0 }

    const endPoint = `/CCSSites/`

    const params = `putSite?id=${id}`

    const url = `${this.apiUrl}${endPoint}${params}`

    return this.http.put<ISite>(url, site)

  }

  addSite(site: ISite): Observable<ISite> {

    const endPoint = `/CCSSites/`

    const params = `postSite`

    const url = `${this.apiUrl}${endPoint}${params}`

    return this.http.post<ISite>(url, site)

  }

  async deleteSite(id: number): Promise<Observable<any>> {

    const endPoint = `/CCSSites/`

    const params = `deleteSite?id=${id}`

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
    let site = {} as ISite
    const url = localStorage.getItem("site.url")

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
      localStorage.setItem("site.phone", site.phone)
    }
  }

  clearAssignedSite(){

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

  }

  getCurrentCache(): number {

    try {
      const appCache = JSON.parse(localStorage.getItem('appCache'));
      return  appCache

    } catch (error) {
      // console.log(error)
    }

    return 0

  }

  getCacheURI(url: string) {

    const  cache = this.getCurrentCache();

    if (cache == null) {  return  { url: url, cacheMins: 0 }   }

    // console.log('getCacheURI', `${url} url cacheMins: ${cache}`)/

    return { url: url, cacheMins: cache }

  }

  setAssignedSiteByID(id: any): Observable<ISite> {
    return this.getSite(id)
  }


}
