import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SitesService } from '../reporting/sites.service';
import { BehaviorSubject, Observable  } from 'rxjs';
import { ISite } from 'src/app/_interfaces';

export interface SearchRewardsModel  {
  name: string;
  scheduleId: number;
  clientId: number;
  orderId: number;
  productID: number;
  available : boolean;
  pageSize: number;
  pageNumber: number;
  pageCount: number;
  recordCount: number;
  currentPage: number;
  lastPage: number;
  loadChildren: boolean;
  iSLastPage: boolean;
  iSFirstPage: boolean;
}

export interface DisplayMenuResults {
  paging:  any;
  results : RewardsAvailable[];
  message: string;
  errorMessage: string;
}

export interface RewardsAvailable {
  id: number;
  name : string;
  scheduleID : number;
  scheduleName : string;
  productID : number;
  appliesToOrderItemID : number;
  appliesToProductID : number;
  dateIssued : string
  barcode : string;
  clientID : number;
  groupID : number;
  orderID : number;
}

@Injectable({
  providedIn: 'root'
})
export class RewardsAvailableService {

  constructor(
      private httpClient: HttpClient,
      private sitesService: SitesService,
   ) {
  }

  getClientAvailableItems(site: ISite,clientID: number, orderID: number): Observable<DisplayMenuResults> {

    const controller = "/RewardsAvailable/"

    const endPoint = "GetClientAvailableItems"

    const parameters = `?clientID=${clientID}&orderID=${orderID}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<DisplayMenuResults>(uri)

  };


  useReward(site: ISite, id: number, orderID: number): Observable<RewardsAvailable> {

    const controller = "/RewardsAvailable/"

    const endPoint = "UseReward"

    const parameters = `?id=${id}&orderID=${orderID}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<RewardsAvailable>(uri)

  };

  getReward(site: ISite, id: number): Observable<RewardsAvailable> {

    const controller = "/RewardsAvailable/"

    const endPoint = "getReward"

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<RewardsAvailable>(uri)

  };
}
