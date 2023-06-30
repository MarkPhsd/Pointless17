import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { IProductPostOrderItem, IServiceType, ISite, IUserProfile }   from 'src/app/_interfaces';
import { IOrdersPaged, IPOSOrder, IPOSOrderSearchModel, IPOSPayment, PosOrderItem,  } from 'src/app/_interfaces/transactions/posorder';
import { IPagedList } from '../system/paging.service';
import { IItemBasic } from '../menu/menu.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor,  } from '@capacitor/core';
import { IBalanceSheet } from './balance-sheet.service';
import { SitesService } from '../reporting/sites.service';
import { ItemWithAction } from './posorder-item-service.service';
import { IListBoxItem } from 'src/app/_interfaces/dual-lists';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { POOrderImport } from '../data/fake-products.service';
export interface POSOrdersPaged {
  paging : IPagedList
  results: IPOSOrder[]
}

export interface importPuchase {
  order: IPOSOrder;
  items: any;
}

export interface OrderPayload {
  userID      : number;
  serviceType : IServiceType;
  deviceName  : string;
  client      : IUserProfile;
  orderName   : string
  order       : IPOSOrder;
}

export interface IVoidOrder {
  id: number;
  action: number;
  voidReasonID: number;
  voidReason  : string;
  returnToInventory: boolean;
}
export interface OrderActionResult {
  message : string;
  errorMessage : string;
  order : IPOSOrder;
}

@Injectable({
  providedIn: 'root'
})

export class OrdersService {

  get platForm() {  return Capacitor.getPlatform(); }

