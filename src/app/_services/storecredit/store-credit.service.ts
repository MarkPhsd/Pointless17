import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { SitesService } from '../reporting/sites.service';
import { IPagedList } from '../system/paging.service';
import { IStoreCreditSearchModel, StoreCredit, StoreCreditResultsPaged } from './store-credit-methods.service';

@Injectable({
  providedIn: 'root'
})
export class StoreCreditService {

  constructor(
    private httpClient: HttpClient,
  ) {
 }

  delete(site: ISite, id: number): Observable<StoreCredit> {

    const controller ="/StoreCredits/"

    const endPoint = `GetStoreCredits`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

  }

  search(site: ISite, searchModel: IStoreCreditSearchModel): Observable<StoreCreditResultsPaged> {

    // console.log('search Model', searchModel);

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

  putStoreCredit(site: ISite, id: number, storeCredit: StoreCredit): Observable<StoreCredit> {

    const controller =  "/StoreCredits/"

    const endPoint = "putStoreCredit"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.put<StoreCredit>(url, storeCredit);

  };

  postStoreCredit(site: ISite, storeCredit: StoreCredit): Observable<StoreCredit> {

    if (!storeCredit) {return null;}

    const controller =  "/StoreCredits/"

    const endPoint = "PostStoreCredit"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<StoreCredit>(url, storeCredit);

  };

  updateCreditValue(site: ISite, id: number, valueToReduce: number) {

    if (!id) {return null;}

    const controller =  "/StoreCredits/"

    const endPoint = "updateCreditValue"

    const parameters = `?id=${id}&value=${valueToReduce}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<StoreCredit>(url);

  }

  save(site:ISite, storeCredit: StoreCredit) {

    if (!storeCredit) { return null}
    if (storeCredit.id == 0 || !storeCredit.id) {
      return this.postStoreCredit(site, storeCredit)
    }
    if ( storeCredit.id &&  storeCredit.id !=0 ) {
      return this.putStoreCredit(site, storeCredit.id, storeCredit)
    }

    return null;

  }

  // PostStoreCredits
  // PutStoreCredits
  // GetStoreCredits

}
