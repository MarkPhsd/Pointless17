import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, } from 'rxjs';
import { ISite, IUser }   from 'src/app/_interfaces';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { Capacitor } from '@capacitor/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdersService } from './orders.service';
import { IMenuItem } from '../../_interfaces/menu/menu-products';
import { IPurchaseOrderItem } from '../../_interfaces/raw/purchaseorderitems';
import { IInventoryAssignment,Serial } from '../inventory/inventory-assignment.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { ScaleInfo, ScaleService } from '../system/scale-service.service';

export interface ItemPostResults {
  order            : IPOSOrder,
  menuItem         : IMenuItem[],
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

export interface newItem            { orderID: number, quantity: number, menuItem: IMenuItem, barcode: string,  weight: number}
export interface newInventoryItem   { orderID: number, quantity: number, menuItem: IInventoryAssignment, barcode: string,  weight: number}
export interface newSerializedItem  { orderID: number, quantity: number, menuItem: Serial, barcode: string,  weight: number}


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
    private orderService        : OrdersService,
    private scaleService        : ScaleService,
    )
  {

    if ( this.platForm  === "Electron" || this.platForm === "android" || this.platForm === "capacitor")
    { this.isApp = true }

    this.initScaleInfoSubscription() ;

   }

  getNewItemWeight(newItem: any) {
    //  Not oScale.ScaleMode = "NA"
    if (this.scaleInfo) {
      const scaleInfo = this.scaleInfo
      if  (scaleInfo) {
        let weight = scaleInfo.value;
        newItem.weight = weight
      }
    }
    return newItem;
  }


  async addItemToOrder(site: ISite, newItem: any):  Promise<ItemPostResults> {
    if (newItem) {
       return await this.postItem(site, newItem).pipe().toPromise();
      //  const item$ =this.postItem(site, newItem)
      //  const item = await lastValueFrom(item$);
    }
  }

  async addItemToOrderWithBarcodePromise(site: ISite, newItem: newItem):  Promise<ItemPostResults> {
    if (newItem) {
       return await this.addItemToOrderWithBarcode(site, newItem).pipe().toPromise();
      //  const item$ =this.addItemToOrderWithBarcode(site, newItem)
      //  const item = await lastValueFrom(item$);
      //  return item
    }
  }

  scanItemForOrder(site: ISite, order: IPOSOrder, barcode: string, quantity: number): Observable<ItemPostResults> {
    if (order && barcode) {
      let newItem = { orderID: order.id, quantity: quantity, barcode: barcode } as newItem
      return this.addItemToOrderWithBarcode(site, newItem)
    }
    return null;
  }

  addItemToOrderWithBarcode(site: ISite, newItem: any):  Observable<ItemPostResults> {

    if (!newItem ) { return }

    newItem = this.getNewItemWeight(newItem);

    const controller = "/POSOrderItems/"

    const endPoint  = "PostUniquBarcodeItem"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<ItemPostResults>(url, newItem );

  }

  appylySerial(site: ISite, id: number, serialCode: string, user: IUser): Observable<ItemPostResults> {

    const item = {} as ApplySerialAction
    item.id = id;
    item.serialCode = serialCode;

    if (!user) {

    }

    const controller = "/POSOrderItems/"

    const endPoint  = "applySerial"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<ItemPostResults>(url, item);

  }

   postItemWithBarcode(site: ISite, newItem: newItem): Observable<ItemPostResults> {

    newItem =  this.getNewItemWeight(newItem);

    const controller = "/POSOrderItems/";

    const endPoint = "PostItemWithBarcode";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ItemPostResults>(url , newItem)

  }

  postItem(site: ISite, newItem: any): Observable<ItemPostResults> {

    newItem = this.getNewItemWeight(newItem);

    console.log(newItem)

    const controller = "/POSOrderItems/";

    const endPoint = "PostItem";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ItemPostResults>(url , newItem)

  }

  putItem(site: ISite, newItem: any): Observable<ItemPostResults> {

    newItem = this.getNewItemWeight(newItem);

    console.log(newItem)

    const controller = "/POSOrderItems/";

    const endPoint = "PutItem";

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<ItemPostResults>(url , newItem)

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

    const endPoint  = "getPOSOrderItems"

    const parameters = `$id=$id{id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

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

  voidPOSOrderItem(site: ISite, item: ItemWithAction ): Observable<string> {

    if (item.posItem.voidReason)  {
      this.notificationEvent(`Item already voided: ${item.voidReason}`, 'Item Voided')
      return
    }

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
