import { Injectable } from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { OrdersService } from 'src/app/_services';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as _  from "lodash";
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { IPOSOrder, IPurchaseOrderItem, PosOrderItem, ProductPrice } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemPostResults, NewItem, POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { PromptWalkThroughComponent } from 'src/app/modules/posorders/prompt-walk-through/prompt-walk-through.component';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { T } from '@angular/cdk/keycodes';
import { PromptGroupService } from '../menuPrompt/prompt-group.service';
import { ISite }   from 'src/app/_interfaces';
import { PromptWalkThroughService } from '../menuPrompt/prompt-walk-through.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { RequiresSerialComponent } from 'src/app/modules/posorders/requires-serial/requires-serial.component';
import { PriceOptionsComponent } from 'src/app/modules/posorders/price-options/price-options.component';
import { ProductEditButtonService } from '../menu/product-edit-button.service';

export interface ProcessItem {
  order: IPOSOrder;
  item: IMenuItem;
  posItem: IPurchaseOrderItem;
}

@Injectable({
  providedIn: 'root'
})
export class OrderMethodsService {

  order                   : IPOSOrder;
  _order                  : Subscription;
  subscriptionInitialized : boolean;

  private itemProcessSection      = 0
  private _itemProcessSection     = new BehaviorSubject<number>(null);
  public itemProcessSection$      = this._itemProcessSection.asObservable();

