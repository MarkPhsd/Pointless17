import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProductPostOrderItem, IServiceType, ISite, IUserProfile }   from 'src/app/_interfaces';
import { IOrdersPaged, IPOSOrder, IPOSOrderSearchModel, PosOrderItem,  } from 'src/app/_interfaces/transactions/posorder';
import { IPagedList } from '../system/paging.service';
import { IItemBasic } from '../menu/menu.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor,  } from '@capacitor/core';
import { StringDecoder } from 'node:string_decoder';
import { ToolBarUIService } from '../system/tool-bar-ui.service';
import { IBalanceSheet } from './balance-sheet.service';
import { PlatformService } from '../system/platform.service';
import { Router } from '@angular/router';
import { SitesService } from '../reporting/sites.service';
import { ItemWithAction } from './posorder-item-service.service';
import { AuthenticationService } from '../system/authentication.service';
import { IListBoxItem } from 'src/app/_interfaces/dual-lists';
import { IPaymentMethod } from './payment-methods.service';
import { UserAuthorizationService } from '../system/user-authorization.service';
export interface POSOrdersPaged {
  paging : IPagedList
  results: IPOSOrder[]
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

  public toggleChangeOrderType: boolean;

  get platForm() {  return Capacitor.getPlatform(); }

  //applies to order filter for POS
  private _prepStatus        = new BehaviorSubject<number>(null);
  public prepStatus$         = this._prepStatus.asObservable();
  //applies to order filter for POS
  public printerLocation    : number;
  private _printerLocation    = new BehaviorSubject<number>(null);
  public printerLocation$      = this._printerLocation.asObservable();
  //applies to order filter for POS
  private _viewOrderType      = new BehaviorSubject<number>(null);
  public viewOrderType$       = this._viewOrderType.asObservable();

  private _posSearchModel     = new BehaviorSubject<IPOSOrderSearchModel>(null);
  public posSearchModel$      = this._posSearchModel.asObservable();

  private _posOrders          = new BehaviorSubject<IPOSOrder[]>(null);
  public posOrders$           = this._posOrders.asObservable();

  private _currentOrder       = new BehaviorSubject<IPOSOrder>(null);
  public currentOrder$        = this._currentOrder.asObservable();
  public currentOrder         = {} as IPOSOrder

  private _bottomSheetOpen    = new BehaviorSubject<boolean>(null);
  public bottomSheetOpen$     = this._bottomSheetOpen.asObservable();


  isApp                       = false;
  private orderClaimed                : boolean;

  getCurrentOrder() {
    if (!this.currentOrder) {
      this.currentOrder = this.getStateOrder();
    }
    return this.currentOrder;
  }

  get IsOrderClaimed() { return this.orderClaimed};



  updateBottomSheetOpen(open: boolean) {
    this._bottomSheetOpen.next(open);
  }

  updateViewOrderType(value: number) {
    this._viewOrderType.next(value)
  }

  updatePrepStatus(value: number) {
    this._prepStatus.next(value);
  }

  updateOrderPrinterLocation(value: number) {
    this.printerLocation = value;
    this._printerLocation.next(value)
  }

