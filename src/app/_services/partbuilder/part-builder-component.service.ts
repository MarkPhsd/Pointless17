import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService, IItemBasic, IItemBasicB, IItemValue } from '..';
import { SitesService } from '../reporting/sites.service';
import { PB_Components, PB_Main } from './part-builder-main.service';

@Injectable({
  providedIn: 'root'
})
export class PartBuilderComponentService {


  controller = '/PB_Components/'

  constructor(
    private http         : HttpClient,
    private auth         : AuthenticationService,
    private siteService  : SitesService,
   )
{ }



  delete(site: ISite, id: number): Observable<PB_Components> {

    const controller = this.controller

    const endPoint = `DeleteItem`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

  }



  deleteComponent(site: ISite, id: number): Observable<PB_Components> {

    const controller = this.controller

    const endPoint = `deleteComponent`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

  }

  getItems(site: ISite) : Observable<PB_Components[]> {

    const controller = this.controller

    const endPoint = `getItems`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<PB_Components[]>(url)

  }

  getItem(site: ISite, id: any) : Observable<PB_Components> {

    const controller = this.controller

    const endPoint = `getItem`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<PB_Components>(url)

  }

  postList(site: ISite, list: PB_Main[]): Observable<PB_Components[]> {

    const controller = this.controller

    const endPoint = `PostMenusList`;

    const parameters= ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<PB_Components[]>(url, list)

  }

  saveItemValues(site: ISite, item: PB_Components) {

    const value = { } as IItemValue;
    value.id = item.id
    value.cost = item.cost;
    value.quantity  = item.quantity
    value.price = item.price ;

    const controller = `/PB_Builder/`

    const endPoint = `SaveItemValues`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<PB_Components>(url, value)
  }

  save(site: ISite,  item: PB_Components): Observable<PB_Components> {
    if (item.id) {
      return  this.put(site, item);
    }
    if (!item.id) {
      return this.post(site, item);
    }
  }

  post(site: ISite,  item: PB_Components): Observable<PB_Components> {

    const controller = this.controller

    const endPoint = `postItem`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<PB_Components>(url, item)

  }

 put(site: ISite, item: PB_Components): Observable<PB_Components> {

    if (item) {

      const controller = this.controller

      const endPoint = 'putItem'

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.put<PB_Components>(url, item)

    }

  }



}
