import { Injectable,  } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable,  } from 'rxjs';
import {  ISite, Paging,  }  from 'src/app/_interfaces';
import { SitesService } from '../reporting/sites.service';

export interface IItemBasic{
  name: string;
  id: number;
}

export interface MetaTagSearchModel {
  paging: Paging;
  metaTag: IMetaTag
}


export interface IMetaTag {
  id:          number;
  name:        string;
  description: string;
  productID:   number;
  icon:        string;
  brandID      : number;
  departmentID : number;
  typeID       : number;
  attribute    : string;
  paging: Paging;
}

export interface MetaTagResults {
  results: IMetaTag[];
  paging: Paging;
  errorMessage: string;
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
  metaTagSearch(site: ISite, search: MetaTagSearchModel): Observable<MetaTagResults> {
    const controller = '/metaTags/'

    const endPoint = 'metaTagSearch'

    const parameters =``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<MetaTagResults>(url, search);
  }

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
