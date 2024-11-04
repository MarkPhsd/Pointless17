import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, catchError, of, switchMap, } from 'rxjs';
import { ISite, IUser, ProductPrice }   from 'src/app/_interfaces';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { Capacitor } from '@capacitor/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { IMenuItem } from '../../_interfaces/menu/menu-products';
import { IPurchaseOrderItem } from '../../_interfaces/raw/purchaseorderitems';
import { IInventoryAssignment,Serial } from '../inventory/inventory-assignment.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { ScaleInfo, ScaleService } from '../system/scale-service.service';
import { POSItemSearchModel } from '../reporting/reporting-items-sales.service';
import { IPagedList } from '../system/paging.service';
import { SitesService } from '../reporting/sites.service';

export interface OrderItemHistory {
    id: number;
    productId?: number | null;
    orderId?: number | null;
    sku: string;
    productName: string;
    quantity?: number | null;
    discount?: number | null;
    unitPrice?: number | null;
    wholeSale?: number | null;
    modifierNote: string;
    unitType?: number | null;
    tax1?: number | null;
    serviceTypeId?: number | null;
    employeeId?: number | null;
    zrun: string;
    clientId?: number | null;
    reportRunId?: number | null;
    itemReturn?: number | null;
    originalPrice?: number | null;
    serverName: string;
    serviceType: string;
    tax2?: number | null;
    tax3?: number | null;
    wicebt?: number | null;
    caseQty?: number | null;
    stdRetail?: number | null;
    itemCashDiscount?: number | null;
    itemOrderCashDiscount?: number | null;
    itemOrderPercentageDiscount?: number | null;
    itemLoyaltyPointCount?: number | null;
    itemLoyaltyPointDiscount?: number | null;
    itemPercentageDiscountValue?: number | null;
    itemOrderPercentageDiscountId?: number | null;
    itemOrderCashDiscountId?: number | null;
    itemCashDiscountId?: number | null;
    itemPercentageDiscountValueId?: number | null;
    itemLoyaltyPointDiscountId?: number | null;
    unitName: string;
    serialCode: string;
    prodModifierType?: number | null;
    printed?: Date | null;
    isWeightedItem?: number | null;
    quantityView: string;
    positiveNegative?: number | null;
    orderDate?: Date | null;
    completionDate?: Date | null;
    voidReason: string;
    idRef?: number | null;
    promptGroupId?: number | null;
    traceProductCount?: number | null;
    subTotal?: number | null;
    total?: number | null;
    taxTotal?: number | null;
    seedCount?: number | null;
    plantCount?: number | null;
    liquidCount?: number | null;
    solidCount?: number | null;
    concentrateCount?: number | null;
    extractCount?: number | null;
    combinedCategory?: number | null;
    gramCount?: number | null;
    portionValue: string;
    packagingMaterial: string;
    scheduleId?: number | null;
    scheduleDiscount_GroupValue?: number | null;
    isSchedule_DiscountMember?: number | null;
    isSchedule_DiscountedItem?: number | null;
    discountScheduleId?: number | null;
    itemPrepped?: Date | null;
    printLocation?: number | null;
    splitGroupId?: number | null;
    gratuity?: number | null;
    prodSecondLanguage: string;
    productSortOrder?: number | null;
    pizzaMultiplier?: number | null;
    pizzaGroup?: number | null;
    priceTierId?: number | null;
    pg_PromptSubGroupsId?: number | null;
    rewardGroupApplied?: number | null;
    unitMultiplier?: number | null;
    baseUnitType: string;
    baseUnitTypeId?: number | null;
    category: string;
    department: string;
    productCount?: number | null;
    historyItem: number;
    name: string;

    useType: string;
    categoryId?: number | null;
    departmentId?: number | null;
    itemTypeId?: number | null;
    traceOrderDate: string | null;
    cashDiscountValue: number | null;
    color: string | null;
}

export interface OrderItemHistorySearch  {
  results: OrderItemHistory[]
  paging: IPagedList;
  errorMessage: string;
}

