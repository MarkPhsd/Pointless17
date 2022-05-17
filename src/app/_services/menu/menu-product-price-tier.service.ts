import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { ISite, PriceTierPrice } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { SettingsService } from '../system/settings.service';

@Injectable({
  providedIn: 'root'
})
export class MenuProductPriceTierService {

  site: ISite;
  constructor( private http: HttpClient,
               private auth: AuthenticationService,
              private settingService: SettingsService,
              private httpCache: HttpClientCacheService,
              ) {
                }

  getPriceTierPrices(site: ISite):  Observable<PriceTierPrice[]>  {

    const controller =  `/PriceTierPrices/`

    const endPoint = `getPriceTierPrice`

    const parameters = ``

    let url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.settingService.getCacheURI(url)

    return  this.httpCache.get<PriceTierPrice[]>(uri)

  }

  getPriceTierPrice(site: ISite, id: any):  Observable<PriceTierPrice>  {

    const controller =  `/PriceTierPrices/`

    const endPoint = `getPriceTierPrice`

    const parameters = `?id=id`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.settingService.getCacheURI(url)

    return  this.httpCache.get<PriceTierPrice>(uri)

  }

  putPriceTierPrice(site: ISite, id: any, model: PriceTierPrice):  Observable<PriceTierPrice>  {

    const controller =  `/PriceTierPrices/`

    const endPoint = `putPriceTierPrice`

    const parameters = `?id=id`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<PriceTierPrice>(url , model)


  }


  postPriceTierPrice(site: ISite, model: PriceTierPrice): Observable<PriceTierPrice> {

    const  controller =  "/PriceTierPrices/"

    const endPoint = `postPriceTierPrice`

    const parameters  = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<PriceTierPrice>(url , model)

  };

  savePriceTierPrice(site: ISite, model: PriceTierPrice) : Observable<PriceTierPrice> {

    if (model.id !== 0) {

    return this.putPriceTierPrice(site, model.id, model)

    } else {

    return this.postPriceTierPrice(site, model)

    }

  }
}
