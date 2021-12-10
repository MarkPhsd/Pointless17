import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { PriceTierPrice } from 'src/app/_interfaces/menu/price-categories';
import { AuthenticationService } from '..';
import { IPagedList, SearchModel } from '../system/paging.service';

@Injectable({
  providedIn: 'root'
})
export class PriceTierPriceService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
    private _fb: FormBuilder,
   )
  { }


  deletePrice(site: ISite, id: number): Observable<PriceTierPrice> {

    const endpoint = "/PriceTierPrices/"

    const parameters = "deletePrice"

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.delete<PriceTierPrice>(url)

  }

  initPriceTierPriceForm(inputForm: FormGroup): FormGroup {
    inputForm  =  this.initalizeForm(inputForm)
    return inputForm
  }

  putPriceTier(site:ISite, priceTier: PriceTierPrice) {
    const endpoint = "/PriceTierPrices/"

    const parameters = `putPriceTierPrice&id=${priceTier.id}`

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
    if (priceTier && priceTier.id != 0) {
      return this.putPriceTier(site, priceTier)
    }
    if (priceTier && (!priceTier.id || priceTier.id == 0)) {
      return this.postPriceTier(site, priceTier)
    }
  }

  addArrayForm(): FormGroup {
    let inputForm = this._fb.group({})
    inputForm  =  this.initalizeForm(inputForm)
    return inputForm
  }

  initalizeForm(inputForm) {
    inputForm  =  this._fb.group({
        id:              [],
        productPriceID:  [],
        quantityFrom:    [],
        quantityTo:      [],
        retail:          [],
        price1:          [],
        price2:          [],
        price3:          [],
        price4:          [],
        price5:          [],
        price6:          [],
        price7:          [],
        price8:          [],
        price9:          [],
        startTime:       [],
        endTime:         [],
        specialPrice:    [],
        weekDays:        [],
        flatQuantity:    [],
        priceName:       [],
        rateOrPrice:     [],
    })
    return inputForm
  }


}
