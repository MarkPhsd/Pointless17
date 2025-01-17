import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { BehaviorSubject, Observable, of, switchMap  } from 'rxjs';
import { ISite, IUser }  from 'src/app/_interfaces';
import { HttpClient } from '@angular/common/http';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';
import { DiscountInfo, IPriceSchedule, IPriceSearchModel, PriceAdjustScheduleTypes, PS_SearchResultsPaged } from 'src/app/_interfaces/menu/price-schedule';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Injectable({
  providedIn: 'root'
})
export class PriceScheduleService {

  site: ISite;
  @Input() currentPage   = 1;
  @Input() lastPage:     number;
  @Input() pageCount:    number;
  @Input() pageSize      = 25;
  @Input() pageNumber    = 1;

  private _priceSchedule         = new BehaviorSubject<IPriceSchedule>(null);
  public  priceSchedule$         = this._priceSchedule.asObservable();

  updateItemPriceSchedule(priceSchedule:  IPriceSchedule) {
    this._priceSchedule.next(priceSchedule);
  }

  constructor(
              private httpCache: HttpClientCacheService,
              private httpClient: HttpClient,
              private sitesService: SitesService,
              private auth: AuthenticationService,) {
  }

  delete(site: ISite, id: number): Observable<IPriceSchedule> {

    const controller = "/PriceSchedules/"

    const endPoint   = `DeletePriceSchedule`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

  }

  deleteItemDiscountSelected(site: ISite, id: number): Observable<DiscountInfo> {

    const controller = "/PriceSchedules/";

    const endPoint = `deleteItemDiscount`;

    const parameters= `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<DiscountInfo>(url)

  }

  deleteList(site: ISite, list: number[]): Observable<any> {

    const controller ="/PriceSchedules/"

    const endPoint = `DeletePriceSchedules`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  }

  getList(site: ISite): Observable<IPriceSchedule[]> {

    const controller = "/PriceSchedules/"

    const endPoint = "GetPriceSchedules"

    const parameters = ''

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.httpClient.get<IPriceSchedule[]>(uri)

  };

  getScheduleMenuItems(site: ISite, id: number): Observable<IMenuItem[]> {

    const controller = "/PriceSchedules/"

    const endPoint = "getScheduleMenuItems"

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<IMenuItem[]>(uri)

    const url = { url: uri, cacheMins: 60}

    return  this.httpCache.get<IMenuItem[]>(url)

  };

  getMenuList(site: ISite): Observable<PS_SearchResultsPaged> {

    const search =  {type: "Menu List"};

    const controller = "/PriceSchedules/"

    const endPoint = "getMenuList"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // const url = { url: uri, cacheMins: 0}

    return  this.httpClient.post<PS_SearchResultsPaged>(url, search)

  };

  getMenuListItems(site: ISite): Observable<IPriceSearchModel[]> {

    const search =  {type: "Menu List"};

    const controller = "/PriceSchedules/"

    const endPoint = "getMenuList"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // const url = { url: uri, cacheMins: 0}

    return  this.httpClient.post<PS_SearchResultsPaged>(url, search).pipe(switchMap(data => {
      const results = data as PS_SearchResultsPaged;
      return of(results.results)
    }))

  };

  getSimpleMenuList(site: ISite): Observable<PS_SearchResultsPaged> {

    const search =  {type: "Menu List"};

    const controller = "/PriceSchedules/"

    const endPoint = "getSimpleMenuList"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // const url = { url: uri, cacheMins: 0}

    return  this.httpClient.post<PS_SearchResultsPaged>(url, search)

  };

  getListBySearch(site: ISite, searchModel: IPriceSearchModel): Observable<PS_SearchResultsPaged> {

    const controller = "/PriceSchedules/"

    const endPoint = "GetList"

    const parameters = ''

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.httpClient.post<any>(uri, searchModel)

  };

  getPriceSchedule(site: ISite, id: number): Observable<IPriceSchedule> {

    const controller = "/PriceSchedules/"

    const endPoint = "GetPriceSchedule"

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    // const url = { url: uri, cacheMins: 0}

    return  this.httpClient.get<IPriceSchedule>(uri)

  };

  getPriceScheduleFull(site: ISite, id: number): Observable<IPriceSchedule> {
    let endPoint = "getPriceScheduleFull"
    let user =  JSON.parse(localStorage.getItem('user')) as IUser
    // console.log('getPriceScheduleFull', user)
    if (!user || (user && !user.id)) {
       endPoint = "getPublicPriceScheduleFull"
    }

    const controller = "/PriceSchedules/"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<IPriceSchedule>(url)
    const uri = { url: url, cacheMins: 30}

    return this.httpCache.get(uri);



  };

  put(site: ISite,  priceSchedule: IPriceSchedule): Observable<IPriceSchedule> {

    const controller = "/PriceSchedules/"

    const endPoint = 'PutPriceSchedule'

    // const parameters = `?id=${priceSchedule.id}`

    const url = `${site.url}${controller}${endPoint}`

    return  this.httpClient.post<IPriceSchedule>(url, priceSchedule)

  }

  post(site: ISite, priceSchedule: IPriceSchedule): Observable<IPriceSchedule> {

    const controller = '/PriceSchedules/'

    const endPoint = `PostPriceSchedule`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.post<IPriceSchedule>(url, priceSchedule)

  }

  postItemList(site: ISite, list: DiscountInfo[]): Observable<DiscountInfo[]> {

    const controller = "/PriceSchedules/"

    const endPoint = `PostMenuItemsList`;

    const parameters= ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<DiscountInfo[]>(url, list)

  }

  postSchedulesList(site: ISite, list: IPriceSearchModel[]): Observable<IPriceSearchModel[]> {

    const controller = "/PriceSchedules/"

    const endPoint = `postSchedulesList`;

    const parameters= ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<IPriceSearchModel[]>(url, list)

  }


  save(site: ISite, priceSchedule: IPriceSchedule): Observable<IPriceSchedule> {

    if (priceSchedule.id == undefined) {priceSchedule.id = 0}

    if (priceSchedule.id == 0) {
      return this.post(site, priceSchedule)
    }

    if (priceSchedule.id != 0) {
      return this.put(site, priceSchedule)
    }

  }

  getPriceAdjustList(site: ISite): Observable<PriceAdjustScheduleTypes[]> {

    const controller =  '/PriceSchedules/'

    const endPoint = `getPriceAdjustList`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<PriceAdjustScheduleTypes[]>(url)

  }

  getRestrictionsList(site: ISite): Observable<PriceAdjustScheduleTypes[]> {

    const controller =  '/PriceSchedules/'

    const endPoint = `getRestrictionsList`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<PriceAdjustScheduleTypes[]>(url)

  }


}
