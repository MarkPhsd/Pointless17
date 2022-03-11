import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { AppInitService } from '../system/app-init.service';
import { PlatformService } from '../system/platform.service';


export interface IHeartJane {
  http: string;
  apiKey: string;
  apiPass: string;
}

@Injectable({
  providedIn: 'root'
})
export class IHeartJaneService {

iHeartJane = {} as IHeartJane

apiUrl: 'http:service' //add this to IHeartJaneInterface
 constructor( private http  : HttpClient,
    private auth            : AuthenticationService,
    private appInitService  : AppInitService,
    private platformSevice  : PlatformService,
    private httpClient      : HttpClient) {

      this.iHeartJane.http = 'http://iheartjane.com'

  }

  notifyOrderComplete(order: IPOSOrder) {

  }

  // receiveOrders() {

  //   const endPoint = `/getOrdersPending/`

  //   const params = ``

  //   const url = `${this.iHeartJane.http}${endPoint}${params}`

  //   return  this.http.delete<any>(url)

  // }

  // recieveProducts(site: ISite)) {

  // }

}
