import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { PriceTierPrice } from 'src/app/_interfaces/menu/price-categories';
import { AuthenticationService } from '..';

@Injectable({
  providedIn: 'root'
})
export class PriceTierPriceService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
    private _fb: UntypedFormBuilder,
   )
  { }


  deletePrice(site: ISite, id: number): Observable<PriceTierPrice> {
    const endpoint = "/PriceTierPrices/"

    const parameters = `DeletePrice?id=${id}`

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.delete<PriceTierPrice>(url)
  }

  putPriceTier(site:ISite, priceTier: PriceTierPrice) {
    const endpoint = "/PriceTierPrices/"

    const parameters = `putPriceTierPrice?id=${priceTier.id}`

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.put<PriceTierPrice>(url, priceTier)
  }

  postPriceTier(site:ISite, priceTier: PriceTierPrice) {
    const endpoint = "/PriceTierPrices/"

    const parameters = "postPriceTierPrice"

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.post<PriceTierPrice>(url, priceTier)
  }

  save(site:ISite, priceTier: PriceTierPrice) : Observable<PriceTierPrice> {

    if (priceTier.id == null) { priceTier.id = 0}

    if (priceTier && (!priceTier.id || priceTier.id == 0)) {
      return this.postPriceTier(site, priceTier)
    }

    if (priceTier && priceTier.id != 0) {
      return this.putPriceTier(site, priceTier)
    }

  }


}
