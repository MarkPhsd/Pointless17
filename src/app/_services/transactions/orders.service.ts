import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { IProductPostOrderItem, IServiceType, ISite, IUserProfile }   from 'src/app/_interfaces';
import { IOrdersPaged, IPOSOrder, IPOSOrderSearchModel, IReconcilePayload, OrderToFrom } from 'src/app/_interfaces/transactions/posorder';
import { IPagedList } from '../system/paging.service';
import { IItemBasic } from '../menu/menu.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Capacitor,  } from '@capacitor/core';
import { IBalanceSheet } from './balance-sheet.service';
import { SitesService } from '../reporting/sites.service';
import { ItemWithAction } from './posorder-item-service.service';
import { IListBoxItem } from 'src/app/_interfaces/dual-lists';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { POOrderImport } from '../data/fake-products.service';
import { AuthenticationService } from '..';
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
  completionDate_From  : string; // searchModel.completionDate_From;
  completionDate_To    : string; // searchModel.completionDate_To;

  get platForm() {  return Capacitor.getPlatform(); }

  constructor(
        private http: HttpClient,
        private _SnackBar: MatSnackBar,
        private siteService: SitesService,
        private authenticationService:  AuthenticationService,
        private userAuthorizationService: UserAuthorizationService,
    )
  {

  }

  deleteZeroQuantityItems(site: ISite, id: number): Observable<any> {

    const controller = "/POSOrders/"

    const endPoint  = "deleteZeroQuantityItems"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }

  scanCheckInItem(barCode: string, scanMode: boolean): Observable<IPOSOrder> {

    const site= this.siteService.getAssignedSite();

    const controller = "/POSOrderItems/"

    const endPoint  = "scanCheckInItem"

    const parameters = `?barCode=${barCode}&scanMode=${scanMode}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }

  postPurchaseOrder(site: ISite, name: string, id: number, outPutAll?: boolean) :  Observable<any> {
    const controller = "/POSOrders/"

    const endPoint  = "postPurchaseOrder"
    if (!outPutAll) { 
      outPutAll = false
    }

    const parameters = `?name=${name}&vendorID=${id}&outPutAll=${outPutAll}`

    console.log(parameters)
    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
  }

  applyReconciliation(site: ISite,id: number) :  Observable<any>  {
    const controller = "/POSOrderItems/"

    const endPoint  = "ApplyReconciliation"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
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

  releaseTable(site: ISite, uuID: string) {
    const controller = "/POSOrders/"

    const endPoint  = "releaseTable"

    const parameters = `?UUID=${uuID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
  }

  splitOrderFromGroup(site: ISite, id: number, groupID: number) {
    const controller = "/POSOrders/"

    const endPoint  = "splitOrderFromGroup"

    const parameters = `?currentOrderID=${id}&splitGroupID=${groupID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
  }


  inventoryMonitor(site: ISite, id: number) :  Observable<IPOSOrder> {
    const controller = "/POSOrders/"

    const endPoint  = "InventoryMonitor"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
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


  getRelatedSplitOrders(site: ISite, refID: number) :  Observable<IPOSOrder[]>  {
    const controller = "/POSOrders/"

    const endPoint  = "GetRelatedSplitOrders"

    const parameters = `?refID=${refID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder[]>(url);
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

  getBalanceSheetGratuityTotal(site: ISite, reportRunID: number , history: boolean)  {
    const controller = "/POSOrders/"

    const endPoint  = "getBalanceSheetGratuityTotal"

    const parameters = `?reportRunID=${reportRunID}&history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
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

  transferOrder(site: ISite, id: number, sheetID: number) :  Observable<IPOSOrder> {
    const controller = "/POSOrders/"

    const endPoint  = "transferOrder"

    const parameters = `?id=${id}&sheetID=${sheetID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }


  pOSTReconciliationOrder( site: ISite, name: string) :  Observable<IPOSOrder> {
    const controller = "/POSOrders/"

    const endPoint  = "pOSTReconciliationOrder"

    const parameters = `?name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url);
  }

  addReconciliationSection(site: ISite, item: IReconcilePayload): Observable<IPOSOrder> {

    const controller = "/POSOrders/";

    const endPoint = "AddReconciliationSection";

    const parameters = ``

    console.log(item)
    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>( url, item )

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
// this.userAuthorizationService.user.username

  claimOrder(site: ISite, id: string, history: boolean):  Observable<any>  {

    if (!this.userAuthorizationService?.user) {
      return of(null)
    }
    if (this.userAuthorizationService?.user?.username === 'Temp') {
      return of('')
    }
    if (history === undefined) {history = false};
    if (history) {
      return of('')
      return
    }

    // console.log('user', this.userAuthorizationService?.user)

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

  roundOrder(site: ISite, id: number):  Observable<IPOSOrder> {

    const controller = "/POSOrderItems/"

    const endPoint  = "roundOrder"

    const parameters = `?ID=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);

  }

  getOrder(site: ISite, id: string, history: boolean, startDate?: string, endDate?: string):  Observable<IPOSOrder>  {

    const user = this.userAuthorizationService.user;
    if (!user) {
      console.log('user is null')
      return of(null)
    }
    if (history === undefined) {history = false};

    if (this.completionDate_From && this.completionDate_To) { 
      startDate = this.completionDate_From
      endDate   = this.completionDate_To
    }

    if (!startDate) {startDate = '' }
    if (!endDate)   {endDate = '' }

    const deviceName = localStorage.getItem('devicename')

    const controller = "/POSOrders/"

    const endPoint  = "GetPOSOrderV2"

    const parameters = `?ID=${id}&history=${history}&deviceName=${deviceName}&startDate=${startDate}&endDate=${endDate}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url)

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

    let item = {} as IPOSOrder
    if (!this.authenticationService._user) { return of(item) }

    return this.http.post<IPOSOrder>(url, orderPayload).pipe( switchMap (
      data => {

        // console.log('post orer with payload', data?.resultMessage)

        if (data.resultMessage){
          this.siteService.notify(`Order was not submitted ${data?.resultMessage}`, "Error", 2000, 'yellow' )
          return of(data)
        }

        if (!data || +data.id == 0) {
          this.siteService.notify(`Order was not submitted`, "Error", 2000, 'yellow' )
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

  getQROrderAnon(site: ISite, orderCode: string): Observable<IPOSOrder> {

    const controller = '/POSOrders/'

    const endPoint  = 'getQROrderAnon'

    const parameters = `?orderCode=${orderCode}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSOrder>(url)

  }
  getOrdersPrepBySearchPaged(site: ISite, POSOrderSearchModel: IPOSOrderSearchModel): Observable<POSOrdersPaged> {

    const controller =  '/POSOrders/'

    const endPoint  = 'getOrdersPagedPreStatus'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // console.log('url', url)
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

  deleteTOrder(site: ISite, id: number, history: boolean) {
    const controller = "/POSOrders/";

    const endPoint = "deleteTOrder";

    const parameters = `?id=${id}&history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>( url )
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

  changeOrderType(site: ISite, id: number, orderTypeID: number, updateItems: boolean, history: boolean): Observable<IPOSOrder> {

    const controller = "/POSOrders/";

    const endPoint = "changeOrderTypeV2";

    const parameters = `?id=${id}&orderTypeID=${orderTypeID}&updateItems=${updateItems}&history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>( url )

  }


  getT_Order(site: ISite, id: number, history: boolean): Observable<OrderToFrom> {

    const controller = "/POSOrders/";

    const endPoint = "GetTOrder";

    const parameters = `?id=${id}&history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>( url )

  }

  putT_Order(site: ISite,  order: any, history: boolean): Observable<OrderToFrom> {

    const controller = "/POSOrders/";

    const endPoint = "PutOrder";

    const parameters = `?history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<any>( url , order)

  }

  notificationEvent(description, title){
    this._SnackBar.open ( description, title , {
      duration: 5000,
      verticalPosition: 'top'
    })
  }

}
