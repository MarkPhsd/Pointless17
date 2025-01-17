import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { EMPTY, Observable, of, } from 'rxjs';
import {clientType, ISite }   from 'src/app/_interfaces';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';

export interface IUserAuth_Properties {

  enableItemDiscount: boolean;
  enableCashVoid: boolean;
  enablebuyAgain: boolean;
  disableSplitByItems: boolean;
  disableMultiplePayments: boolean;
  allowCashPaymentForOtherServer: boolean;
  viewPaymentItemSalesReports: boolean;
  viewPaymentReports: boolean;

  allowChangeOrderType : boolean;
  // 'pos section
  voidOrder            : boolean;
  splitItemOverRide    : boolean;
  voidItem             : boolean;
  voidPayment          : boolean;
  deleteOrder          : boolean;

  // reports:
  disableBalanceEndOfDay   : boolean;
  disableItemSales         : boolean;
  disableDeviceSales       : boolean;
  disableGiftCards         : boolean;
  disableLabor              : boolean;
  disableDepartmentSales    : boolean;
  disableHourlySales        : boolean;
  disableUOMSales           : boolean;

  buysSalesReports        : boolean;
  itemSalesGroupBySize    : boolean;
  itemSalesGroupByQuantity: boolean;
  //payments
  houseAccountPayment  : boolean;
  changeItemPrice      : boolean;
  changeInventoryValue : boolean;

  blindBalanceSheet    : boolean;
  balanceSheetDetails  : boolean;
  blindClose           : boolean;
  balanceSheetViewTypeSales: boolean; //item type
  balanceSheetTransactionTypes: boolean;
  balanceSheetDisableBank: boolean;
  balanceSheetDisableCashDrops: boolean;
  balanceSheetCreditCardPayments: boolean;

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
  intakeInventory     : boolean;
  adjustInventoryCount: boolean;
  deleteInventory: boolean;

// 'product work
  editProduct         : boolean;
  adjustProductCount  : boolean;
  deleteProduct: boolean;
  // 'add non customer types
  allowTransferOrder  : boolean;
  addEmployee         : boolean;
  changeClientType    : boolean;

  changeAuths         : boolean;
  accessAdmins        : boolean;

  refundItem      : boolean;
  refundOrder     : boolean;
  refundPayment   : boolean;

  userAssignedBalanceSheet : boolean;
  searchBalanceSheets      : boolean;

  deleteEmployee: boolean;

  uploadPictures: boolean;

  priceColumnOption: boolean;

  allowNegativeTransaction: boolean;
  allowZeroTransaction: boolean;
  allowSuspendTransaction: boolean;

  defaultViewAllOrders: boolean;

  disableVoidClosedItem: boolean;
  disableEditOtherUsersOrders: boolean;

  allowBuy: boolean;

  allowReconciliation: boolean;
  allowSeeItemCost: boolean;
  editEmail: boolean;

  //notifications

  voidNotification: boolean;
  balanceSheetStartNotification: boolean;
  discountNotification: boolean;
  postShipDayOrder: boolean;

  displayTipCalcForServers: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class ClientTypeService {

  constructor( private http: HttpClient,
               private httpCache: HttpClientCacheService,
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

  getClientTypeCached(site: ISite, id: any): Observable<clientType> {

    const controller = '/clientTypes/'

    const endPoint = "getClientType"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as any;
    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const uri = { url: url, cacheMins: appCache.value}
        return  this.httpCache.get<clientType>(uri)
      }
    }

    return this.http.get<clientType>(url);

  }

  getClientTypeByName(site: ISite, name: any) : Observable<clientType> {

    if (!name) {return EMPTY}

    const controller =  "/clientTypes/"

    const endPoint = `getClientTypeByName`

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<clientType>(url)

  }

  getClientTypeByNameCached(site: ISite, name: any) : Observable<clientType> {

    if (!name) {return of(null)}

    const controller =  "/clientTypes/"

    const endPoint = `getClientTypeByName`

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as any;
    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const uri = { url: url, cacheMins: appCache.value}
        return  this.httpCache.get<clientType>(uri)
      }
    }

    return this.http.get<clientType>(url);
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

    clientType.limitConcentrates = clientType.limitConcentrate
    if (!clientType.id || clientType.id == 0) {
      return this.postClientType(site, clientType)
    }

    if (clientType.id != 0) {
      return this.putClientType(site, clientType.id, clientType)
    }

  }



}
