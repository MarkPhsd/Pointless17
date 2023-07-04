import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { SitesService } from '../reporting/sites.service';
import { IProduct, ISite, Paging, UnitType } from 'src/app/_interfaces';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { Product } from 'electron/main';

export interface PB_SearchResults {
  results: PB_Main[];
  paging: Paging;
  errorMessage: string;
}
export interface PB_Main  {
	id: number;
	name: string;
	pB_Components: PB_Components[];
	sort: number;
	dateUpdated: Date;
}
export interface PB_Components {
	id: number;
	pb_MainID: number;
	name: string;
	quantity: number;
	productID: number;
	unitTypeID: number;
  unitName: string;
	cost: number;
	price: number;
  product: IMenuItem | Product;
  unitType: UnitType;
	pb_MainID_Associations: PB_Main[];
}

export interface PB_Main_Associations {
  associationID: number;
  pb_mainID: number;
  componentID: number;
}

@Injectable({
  providedIn: 'root'
})
export class PartBuilderMainService {

  constructor(
    private http         : HttpClient,
    private auth         : AuthenticationService,
    private siteService  : SitesService,
   )
{ }


  delete(site: ISite, id: number): Observable<PB_Main> {

    const controller = "/PB_Builder/"

    const endPoint = `DeleteItem`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

  }

  getItems(site: ISite) : Observable<PB_Main[]> {

    const controller = "/PB_Builder/"

    const endPoint = `getItems`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<PB_Main[]>(url)

  }

  getItem(site: ISite, id: any) : Observable<PB_Main> {

    const controller = "/PB_Builder/"

    const endPoint = `getItem`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<PB_Main>(url)

  }

  postList(site: ISite, list: PB_Main[]): Observable<PB_Main[]> {

    const controller = "/PB_Builder/"

    const endPoint = `POSTItemList`;

    const parameters= ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<PB_Main[]>(url, list)

  }

  save(site: ISite,  item: PB_Main): Observable<PB_Main> {
    if (item.id) {
      return  this.put(site, item.id, item);
    }
    if (!item.id) {
      return this.post(site, item);
    }
    return of({} as PB_Main)
  }

  post(site: ISite,  item: PB_Main): Observable<PB_Main> {

    const controller = "/PB_Builder/"

    const endPoint = `PostItem`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)

  }

 put(site: ISite, id: number, item: PB_Main): Observable<PB_Main> {

    if (id && item) {

      const controller = "/PB_Builder/"

      const endPoint = 'PutItem'

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.put<any>(url, item)

    }

  }

  searchMenuPrompts(site: ISite, search: any) : Observable<PB_SearchResults> {

    const controller = "/PB_Builder/"

    const endPoint = 'search'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>(url, search)

  }

}
