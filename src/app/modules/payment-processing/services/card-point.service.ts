import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CardPointService {

  constructor(private http: HttpClient) { }

  //auth no capture
  // {
  //     "merchid": "{{merchid}}",
  //     "account": "{{account}}",
  //     "expiry": "{{expiry}}",
  //     "amount": "1",
  //     "currency": "{{currency}}",
  //     "name": "CC TEST"
  // }

  // auth capture
  // {
  //   "merchid": "{{merchid}}",
  //   "account": "9674338015190051",
  //   "expiry": "1222",
  //   "amount": "100",
  //   "batchsource": "1234A",
  //   "currency": "{{currency}}",
  //       "name": "Datacap/Test Card 02",
  //   "capture": "y",
  //   "receipt": "y"
  // }

  authCapture(apiURL: string, item: any): Observable<any> {

    const controller = '/CardPointe/'

    const endPoint = "authCapture"

    const parameters = ``

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)
  }


  //capture
  // {
  //   "retref": "{{retref}}",
  //   "merchid": "{{merchid}}",
  //   "amount": "2.00"
  // }
  capture(apiURL: string, item: any): Observable<any> {

    const controller = '/CardPointe/'

    const endPoint = "capture"

    const parameters = ``

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)
  }

  //refund
  //   {
  //     "retref": "{{retref}}",
  //     "merchid": "{{merchid}}"
  // }
  refundWithReference(apiURL: string, item: any): Observable<any> {

    const controller = '/CardPointe/'

    const endPoint = "refundWithReference"

    const parameters = ``

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)
  }

  //auth
  //   {
  //     "merchid": "{{merchid}}",
  //     "account": "{{account}}",
  //     "expiry": "{{expiry}}",
  //     "amount": "-1",
  //     "currency": "{{currency}}",
  //     "name": "CC TEST"
  // }
  refundWithoutRef(apiURL: string, item: any): Observable<any> {

    const controller = '/CardPointe/'

    const endPoint = "refundWithoutReference"

    const parameters = ``

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)
  }

  //voidByOrderId
  // {
  //     "merchid": "{{merchid}}",
  //     "orderid": "{{orderid}}"
  // }
  voidByOrderId(apiURL: string, item: any): Observable<any> {

    const controller = '/CardPointe/'

    const endPoint = "voidByOrderId"

    const parameters = ``

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)
  }

  //void
  // {
  //   "merchid": "{{merchid}}",
  //   "retref": "{{retref}}"
  // }
  void(apiURL: string, item: any): Observable<any> {

    const controller = '/CardPointe/'

    const endPoint = "void"

    const parameters = ``

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)
  }

}

// commcard: string;
// resptext: string;
// cvvresp: string;
// respcode: string;
// batchid: string;
// avsresp: string;
// entrymode: string;
// respproc: string;
// bintype: string;
// expiry: string;
// retref: string;
// respstat: string;
// account: string;
