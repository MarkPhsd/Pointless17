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

export interface POSOrdersPaged {
  paging : IPagedList
  results: IPOSOrder[]
}

export interface OrderPayload {
  userID      : number;
  serviceType : IServiceType;
  deviceName  : string;
  client      : IUserProfile;
  orderName   : StringDecoder
  order       : IPOSOrder;
}

export interface IVoidOrder {
  id: number;
  action: number;
  voidReasonID: number;
  voidReason  : string;
  returnToInventory: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class OrdersService {
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
    localStorage.removeItem('orderSubscription')
    this.toolbarServiceUI.updateOrderBar(false)
    this.updateOrderSubscription(null);
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
      this.claimOrder(site, order.id.toString(), order.history).subscribe(result => {
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
    if (name.length) {
      if (name.length >= 5) {
        const realName = name.substring(0, name.length - 4)
        localStorage.setItem(`POSName`, realName)
        if (localStorage.getItem(`POSName`) === realName  ) {
          return true
        } else {
          return false
        }
      }
    } else {
      localStorage.removeItem('POSName');
      return false
    }
  }

  get posName(): string { return localStorage.getItem("POSName") };

  applyItemsToGroup(site: ISite, groupID: number, selectedItems: any) :  Observable<any>  { 
    const controller = "/POSOrders/"

    const endPoint  = "applyItemsToGroup"

    const parameters = `?groupID=${groupID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, selectedItems);
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
    if (!site) { return }
    const orderPayload = this.getPayLoadDefaults(serviceType)
    const order$       = this.postOrderWithPayload(site, orderPayload)
    console.log('orderPayload', orderPayload)
    order$.subscribe( {
        next:  order => {
          console.log('order', order)
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
        // this.toolbarServiceUI.showSearchSideBar()
        return
      }

    }
  }

  notificationEvent(description, title){
    this._SnackBar.open ( description, title , {
      duration: 2000,
      verticalPosition: 'top'
    })
  }

}