export interface IOrderItemSearchModel {
  completionDate_From:         string;
  completionDate_To:           string;
  orderDate_From:              string;
  orderDate_To:                string;
  serviceTypes:                string[];
  serviceType:                 string;
  serviceTypeID:               number;
  employeeID:                  number;
  pageSize:                    number;
  pageNumber:                  number;
  pageCount:                   number;
  currentPage:                 number;
  lastPage:                    number;
  useNameInAllFieldsForSearch: boolean;
  clientID:                    number;
  orderID                      :number;
  id:                          number;
  zrun                         : number;
  reportRunID                  : number;
  name                         : string;
  itemTypeID                   : number;
  historyItem                  : boolean;
  voidedItem                   : boolean;
}

export interface ItemPostResults {
  order            : IPOSOrder;
  menuItem         : IMenuItem[];
  ageCheckPass     : boolean;
  expirationPass   : boolean;
  inventory        : IInventoryAssignment;
  posItem          : IPurchaseOrderItem;
  posItemMenuItem  : IMenuItem;
  serial           : Serial;
  scanResult       : boolean;
  inventoryResults : InventoryResults
  serialResults    : InventoryResults;
  itemTypeIsNothing: boolean;
  resultErrorDescription: string;
  menuItemWithPrice: IMenuItem
  message:           string;
  priceCategoryID   : number;
  quantity: number
 }

 export interface  InventoryResults {
  serial           : Serial;
  inventory        : IInventoryAssignment;
  overSell         : boolean;
  overSellAmount   : boolean;
  itemNotFound     : boolean;
  countUsed        : number;
 }

 export interface ApplySerialAction {
   id        : number;
   serialCode: string;
   overRide  : boolean;
 }

export interface NewItem            {
  orderID: number,
  quantity: number,
  menuItem: IMenuItem,
  barcode: string,
  weight: number,
  portionValue: string,
  packaging: string,
  itemNote: string,
  deviceName: string,
  passAlongItem: any,
  order: IPOSOrder;
  clientID: number;
  priceColumn: number;
  assignedPOSItems:  PosOrderItem[];
  unitTypeID: number;
  price?: ProductPrice; // the real assingment
  productPrice?: ProductPrice; // temporary assignment - used in customer menu.
  wholesale: number;
  groupName: string;
}


export interface NewInventoryItem   { orderID: number, quantity: number, menuItem: IInventoryAssignment, barcode: string,  weight: number, portionValue: string, packaging: string,  itemNote: string}
export interface NewSerializedItem  { orderID: number, quantity: number, menuItem: Serial, barcode: string,  weight: number, portionValue: string, packaging:string,  itemNote: string}

// Public Property OrderID As Integers
// Public Property ItemID As Integer
// Public Property MenuItem As MenuItem
// Public Property Quantity As Decimal
// Public Property Barcode As String
// Public Property OverRide As Boolean
// Public Property Weight As Double
// Public Property POSOrderItem As POSOrderItem
// Public Property PassAlongItem As POSOrderItem
// Public Property ErrorMessage As String
// Public Property Price As ProductPrice
// Public Property Packaging As String
// Public Property PortionValue As String

enum actions {
  void = 1,
  priceAdjust = 2,
  note = 3,
  SaleAuth = 4,
  refund = 10,
  refundTypeTwo = 11,
}

export interface ItemWithAction {
  posItem           : PosOrderItem;
  action            : actions;
  voidReasonID      : number;
  returnToInventory : boolean;
  voidReason        : string;
  id                : number;
  resultMessage     : string;
  result            : boolean;
  typeOfAction      : string;
  items             : PosOrderItem[];
  order             : IPOSOrder;
  menuItem          : IMenuItem;
  orderId           : number;
  quantity: number;
  deviceName: string;
}

@Injectable({
  providedIn: 'root'
})

export class POSOrderItemService {



  get platForm()              {  return Capacitor.getPlatform(); }

  private _posOrderItem       = new BehaviorSubject<PosOrderItem>(null);
  public posOrderItem$        = this._posOrderItem.asObservable();
  isApp : boolean

