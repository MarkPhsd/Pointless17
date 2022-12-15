import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { ISite }   from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface IPaymentMethod {
  id:              number;
  name:            string;
  isCreditCard:    boolean;
  companyCredit:   boolean;
  reverseCharge:   boolean;
  managerRequired: boolean;
  wic:             boolean;
  ebt:             boolean;
  tenderOrder:     number;
  exchangeRate:    number;
  isCash:          boolean;
  state:           boolean;
  enabledOnline:   boolean;
  preAuth     :    boolean;
  instructions:    string;
  addedPercentageFee: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {


  constructor(
    private http: HttpClient,
    private _SnackBar: MatSnackBar,
    private httpCache: HttpClientCacheService,
    private siteService: SitesService,
    private _fb: FormBuilder,
            )
  {

  }

  getList(site: ISite):  Observable<IPaymentMethod[]> {

    const controller = '/PaymentMethods/'

    const endPoint  = 'GetList'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPaymentMethod[]>(url);

  }

  getListByName(site: ISite, name: string):  Observable<IPaymentMethod[]> {

    const controller = '/PaymentMethods/'

    let endPoint   = 'getListByName'
    let parameters = ''

    if (!name) {
      endPoint = 'getlist'
    } else {
      endPoint  = 'GetListByName'
      parameters = `?name=${name}`
    }

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPaymentMethod[]>(url);

  }

  getCacheList(site: ISite):  Observable<IPaymentMethod[]> {

    const controller = '/PaymentMethods/'

    const endPoint  = 'GetList'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.siteService.getCacheURI(url)

    return this.httpCache.get<IPaymentMethod[]>(uri);

  }


  getCacheMethod(site: ISite, id: number):  Observable<IPaymentMethod> {

    const controller = '/PaymentMethods/'

    const endPoint  = "getPaymentMethod"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.siteService.getCacheURI(url)

    return this.httpCache.get<IPaymentMethod>(uri);

  }

  getPaymentMethodByName(site: ISite, name: string): Observable<IPaymentMethod> {

    const controller = "/PaymentMethods/"

    const endPoint  = "getPaymentMethodByName"

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPaymentMethod>(url);

  }


  getPaymentMethod(site: ISite, id: number): Observable<IPaymentMethod> {

    const controller = "/PaymentMethods/"

    const endPoint  = "getPaymentMethod"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPaymentMethod>(url);

  }

  delete(site: ISite, id: number): Observable<IPaymentMethod> {
    const controller = "/PaymentMethods/"

    const endPoint  = "DeletePaymentMethod"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<IPaymentMethod>(url);
  }

  post(site: ISite, paymentMethod: IPaymentMethod): Observable<IPaymentMethod> {
    const controller = "/PaymentMethods/"

    const endPoint  = "postPaymentMethod"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPaymentMethod>(url, paymentMethod);
  }

  put(site: ISite, paymentMethod: IPaymentMethod): Observable<IPaymentMethod> {
    const controller = "/PaymentMethods/"

    const endPoint  = "PutPaymentMethod"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<IPaymentMethod>(url, paymentMethod);
  }

  saveItem(site: ISite, paymentMethod: IPaymentMethod): Observable<IPaymentMethod> {
    if (paymentMethod.id === 0 || !paymentMethod.id) {
      return this.post(site, paymentMethod)
    } else {
      return this.put(site, paymentMethod)
    }
  }

  initForm(fb: FormGroup): FormGroup {
    // const serializedDate = new Date(user?.dob)
         fb = this._fb.group({
            id:              [''], //
            name:            ['', Validators.required], //
            isCreditCard:    [''], //
            companyCredit:   [''], //
            reverseCharge:   [''], //
            managerRequired: [''], //
            wic:             [''], //
            ebt:             [''], //
            tenderOrder:     [''], //
            exchangeRate:    [''], //
            isCash:          [''], //
            state:           [''], //
            preAuth:         [''],
            enabledOnline:   [''],
            instructions  :  [''],
            addedPercentageFee :  ['']
          }
        )
        return fb
    }
}
