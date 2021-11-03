import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable } from 'rxjs';
import { ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';

export interface IPrinterLocation {
  id: number;
  name: string;
  activeLocation: boolean;
  printer: string;
}

@Injectable({
  providedIn: 'root'
})

export class PrinterLocationsService {

  site: ISite;


  constructor(
      private http: HttpClient,
      private auth: AuthenticationService,
      private siteService: SitesService)
    {
    }


  getLocations(): Observable<IPrinterLocation[]> {

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
