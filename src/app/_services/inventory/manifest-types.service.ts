import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable } from 'rxjs';
import { ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';

export interface ManifestType {
  id: number;
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManifestTypesService {


  site: ISite;


  constructor(
      private http: HttpClient,
      private auth: AuthenticationService,
      private siteService: SitesService)
    {
    }

  listAll(): Observable<ManifestType[]> {

      const site = this.siteService.getAssignedSite()

      const controller =  `/ManifestType/`

      const endPoint = `GetManifestTypes`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.get<ManifestType[]>(url)

  }

  get( id: number): Observable<ManifestType> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestType/`

    const endPoint = `GetManifestType`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ManifestType>(url)

  }

  add( iInventoryLocation: ManifestType ) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestType/`

    const endPoint = `PostManifestType`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ManifestType>(url, iInventoryLocation)

  }

  update(id: number, iInventoryLocation: ManifestType) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestType/`

    const endPoint = `PutManifestType`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<ManifestType>(url, iInventoryLocation)

  }

  delete(id: number): Observable<ManifestType> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestType/`

    const endPoint = `DeleteManifestType`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<ManifestType>(url)

  }



}
