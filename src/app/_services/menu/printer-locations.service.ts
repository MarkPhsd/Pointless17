import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable, of } from 'rxjs';
import { ISetting, ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { UserAuthorizationService } from '../system/user-authorization.service';

export interface IPrinterLocation {
  id: number;
  name: string;
  activeLocation: boolean;
  printer: string;
  templateID: number;
  address: string;
}

export interface IPrinterLocationRO {
  id: number;
  name: string;
  activeLocation: boolean;
  printer: string;
  templateID: number;
  address: string;
  templateName: string;
}

@Injectable({
  providedIn: 'root'
})

export class PrinterLocationsService {

  site: ISite;

  constructor(
      private http: HttpClient,
      private httpCache: HttpClientCacheService,
      private auth: AuthenticationService,
      private userAuthorizationService: UserAuthorizationService,
      private siteService: SitesService)
    {
    }


  getLocationsCached(): Observable<IPrinterLocation[]> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/PrinterLocations/`

    const endPoint = `GetLocations`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri = { url: url, cacheMins: 120}

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as ISetting
    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const url = { url: uri, cacheMins: appCache.value}
        return  this.httpCache.get<IPrinterLocation[]>(uri)
      }
    }

    return  this.http.get<IPrinterLocation[]>(url)

}

  getLocations(): Observable<IPrinterLocation[]> {
      if (!this.userAuthorizationService?.user) { 
        return of(null)
      }
    
      const site = this.siteService.getAssignedSite()

      const controller =  `/PrinterLocations/`

      const endPoint = `GetLocations`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.get<IPrinterLocation[]>(url)

  }

  getLocation( id: number): Observable<IPrinterLocation> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/PrinterLocations/`

    const endPoint = `GetLocation`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IPrinterLocation>(url)

  }

  addLocation( printerLocation: IPrinterLocation ) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/PrinterLocations/`

    const endPoint = `PostLocation`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPrinterLocation>(url, printerLocation)

  }

  updateLocation(id: number, printerLocation: IPrinterLocation) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/PrinterLocations/`

    const endPoint = `PutLocation`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IPrinterLocation>(url, printerLocation)

  }

  deleteLocation(id: number): Observable<IPrinterLocation> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/printerlocations/`

    const endPoint = `DeleteLocation`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<IPrinterLocation>(url)

  }



}
