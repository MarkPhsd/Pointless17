import { Injectable } from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { OrdersService } from 'src/app/_services';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as _  from "lodash";
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { IPOSOrder, IPurchaseOrderItem, ProductPrice } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { PromptWalkThroughComponent } from 'src/app/modules/posorders/prompt-walk-through/prompt-walk-through.component';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { T } from '@angular/cdk/keycodes';
import { PromptGroupService } from '../menuPrompt/prompt-group.service';
import { ISite }   from 'src/app/_interfaces';
import { PromptWalkThroughService } from '../menuPrompt/prompt-walk-through.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { RequiresSerialComponent } from 'src/app/modules/posorders/requires-serial/requires-serial.component';
import { PriceOptionsComponent } from 'src/app/modules/posorders/price-options/price-options.component';

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
  // private itemProcessSubscription: Subscription;
  public itemProcessSection$      = this._itemProcessSection.asObservable();

  processItem : ProcessItem

  intSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(data => {
      this.order = data;
    })

    // this._itemProcessSection = this.itemProcessSubscription$.subscribe()
  }

  updateProcess()  {
    this.itemProcessSection = this.itemProcessSection +1
    console.log('updateProcess', this.itemProcessSection)
    this._itemProcessSection.next(this.itemProcessSection)
    this.handleProcessItem()
  }

  constructor(public route                    : ActivatedRoute,
              private dialog                  : MatDialog,
              private siteService             : SitesService,
              private orderService            : OrdersService,
              private _snackBar               : MatSnackBar,
              private posOrderItemService     : POSOrderItemServiceService,
              // private priceService            : PricingService,
              private promptGroupService      : PromptGroupService,
              private promptWalkService: PromptWalkThroughService,
             ) {
    this.intSubscriptions();
  }

  async doesOrderExist(site: ISite): Promise<boolean> {
    if (!this.subscriptionInitialized) { this.intSubscriptions(); }
    if (!this.order) {
      const result = await this.orderService.newDefaultOrder(site)
      if (!result) {
        this.notifyEvent(`No order assigned.`, 'Alert')
      }
      return result;
    }
    return true
  }

  appylySerial(posItem: IPOSOrderItem) {
    const site = this.siteService.getAssignedSite();
    console.log(posItem, posItem.serialCode)
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
            this.orderService.updateOrderSubscription(data.order)
            this.addedItemOptions(order, item, data.posItem)
          } else {
            this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert')
          }
        }
      )
    }
  }

  // Public Property OrderID As Integer
  // Public Property MenuItem As MenuItem
  // Public Property Quantity As Decimal
  // Public Property Barcode As String
  // Public Property OverRide As Boolean
  // Public Property Weight As Double
  // Public Property POSOrderItem As POSOrderItem

  //this.newItem.order, this.newItem.posItem, this.newItem.item, price, this.newItem.posItem.quantity)
  async addPriceToItem(order: IPOSOrder,  menuItem: IMenuItem, price: ProductPrice,  quantity: number, itemID: number) {
    const site          = this.siteService.getAssignedSite()
    if (!order)         { order = this.order }
    const result        = await this.doesOrderExist(site);
    if (!result) { return }
    if (order) {

      const newItem     = { orderID: order.id, itemID: posOrderItem.id, quantity: quantity, menuItem: menuItem, price: price }
      const itemResult$ = this.posOrderItemService.putItem(site, newItem)
      itemResult$.subscribe(data => {
          if (data.order) {
            this.orderService.updateOrderSubscription(data.order)
            this.addedItemOptions(order, menuItem, data.posItem)
          } else {
            this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert')
          }
        }
      )
    }
  }

  // this.orderMethodService.addItemToOrder(this.newItem.order, price, this.newItem.posItem.quantity)

  async scanBarcodeAddItem(barcode: string, quantity: number, input: any) {

    const site = this.siteService.getAssignedSite()
    const result = await this.doesOrderExist(site);
    if (!result) { return }
    const order = this.order

    //or we refresh the order with the new item added
    const addItem$ = this.posOrderItemService.scanItemForOrder(site, order, barcode, 1);
    addItem$.subscribe(
        data=> {
        if (data.posItemMenuItem) {
          this.addedItemOptions(data.order, data.posItemMenuItem, data.posItem)
        }
        if (data.menuItemWithPrice) {
          //this means we prompt for prices.
        }
        if (data.order) {
          this.orderService.updateOrderSubscription(data.order)
        }
        if (data.menuItem) {
          if (data.menuItem.length > 0) {
            //here we can and present a list of items found
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
      if (this.processItem.item.requiresSerial || this.processItem.item.itemType.requiresSerial)
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
        dialogRef.afterClosed().subscribe(result => {
          if (result) { this.updateProcess(); }
        });
      }
    }
    // this.handleProcessItem();
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
    this.handleProcessItem();
  }

  async handleProcessItem() {
    const process = this.itemProcessSection;
    // order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem

    if (!this.processItem) {return}

    switch(process) {
      case  0: {
          this.promptSerial(this.processItem.item, this.processItem.posItem)
          break;
        }
      case  1: {
        this.openPriceOptionPrompt(this.processItem.order,this.processItem.item,this.processItem.posItem)
        break;
      }
      case  2: {
        this.openPromptWalkThrough(this.processItem.order,this.processItem.item,this.processItem.posItem)
        //statements;
        break;
      }
      case  3: {
        this.openQuantityPrompt(this.processItem.order,this.processItem.item,this.processItem.posItem);
        //statements;
        break;
      }
      case  4: {
        this.openGiftCardPrompt(this.processItem.order,this.processItem.item,this.processItem.posItem);
        //statements;
        break;
      }
      case 5: {
        this.openPriceChangePrompt(this.processItem.order,this.processItem.item,this.processItem.posItem);
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }


  async  openPriceOptionPrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem): Promise<boolean> {
    const site = this.siteService.getAssignedSite()
    //if there are multiple prices for this item.
    //the webapi will return what price options are avalible for the item.
    //the pop up will occur and prompt with options.
    //the function will return true once complete.
    if (item && item.priceCategories && item.priceCategories.productPrices.length > 0 ) {
        //remove unused prices if they exist?
        // prompt.posOrderItem = posItem;
        // this.promptGroupService.updatePromptGroup(prompt);
        // encapsulation: ViewEncapsulation.None
        // const newItem     = { orderID: order.id, quantity: quantity, menuItem: item }
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
          }
        });
        return;
    }
    // this.updateProcess() //
    return true;
  }

  openPriceChangePrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    // this.handleProcessItem();
  }

  openGiftCardPrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    // this.handleProcessItem();

  }

  openQuantityPrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    // this.handleProcessItem();
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
        return;
      });
    }
    // this.updateProcess() //
    return;
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