  private _itemWithActions       = new BehaviorSubject<ItemWithAction>(null);
  public itemWithAction$        = this._itemWithActions.asObservable();

  _scaleInfo: Subscription;
  scaleInfo : ScaleInfo;

  private _searchModel          = new BehaviorSubject<IOrderItemSearchModel>(null);
  public searchModel$           = this._searchModel.asObservable();

  updateSearchModel(searchModel: IOrderItemSearchModel) {
    // console.log('searchmode', searchModel)
    this._searchModel.next(searchModel);
  }

  updateItemWithAction(item: ItemWithAction ) {
    this._itemWithActions.next(item);
  }

  updatePOSItemSubscription(item: PosOrderItem) {
    item.pizzaMultiplier
    this._posOrderItem.next(item);
  }

  initScaleInfoSubscription() {
    this._scaleInfo = this.scaleService.scaleInfo$.subscribe(data =>
      this.scaleInfo = data
    )
  }

  constructor(
    private http                : HttpClient,
    private _SnackBar           : MatSnackBar,
    private scaleService        : ScaleService,
    private siteService         : SitesService,
    )
  {

    if ( this.platForm  === "Electron" || this.platForm === "android" || this.platForm === "capacitor")
    { this.isApp = true }

    this.initScaleInfoSubscription() ;

  }

  getNewItemWeight(newItem: any) {
    if (this.scaleInfo) {
      const scaleInfo = this.scaleInfo
      if  (scaleInfo) {
        let weight = +scaleInfo.value;
        if (weight && weight != 0){
          newItem.weight = weight;
          newItem.quantity = 1;
        }
      }
    }
    return newItem;
  }

