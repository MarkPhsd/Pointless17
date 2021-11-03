import { Injectable } from '@angular/core';
import { FlatRateTax, FlatRateTaxValue } from '../menu/item-type.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { ISite } from 'src/app/_interfaces';

@Injectable({
  providedIn: 'root'
})
export class FlatRateService {

  constructor( private http: HttpClient,
               private auth: AuthenticationService) {
  }

   getList(site: ISite): Observable<FlatRateTax[]> {

     const controller = "/FlatRateTaxes/"

     const endPoint = `GetFlatRateTaxes`

     const parameters = ``

     const url = `${site.url}${controller}${endPoint}${parameters}`

     return  this.http.get<FlatRateTax[]>(url)

   }


   getItem(site: ISite, id: number): Observable<FlatRateTax> {

    const controller = "/FlatRateTaxes/"

    const endPoint = `getFlatRateTax`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<FlatRateTax>(url)

  }

  postRate(site: ISite, flatRateTax: FlatRateTax): Observable<FlatRateTax> {

    const controller = "/FlatRateTaxes/"

    const endPoint = `postFlatRateTax`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<FlatRateTax>(url, flatRateTax)

  }

  putRate(site: ISite, flatRateTax: FlatRateTax): Observable<FlatRateTax> {

    const controller = "/FlatRateTaxes/"

    const endPoint = `PutFlatRateTax`

    const parameters = `?id=${flatRateTax.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<FlatRateTax>(url, flatRateTax)

  }

  deleteFlatRateTax(site: ISite,id: any): Observable<FlatRateTax> {
    const controller = "/FlatRateTaxes/"
    const endPoint = 'DeleteFlatRateTax'
    const parameters = `?id=${id}`
    const url = `${site.url}${controller}${endPoint}${parameters}`
    return  this.http.delete<FlatRateTax>(url)
  }

  deleteFlateRateTaxValue(site: ISite,id: any): Observable<FlatRateTaxValue> {
    const controller = "/FlatRateTaxes/"
    const endPoint = 'DeleteFlateRateTaxValue'
    const parameters = `?id=${id}`
    const url = `${site.url}${controller}${endPoint}${parameters}`
    return  this.http.delete<FlatRateTaxValue>(url)
  }

}
