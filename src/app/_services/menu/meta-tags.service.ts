import { Injectable, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable, Subject, throwError  } from 'rxjs';
import { IProduct, IProductCategory, ISite, MenuItem }  from 'src/app/_interfaces';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { IMenuItem } from '../../_interfaces/menu/menu-products';
import { ProductSearchModel } from '../../_interfaces/search-models/product-search';
import { SitesService } from '../reporting/sites.service';


export interface IItemBasic{
  name: string;
  id: number;
}

export interface IMetaTag {
  id:          number;
  name:        string;
  description: string;
  productID:   number;
  icon:        string;
}

@Injectable({
  providedIn: 'root'
})
export class MetaTagsService {

  site: ISite;
  constructor(private http: HttpClient,
              private auth: AuthenticationService,
              private siteService: SitesService,) {
  }

  // @Input() currentPage: number= 1;
  // @Input() lastPage:    number;
  // @Input() pageCount:   number;
  // @Input() pageSize:    number = 25;
  // @Input() pageNumber:  number = 1;


  getBasicLists(site: ISite, type: string):  Observable<IItemBasic[]>  {

    const controller =  '/metaTags/'

    const endPoint = 'GetItemNamesList'

    const parameters = `?name=${type}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IItemBasic[]>(url)

  }

  getList(site: ISite): Observable<IMetaTag[]> {

    const controller =  "/metaTags/"

    const endPoint = "getList"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IMetaTag[]>(url)
  };

  save(site: ISite, metaTag: IMetaTag): Observable<IMetaTag> {

    if (metaTag.id) {
      return  this.put(site, metaTag.id, metaTag);

    } else {
      return this.post(site, metaTag);

    }
  }

  // https://localhost:44309/api/metaTags/PosttMETATag
   post(site: ISite,  metaTag: IMetaTag): Observable<IMetaTag> {

    const controller ="/metaTags/"

    const endPoint = `PosttMETATag`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, metaTag)

  };

   put(site: ISite, id: number, metaTag: IMetaTag): Observable<IMetaTag> {

    if (id && metaTag) {

      const controller = '/metaTags/'

      const endPoint = 'PutMETATag'

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.put<any>(url, metaTag)

    }

  };

}