  updateOrderSubscriptionClearOrder(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.releaseOrder(site, id).subscribe()
    }
    this.clearOrderSubscription()
  }

  clearOrderSubscription() {
    localStorage.removeItem('orderSubscription')
    this.toolbarServiceUI.updateOrderBar(false)
    this.updateOrderSubscription(null);
  }

  updateOrderSubscriptionLoginAction(order: IPOSOrder) {
    this._currentOrder.next(order);
    this.currentOrder = order;
    if (order == null) {
      order = this.getStateOrder();
      if (order) {
        return;
      }
    }
  }

  updateOrderSubscription(order: IPOSOrder) {
    this._currentOrder.next(order);
    if (order == null) {
      order = this.getStateOrder();
      if (order) {
        this.toolbarServiceUI.updateOrderBar(false)
        return;
      }
    }

    this.currentOrder = order;
    this.orderClaimed = false;
    this.setStateOrder(order);

    const site = this.siteService.getAssignedSite();
    if (order && order.id) {
      const order$ = this.claimOrder(site, order.id.toString(), order.history)
      if (!order$) {
        this.orderClaimed = false;
        return
      }
      order$.subscribe(result => {
        this.orderClaimed = true;
      });

    }
  }

  setStateOrder(order) {
    const orderJson = JSON.stringify(order);
    localStorage.setItem('orderSubscription', orderJson);
  }

  getStateOrder(){
    const order = localStorage.getItem('orderSubscription');
    return JSON.parse(order) as IPOSOrder;
  }


  updateOrderSearchModel(searchModel: IPOSOrderSearchModel) {
    this._posSearchModel.next(searchModel);
  }

  constructor(
        private platFormService: PlatformService,
        private http: HttpClient,
        private _SnackBar: MatSnackBar,
        private toolbarServiceUI: ToolBarUIService,
        private router: Router,
        private siteService: SitesService,
        private userAuthorizationService: UserAuthorizationService,
        private authorizationService: AuthenticationService,
    )
  {
    this.isApp = this.platFormService.isApp()
    const order = this.getStateOrder();
    if (order) {
      this.updateOrderSubscription(order)
    }
  }

  setPOSName(name: string): boolean {

    console.log('name.length <= 5', name.length)
    if (name.length) {

      if (name.length <= 5) {
        localStorage.setItem(`devicename`, name)
        console.log('set name', name);


        if (localStorage.getItem(`devicename`) === name  ) {
          return true
        } else {
          return false
        }
      }
    } else {
      localStorage.removeItem('devicename');
      return false
    }
  }

  get posName(): string { return localStorage.getItem("devicename") };

  applyItemsToGroup(site: ISite, groupID: number, selectedItems: any) :  Observable<any>  {
    const controller = "/POSOrders/"

    const endPoint  = "applyItemsToGroup"

    const parameters = `?groupID=${groupID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, selectedItems);
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



  completeOrder(site: ISite , id: number) {
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

  claimOrder(site: ISite, id: string, history: boolean):  Observable<any>  {

    if (this.userAuthorizationService.user.username === 'Temp') {
      return;
    }
    if (history === undefined) {history = false};
    if (history) { return }

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

    return this.http.post<IPOSOrder>(url, orderPayload);

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

  //////////////////async await functions.
  newDefaultOrder(site: ISite)  {
    if (!site)        {  return }
    this.newOrderWithPayload(site, null);
  }

  newOrderWithPayload(site: ISite, serviceType: IServiceType) {
    const order$ = this.newOrderWithPayloadMethod(site, serviceType )
    order$.subscribe( {
        next:  order => {
          if (order.resultMessage) {
            this.notificationEvent(`Error submitting Order ${order.resultMessage}`, "Posted")
            return
          }
          this.setActiveOrder(site, order)
          this.navToMenu();
        },
        error:  catchError => {
          this.notificationEvent(`Error submitting Order # ${catchError}`, "Posted")
        }
      }
    )
  }


  newOrderWithPayloadMethod(site: ISite, serviceType: IServiceType): Observable<IPOSOrder> {
    if (!site) { return }
    const orderPayload = this.getPayLoadDefaults(serviceType)
    return  this.postOrderWithPayload(site, orderPayload)
  }

  newOrderFromTable(site: ISite, serviceType: IServiceType, uuID: string, floorPlanID: number, name: string): Observable<IPOSOrder> {
    if (!site) { return }
    let orderPayload = this.getPayLoadDefaults(serviceType)
    if (!orderPayload.order) {
      orderPayload.order = {} as IPOSOrder
    }
    orderPayload.order.tableUUID = uuID;
    orderPayload.order.floorPlanID = floorPlanID;
    orderPayload.order.customerName = name;
    orderPayload.order.tableName = name;
    return  this.postOrderWithPayload(site, orderPayload)
  }

  navToMenu() {
    if (this.router.url != '/app-main-menu'){
      if (this.router.url.substring(0, '/menuitems-infinite'.length) != '/menuitems-infinite') {
         this.router.navigate(['/app-main-menu']);
        return
      }
    }
  }

  getPayLoadDefaults(serviceType: IServiceType): OrderPayload {
    const orderPayload = {} as OrderPayload;
    orderPayload.client = null;
    orderPayload.serviceType = serviceType;
    orderPayload.deviceName = this.getCurrentAssignedBalanceSheetDeviceName();
    const order = {} as IPOSOrder;
    order.deviceName =  orderPayload.deviceName;
    order.employeeID = +this.getEmployeeID();
    orderPayload.order = order
    return orderPayload
  }

  getEmployeeID(): number {
    const id = +this.authorizationService?.userValue?.id;
    // const id = localStorage.getItem('employeeIDLogin')  ;
    console.log('employeeIDLogin', id)
    if (id) {
      return +id
    }
    return  0
  }

  getCurrentAssignedBalanceSheetDeviceName(): string {
    try {
      if (localStorage.getItem('devicename')) {
        return localStorage.getItem('devicename')
      }
    } catch (error) {

      return '';
    }
  }

  setActiveOrder(site, order: IPOSOrder) {
    if (order) {
      this.updateOrderSubscription(order)
      this.toolbarServiceUI.updateOrderBar(true)
      if (!order.history && this.platFormService.isApp()) {
        this.toolbarServiceUI.showSearchSideBar()
        return
      }
    }
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
