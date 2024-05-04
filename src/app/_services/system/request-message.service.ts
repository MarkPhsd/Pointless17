import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ISite, Paging } from 'src/app/_interfaces';
import { Observable, of,switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserAuthorizationService } from './user-authorization.service';
import { type } from 'os';
import { SitesService } from '../reporting/sites.service';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';

// Generated by https://quicktype.io

export interface IRequestMessageSearchModel {
  completionDate_From:         string;
  completionDate_To:           string;
  completed:                   boolean;
  pageSize:                    number;
  pageNumber:                  number;
  pageCount:                   number;
  currentPage:                 number;
  lastPage:                    number;
  useNameInAllFieldsForSearch: boolean;
  userID:                      number;
  parameters      : string;
	method          : string;
  type            : string;
  subject         : string;
	roles           : string;
	requestDate     : string;
	requestCompleted: string;
  payload         : string;
  userRequested   : string;
  senderName      : string;
  senderID        : number;
  archived        : boolean;
  message         : string;
  employeeID      : number;
  orderID         : number;
  orderItemID     : number;
  name         : string;
  template     : boolean;
  balanceZero: boolean;
}

export interface IRequestResponse {
  id     : number;
  message: string;
  result : boolean;
}

export interface IRequestMessage {
  id	            : number;
  parameters      : string;
	method          : string;
  type            : string;
  subject         : string;
	roles           : string;
	requestDate     : string;
	requestCompleted: string;
  payload         : string;
  userRequested   : string;
  userID          : number;
  senderName      : string;
  senderID        : number;
  archived        : boolean;
  message         : string;
  employeeID      : number;
  orderID         : number;
  orderItemID     : number;
  template        : boolean;
  balanceZero:     boolean;
}

export interface   IRequestMessagesResult {
  errorMessage: string;
  paging: Paging;
  results: IRequestMessage[]
  message: string;
}

// IRequestMessagesResult
// SearchRequestsMessages

@Injectable({
  providedIn: 'root'
})
export class RequestMessageService {



  defaultSubjects = [
    {name: 'Please Complete', type: 'ps', subject: 'Please Complete', template: true, message: 'Please review this order for prep. I would like it completed. I agree to pay when it the order is completed.', id: 1},
    {name: 'Please Review for Prep', type: 'ps', subject: 'Please Review for Prep', template: true,  message: 'Please review this order for prep. I would like it confirmed and then please contact me.', id: 2},

    {name: 'Ready for Pickup', type: 'oc', subject:  'Ready for Pickup',  balanceZero: false,  template: true, message: 'Your order has been completed for Pickup.', id: 3},
    {name: 'Order Ready for Delivery', type: 'oc', subject: 'Order Ready for Delivery',  balanceZero: false, template: true,  message: 'Your order has been completed. We will notify you when it is en route for delivery.', id: 5},
    {name: 'Please Pay', type: 'oc', subject: 'Please Pay',   balanceZero: false, template: true,  message: 'Your order has been completed. Please complete payment so we may schedule pickup or delivery.', id: 6},
    {name: 'Order Can Not be Completed', type: 'oc', balanceZero: false, template: true,  subject: 'Order Can Not be Completed', message: 'Your order can not be completed. We will notify you of why in a separate email.', id: 7},
    {name: 'Items Prepared', type: 'on', balanceZero: false, template: true,  subject: 'Your order has been prepared', message: 'Your order has been prepared.', id: 8},

  ]

  messageTypes = [
    {name: 'Order Communication', id: 'oc'},
    {name: 'Price Change, Refund, Void Request', id: 'pc'},
    {name: 'Item Request', id: 'ir'},
    {name: 'Table Service Request', id: 'tsr'},
    {name: 'Check Service Request', id: 'csr'},
    {name: 'Price Schedule', id: 'ps'},
    {name: 'Order Ready - Use Only One Template', id: 'on'},
    {name: 'Print Job', id: 'Print Job'},
  ];

  isAuthorized   = false;
  constructor(private snackBar: MatSnackBar,
              private siteService: SitesService,
              private http: HttpClient,
              private httpCache               : HttpClientCacheService,
              private userAuthorization: UserAuthorizationService,
              ) {

    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
  }

  archiveMessages(site: ISite, list: IRequestMessage[]): Observable<IRequestResponse> {
    //this should perform the operation on the backend via the api.
    const controller = "/RequestMessages/"

    const endPoint = "archiveMessages"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IRequestResponse>(url, list)

  }

   delete(site: ISite, id: number): Observable<IRequestResponse> {
    //this should perform the operation on the backend via the api.
    const controller = "/RequestMessages/"

    const endPoint = "deleteRequestMessage"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<IRequestResponse>(url)

  }

  performMessageAction(site: ISite, id: number): Observable<IRequestResponse> {
    //this should perform the operation on the backend via the api.
    const controller = "/RequestMessages/"

    const endPoint = "performAction"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IRequestResponse>(url)

  }

  saveMessage(site: ISite,  message: IRequestMessage): Observable<IRequestResponse> {
    //this shouold perform the operation on the backend via the api.
    if (message.id) {
      return  this.putMessage(site, message)
    }
    return this.postMessage(site, message)
  }

  saveMessageData(site: ISite,  message: IRequestMessage): Observable<IRequestMessage> {
    //this shouold perform the operation on the backend via the api.
    if (message.id) {
      return  this.putMessageData(site, message)
    }
    return this.postMessageData(site, message)
  }

