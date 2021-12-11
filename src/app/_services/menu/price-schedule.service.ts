import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { Observable  } from 'rxjs';
import { ISite }  from 'src/app/_interfaces';
import { HttpClient } from '@angular/common/http';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';
import { IPriceSchedule, IPriceSearchModel, PriceAdjustScheduleTypes, PS_SearchResultsPaged } from 'src/app/_interfaces/menu/price-schedule';

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

  constructor(
              private httpCache: HttpClientCacheService,
              private httpClient: HttpClient,
              private sitesService: SitesService,
              private auth: AuthenticationService,) {
  }

  delete(site: ISite, id: number): Observable<IPriceSchedule> {

    const controller ="/PriceSchedules/"

    const endPoint = `DeletePriceSchedule`

    const parameters = `id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

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

    const url = { url: uri, cacheMins: 0}

    return  this.httpClient.get<IPriceSchedule>(uri)

  };

  put(site: ISite,  priceSchedule: IPriceSchedule): Observable<IPriceSchedule> {

    const controller = "/PriceSchedules/"

    const endPoint = 'PutPriceSchedule'

    const parameters = `?id=${priceSchedule.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.put<IPriceSchedule>(url, priceSchedule)

  }

  post(site: ISite, priceSchedule: IPriceSchedule): Observable<IPriceSchedule> {

    const controller = '/PriceSchedules/'

    const endPoint = `PostPriceSchedule`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.post<IPriceSchedule>(url, priceSchedule)

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
