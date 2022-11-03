import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { EMPTY, Observable, } from 'rxjs';
import {clientType, ISite }   from 'src/app/_interfaces';

export interface IUserAuth_Properties {
  // 'pos section
  voidOrder            : boolean;
  voidItem             : boolean;
  voidPayment          : boolean;

  changeItemPrice      : boolean;
  changeInventoryValue : boolean;
  blindBalanceSheet    : boolean;
  blindClose           : boolean;

  // 'admin section
  closeDay             : boolean;
  sendTextBlast        : boolean;
  sendEmailBlast       : boolean;
  deleteClientType     : boolean;

  accessHistoryReports : boolean;
  accessDailyReport    : boolean;

  // 'metrc work
  importMETRCPackages : boolean;

// 'inventory work
  adjustInventory     : boolean;

// 'product work
  adjustInventoryCount: boolean;
  adjustProductCount  : boolean;

  // 'add non customer types
  addEmployee         : boolean;
  changeClientType    : boolean;

  changeAuths         : boolean;
  accessAdmins        : boolean;

  refundItem      : boolean;
  refundOrder     : boolean;
  refundPayment   : boolean;

  userAssignedBalanceSheet : boolean;
}

@Injectable({
  providedIn: 'root'
})

export class ClientTypeService {

  constructor( private http: HttpClient,
                private auth: AuthenticationService,
              ) { }

  getClientTypesPaged(site: ISite, searchModel: clientType): Observable<clientType[]> {
    const controller = "/clientTypes/"

    const endPoint = `ClientTypeSearch`;

    const parameters= ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<clientType[]>(url, searchModel)
  }

  getClientType(site: ISite, id: any): Observable<clientType> {

    const controller = '/clientTypes/'

    const endPoint = "getClientType"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<clientType>(url)

  }

  getClientTypeByName(site: ISite, name: any) : Observable<clientType> {

    if (!name) {return EMPTY}

    const controller =  "/clientTypes/"

    const endPoint = `getClientTypeByName`

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<clientType>(url)

  }

  getClientTypes(site: ISite): Observable<any> {

    const controller = "/clientTypes/"

    const endPoint = `getClientTypes`;

    const parameters= ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)

  }

  putClientType(site: ISite, id: any, clientType: clientType): Observable<clientType> {

    const controller = "/clientTypes/"

    const endPoint = `putClientType`

    const parameters= `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<clientType>(url, clientType)

  }

  delete(site: ISite, id: any): Observable<clientType> {

    const controller = "/clientTypes/"

    const endPoint = `deleteClientType`

    const parameters= `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<clientType>(url)

  }

  postClientType(site: ISite, clientType: clientType): Observable<clientType> {

    const controller = '/ClientTypes/'

    const endPoint = 'postClientType'

    const parameters= ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    console.log(url)
    return this.http.post<clientType>(url, clientType)

  }

  saveClientType(site: ISite, clientType: clientType): Observable<clientType> {

    if (!clientType.id || clientType.id == 0) {
      return this.postClientType(site, clientType)
    }

    if (clientType.id != 0) {
      return this.putClientType(site, clientType.id, clientType)
    }

  }



}
