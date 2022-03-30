import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { Observable, Subject, throwError  } from 'rxjs';
import { ISite  }  from 'src/app/_interfaces';
import { HttpClient } from '@angular/common/http';
import { ProductPrice, ProductPrice2 } from 'src/app/_interfaces/menu/price-categories';

@Injectable({
  providedIn: 'root'
})
export class PriceCategoryItemService {

  @Input() currentPage = 1;
  @Input() lastPage    :number;
  @Input() pageCount   :number;
  @Input() pageSize    = 25;
  @Input() pageNumber  = 1;

  constructor( private http: HttpClient,
               private auth: AuthenticationService
              )
  { }

  delete(site: ISite, id: number): Observable<any> {

    const controller = "/ProductPrices/"

    const endPoint = `DeleteProductPrice`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

   }

  // api/PriceCategories/GetPriceCategories
  getList(site: ISite, priceCategoryID: number): Observable<ProductPrice[]> {

    const controller =  "/ProductPrices/"

    const endPoint = "GetProductPrices"

    const parameters = `?priceCategoryID=${priceCategoryID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ProductPrice[]>(url)
  };

  savePriceList(site: ISite,  items: ProductPrice2[]): Observable<any> {

    const controller ="/ProductPrices/"

    const endPoint = `POSTProductPriceList`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, items)

  }

  save(site: ISite,  item: ProductPrice2): Observable<any> {
    if (item.id) {
      return  this.put(site, item.id, item);
    } else {
      return this.post(site, item);
    }
  }

   post(site: ISite,  item: ProductPrice2): Observable<any> {

    console.log('post', item)
    const controller ="/ProductPrices/"

    const endPoint = `POSTProductPrice`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)

  }

   put(site: ISite, id: number, item: ProductPrice2): Observable<any> {

    console.log('post', item)
    if (id && item) {

      const controller = '/ProductPrices/'

      const endPoint = 'PutProductPrice'

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.put<any>(url, item)

    }

  }

}