  processItem : ProcessItem

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(data => {
      this.order = data;
    })
  }

  initItemProcess(){
    this.orderService.updateOrderSubscription(this.order);
    this.processItem = null;
    this._itemProcessSection.next(0)
  }

  updateProcess()  {
    this.itemProcessSection = this.itemProcessSection +1
    console.log('update Process',  this.itemProcessSection)
    this._itemProcessSection.next(this.itemProcessSection)
    this.handleProcessItem()
  }

  constructor(public route                    : ActivatedRoute,
              private dialog                  : MatDialog,
              private siteService             : SitesService,
              private orderService            : OrdersService,
              private _snackBar               : MatSnackBar,
              private posOrderItemService     : POSOrderItemServiceService,
              private productEditButtonService: ProductEditButtonService,
              private promptGroupService      : PromptGroupService,
              private promptWalkService: PromptWalkThroughService,
             ) {
    this.initSubscriptions();
  }

  async doesOrderExist(site: ISite): Promise<boolean> {
    if (!this.subscriptionInitialized) { this.initSubscriptions(); }
    if (!this.order) {
      const result = await this.orderService.newDefaultOrder(site)
      if (!result) {
        this.notifyEvent(`No order assigned.`, 'Alert')
      }
      return result;
    }
    return true
  }

  appylySerial(posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite();
    return this.posOrderItemService.appylySerial(site, posItem.id, posItem.serialCode, null)
  }

  async addItemToOrder(order: IPOSOrder, item: IMenuItem, quantity: number) {
    const site          = this.siteService.getAssignedSite()
    if (!order)         { order = this.order }
    const result        = await this.doesOrderExist(site);
    if (!result) { return }
    if (order) {
      const newItem     = { orderID: order.id, quantity: quantity, menuItem: item }
      const itemResult$ = this.posOrderItemService.postItem(site, newItem)
      itemResult$.subscribe(data => {
          if (data.order) {
            // this.order = data.order
            this.addedItemOptions(data.order, item, data.posItem)
          } else {
            this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert')
          }
        }
      )
    }
  }

  async addPriceToItem(order: IPOSOrder,  menuItem: IMenuItem, price: ProductPrice,  quantity: number, itemID: number) {
    const site          = this.siteService.getAssignedSite()
    if (!order)         { order = this.order }
    const result        = await this.doesOrderExist(site);
    if (!result) { return }
    if (order) {
      const newItem     = { orderID: order.id, itemID: itemID, quantity: quantity, menuItem: menuItem, price: price }
      const itemResult$ = this.posOrderItemService.putItem(site, newItem)
      itemResult$.subscribe(data => {
          if (data.order) {
            this.order = data.order
            this.orderService.updateOrderSubscription(data.order)
            this.updateProcess()
          } else {
            this.notifyEvent(`Error occured, this item was not changed. ${data.resultErrorDescription}`, 'Alert')
          }
        }
      )
    }
  }

  async addItemToOrderWithBarcodePromise(site: ISite, newItem: NewItem):  Promise<ItemPostResults> {
    if (newItem) {
      this.initItemProcess();
       return await this.posOrderItemService.addItemToOrderWithBarcode(site, newItem).pipe().toPromise();
    }
  }

  scanItemForOrder(site: ISite, order: IPOSOrder, barcode: string, quantity: number): Observable<ItemPostResults> {
    if (order && barcode) {
      this.initItemProcess();
      let newItem = { orderID: order.id, quantity: quantity, barcode: barcode } as NewItem
      return this.posOrderItemService.addItemToOrderWithBarcode(site, newItem)
    }
    return null;
  }

  async scanBarcodeAddItem(barcode: string, quantity: number, input: any) {

    const site = this.siteService.getAssignedSite()
    const result = await this.doesOrderExist(site);
    this.initItemProcess();
    if (!result) { return }
    const order = this.order

    //or we refresh the order with the new item added
    const addItem$ = this.scanItemForOrder(site, order, barcode, 1);
    addItem$.subscribe(
        data=> {
        if (data.posItemMenuItem) {
          this.addedItemOptions(data.order, data.posItemMenuItem, data.posItem)
        }
        if (data.menuItemWithPrice) {
        }
        if (data.order) {
          this.orderService.updateOrderSubscription(data.order)
        }
        if (data.menuItem) {
          if (data.menuItem.length > 0) {
          }
        }
        if (!data.order && data.menuItem) {
          this.notifyEvent(`${data.resultErrorDescription}`, 'Error', )
        }
      }
    )
    input.nativeElement.value = ''
  }

  promptSerial(menuItem: IMenuItem, posItem: IPurchaseOrderItem) {
    if (posItem) {
      if ( menuItem.itemType.requiresSerial)
      {
        const dialogRef = this.dialog.open(RequiresSerialComponent,
          {
            width:     '300px',
            maxWidth:  '300px',
            height:    '270px',
            maxHeight  :'270px',
            panelClass :'foo',
            data       : posItem
          }
        )
        dialogRef.afterClosed().subscribe(data => {
          if (data.result)  { this.updateProcess (); }
          if (!data.result) {
            if (data.posItem){
              this.cancelItem(data.posItem);
            }
            if (!data.posItem) {
              this.cancelItem(posItem);
            }
            this.initItemProcess();
           }
        });
      }
    }
  }

  async cancelItem(posItem: IPurchaseOrderItem ) {
    const site = this.siteService.getAssignedSite();
    if (posItem.id) {
      let result = await this.posOrderItemService.deletePOSOrderItem(site, posItem.id).pipe().toPromise();
      if (result.scanResult) {
        this.notifyEvent('Item Deleted', 'Notice')
      } else  {
        this.notifyEvent('Item must be voided', 'Notice')
      }
      if (result && result.order) {
        this.orderService.updateOrderSubscription(result.order);
      }
    }
  }

  async openPromptWalkThrough(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    if (!posItem || posItem.promptGroupID == 0 || !posItem.promptGroupID) { return }
    const prompt = await this.promptGroupService.getPrompt(site, item.promptGroupID).pipe().toPromise()
    this.openPromptWalkThroughWithItem(prompt, posItem);
  }

  //, pricing:  priceList[]
  async addedItemOptions(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const processItem   = {} as ProcessItem;
    processItem.item    = item;
    processItem.order   = order;
    processItem.posItem = posItem;
    this.processItem    = processItem;
    this._itemProcessSection.next(0)
    this.itemProcessSection = 0;
    this.handleProcessItem();
  }

  async handleProcessItem() {
    const process = this.itemProcessSection;

    if (!this.processItem) {
      console.log('no processItem')
      this.orderService.updateOrderSubscription(this.order)
      return
    }

    switch(process) {
      case  0: {
          this.openPriceOptionPrompt(this.processItem.order,this.processItem.item,this.processItem.posItem)
          console.log('Handle Process Item openPriceOptionPrompt', 0)
          break;
      }
      case  1: {
          this.promptSerial(this.processItem.item, this.processItem.posItem)
          console.log('Handle Process Item promptSerial', 1)
          break;
        }
      case  2: {
        this.openPromptWalkThrough(this.processItem.order,this.processItem.item,this.processItem.posItem)
        //statements;
        console.log('Handle Process Item openPromptWalkThrough', 2)
        break;
      }
      case  3: {
        this.openQuantityPrompt(this.processItem.order,this.processItem.item,this.processItem.posItem);
        //statements;
        console.log('Handle Process Item openQuantityPrompt', 3)
        break;
      }
      case  4: {
        this.openGiftCardPrompt(this.processItem.order,this.processItem.item,this.processItem.posItem);
        //statements;
        console.log('Handle Process Item openGiftCardPrompt', 4)
        break;
      }
      case 5: {
        this.openPriceChangePrompt(this.processItem.order,this.processItem.item,this.processItem.posItem);
        console.log('Handle Process Item openPriceChangePrompt', 5)
        break;
      }
      case 6: {
        this.orderService.updateOrderSubscription(this.processItem.order);
        console.log('Handle Process Item updateOrderSubscription', 6)
        this.initItemProcess();
        break;
      }
      default: {
        break;
      }
    }
  }


  async  openPriceOptionPrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem): Promise<boolean> {

    if (!order || !item || !posItem) {return}

    const site = this.siteService.getAssignedSite()
    //if there are multiple prices for this item.
    //the webapi will return what price options are avalible for the item.
    //the pop up will occur and prompt with options.
    //the function will return true once complete.
    if (item && item.priceCategories && item.priceCategories.productPrices.length > 1 ) {
      // remove unused prices if they exist?
      // prompt.posOrderItem = posItem;
      // this.promptGroupService.updatePromptGroup(prompt);
      // encapsulation: ViewEncapsulation.None
      console.log('productPrices.length', item.priceCategories.productPrices.length)

      const  newItem = {order: order, item: item, posItem: posItem}
      const dialogRef = this.dialog.open(PriceOptionsComponent,
        {
          width:     '500px',
          maxWidth:  '500px',
          height:    '75vh',
          maxHeight: '75vh',
          panelClass: 'foo',
          data: newItem
        }
      )
      dialogRef.afterClosed().subscribe(result => {
        //use this to remove item if price isn't choice.
        this.promptGroupService.updatePromptGroup(null)
        this.promptWalkService.updatePromptGroup(null)
        if (result) {
          this.updateProcess() //
          return
        }
        if (!result) {
          this.order = order;
          this.initItemProcess();
          return
        }
      });
    } else {
      console.log('Confirm no Prompt for price.')
      this.order = order;
      this.initItemProcess();
    }
    return true;
  }

  openPriceChangePrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    this.updateProcess() //
  }

  openGiftCardPrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    this.updateProcess() //
  }

  openQuantityPrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    this.updateProcess() //
  }

  openPromptWalkThroughWithItem(prompt: IPromptGroup, posItem: IPurchaseOrderItem) {
    if (prompt) {
      prompt.posOrderItem = posItem;
      this.promptGroupService.updatePromptGroup(prompt);
      // encapsulation: ViewEncapsulation.None
      const dialogRef = this.dialog.open(PromptWalkThroughComponent,
        {
          width:     '90vw',
          maxWidth:  '1000px',
          height:    '90vh',
          maxHeight: '90vh',
          panelClass: 'foo'
        }
      )
      dialogRef.afterClosed().subscribe(result => {
        this.promptGroupService.updatePromptGroup(null)
        this.promptWalkService.updatePromptGroup(null)
        if (result) {
          this.updateProcess();
        }
        if (!result) { this.initItemProcess(); }
        return;
      });
    }

    return;
  }

  removeItemFromList(index: number, orderItem: PosOrderItem) {
    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.printed || this.order.completionDate ) {
        this.productEditButtonService.openVoidItemDialog(orderItem)
        return
      }

      if (orderItem.id) {
        const orderID = orderItem.orderID
        this.posOrderItemService.deletePOSOrderItem(site, orderItem.id).subscribe( item=> {
          if (item) {
            this.notifyEvent('Item Deleted', "")
            this.order.posOrderItems.splice(index, 1)
            this.orderService.updateOrderSubscription(item.order)
          }
        })
      }
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
