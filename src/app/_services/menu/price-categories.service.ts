import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { Observable  } from 'rxjs';
import { ISite,  }  from 'src/app/_interfaces';
import { HttpClient } from '@angular/common/http';
import { PriceCategories, IPriceCategoryPaged, IPriceCategory2 } from 'src/app/_interfaces/menu/price-categories';
import { SearchModel } from '../system/paging.service';
import { ProductEditButtonService } from './product-edit-button.service';
import { SitesService } from '../reporting/sites.service';

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

  constructor( private http                    : HttpClient,
               private auth                    : AuthenticationService,
               private productEditButtonService: ProductEditButtonService,
               private siteService             : SitesService,
              )
  { }

  delete(site: ISite, id: number): Observable<PriceCategories> {

    const controller = "/pricecategories/"

    const endPoint = `DeletePriceCategory`

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

  getPriceCategory(site: ISite, id: any) : Observable<PriceCategories> {

    const controller = "/pricecategories/"

    const endPoint = `getPriceCategory`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<PriceCategories>(url)

  }


  // api/PriceCategories/GetPriceCategories
  getList(site: ISite, searchModel: SearchModel): Observable<IPriceCategoryPaged> {

    const controller =  "/PriceCategories/"

    const endPoint = "GetPriceCategoriesSearch"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPriceCategoryPaged>(url,searchModel)
  };

  save(site: ISite,  price: IPriceCategory2): Observable<PriceCategories> {

    console.log('save', price)
    if (price.id) {
      return  this.put(site, price.id, price);

    } else {
      return this.post(site, price);

    }
  }

   post(site: ISite,  price: IPriceCategory2): Observable<PriceCategories> {

    const controller ="/PriceCategories/"

    const endPoint = `POSTPriceCategory`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, price)

  }

   put(site: ISite, id: number, price: IPriceCategory2): Observable<PriceCategories> {

    if (id && price) {

      const controller = '/PriceCategories/'

      const endPoint = 'PutPriceCategory'

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.put<any>(url, price)

    }
  }

  //move to methods
  openPriceCategoryEditor(id: number) {
    const site = this.siteService.getAssignedSite();
    const price$ = this.getPriceCategory(site, id)
    price$.subscribe( data => {
      this.productEditButtonService.openPriceEditor(data)
    })
  }

}
