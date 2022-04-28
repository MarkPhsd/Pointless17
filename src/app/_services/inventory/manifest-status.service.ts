import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable } from 'rxjs';
import { ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';

export interface ManifestStatus {
  id: number;
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManifestStatusService {

  site: ISite;

  constructor(
      private http: HttpClient,
      private auth: AuthenticationService,
      private siteService: SitesService)
    {
    }

  listAll(): Observable<ManifestStatus[]> {

      const site = this.siteService.getAssignedSite()

      const controller =  `/ManifestStatus/`

      const endPoint = `GetManifestStatus`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.get<ManifestStatus[]>(url)

  }

  get( id: number): Observable<ManifestStatus> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestStatus/`

    const endPoint = `GetManifestStatus`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ManifestStatus>(url)

  }

  add( iInventoryLocation: ManifestStatus ) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestStatus/`

    const endPoint = `PostManifestStatus`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ManifestStatus>(url, iInventoryLocation)

  }

  update(id: number, iInventoryLocation: ManifestStatus) {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestStatus/`

    const endPoint = `PutManifestStatus`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<ManifestStatus>(url, iInventoryLocation)

  }

  delete(id: number): Observable<ManifestStatus> {

    const site = this.siteService.getAssignedSite()

    const controller =  `/ManifestStatus/`

    const endPoint = `DeleteManifestStatus`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<ManifestStatus>(url)

  }



}