  setSortedItems(site: ISite, itemsList: PosOrderItem[]) : Observable<string>{

    const controller = "/POSOrderItems/"

    const endPoint  = "setSortedItems"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, itemsList );
  }

  postInventoryAction(site: ISite, arg1: { posItem: PosOrderItem; action: string; }) {

    const controller = "/POSOrderItems/"

    const endPoint  = "postInventoryAction"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, arg1 );
  }

  setInventoryId(site: ISite, item: { id: number; inventoryID: number; }) :  Observable<any> {

    const controller = "/POSOrderItems/"

    const endPoint  = "setInventoryId"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item );

}

  setModifierNote(site: ISite, item: { id: number; modifierNote: string; }) :  Observable<any> {

      const controller = "/POSOrderItems/"

      const endPoint  = "setModifierNotes"

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.post<any>(url, item );

  }

  addItemToOrderWithBarcode(site: ISite, newItem: NewItem):  Observable<ItemPostResults> {

    if (!newItem ) {
      // console.log('no item for add item to order with barcode')
      return
    }

    if (newItem.quantity == 1) {
      newItem = this.getNewItemWeight(newItem);
    }

    if (newItem.productPrice) { newItem.price = newItem.productPrice}

    // console.log('new Item', newItem )
    const controller = "/POSOrderItems/"

    const endPoint  = "PostUniqueBarcodeItem"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // console.log('url', url, newItem)
    return this.http.post<ItemPostResults>(url, newItem );

  }

  appylySerial(site: ISite, id: number, serialCode: string, user: IUser): Observable<ItemPostResults> {

    const item = {} as ApplySerialAction
    item.id = id;
    item.serialCode = serialCode;

    const controller = "/POSOrderItems/"

    const endPoint  = "applySerial"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<ItemPostResults>(url, item);

  }

   postItemWithBarcode(site: ISite, newItem: NewItem): Observable<ItemPostResults> {

    newItem =  this.getNewItemWeight(newItem);

    const controller = "/POSOrderItems/";

    const endPoint = "PostItemWithBarcode";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ItemPostResults>(url , newItem)

  }

  postItem(site: ISite, newItem: any): Observable<ItemPostResults> {

    if (newItem && newItem.productPrice) { newItem.price = newItem.productPrice}

    newItem = this.getNewItemWeight(newItem);

    // console.log(newItem);

    const controller = "/POSOrderItems/";

    const endPoint = "PostItem";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ItemPostResults>(url , newItem)

  }


  buyItemUpdate(site: ISite, data: IPurchaseOrderItem) {
    const controller = "/POSOrderItems/";

    const endPoint = "buyItemUpdate";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IPurchaseOrderItem>(url , data)
  }


  getItemsHistoryBySearch(site: ISite, search: IOrderItemSearchModel): Observable<OrderItemHistorySearch> {
    const controller = "/POSOrderItems/";

    const endPoint = "GetItemsHistoryBySearch";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<OrderItemHistorySearch>(url , search)
  }


  getItemHistoryBySearch(site: ISite, search: IOrderItemSearchModel): Observable<OrderItemHistorySearch> {
    const controller = "/POSOrderItems/";

    const endPoint = "GetItemHistoryBySearch";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<OrderItemHistorySearch>(url , search)
  }


  putItem(site: ISite, newItem: any): Observable<ItemPostResults> {

    newItem = this.getNewItemWeight(newItem);

    const controller = "/POSOrderItems/";

    const endPoint = "PutItem";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<ItemPostResults>(url , newItem)

  }


  putItemNoWeight(site: ISite, newItem: any): Observable<ItemPostResults> {

    const controller = "/POSOrderItems/";

    const endPoint = "PutItem";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<ItemPostResults>(url , newItem)

  }

  setItemPrep(site: ISite, item: PosOrderItem): Observable<PosOrderItem> {

    const controller = "/POSOrderItems/";

    let endPoint = "SetItemAsPrepped";
    if (item.itemPrepped) {  endPoint = "SetItemAsUnPrepped" }

    const parameters = `?id=${item.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<PosOrderItem>(url)

  }

  setItemsAsPrepped(site: ISite, orderID: number, printLocation: number): Observable<any> {

    const controller = "/POSOrderItems/";

    let endPoint = "SetItemsAsPrepped";

    const parameters = `?OrderID=${orderID}&PrintLocation=${printLocation}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  setOneItemFromGroupAsPrepped(site: ISite, id: number, startDate: string, endDate: string): Observable<any> {

    const controller = "/POSOrderItems/";

    let endPoint = "setOneItemFromGroupAsPrepped";

    const parameters = `?id=${id}&startDate=${startDate}&endDate=${endDate}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }


  setItemGroupAsPrepped(site: ISite, id: number, startDate: string, endDate: string): Observable<any> {

    const controller = "/POSOrderItems/";

    let endPoint = "setItemGroupAsPrepped";

    const parameters = `?id=${id}&startDate=${startDate}&endDate=${endDate}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }


  setItemAsUnPrinted(site: ISite, item: PosOrderItem): Observable<PosOrderItem> {

    const controller = "/POSOrderItems/";

    const endPoint = "SetItemAsUnPrinted";

    const parameters = `?id=${item.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<PosOrderItem>(url)

  }

  postPromptItems(site: ISite, iPrompt: IPromptGroup): Observable<IPromptGroup> {

    const controller = "/POSOrderItems/";

    const endPoint = "postPromptItems";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPromptGroup>(url , iPrompt)

  }

  getPOSOrderItem(site: ISite, id: number):  Observable<PosOrderItem> {

    const controller = "/POSOrderItems/"

    const endPoint  = "getPOSOrderItem"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`
    // console.log(url)
    return this.http.get<PosOrderItem>(url);

  }

  getPOSOrderItembyHistory(site: ISite, id: number, history: boolean):  Observable<PosOrderItem> {

    const controller = "/POSOrderItems/"

    const endPoint  = "getPOSOrderItembyHistory"

    const parameters = `?id=${id}&history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`
    // console.log(url)
    return this.http.get<PosOrderItem>(url);

  }

  getPOSOrderItems(site: ISite):  Observable<PosOrderItem> {

    const controller = "/POSOrderItems/"

    const endPoint  = "getPOSOrderItems"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<PosOrderItem>(url);

  }

  //modify item
  changeModifierNote(site: ISite, posOrderItem: PosOrderItem): Observable<IPOSOrder> {

    const controller = "/POSOrderItems/";

    const endPoint = "changeModifierNote";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPOSOrder>(url , posOrderItem)

  }

  setItemStoreCreditInfo(site: ISite, item: IPurchaseOrderItem): Observable<IPurchaseOrderItem> {

    const controller = "/POSOrderItems/";

    const endPoint = "setItemStoreCreditInfo";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPurchaseOrderItem>(url , item)

  }

  changeItemPrice(site: ISite, posOrderItem: PosOrderItem): Observable<IPOSOrder> {

    const controller = "/POSOrderItems/";

    const endPoint = "changeItemPrice";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const payLoad = { posOrderItem: posOrderItem, menuItem: null}

    return  this.http.post<IPOSOrder>(url, payLoad)

  }

  changeItemSubTotal(site: ISite, posOrderItem: PosOrderItem): Observable<IPOSOrder> {

    // const result = this.validateItemchange(posOrderItem)
    // if (!result) {
    //   this.notificationEvent(`Error ${result}`, 'Failure' )
    //   return
    // }

    const controller = "/POSOrderItems/";

    const endPoint = "changeItemSubTotal";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const payLoad = { posOrderItem: posOrderItem, menuItem: null}

    return  this.http.post<IPOSOrder>(url, payLoad)

  }

  changeItemCost(site: ISite, posOrderItem: PosOrderItem): Observable<IPOSOrder> {

    const controller = "/POSOrderItems/";

    const endPoint = "changeItemCost";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    let order$ =  this.http.post<IPOSOrder>(url, posOrderItem).pipe(
      switchMap(data => {
        return of(data)
      }),
      catchError(data => {
        this.siteService.notify('Error' + JSON.stringify(data), 'close', 5000)
        let order = {} as IPOSOrder
        order.errorMessage =  JSON.stringify(data)
        return of(order)
      }))
    return order$

  }

  changeItemTotalCost(site: ISite, posOrderItem: PosOrderItem): Observable<IPOSOrder> {

    // const result = this.validateItemchange(posOrderItem)
    // if (!result) {
    //   this.notificationEvent(`Error ${result}`, 'Failure' )
    //   return
    // }

    // console.log('posOrderItem wholeSaleCost', posOrderItem.wholeSaleCost)
    const controller = "/POSOrderItems/";

    const endPoint = "changeTotalCost";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const payLoad = { posOrderItem: posOrderItem, menuItem: null}

    return  this.http.post<IPOSOrder>(url, payLoad)

  }

  changeItemValues(site: ISite, posOrderItem: PosOrderItem): Observable<IPOSOrder> {

    const controller = "/POSOrderItems/";

    const endPoint = "changeItemValues";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPOSOrder>(url, posOrderItem)

  }

  changeItemQuantityReconcile(site: ISite, item: PosOrderItem): Observable<IPOSOrder> {

    const controller = "/POSOrderItems/";

    const endPoint = "changeItemQuantityReconcile";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPOSOrder>(url, item)

  }

  applyItemPerDiscount(site: ISite, item: PosOrderItem, list: PosOrderItem[]) {

    const controller = "/POSOrderItems/";

    const endPoint = "applyItemPerDiscount";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const payLoad = { posOrderItem: item, list: list }

    return  this.http.post<IPOSOrder>(url, payLoad)

  }


  changeItemQuantity(site: ISite, posOrderItem: PosOrderItem): Observable<IPOSOrder> {

    // const result = this.validateItemchange(posOrderItem)
    // if (!result) {
    //   this.notificationEvent(`Error ${result}`, 'Failure' )
    //   return
    // }

    const controller = "/POSOrderItems/";

    const endPoint = "ChangeItemQuantity";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const payLoad = { posOrderItem: posOrderItem, menuItem: null}

    return  this.http.post<IPOSOrder>(url, payLoad)

  }


  removeOrderDiscount(site: ISite, id: number): Observable<IPOSOrder> {

    const controller = "/POSOrderItems/";

    const endPoint = "removeOrderDiscount";

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IPOSOrder>(url)

  }

  removeItemDiscount(site: ISite, posOrderItem: PosOrderItem, menuItem: IMenuItem): Observable<IPOSOrder> {

    const controller = "/POSOrderItems/";

    const endPoint = "removeItemDiscount";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const payLoad = { posOrderItem: posOrderItem }

    return  this.http.post<IPOSOrder>(url, payLoad)

  }

  getPurchaseOrderItem(site: ISite, id: number): Observable<IPurchaseOrderItem> {

    const controller = "/POSOrderItems/";

    const endPoint = "getItem";

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IPurchaseOrderItem>(url)

  }


  getPurchaseOrderItemHistory(site: ISite, id: number): Observable<IPurchaseOrderItem> {

    const controller = "/POSOrderItems/";

    const endPoint = "GetItemHistory";

    const parameters = `?id=${id}&history=true`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IPurchaseOrderItem>(url)

  }


  deletePOSOrderItems(site: ISite, orderID: number, selected: any): Observable<ItemPostResults> {
    const controller = "/POSOrderItems/"

    const endPoint = "DeleteItems"

    const parameters = `?orderID=${orderID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ItemPostResults>(url, {list: selected} ).pipe(switchMap(data => {
      return of(data)
    }),catchError(data => {
      console.log('error')
      return of(null)
    }))
  }


  deletePOSOrderItem(site: ISite, id: number, orderID: number): Observable<ItemPostResults> {

    const controller = "/POSOrderItems/"

    const endPoint = "DeleteItemv2"

    const parameters = `?id=${id}&orderID=${orderID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<ItemPostResults>(url).pipe(switchMap(data => {
      return of(data)
    }),catchError(data => {
      console.log('error')
      return of(null)
    }))

  }

  setItemAsPrinted( site: ISite, item: PosOrderItem ) : Observable<any> {

    // console.log('setItemAsPrinted')

    const controller = "/POSOrderItems/";

    const endPoint = "setItemAsPrinted";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<any>(url , item);
  }

   setUnPrintedItemsAsPrinted( site: ISite, orderID: number ) : Observable<any> {

    const controller = "/POSOrderItems/";

    const endPoint = "SetUnPrintedItemsAsPrinted"

    const parameters = `?id=${orderID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url);
  }

  voidPOSOrderItem(site: ISite, item: ItemWithAction ): Observable<string> {

    // if (item.posItem.voidReason)  {
    //   console.log('item.void reason', item.posItem.voidReason)
    //   this.notificationEvent(`Item already voided: ${item.voidReason}`, 'Item Voided')
    //   return
    // }

    const deviceName = localStorage.getItem('devicename')
    item.deviceName = deviceName;
    const controller = "/POSOrderItems/"

    const endPoint = "VoidItem"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<string>(url, item)

  }

  notificationEvent(description, title){
    this._SnackBar.open ( description, title , {
      duration: 2000,
      verticalPosition: 'top'
    })
  }

  validateItemchange(item: PosOrderItem) {

    if (item.printed) {
      return 'Item has been printed'
    }
    return
  }
}

// }

// updateItemQuantity( quantity:number) {
//   if (!this.printed){
//     if (this.orderItem) {
//       const site = this.siteService.getAssignedSite()
//       if (!this.orderItem ) {
//         this.notifyEvent(`Order Item not found so not changed.` , 'Thank You')
//          return
//       }

//       if (!this.menuItem) {
//         this.notifyEvent(`Menu Item not found so not changed.` , 'Thank You')
//          return
//       }

//       let item$ = this.posOrderItemService.changeItemQuantity(site, this.orderItem, this.menuItem)
//       item$.subscribe(data => {
//         if (!data.resultMessage) {
//           this.notifyEvent(`The quantity has not been changed. Is the item n inventory item? If so another item must be added on the order.` , 'Thank You')
//         }
//       }, err => {
//         this.notifyEvent('An error occured, ' + err, 'Failed')
//       }
//       )
//     }
//   }
// }
