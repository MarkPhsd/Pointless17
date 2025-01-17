import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IServiceType, IServiceTypePOSPut, ISetting, ISite }   from 'src/app/_interfaces';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';

@Injectable({
  providedIn: 'root'
})

export class ServiceTypeService {

  list: IServiceType[];
  constructor( private http        : HttpClient,
                private httpCache  : HttpClientCacheService,
                private siteService: SitesService) { }

  getType(site: ISite, id: number):  Observable<IServiceType> {

    const controller = '/ServiceType/'

    const endPoint = `getServiceType`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IServiceType>(url);

  }


  getTypeCached(site: ISite, id: number):  Observable<IServiceType> {

    const controller = '/ServiceType/'

    const endPoint = `getServiceType`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri = { url: url, cacheMins: 120}

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as ISetting
    if (appCache) {
      if (appCache.value && appCache.boolean) {
        const url = { url: uri, cacheMins: appCache.value}
        return  this.httpCache.get<IServiceType>(uri)
      }
    }

    return this.http.get<IServiceType>(url);

  }

  getTypesBySearch(site: ISite, searchModel: IServiceType):  Observable<IServiceType[]> {

    const controller = '/ServiceType/'

    const endPoint = 'getTypesBySearch'

    const parameters = '';

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IServiceType[]>(url, searchModel);
  }

  getAllServiceTypes(site: ISite):  Observable<IServiceType[]> {

    const controller = '/ServiceType/'

    const endPoint = 'getAllServiceTypes'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IServiceType[]>(url);

  }

  getSaleTypes(site: ISite):  Observable<IServiceType[]> {

    const controller = '/ServiceType/'

    const endPoint = 'GetSaleTypes'

    const parameters = '';

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IServiceType[]>(url);

  }

  


  getSaleTypesCached(site: ISite):  Observable<IServiceType[]> {

    const controller = '/ServiceType/'

    const endPoint = 'GetSaleTypes'

    const parameters = '';

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.siteService.getCacheURI(url)

    return  this.httpCache.get<IServiceType[]>(uri)

  }

  getPurchaseOrderTypes(site: ISite):  Observable<IServiceType[]> {

    const controller = '/ServiceType/'

    const parameters = 'getPurchaseOrderTypes'

    const endPoint = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IServiceType[]>(url);

  }

  putServiceType(site: ISite, id: any, serviceType: IServiceTypePOSPut): Observable<IServiceType> {

    const controller = "/ServiceType/"

    const endPoint = `putServiceType`

    const parameters= `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<IServiceType>(url, serviceType)

  }

  delete(site: ISite, id: any): Observable<IServiceType> {

    const controller = "/ServiceType/"

    const endPoint = `deleteServiceType`

    const parameters= `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<IServiceType>(url)

  }

  postServiceType(site: ISite, serviceType: IServiceTypePOSPut): Observable<IServiceType> {

    const controller = '/ServiceType/'

    const endPoint = 'postServiceType'

    const parameters= ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IServiceType>(url, serviceType)

  }

  saveServiceType(site: ISite, serviceType: IServiceTypePOSPut): Observable<IServiceType> {

    if (!serviceType.id || serviceType.id == 0) {
      return this.postServiceType(site, serviceType)
    }

    if (serviceType.id != 0) {
      return this.putServiceType(site, serviceType.id, serviceType)
    }

  }


}
