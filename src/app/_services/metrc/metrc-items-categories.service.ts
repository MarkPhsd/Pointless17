import { Injectable } from '@angular/core';
import { Observable, of, } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

// Generated by https://quicktype.io

import {
  METRCItemsCategories,

} from '../../_interfaces/metrcs/items';

@Injectable({
  providedIn: 'root'
})
export class MetrcItemsCategoriesService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
    private sitesService: SitesService,
   ) {}

  importItemCategories(site: ISite): Observable<METRCItemsCategories[]> {

    console.log('site', site)
    if (!site || !site.id) { 
      this.sitesService.notify('No Site Assigned', "Close", 50000)
      return of(null)
    }

    const controller = '/MetrcCategories/'

    const endPoint   = `GetImportItemCategories`

    const parameters = `?id=${site.id}`

    const url        = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<METRCItemsCategories[]>(url);

  }

  getCategories(): Observable<METRCItemsCategories[]> {

    const site = this.sitesService.getAssignedSite();

    const controller = '/MetrcCategories/'

    const endPoint = `GetMetrcCategories`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<METRCItemsCategories[]>(url);

  }

  getCategoryByName(name : string): Observable<METRCItemsCategories> {

    const site = this.sitesService.getAssignedSite();

    const controller = '/MetrcCategories/'

    const endPoint = `GetMetrcCategoryByName`

        const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<METRCItemsCategories>(url);

  }

  getCategory(id: any): Observable<METRCItemsCategories> {

    const site = this.sitesService.getAssignedSite();

    const controller = '/MetrcCategories/'

    const endPoint = `GetMetrcCategory`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<METRCItemsCategories>(url);

  }

  putCategory(id: number, mETRCItemsCategories: METRCItemsCategories): Observable<METRCItemsCategories> {

    const site = this.sitesService.getAssignedSite();

    const controller = '/MetrcCategories/'

    const endPoint = 'PutMetrcCategory'

    const parameters = '?id=${id}'

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<METRCItemsCategories>(url, mETRCItemsCategories);

  }

  postCategory(mETRCItemsCategories: METRCItemsCategories): Observable<METRCItemsCategories> {

    const site = this.sitesService.getAssignedSite();

    const controller = '/MetrcCategories/'

    const endPoint = 'PostMetrcCategory'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<METRCItemsCategories>(url, mETRCItemsCategories);

  }


}
