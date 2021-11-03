import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { Observable, Subject, throwError  } from 'rxjs';
import { IProduct, IProductCategory, ISite, MenuItem,  }  from 'src/app/_interfaces';
import { IMenuItem } from '../../_interfaces/menu/menu-products';
import { ProductSearchModel } from '../../_interfaces/search-models/product-search';
import { HttpClient } from '@angular/common/http';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';

import { IPriceCategories, PriceCategorySearchModel,IPriceCategoryPaged, IPriceCategory2 } from 'src/app/_interfaces/menu/price-categories';


export interface IItemBasic{
  name: string;
  id  : number;
  type: number;
}


@Injectable({
  providedIn: 'root'
})
export class PriceCategoriesService {


  @Input() currentPage = 1;
  @Input() lastPage    :number;
  @Input() pageCount   :number;
  @Input() pageSize    = 25;
  @Input() pageNumber  = 1;

  constructor( private http: HttpClient,
               private auth: AuthenticationService
              )
  { }

  delete(site: ISite, id: number): Observable<IPriceCategories> {

    const controller = "/PriceCategoriesSync/"

    const endPoint = `DeletePriceCategoriesSync`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

   }

   searchPriceCategories(site: ISite, searchPhrase): Observable<IItemBasic[]> {

    const controller = "/pricecategories/"

    const endPoint = `searchPriceCategories`

    const parameters = `?searchPhrase=${searchPhrase}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)
   }


  getPriceCategoriesNoChildrenByPage(site: ISite): Observable<IPriceCategoryPaged> {

    const pageNumber = 1

    const pageSize = 1000

    const controller = "/pricecategories/"

    const endPoint = `GetPriceCategoriesNoChildrenByPage`

    const parameters = `?pageNumber=${pageNumber}&pageSize=${pageSize}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  getPriceCategory(site: ISite, id: any) : Observable<IPriceCategories> {

    const controller = "/pricecategories/"

    const endPoint = `getPriceCategory`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IPriceCategories>(url)

  }


  // api/PriceCategories/GetPriceCategories
  getList(site: ISite, searchModel: PriceCategorySearchModel): Observable<IPriceCategoryPaged> {

    const controller =  "/PriceCategories/"

    const endPoint = "GetPriceCategoriesSearch"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPriceCategoryPaged>(url,searchModel)
  };

  save(site: ISite,  price: IPriceCategory2): Observable<IPriceCategories> {

    console.log('save', price)
    if (price.id) {
      return  this.put(site, price.id, price);

    } else {
      return this.post(site, price);

    }
  }

   post(site: ISite,  price: IPriceCategory2): Observable<IPriceCategories> {

    const controller ="/PriceCategories/"

    const endPoint = `POSTPriceCategory`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, price)

  }

   put(site: ISite, id: number, price: IPriceCategory2): Observable<IPriceCategories> {

    if (id && price) {

      const controller = '/PriceCategories/'

      const endPoint = 'PutPriceCategory'

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.put<any>(url, price)

    }
  }



}
