import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable } from 'rxjs';
import { ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';

export interface IInventoryLocation {
  id: number;
  name: string;
  activeLocation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryLocationsService {

  site: ISite;


  constructor(
      private http: HttpClient,
      private auth: AuthenticationService,
      private siteService: SitesService)
    {
    }


  getLocations(): Observable<IInventoryLocation[]> {

      const site = this.siteService.getAssignedSite()

      const controller =  `/inventoryLocations/`

      const endPoint = `GetInventoryLocations`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.get<IInventoryLocation[]>(url)

  }

  getLocation( id: number): Observable<IInventoryLocation> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/inventoryLocations/`

    const endPoint = `GetInventoryLocation`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IInventoryLocation>(url)

  }

  addLocation( iInventoryLocation: IInventoryLocation ) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/inventoryLocations/`

    const endPoint = `PostInventoryLocation`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IInventoryLocation>(url, iInventoryLocation)

  }

  updateLocation(id: number, iInventoryLocation: IInventoryLocation) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/inventoryLocations/`

    const endPoint = `PutInventoryLocation`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IInventoryLocation>(url, iInventoryLocation)

  }

  deleteLocation(id: number): Observable<IInventoryLocation> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/inventoryLocations/`

    const endPoint = `DeleteInventoryLocation`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<IInventoryLocation>(url)

  }



}
