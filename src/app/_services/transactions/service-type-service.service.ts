import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable } from 'rxjs';
import { IServiceType, ISite }   from 'src/app/_interfaces';
import { environment } from 'src/environments/environment';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';

@Injectable({
  providedIn: 'root'
})

export class ServiceTypeService {

  constructor( private http        : HttpClient,
                private httpCache  : HttpClientCacheService,
                private auth       : AuthenticationService,
                private siteService: SitesService) { }

  getType(site: ISite, id: number):  Observable<IServiceType> {

    const controller = '/ServiceType/'

    const endPoint = `getServiceType`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

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

  putServiceType(site: ISite, id: any, serviceType: IServiceType): Observable<IServiceType> {

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

  postServiceType(site: ISite, serviceType: IServiceType): Observable<IServiceType> {

    const controller = '/ServiceType/'

    const endPoint = 'postServiceType'

    const parameters= ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IServiceType>(url, serviceType)

  }

  saveServiceType(site: ISite, serviceType: IServiceType): Observable<IServiceType> {

    if (!serviceType.id || serviceType.id == 0) {
      return this.postServiceType(site, serviceType)
    }

    if (serviceType.id != 0) {
      return this.putServiceType(site, serviceType.id, serviceType)
    }

  }


}
