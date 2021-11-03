import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { ISite, UnitType } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { SitesService } from '../reporting/sites.service';

@Injectable({
  providedIn: 'root'
})
export class MenuUnitTypesService {


  constructor( private http: HttpClient,
               private httpCache: HttpClientCacheService,
               private auth: AuthenticationService,
               private siteService: SitesService) {

            }

  getList(site: ISite):  Observable<UnitType[]>  {

    const controller =  `/UnitTypes/`

    const endPoint = `GetUnitTypes`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.siteService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

    // return  this.http.get<any[]>(url)

  }

  getUnitType(site: ISite, id: any):  Observable<UnitType>  {

    const controller =  `/UnitTypes/`

    const endPoint = `GetUnitType`

    const parameters = `?id=id`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.siteService.getCacheURI(url)

    return  this.httpCache.get<any>(uri)

    // return  this.http.get<UnitType>(url)

  }

  putUnitType(site: ISite, id: any, model: UnitType):  Observable<UnitType>  {

    const controller =  `/UnitTypes/`

    const endPoint = `GetUnitType`

    const parameters = `?id=id`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<UnitType>(url , model)
  }


  postUnitType(site: ISite, model: UnitType): Observable<UnitType> {

    const  controller =  "/ClientTable/"

    const endPoint = `putClientTable`

    const parameters  = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<UnitType>(url , model)

  };

  saveUnitType( site: ISite, model: UnitType) : Observable<UnitType> {

    if (model.id !== 0) {

      return this.putUnitType(site, model.id, model)

    } else {

      return this.postUnitType(site, model)

    }

  }

}