  constructor(
        private http: HttpClient,
        private _SnackBar: MatSnackBar,
        private siteService: SitesService,
        private userAuthorizationService: UserAuthorizationService,
    )
  {

  }
  applyItemsToGroup(site: ISite, groupID: number, selectedItems: any) :  Observable<any>  {
    const controller = "/POSOrders/"

    const endPoint  = "applyItemsToGroup"

    const parameters = `?groupID=${groupID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, selectedItems);
  }

  consolidateClientOrders(site: ISite, clientID : number) :  Observable<IPOSOrder>  {
    const controller = "/POSOrders/"

    const endPoint  = "consolidateClientOrders"

    const parameters = `?clientID=${clientID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }

  newOrderFromQR(site: ISite, qr: string): Observable<IPOSOrder> {
    const controller = "/POSOrders/"

    const endPoint  = "newQROrder"

    const parameters = `?qr=${qr}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }


  getPOSOrderGroupTotal(site: ISite, id: number, groupID: number) :  Observable<IPOSOrder>  {
    const controller = "/POSOrders/"

    const endPoint  = "getPOSOrderGroupTotal"

    const parameters = `?id=${id}&groupID=${groupID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
  }


  getSplitItemsList(site: ISite, orderID: number, groupID: number) :  Observable<IListBoxItem[]>  {
    const controller = "/POSOrders/"

    const endPoint  = "GetSplitItemsList"

    const parameters = `?orderID=${orderID}&groupID=${groupID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IListBoxItem[]>(url);
  }

  getHouseAccountPendingOrders(site: ISite):  Observable<any[]> {
    const controller = "/POSOrders/"

    const endPoint  = "getHouseAccountPendingOrders"

    const parameters = ""

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any[]>(url);
  }

  deleteUnClosedUnPrintedOrders(site: ISite):  Observable<any[]> {
    const controller = "/POSOrders/"

    const endPoint  = "deleteUnClosedUnPrintedOrders"

    const parameters = ""

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any[]>(url);
  }

  getTodaysOpenOrders(site: ISite):  Observable<IPOSOrder[]> {
    const controller = "/POSOrders/"

    const endPoint  = "GetOrdersbyPage"

    const parameters = "?pageNumber=1&pageSize=1000"

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder[]>(url);
  }

  getActiveTableOrders(site: ISite, floorPlanID: number):  Observable<IPOSOrder[]> {
    const controller = "/POSOrders/"

    const endPoint  = "getActiveTableOrders"

    const parameters = `?floorPlanID=${floorPlanID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder[]>(url);
  }

  forceCompleteOrder(site: ISite , id: number): Observable<IPOSOrder> {
    const controller = "/POSOrders/"

    const endPoint  = "forceCompleteOrder"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }
  completeOrder(site: ISite , id: number): Observable<IPOSOrder> {
    const controller = "/POSOrders/"

    const endPoint  = "completeOrder"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }

  // GetActiveEmployees(Name As String, StartDate As String, EndDate As String)

  getActiveEmployees(site: ISite):  Observable<IItemBasic[]>  {
    const controller = "/POSOrders/"

    const endPoint  = "getActiveEmployees"

    const parameters = `?startDate=${''}&endDate=${''}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IItemBasic[]>(url);
  }

  setOrderName(id: number, orderName: string):  Observable<any>  {
    const site = this.siteService.getAssignedSite();

    const controller = "/POSOrders/"

    const endPoint  = "SetOrderName"

    const parameters = `?orderID=${id}&orderName=${orderName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
  }

  setOrderPriceColumn(orderID: number, priceColumn: number):  Observable<any>  {
    const site = this.siteService.getAssignedSite();

    const controller = "/POSOrders/"

    const endPoint  = "setOrderPriceColumn"

    const parameters = `?orderID=${orderID}&priceColumn=${priceColumn}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
  }

  getUserCurrentOrder(site: ISite, userID: number) {
    let history = false;
    if (history === undefined) {history = false};

    const controller = "/POSOrders/"

    const endPoint  = "getUserCurrentOrder"

    const parameters = `?userID=${userID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }

  // Public Property results As PagedList(Of POSOrder)
  // Public Property Paging As Pagination
  // Public Property Summary As POSOrdersSummarized
  // Public Property ErrorMessage As String
  getPendingInBalanceSheet(site: ISite, id: number): Observable<IOrdersPaged> {
    const controller = "/POSOrders/";

    const endPoint = "GetPendingInBalanceSheet";

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IOrdersPaged>(url)
  }

  //getOrderCountCompletedInBalanceSheet
  getOrderCountCompletedInBalanceSheet(site: ISite, sheet: IBalanceSheet ): Observable<IOrdersPaged> {
    const controller = "/POSOrders/";

    const endPoint = "getOrderCountCompletedInBalanceSheet";

    const parameters = ``
    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IOrdersPaged>(url, sheet )
  }

  importPurchaseOrderCSV(site: ISite, order: IPOSOrder,  items: POOrderImport[]): Observable<IPOSOrder> {

    const controller = "/POSOrderItems/";

    const endPoint = "importPurchaseOrderCSV";

    const parameters = ``
    const url = `${site.url}${controller}${endPoint}${parameters}`;

    // // const import = {order, items};
    let  itemsImport = {} as importPuchase;
    itemsImport.order = order;
    itemsImport.items = items;

    return  this.http.post<IPOSOrder>(url, itemsImport );

  }


  claimOrder(site: ISite, id: string, history: boolean):  Observable<any>  {

    if (this.userAuthorizationService.user.username === 'Temp') {
      return of('')
    }
    if (history === undefined) {history = false};
    if (history) {
      return of('')
      return
    }

    const posName = localStorage.getItem('devicename')

    const controller = "/POSOrders/"

    const endPoint  = "claimOrder"

    const parameters = `?ID=${id}&posName=${posName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`
    return this.http.get<any>(url);
  }

  releaseOrder(site: ISite, id: number):  Observable<any>  {

    const controller = "/POSOrders/"

    const endPoint  = "releaseOrder"

    const parameters = `?ID=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
  }

  getOrder(site: ISite, id: string, history: boolean):  Observable<IPOSOrder>  {

    if (history === undefined) {history = false};
    const deviceName = localStorage.getItem('devicename')

    const controller = "/POSOrders/"

    const endPoint  = "GetPOSOrder"

    const parameters = `?ID=${id}&history=${history}&deviceName=${deviceName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);

  }


  getOrderByTableUUID(site: ISite, UUID: string):  Observable<IPOSOrder>  {

    // const deviceName = localStorage.getItem('devicename')

    const controller = "/POSOrders/"

    const endPoint  = "getOrderByTableUUID"

    const parameters = `?UUID=${UUID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);

  }

  mergeOrders(site: ISite, list: IPOSOrder[]) {
    const controller = "/POSOrders/"

    const endPoint  = "mergeOrders"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`
    console.log(list)
    return this.http.put<any>(url, list);
  }

  refundOrder(site: ISite, item: ItemWithAction):  Observable<OrderActionResult>  {

    const deviceName = localStorage.getItem('devicename')

    const controller = "/POSOrders/"

    const endPoint  = "refundOrder"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<OrderActionResult>(url, item);

  }

  refundItem(site: ISite, item: ItemWithAction):  Observable<OrderActionResult>  {

    const deviceName = localStorage.getItem('devicename')

    const controller = "/POSOrderItems/"

    const endPoint  = "refunditems"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<OrderActionResult>(url, item);

  }

  refundPayment(site: ISite, item: ItemWithAction):  Observable<IPOSOrder>  {

    const deviceName = localStorage.getItem('devicename')

    const controller = "/POSOrders/"

    const endPoint  = "refundItem"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPOSOrder>(url, item);

  }

  postOrderWithPayload(site: ISite, orderPayload: OrderPayload):  Observable<IPOSOrder>  {

    //get default settings

    const controller = "/POSOrders/"

    const endPoint  = "postOrderWithPayload"

    const parameters = ``
    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPOSOrder>(url, orderPayload).pipe( switchMap (
      data => {

        if (!data || +data.id == 0) {
          this.siteService.notify(`Order was not submitted`, "Error", 2000, 'yellow' )
          return of(null)
        }
        if (data.resultMessage){
          this.siteService.notify(`Order was not submitted ${JSON.stringify(data.resultMessage)}`, "Error", 2000, 'yellow' )
          return of(null)
        }
        return of(data)
      })
    )

  }

  postNewDefaultOrder(site: ISite, orderPayload: OrderPayload):  Observable<IPOSOrder>  {

    //get default settings
    const controller = "/POSOrders/"

    const endPoint  = "PostNewDefaultOrder"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPOSOrder>(url, orderPayload);

  }

    ///takes the clientID and submits a new POS order of Default Transaction Type.
  //posts a check in in store.
  getNewDefaultCheckIn(site: ISite, clientID: any): Observable<IPOSOrder> {
    console.log('getNewDefaultCheckIn', clientID)
    const controller = '/POSOrders/'

    const endPoint  = 'getNewCheckIn'

    const parameters = `?clientID=${clientID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url)

  }

  ///takes the clientID and submits a new POS order of Default Transaction Type.
  //posts a check in in store.
  getNewCheckInByServiceType(site: ISite, clientID:number, serviceType: string): Observable<IPOSOrder> {

    const controller = '/POSOrders/'

    const endPoint  = 'getNewCheckIn'

    const parameters = `?clientID=${clientID}&serviceType=${serviceType}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url)

  }

  postOrder(site: ISite, order: IPOSOrder):  Observable<IPOSOrder>  {

    const controller = "/POSOrders/"

    const endPoint  = "postOrder"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPOSOrder>(url, order);

  }

  putOrder(site: ISite, order: IPOSOrder):  Observable<IPOSOrder>  {

    const controller = "/POSOrders/"

    const endPoint  = "putOrder"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<IPOSOrder>(url, order);

  }

  getCurrentPOSOrder(site: ISite, posName: string): Observable<IPOSOrder> {

    const controller = '/POSOrders/'

    const endPoint  = 'GetCurrentPOSOrder'

    const parameters = `?posName=${posName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url)

  }

  getQRCodeOrder(site: ISite, tableUUID: string): Observable<IPOSOrder> {

    const controller = '/POSOrders/'

    const endPoint  = 'getQRCodeOrder'

    const parameters = `?tableUUID=${tableUUID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url)

  }

  getQROrder(site: ISite, orderCode: string): Observable<IPOSOrder> {

    const controller = '/POSOrders/'

    const endPoint  = 'getQROrder'

    const parameters = `?orderCode=${orderCode}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url)

  }


  getOrdersPrepBySearchPaged(site: ISite, POSOrderSearchModel: IPOSOrderSearchModel): Observable<POSOrdersPaged> {

    const controller =  '/POSOrders/'

    const endPoint  = 'getOrdersPagedPreStatus'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<POSOrdersPaged>(url, POSOrderSearchModel)

  }

  getOrderBySearchPaged(site: ISite, POSOrderSearchModel: IPOSOrderSearchModel): Observable<POSOrdersPaged> {

    const controller =  '/POSOrders/'

    const endPoint  = 'getOrdersPaged'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<POSOrdersPaged>(url, POSOrderSearchModel)

  }

  getCurrentOrders(site: ISite, POSOrderSearchModel: IPOSOrderSearchModel): Observable<IPOSOrder[]> {

    const controller =  '/POSOrders/'

    const endPoint  = 'getCurrentOrders'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPOSOrder[]>(url, POSOrderSearchModel)

  }

  getHistoricalOrders(site: ISite, POSOrderSearchModel: IPOSOrderSearchModel): Observable<IPOSOrder[]> {

    const controller = '/POSOrders/'

    const endPoint  = 'GetHistoricalOrders'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPOSOrder[]>(url, POSOrderSearchModel)

  }

  async getCurrentOrderID(): Promise<any> {

  }

  deleteCheckInsOfClient(site: ISite, clientID: number): any {

    const controller = '/POSOrders/'

    const endPoint  = "DeleteCheckIns"

    const parameters = `?clientID=${clientID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

      this.http.get<any>(url).subscribe(
        data => {
          return data
        },
        catchError => {
          return catchError
        }
      )
  }

  deleteOrder(site: ISite, id: number)   : Observable<any> {

      const controller = "/POSOrders/";

      const endPoint = "deleteOrder";

      let productPostOrderItem = {} as IProductPostOrderItem;

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.get<any>( url )

  }

  voidOrder(site: ISite,item: ItemWithAction) : Observable<any>  {

    const controller = "/POSOrders/";

    const endPoint = "VoidOrder";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>( url, item )
  }


  getCountOfPendingOrdersByClient(site: ISite, clientID: number): Observable<any> {

    const controller = "/PurchaseOrders1/";

    const endPoint = "GetCountOfPendingOrdersByClient";

    const parameters = `?clientID=${clientID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>( url )

  }

  changeOrderType(site: ISite, id: number, orderTypeID: number, updateItems: boolean): Observable<IPOSOrder> {

    const controller = "/POSOrders/";

    const endPoint = "changeOrderType";

    const parameters = `?id=${id}&orderTypeID=${orderTypeID}&updateItems=${updateItems}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>( url )

  }

  notificationEvent(description, title){
    this._SnackBar.open ( description, title , {
      duration: 2000,
      verticalPosition: 'top'
    })
  }

}
