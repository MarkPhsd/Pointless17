import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable } from 'rxjs';
import { ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ManifestType } from './manifest-types.service';

@Injectable({
  providedIn: 'root'
})
export class ManifestMethodsService {

  site: ISite;

  constructor(
      private http: HttpClient,
      private auth: AuthenticationService,
      private siteService: SitesService)
    {
    }

  listAll(): Observable<ManifestType[]> {

      const site = this.siteService.getAssignedSite()

      const controller =  `/ManifestTypes/`

      const endPoint = `GetManifestTypess`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.get<ManifestType[]>(url)

  }

  getManifestTypes( id: number): Observable<ManifestType> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestTypes/`

    const endPoint = `GetManifestTypes`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ManifestType>(url)

  }

  addManifestTypes( iInventoryLocation: ManifestType ) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestTypes/`

    const endPoint = `PostManifestTypes`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ManifestType>(url, iInventoryLocation)

  }

  updateManifestTypes(id: number, iInventoryLocation: ManifestType) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestTypes/`

    const endPoint = `PutManifestTypes`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<ManifestType>(url, iInventoryLocation)

  }

  deleteManifestTypes(id: number): Observable<ManifestType> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestTypes/`

    const endPoint = `DeleteManifestTypes`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<ManifestType>(url)

  }



}
