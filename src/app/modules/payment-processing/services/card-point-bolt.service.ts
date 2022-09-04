import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BoltConnectResponse } from './../models/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CardPointBoltService {

  constructor(private http: HttpClient) { }

  getCardPointBolt(apiURL: string, hsn: string, sessionID: string): Observable<any> {

    const controller = '/cardpointe/'

    const endPoint = "getCardPointBolt"

    const parameters = `?hsn=${hsn}&sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }

  ping(apiURL: string, hsn: string, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "PingTerminal"

    const parameters = `?hsn=${hsn}&sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    console.log(url)

    return this.http.get<any>(url)

  }

  connect(apiURL: string, hsn: string): Observable<BoltConnectResponse> {

    const controller = '/CardPointeBolt/'

    const endPoint = "connect"

    const parameters = `?hsn=${hsn}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.get<BoltConnectResponse>(url)

  }

  listTerminals(apiURL: string, hsn: string, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "listTerminals"

    const parameters = `?hsn=${hsn}&sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }

  disconnect(apiURL: string, hsn: string, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "disconnect"

    const parameters = `?hsn=${hsn}&sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }

  terminalDetails(apiURL: string, hsn: string, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "terminalDetails"

    const parameters = `?hsn=${hsn}&sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }

  // {
  //   "amount": "1000",
  //   "tip": "225",
  //   "total": "1225"
  // }
  tip(apiURL: string, hsn: string, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "tip"

    const parameters = `?hsn=${hsn}&sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }
   // https://developer.cardpointe.com/bolt-terminal#readCard
   cancel(apiURL: string, hsn:string, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "cancel"

    const parameters = `?sessionID=${sessionID}&hsn=${hsn}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }

  // https://developer.cardpointe.com/bolt-terminal#readCard
  readCard(apiURL: string, item: any, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "readCard"

    const parameters = `?sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)

  }

  // https://developer.cardpointe.com/bolt-terminal#authCard
  authCard(apiURL: string, item: any, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "authCard"

    const parameters = `?sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)

  }

  // https://developer.cardpointe.com/bolt-terminal#authManual
  authManual(apiURL: string, item: any, sessionID: string): Observable<any> {

    const controller = '/CardPointeBolt/'

    const endPoint = "authManual"

    const parameters = `?sessionID=${sessionID}`

    const url = `${apiURL}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)

  }

}
