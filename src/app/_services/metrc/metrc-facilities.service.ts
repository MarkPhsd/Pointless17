import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

export interface IItemFacilitiyBasic {
  displayName:  string;
  id:           number;
  metrcLicense: string;
}

import {
  METRCFacilities
} from '../../_interfaces/metrcs/facilities';

@Injectable({
  providedIn: 'root'
})
export class MetrcFacilitiesService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {}

  getFacilities(site: ISite): Observable<METRCFacilities[]> {

    const controller = '/MetrcFacilities/'

    const endPoint = `GetMetrcFacilities`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<METRCFacilities[]>(url);

  }

  getFacility(id: any, site: ISite): Observable<METRCFacilities> {

    const controller = '/MetrcFacilities/'

    const endPoint = `getMetrcFacility`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<METRCFacilities>(url);

  }

  importFacilities(site: ISite): Observable<METRCFacilities[]> {

    const controller = '/MetrcFacilities/'

    const parameters = `GetImportFacilities?id=${site.id}`

    const url = `${site.url}${controller}${parameters}`

    // console.log('url', url)
    return this.http.get<METRCFacilities[]>(url);

  }

  getItemsNameBySearch(site: ISite, name: string): Observable<IItemFacilitiyBasic[]> {

    const controller =  "/MetrcFacilities/"

    const endPoint = "GetItemNamesList"

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // console.log("search model ", name)

    return this.http.get<IItemFacilitiyBasic[]>(url)

  }

}
