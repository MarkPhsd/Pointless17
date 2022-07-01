import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ISite } from 'src/app/_interfaces';


@Injectable({
  providedIn: 'root'
})
export class TextMessagingService {

  constructor(
              private http: HttpClient) { }

  //post a message to user

  //get list of users to post to+

  //
  sendOrderIsReady(site: ISite , cellNumber: string, customerName: string, orderID: number) {
    const controller = "/TwilioSMS/"

    const endPoint = 'sendOrderIsReady';

    const parameters = `?number=${cellNumber}&customerName=${customerName}&orderID=${orderID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }

  sendMessage(site: ISite, cellNumber: string, customerName: string,  message: string) {

    const controller = "/TwilioSMS/"

    const endPoint = 'sendMessage';

    const parameters = `?number=${cellNumber}&message=${message}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }

}