  postMessage(site: ISite, message: IRequestMessage) : Observable<IRequestResponse> {
    const controller = "/RequestMessages/"

    const endPoint = "PostRequestMessage"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IRequestResponse>(url, message);
  }

  postMessageList(site: ISite) : Observable<any> {

    const controller = "/RequestMessages/"

    const endPoint = "postMessageList"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>(url, this.defaultSubjects);
  }


  putMessage(site: ISite, message: IRequestMessage) : Observable<IRequestResponse> {

    const controller = "/RequestMessages/"

    const endPoint = "PutRequestMessage"

    const parameters = `?id=${message.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IRequestResponse>(url, message);
  }

  postMessageData(site: ISite, message: IRequestMessage) : Observable<IRequestMessage> {
    const controller = "/RequestMessages/"

    const endPoint = "PostRequestMessageData"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IRequestMessage>(url, message);

  }

  putMessageData(site: ISite, message: IRequestMessage) : Observable<IRequestMessage> {

    const controller = "/RequestMessages/"

    const endPoint = "PutRequestMessageData"

    const parameters = `?id=${message.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IRequestMessage>(url, message);

  }

  getRequestMessagesByCurrentUser(site: ISite, searchModel: IRequestMessageSearchModel): Observable<IRequestMessage[]> {
    //this shouold perform the operation on the backend via the api.

    if (!this.userAuthorization.user) {
      const item = [] as IRequestMessage[]
      return of(item);
    }

    const controller = "/RequestMessages/"

    const endPoint = "getRequestMessagesByCurrentUser"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IRequestMessage[]>(url, searchModel)

  }

  getOpenRequestMessagesByOrder(site: ISite, searchModel: IRequestMessageSearchModel): Observable<IRequestMessage[]> {
    //this shouold perform the operation on the backend via the api.
    if (!this.userAuthorization.user) { return of(null)}
    const controller = "/RequestMessages/"

    const endPoint = "GetOpenRequestMessagesByOrder"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IRequestMessage[]>(url,searchModel)

  }

  getOpenRequestMessages(site: ISite, searchModel: IRequestMessageSearchModel): Observable<IRequestMessage[]> {
    //this shouold perform the operation on the backend via the api.
    if (!this.userAuthorization.user) { return of(null)}
    const controller = "/RequestMessages/"

    const endPoint = "getOpenRequestMessages"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IRequestMessage[]>(url,searchModel)

  }

  cancelRequest(site: ISite, id: number): Observable<IRequestResponse> {
    //this shouold perform the operation on the backend via the api.

    const controller = "/RequestMessages/"

    const endPoint = "cancelRequest"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IRequestResponse>(url)

  }

  getRequestMessage(site: ISite, id: number): Observable<IRequestMessage> {
    //this shouold perform the operation on the backend via the api.
    if (!this.userAuthorization.user) { return of(null)}

    const controller = "/RequestMessages/"

    const endPoint = "getRequestMessage"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IRequestMessage>(url)

  }

  getRequestMessages(site: ISite, search: IRequestMessageSearchModel): Observable<IRequestMessagesResult> {
    //this shouold perform the operation on the backend via the api.
    if (!this.userAuthorization.user) { return of(null)}

    const controller = "/RequestMessages/"

    const endPoint = "getRequestMessage"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IRequestMessagesResult>(url,search )

  }

  searchMessages(site: ISite, search: IRequestMessageSearchModel): Observable<IRequestMessagesResult> {
    //this shouold perform the operation on the backend via the api.
    if (!this.userAuthorization.user) { return of(null)}

    const controller = "/RequestMessages/"

    const endPoint = "searchMessages"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IRequestMessagesResult>(url, search)

  }

  getTemplateMessages(site: ISite): Observable<IRequestMessage[]> {

    const controller = "/RequestMessages/"

    const endPoint = "searchMessages"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.siteService.getCacheURI(url)

    const cacheTime = this.siteService.getCurrentCache();

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as any;

    let searchModel = {} as IRequestMessageSearchModel;
    searchModel.template = true;
    searchModel.archived = false;

    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const uri = { url: url, cacheMins: appCache.value}
        searchModel.pageSize = 400;
        searchModel.pageNumber = 1
        return this.httpCache.post<any>(uri, searchModel).pipe(
          switchMap(data => {
            return of(data.results)
        }));
      }
    }

    return  this.http.post<IRequestMessagesResult>(url, searchModel).pipe(
      switchMap(data => {
        return of(data.results)
    }));

  }


  getTemplateBalanceIsZeroMessages() {
    const site = this.siteService.getAssignedSite()
    return this.getTemplateMessages(site).pipe(
      switchMap(data => {
        if (data) {
          data = data.filter(item => {
            if (item.balanceZero == true && item.type.toLowerCase() == 'oc')  {return item}
          })
        }
      return of(data)
    }))
  }

  getTemplateBalanceIsNotZeroMessages():Observable<IRequestMessage[]> {
    const site = this.siteService.getAssignedSite()
    return this.getTemplateMessages(site).pipe(
      switchMap(data => {
        if (data) {
          data = data.filter(item => {
            if ((!item.balanceZero) && item.type.toLowerCase() == 'oc')  {return item}
          })
        }
      return of(data)
    }))
  }

}
