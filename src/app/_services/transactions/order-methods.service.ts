import { Injectable } from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { OrdersService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as _  from "lodash";
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { IPOSOrder, IPurchaseOrderItem, PosOrderItem, ProductPrice } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemPostResults, NewItem, POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { PromptWalkThroughComponent } from 'src/app/modules/posorders/prompt-walk-through/prompt-walk-through.component';
import { PromptGroupService } from '../menuPrompt/prompt-group.service';
import { ISite }   from 'src/app/_interfaces';
import { PromptWalkThroughService } from '../menuPrompt/prompt-walk-through.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { RequiresSerialComponent } from 'src/app/modules/posorders/requires-serial/requires-serial.component';
import { PriceOptionsComponent } from 'src/app/modules/posorders/price-options/price-options.component';
import { ProductEditButtonService } from '../menu/product-edit-button.service';
import { PrintingService } from '../system/printing.service';
import { PlatformService } from '../system/platform.service';

export interface ProcessItem {
  order: IPOSOrder;
  item: IMenuItem;
  posItem: IPurchaseOrderItem;
}

@Injectable({
  providedIn: 'root'
})
export class OrderMethodsService {

  order                           : IPOSOrder;
  _order                          : Subscription;
  subscriptionInitialized         : boolean;

  private itemProcessSection      = 0
  private _itemProcessSection     = new BehaviorSubject<number>(null);
  public itemProcessSection$      = this._itemProcessSection.asObservable();

  processItem : ProcessItem

  private _assingedPOSItem = new BehaviorSubject<PosOrderItem>(null);
  public  assignedPOSItem$ = this._assingedPOSItem.asObservable();
  private assignPOSItem    : PosOrderItem;

  public get assignedPOSItem() {return this.assignPOSItem }

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(order => {
      this.order = order;
    })
  }

  initItemProcess(){
    this.orderService.updateOrderSubscription(this.order);
    this.processItem = null;
    this._itemProcessSection.next(0)
  }

  updateProcess()  {
    this.itemProcessSection = this.itemProcessSection +1
    this._itemProcessSection.next(this.itemProcessSection)
    this.handleProcessItem()
  }

  updateAssignedItem(item: PosOrderItem) {
    this.assignPOSItem = item;
    this._assingedPOSItem.next(item)
  }

  constructor(public route                    : ActivatedRoute,
              private dialog                  : MatDialog,
              private siteService             : SitesService,
              private orderService            : OrdersService,
              private _snackBar               : MatSnackBar,
              private posOrderItemService     : POSOrderItemServiceService,
              private productEditButtonService: ProductEditButtonService,
              private promptGroupService      : PromptGroupService,
              private printingService          :PrintingService,
              private router: Router,
              private platFormService:        PlatformService,
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

  appylySerial(id: number, serialCode: string) {
    const site = this.siteService.getAssignedSite();
    return this.posOrderItemService.appylySerial(site, id, serialCode, null)
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

  //determines if the users action will add the item or view the item on the order.
  menuItemAction(order: IPOSOrder, item: IMenuItem, add: boolean) {
    if (add) {
      this.addItemToOrder(order, item, 1)
      return
    }
    if (!add) {
      this.listItem(item.id);
    }
  }

  listItem(id:number) {
    this.router.navigate(["/menuitem/", {id:id}]);
  }

  async addItemToOrderWithBarcodePromise(site: ISite, newItem: NewItem):  Promise<ItemPostResults> {
    if (!newItem) {return}
    return await this.posOrderItemService.addItemToOrderWithBarcode(site, newItem).pipe().toPromise();
  }

  scanItemForOrder(site: ISite, order: IPOSOrder, barcode: string, quantity: number): Observable<ItemPostResults> {
    if (!order || !barcode) {return null;}
    let newItem = { orderID: order.id, quantity: quantity, barcode: barcode } as NewItem
    return this.posOrderItemService.addItemToOrderWithBarcode(site, newItem)
  }

  async addItemToOrder(order: IPOSOrder, item: IMenuItem, quantity: number) {
   await   this.processAddItem(order, null, item, quantity, null);
  }

  async processAddItem(order : IPOSOrder , barcode: string, item: IMenuItem, quantity: number, input: any) {
    this.initItemProcess();

    if (!order)         { order = this.order }
    const site          = this.siteService.getAssignedSite()
    const result        = await this.doesOrderExist(site);
    if (!result) { return }

    let passAlongItem
    if (this.assignedPOSItem) {  passAlongItem  = this.assignedPOSItem; }

    if (!result) { return }
    if (!order) {order = this.order}
    if (order) {

      if (!item && !barcode) {
        if (!item.itemType) {
          this.notifyEvent(`Item not configured properly. Item type is not assigned.`, 'Alert')
          return
        }
      }

      if (barcode)  {
        const addItem$ = this.scanItemForOrder(site, order, barcode, 1);
        this.processItemPostResults(addItem$)
        return
      }

      if (item) {
        const newItem     = { orderID: order.id, quantity: quantity, menuItem: item, passAlongItem: passAlongItem }
        const addItem$    = this.posOrderItemService.postItem(site, newItem)
        this.processItemPostResults(addItem$)
        return
      }

    }
  }

  processItemPostResults(addItem$: Observable<ItemPostResults>) {
    addItem$.subscribe(data => {
        if (data.message) {  this.notifyEvent(`${data.message}`, 'Alert ')}
        if (data && data.resultErrorDescription) {
          this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription} ${data.message}`, 'Alert')
          return
        }
        if (data.order) {
          this.orderService.updateOrderSubscription(data.order)
          this.addedItemOptions(data.order, data.posItemMenuItem, data.posItem)
        } else {
          this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription} ${data.message}`, 'Alert')
        }
      }
    )
  }

  async scanBarcodeAddItem(barcode: string, quantity: number, input: any) {
    this.processAddItem(this.order, barcode, null, quantity, input);
    input.nativeElement.value = ''
  }

  promptSerial(menuItem: IMenuItem, id: number, editOverRide: boolean, serial: string) {

    if (id) {
      if ( (menuItem && menuItem.itemType.requiresSerial) || editOverRide)
      {
        const dialogRef = this.dialog.open(RequiresSerialComponent,
          {
            width:     '300px',
            maxWidth:  '300px',
            height:    '270px',
            maxHeight  :'270px',
            panelClass :'foo',
            data       : { id: id, serial: serial}
          }
        )
        dialogRef.afterClosed().subscribe(data => {
          if (data && data.order) {
            this.order = data.order
            this.orderService.updateOrderSubscription(this.order)
          }
          if (data && data.result)  { this.updateProcess (); }
          if (!data || !data.result) {
            if (data.id){
              this.cancelItem(data.id, false);
            }
            this.initItemProcess();
           }
        });
      }
    }
  }

  async  promptOpenPriceOption(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem): Promise<boolean> {

    if (!order || !item || !posItem) {return}

    const site = this.siteService.getAssignedSite()
    //if there are multiple prices for this item.
    //the webapi will return what price options are avalible for the item.
    //the pop up will occur and prompt with options.
    //the function will return true once complete.
    if (item && item.priceCategories && item.priceCategories.productPrices.length > 1 ) {
      // remove unused prices if they exist?
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
        // this.promptGroupService.updatePromptGroup(null)
        // this.promptWalkService.updatePromptGroup(null)
        if (!result) {
          this.cancelItem(posItem.id, false);
          return
        }
        if (result) {
          this.updateProcess() //
          return
        }

      });
    } else {
      // console.log('Confirm no Prompt for price.')
      this.order = order;
      this.updateProcess() //
      // this.initItemProcess();
    }
    return true;
  }

  async cancelItem(id: number, notify : boolean ) {
    const site = this.siteService.getAssignedSite();
    if (id) {
      let result = await this.posOrderItemService.deletePOSOrderItem(site, id).pipe().toPromise();
      if (result.scanResult) {
        this.notifyWithOption('Item Deleted', 'Notice', notify)
      } else  {
        this.notifyWithOption('Item must be voided', 'Notice', notify)
      }
      if (result && result.order) {
        this.orderService.updateOrderSubscription(result.order);
        this.initItemProcess();
      }
    } else {
      this.initItemProcess();
    }
  }

  closeOrder(site: ISite, order: IPOSOrder) {
    if (order) {
      const result$ = this.orderService.completOrder(site, order.id)
      result$.subscribe(data=>  {
        this.notifyEvent(`Order Paid for`, 'Order Completed')
        this.orderService.updateOrderSubscription(data)
        this.printingService.previewReceipt()
      }
    )
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
    this.order = order;
    this.handleProcessItem();
  }

  async handleProcessItem() {
    const process = this.itemProcessSection;

    // console.log('handleProcessItems', process)
    if (!this.processItem) {
      // console.log('no processItem')
      this.orderService.updateOrderSubscription(this.order)
      return
    }

    switch(process) {
      case  0: {
          this.promptOpenPriceOption(this.order,this.processItem.item,this.processItem.posItem)
          // console.log('Handle Process Item openPriceOptionPrompt', 0)
          break;
      }
      case  1: {
          if (!this.processItem.posItem.serialCode) {
            // console.log('pre process serial', this.processItem.item, this.processItem.posItem.id, false, '')
            this.promptSerial(this.processItem.item, this.processItem.posItem.id, false, '')
            // console.log('Handle Process Item promptSerial', 1)
          } else {
            this.updateProcess();
          }
          break;
        }
      case  2: {
        this.openPromptWalkThrough(this.order,this.processItem.item,this.processItem.posItem)
        //statements;
        // console.log('Handle Process Item openPromptWalkThrough', 2)
        break;
      }
      case  3: {
        this.openQuantityPrompt(this.order,this.processItem.item,this.processItem.posItem);
        //statements;
        // console.log('Handle Process Item openQuantityPrompt', 3)
        break;
      }
      case  4: {
        this.openGiftCardPrompt(this.order,this.processItem.item,this.processItem.posItem);
        //statements;
        // console.log('Handle Process Item openGiftCardPrompt', 4)
        break;
      }
      case 5: {
        this.openPriceChangePrompt(this.order,this.processItem.item,this.processItem.posItem);
        // console.log('Handle Process Item openPriceChangePrompt', 5)
        break;
      }
      case 6: {
        this.orderService.updateOrderSubscription(this.order);
        // console.log('Handle Process Item updateOrderSubscription', 6)
        // this.initItemProcess();
        break;
      }
      default: {
        break;
      }
    }
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

  notifyWithOption(message: string, title: string, notifyEnabled: boolean) {
    if (notifyEnabled) {
      this.notifyEvent(message, title)
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      verticalPosition: 'bottom'
    });
  }
}
