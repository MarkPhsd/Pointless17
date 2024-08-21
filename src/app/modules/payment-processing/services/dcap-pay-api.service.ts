import { HttpClient } from '@angular/common/http';
import { ParseSourceSpan } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPOSPayment, IPaymentResponse, OperationWithAction } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
// src/app/models/token-response.ts
export interface TokenResponse {
  Token?: string;
  Brand?: string;
  ExpirationMonth?: string;
  ExpirationYear?: string;
  Last4?: string;
  Bin?: string;
  CVV?: string;
  Errors?: string[];
}

export interface KeyResponse {
  responseOrigin: string;
  returnCode:     string;
  status:         string;
  message:        string;
  apiKey:         string;
}

// Generated by https://quicktype.io

export interface SaleResponse {
  status:     string;
  message:    string;
  account:    string;
  expiration: string;
  brand:      string;
  authCode:   string;
  refNo:      string;
  amount:     string;
  authorized: string;
  token:      string;
}


@Injectable({
  providedIn: 'root'
})
export class DcapPayAPIService {



  site = this.siteService.getAssignedSite();

  constructor(private http: HttpClient,
              private siteService: SitesService
              ) { }


  getCertMode() : Observable<string> { 

    //PayAPIMode
    const controller = '/payAPI/'

    const endPoint = "getCertMode"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<string>(url)

  }              

  acquireInitialApiKey(): Observable<KeyResponse> {

    const controller = '/payAPI/'

    const endPoint = "AcquireInitialApiKey"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<KeyResponse>(url)
  }

  acquireApiKey(): Observable<KeyResponse> {

    const controller = '/payAPI/'

    const endPoint = "acquireApiKey"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<KeyResponse>(url)
  }

  deleteKey() {
      const controller = '/payAPI/'

      const endPoint = "deleteKey"

      const parameters = ``

      const url = `${this.site.url}${controller}${endPoint}${parameters}`

      return this.http.get<KeyResponse>(url)
  }

  payAPIKeyExists(): Observable<boolean> {

    const controller = '/payAPI/'

    const endPoint = "payAPIKeyExists"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<boolean>(url)
  }

  payAPiVoid(payment: IPOSPayment): Observable<OperationWithAction> {

    const controller = '/payAPI/'

    const endPoint = "payAPiVoid"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<OperationWithAction>(url, payment)
  }

  payAPIAdjustSale(payment: IPOSPayment) : Observable<OperationWithAction> {

    const controller = '/payAPI/'

    const endPoint = "payAPIAdjustSale"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<OperationWithAction>(url, payment)
  }

  getPayMID(): Observable<string> {

    const controller = '/payAPI/'

    const endPoint = "getPayMID"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<string>(url)
  }

  getPrivatePayAPIKey(): Observable<KeyResponse> {

    const controller = '/payAPI/'

    const endPoint = "getPrivatePayAPIKey"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<KeyResponse>(url)
  }

  sale(response: any, posPayment: IPOSPayment): Observable<IPaymentResponse> {

    const controller = '/payAPI/'

    const endPoint = "payAPISale"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post <any>(url,{responseToken: response, posPayment: posPayment})
  }

  handlePaymentResponse(response: TokenResponse) {
    if (response.Errors) {
      // Handle errors
      console.error('Payment error:', response.Errors);
    } else {
      // Process the successful response
      console.log('Payment Token:', response.Token);
      // Additional processing can be done here
    }
  }
}
