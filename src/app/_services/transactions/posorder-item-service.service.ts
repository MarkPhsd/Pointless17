import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, } from 'rxjs';
import { ISite, IUser }   from 'src/app/_interfaces';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { Capacitor } from '@capacitor/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IMenuItem } from '../../_interfaces/menu/menu-products';
import { IPurchaseOrderItem } from '../../_interfaces/raw/purchaseorderitems';
import { IInventoryAssignment,Serial } from '../inventory/inventory-assignment.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { ScaleInfo, ScaleService } from '../system/scale-service.service';

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
  note = 3
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
}

// firstPOSTCallToAPI('url', data).pipe(
//   concatMap(result1 => secondPOSTCallToAPI('url', result1))
//     concatMap( result2 => thirdPOSTCallToAPI('url', result2))
//      concatMap(result3 => fourthPOSTCallToAPI('url', result3))
//   ....
// ).subscribe(
//   success => { /* display success msg */ },
//   errorData => { /* display error msg */ }
// );
// if your async method does not depend on return value of the precedent async call you can use

//  concat(method(),method2(),method3()).subscribe(console.log)

@Injectable({
  providedIn: 'root'
})

export class POSOrderItemServiceService {

  get platForm() {  return Capacitor.getPlatform(); }

  private _posOrderItem       = new BehaviorSubject<PosOrderItem>(null);
  public posOrderItem$        = this._posOrderItem.asObservable();
  isApp : boolean

  private _itemWithActions       = new BehaviorSubject<ItemWithAction>(null);
  public itemWithAction$        = this._itemWithActions.asObservable();

  _scaleInfo: Subscription;
  scaleInfo : ScaleInfo;

  updateItemWithAction(item: ItemWithAction ) {
    this._itemWithActions.next(item);
  }

  updatePOSItemSubscription(item: PosOrderItem) {
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

  addItemToOrderWithBarcode(site: ISite, newItem: NewItem):  Observable<ItemPostResults> {

    if (!newItem ) {
      console.log('no item for add item to order with barcode')

      return }
    // console.log('menuItem', newItem.menuItem)
    // console.log('menuItem itemType', newItem.menuItem.itemType)

    newItem = this.getNewItemWeight(newItem);

    const controller = "/POSOrderItems/"

    const endPoint  = "PostUniqueBarcodeItem"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

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

    newItem = this.getNewItemWeight(newItem);

    const controller = "/POSOrderItems/";

    const endPoint = "PostItem";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ItemPostResults>(url , newItem)

  }

  putItem(site: ISite, newItem: any): Observable<ItemPostResults> {

    newItem = this.getNewItemWeight(newItem);

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

  setItemAsUnPrinted(site: ISite, item: PosOrderItem): Observable<PosOrderItem> {

    const controller = "/POSOrderItems/";

    const endPoint = "SetItemAsUnPrinted";

    const parameters = `?id=${item.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<PosOrderItem>(url)

  }

  postPromptItems(site: ISite, iPrompt: IPromptGroup): Observable<IPromptGroup> {
    
    const controller = "/POSOrderItems/";

    const endPoint = "PostPostPrompGroup";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPromptGroup>(url , iPrompt)

  }

  getPOSOrderItem(site: ISite, id: number):  Observable<PosOrderItem> {

    const controller = "/POSOrderItems/"

    const endPoint  = "getPOSOrderItem"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`
    console.log(url)
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

    // const result = this.validateItemchange(posOrderItem)
    // if (!result) {
    //   this.notificationEvent(`Error ${result}`, 'Failure' )
    //   return
    // }

    const controller = "/POSOrderItems/";

    const endPoint = "changeItemPrice";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const payLoad = { posOrderItem: posOrderItem, menuItem: null}

    return  this.http.post<IPOSOrder>(url, payLoad)

  }

  changeItemCost(site: ISite, posOrderItem: PosOrderItem): Observable<IPOSOrder> {

    // const result = this.validateItemchange(posOrderItem)
    // if (!result) {
    //   this.notificationEvent(`Error ${result}`, 'Failure' )
    //   return
    // }

    const controller = "/POSOrderItems/";

    const endPoint = "changeItemCost";

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

    const payLoad = { posOrderItem: posOrderItem, menuItem: menuItem }

    return  this.http.post<IPOSOrder>(url, payLoad)

  }

  getPurchaseOrderItem(site: ISite, id: number): Observable<IPurchaseOrderItem> {

    const controller = "/POSOrderItems/";

    const endPoint = "getItem";

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IPurchaseOrderItem>(url)

  }

  deletePOSOrderItem(site: ISite, id: number): Observable<ItemPostResults> {

    const controller = "/POSOrderItems/"

    const endPoint = "DeleteItem"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<ItemPostResults>(url)

  }

  setItemAsPrinted( site: ISite, item: PosOrderItem ) : Observable<any> {

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
