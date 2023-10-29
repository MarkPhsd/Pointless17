import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IStoreCreditSearchModel, StoreCredit, StoreCreditResultsPaged } from './store-credit-methods.service';

@Injectable({
  providedIn: 'root'
})
export class StoreCreditService {

  constructor(
    private httpClient: HttpClient,
  ) {
 }

  delete(site: ISite, cardNum: string ): Observable<StoreCredit> {

    const controller ="/StoreCredits/"

    const endPoint = `DeleteStoreCredits`

    const parameters = `?cardNum=${cardNum}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

  }

  search(site: ISite, searchModel: IStoreCreditSearchModel): Observable<StoreCreditResultsPaged> {

    // console.log('searchModel', searchModel)
    const controller = "/StoreCredits/"

    const endPoint = "SearchItems"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.post<StoreCreditResultsPaged>(url, searchModel)

  };

  getStoreCredit(site: ISite, id: number): Observable<StoreCredit> {

    const controller =  "/StoreCredits/"

    const endPoint = "GetStoreCredit"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<StoreCredit>(url)

  };

  putStoreCredit(site: ISite, cardNum: string, storeCredit: StoreCredit): Observable<StoreCredit> {

    const controller =  "/StoreCredits/"

    const endPoint = "putStoreCreditApp"

    const parameters = `?cardNum=${cardNum}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.put<StoreCredit>(url, storeCredit);

  };

  postStoreCredit(site: ISite, storeCredit: StoreCredit): Observable<StoreCredit> {

    if (!storeCredit) {return of(null);}

    const controller =  "/StoreCredits/"

    const endPoint = "PostStoreCreditApp"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<StoreCredit>(url, storeCredit);

  };

  updateCreditValue(site: ISite, credit: StoreCredit) {

    const controller =  "/StoreCredits/"

    const endPoint = "updateCreditValueApp"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<StoreCredit>(url, credit);

  }

  save(site:ISite, credit: StoreCredit) {
    // console.log(credit)
    if (!credit || !credit.cardNum) {
      console.log('returning nothing')
      return of(null) }
    if (!credit.id ||  credit.id == 0 ) {
      return this.postStoreCredit(site, credit)
    }
    return this.putStoreCredit(site, credit.cardNum, credit)
  }

  // PostStoreCredits
  // PutStoreCredits
  // GetStoreCredits

}
