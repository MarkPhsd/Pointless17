import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProductPostOrderItem, IServiceType, ISite, IUserProfile }   from 'src/app/_interfaces';
import { IPOSOrder, IPOSOrderSearchModel,  } from 'src/app/_interfaces/transactions/posorder';
import { IPagedList } from '../system/paging.service';
import { IItemBasic } from '../menu/menu.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor,  } from '@capacitor/core';
import { StringDecoder } from 'node:string_decoder';
import { ToolBarUIService } from '../system/tool-bar-ui.service';

export interface POSOrdersPaged {
  paging : IPagedList
  results: IPOSOrder[]
}

export interface OrderPayload {
  userID: number;
  serviceType : IServiceType;
  deviceName  : string;
  client      : IUserProfile;
  orderName   : StringDecoder
  order       : IPOSOrder;
}

@Injectable({
  providedIn: 'root'
})

export class OrdersService {
  get platForm() {  return Capacitor.getPlatform(); }

  private _posSearchModel     = new BehaviorSubject<IPOSOrderSearchModel>(null);
  public posSearchModel$      = this._posSearchModel.asObservable();

  private _posOrders          = new BehaviorSubject<IPOSOrder[]>(null);
  public posOrders$           = this._posOrders.asObservable();

  private _currentOrder       = new BehaviorSubject<IPOSOrder>(null);
  public currentOrder$        = this._currentOrder.asObservable();

  private _bottomSheetOpen    = new BehaviorSubject<boolean>(null);
  public bottomSheetOpen$     = this._bottomSheetOpen.asObservable();

  isApp                       = false;

  updateBottomSheetOpen(open: boolean) {
    this._bottomSheetOpen.next(open);
  }

  updateOrderSubscription(order: IPOSOrder) {
    this._currentOrder.next(order);
  }

  updateOrderSearchModel(searchModel: IPOSOrderSearchModel) {
    this._posSearchModel.next(searchModel);
  }

  constructor(
    private http: HttpClient,
    private _SnackBar: MatSnackBar,
    private toolbarServiceUI: ToolBarUIService,
            )
  {
    if (    this.platForm  === "Electron"
         || this.platForm === "android"
         || this.platForm === "capacitor")
    { this.isApp = true }
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

  get posName(): string { return localStorage.getItem("POSName") }

    getTodaysOpenOrders(site: ISite):  Observable<IPOSOrder[]> {

      const controller = "/POSOrders/"

      const endPoint  = "GetOrdersbyPage"

      const parameters = "?pageNumber=1&pageSize=1000"

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<IPOSOrder[]>(url);

  }

  completOrder(site: ISite , id: number) {

    const controller = "/POSOrders/"

    const endPoint  = "completOrder"

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

  getOrder(site: ISite, id: string):  Observable<IPOSOrder>  {

    const controller = "/POSOrders/"

    const endPoint  = "GetPOSOrder"

    const parameters = `?ID=${id}`

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

  voidOrder(site: ISite, id: number) {
    const controller = "/POSOrders/";

    const endPoint = "VoidOrder";

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>( url )
  }


  getCountOfPendingOrdersByClient(site: ISite, clientID: number): Observable<any> {

    const controller = "/PurchaseOrders1/";

    const endPoint = "GetCountOfPendingOrdersByClient";

    const parameters = `?clientID=${clientID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>( url )

  }

  //////////////////async await functions.
  async newDefaultOrder(site: ISite): Promise<boolean>  {
    if (!site)        {  return }
    const result = await this.newOrderWithPayload(site, null)
    return result
  }

  async newOrderWithPayload(site: ISite, serviceType: IServiceType): Promise<boolean> {
    if (!site) { return }
    const orderPayload = this.getPayLoadDefaults(serviceType)
    const order$ = this.postOrderWithPayload(site, orderPayload)
    const result = await order$.pipe().toPromise()
      .then(
        order => {
          this.setActiveOrder(site, order)
          return true
        }, catchError => {
          this.notificationEvent(`Error submitting Order # ${catchError}`, "Posted")
          return false
        }
    )
    return result
  }

  getPayLoadDefaults(serviceType: IServiceType): OrderPayload {
    const orderPayload = {} as OrderPayload;
    orderPayload.client = null;
    orderPayload.serviceType = serviceType;
    const order = {} as IPOSOrder;
    order.deviceName = this.getCurrentAssignedBalanceSheetDeviceName()
    order.employeeID = parseInt(this.getEmployeeID());
    orderPayload.order = order
    return orderPayload
  }

  getEmployeeID() {
    const id = localStorage.getItem('employeeIDLogin')  ;
    console.log('employeeIDLogin', id)
    if (id) {
      return id
    }
    return '0'
  }

  getCurrentAssignedBalanceSheetDeviceName() {
    try {
      if (localStorage.getItem('currentDeviceName')) {
        return localStorage.getItem('currentDeviceName').toLowerCase();
      }
    } catch (error) {
      return '';
    }
  }

  setActiveOrder(site, order) {
    if (order) {
      this.updateOrderSubscription(order)
      this.toolbarServiceUI.updateOrderBar(true)
      return
    }
  }

  notificationEvent(description, title){
    this._SnackBar.open ( description, title , {
      duration: 2000,
      verticalPosition: 'top'
    })
  }

}
