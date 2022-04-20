import { Injectable } from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { MenuService, OrdersService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as _  from "lodash";
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { IClientTable, IPOSOrder, IPurchaseOrderItem, PosOrderItem, ProductPrice } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemPostResults, ItemWithAction, NewItem, POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { PromptWalkThroughComponent } from 'src/app/modules/posorders/prompt-walk-through/prompt-walk-through.component';
import { PromptGroupService } from '../menuPrompt/prompt-group.service';
import { ISite }   from 'src/app/_interfaces';
import { PromptWalkThroughService } from '../menuPrompt/prompt-walk-through.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { RequiresSerialComponent } from 'src/app/modules/posorders/requires-serial/requires-serial.component';
import { PriceOptionsComponent } from 'src/app/modules/posorders/price-options/price-options.component';
import { ProductEditButtonService } from '../menu/product-edit-button.service';
import { PrintingService } from '../system/printing.service';
import { MenuItemModalComponent } from 'src/app/modules/menu/menuitems/menu-item-card/menu-item-modal/menu-item-modal.component';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { DateHelperService } from '../reporting/date-helper.service';
import { DatePipe } from '@angular/common';
import { T } from '@angular/cdk/keycodes';

export interface ProcessItem {
  order   : IPOSOrder;
  item    : IMenuItem;
  posItem : IPurchaseOrderItem;
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
              private printingService         : PrintingService,
              private userAuthorization       : UserAuthorizationService,
              private menuService             : MenuService,
              private dateHelper              : DateHelperService,
              private datePipe                : DatePipe,
              private router: Router,
              private promptWalkService: PromptWalkThroughService,
             ) {
    this.initSubscriptions();

  }

  doesOrderExist(site: ISite) {
    if (!this.subscriptionInitialized) { this.initSubscriptions(); }
    if (!this.order || (this.order.id === undefined)) {
      this.orderService.newDefaultOrder(site);
    }
    return true;
  }

  appylySerial(id: number, serialCode: string) {
    const site = this.siteService.getAssignedSite();
    return this.posOrderItemService.appylySerial(site, id, serialCode, null)
  }

  async addPriceToItem(order: IPOSOrder,  menuItem: IMenuItem, price: ProductPrice,  quantity: number, itemID: number) {
    const site          = this.siteService.getAssignedSite();
    if (!order)         { order = this.order };
    const result        = await this.doesOrderExist(site);
    if (!result) { return }
    if (order) {
      const newItem     = { orderID: order.id, itemID: itemID, quantity: quantity, menuItem: menuItem, price: price };

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

  ///1. List item. 2. Add Item 3. View Sub Groups of Items.   //either move to s
  menuItemAction(order: IPOSOrder, item: IMenuItem, add: boolean) {
    const searchResults = this.updateMenuSearchModel(item)
    if (searchResults) { return }

    console.log('item.itemType', item.itemType)
    console.log('item.itemType.name', item.itemType.name)

    if (add) {
      if (item && item.itemType.requireInStock) {
        this.listItem(item.id);
        return
      }
      this.addItemToOrder(order, item, 1)
      return
    }
    this.listItem(item.id);

  }

  //determines if the users action will add the item or view the item on the order.
  menuItemActionPopUp(order: IPOSOrder, item: IMenuItem, add: boolean) {
    if (add) {
      this.addItemToOrder(order, item, 1)
      return
    }
    if (!add) {
      this.openPopupItem()
    }
  }

  updateMenuSearchModel(item: IMenuItem) : boolean {
    if (!item) {   return false }


    const model =  {} as ProductSearchModel;
    if (item.itemType.name.toLowerCase() == 'category') {
      model.categoryID   = item.categoryID.toString()
      this.menuService.updateMeunuItemData(model)
      this.router.navigate(["/menuitems-infinite/", {categoryID:item.id }])
      return true
    }
    if (item.prodModifierType == 5) {
      model.subCategory  = item.id.toString()
      this.menuService.updateMeunuItemData(model)
      this.router.navigate(["/menuitems-infinite/", {subCategoryID:item.id }])
      return true
    }
    if (item.prodModifierType == 6) {
      model.departmentID = item.id.toString()
      this.menuService.updateMeunuItemData(model)
      this.router.navigate(["/menuitems-infinite/", {departmentID:item.id }])
      return true
    }

    return false

  }

  getPopUpWidth(defaultSize: string) {
    let deviceSize = '90vw'
    let smallDevice = false
    if (window.innerWidth >= 768) {
      smallDevice = false
      deviceSize = defaultSize
    }
    if (window.innerWidth < 768) {
      smallDevice = true
      deviceSize = '100vw'
    }
    return deviceSize
  }

  openPopupItem() {

    const deviceSize = this.getPopUpWidth('90vw')
    let panelClass= ''
    if (deviceSize=='90vw') {
    }
    panelClass = 'custom-dialog-container';

    const dialogRef = this.dialog.open(MenuItemModalComponent,
      {
        width:        deviceSize,
        maxWidth:     deviceSize,
        height:       '90vh',
        maxHeight:    '90vh',
        panelClass:   panelClass
      },
    )

    dialogRef.afterClosed().subscribe(result => {
      return result;
    });
  }

  listItem(id:number) {
    this.router.navigate(["/menuitem/", {id:id}]);
  }

  async addItemToOrderWithBarcodePromise(site: ISite, newItem: NewItem):  Promise<ItemPostResults> {
    if (!newItem) {return}
    return await this.posOrderItemService.addItemToOrderWithBarcode(site, newItem).pipe().toPromise();
  }

  scanItemForOrder(site: ISite, order: IPOSOrder, barcode: string, quantity: number, portionValue: string, packaging: string): Observable<ItemPostResults> {
    if (!order || !barcode) {return null;}
    const newItem = { orderID: order.id, quantity: quantity, barcode: barcode, packaging: packaging, portionValue: portionValue  } as NewItem
    return this.posOrderItemService.addItemToOrderWithBarcode(site, newItem)
  }

  async addItemToOrder(order: IPOSOrder, item: IMenuItem, quantity: number) {
   await   this.processAddItem(order, null, item, quantity, null);
  }

  validateUser(): boolean {
    const valid = this.userAuthorization.validateUser()
    console.log('valid', valid)
    if (!valid) {
      this.notifyEvent('Please login, or create your account to place an order. Carts require a registerd user to be created.', 'Alert')
      return false
    } {
      return true
    }
  }

  async processAddItem(order : IPOSOrder ,
                       barcode: string,
                       item: IMenuItem,
                       quantity: number,
                       input: any) {

    const valid = this.validateUser();

    if (!valid) { return };

    this.initItemProcess();

    if (quantity === 0 ) { quantity = 1};

    if (!order)         { order = this.order };
    const site          = this.siteService.getAssignedSite();
    const result        = await this.doesOrderExist(site);

    if (!result) { return false };
    let passAlongItem;
    if (this.assignedPOSItem) {  passAlongItem  = this.assignedPOSItem; };
    if (!result) { return false };

    order = this.orderService.getCurrentOrder();

    if (!order || order.id === undefined) {
      this.order = null;
      this.orderService.updateOrderSubscription(null);
      this.notifyEvent(`Order not started, please try adding item again.`, 'Alert');
      return false;
    }

    if (order && order.id) {
      if (!item && !barcode) {
        if (!item.itemType) {
          this.notifyEvent(`Item not configured properly. Item type is not assigned.`, 'Alert');
          return false;
        }
      }

      if (barcode)  {
        const addItem$ = this.scanItemForOrder(site, order, barcode, quantity,  input?.packaging,  input?.portionValue)
        this.processItemPostResults(addItem$)
        return false;
      }

      let packaging     = '';
      let portionValue  = '';
      let itemNote      = '';
      if (input) {
        packaging        = input?.packaging;
        portionValue     = input?.portionValue;
        itemNote         = input?.itemNote;
      }

      if (item) {
        const newItem     = { orderID: order.id, quantity: quantity, menuItem: item, passAlongItem: passAlongItem,
                              packaging: packaging, portionValue: portionValue, barcode: '', weight: 1, itemNote: itemNote } as NewItem
        const addItem$    = this.posOrderItemService.postItem(site, newItem)
        this.processItemPostResults(addItem$)
        return true
      }
    }
  }

  // tslint:disable-next-line: typedef
  processItemPostResults(addItem$: Observable<ItemPostResults>) {
    addItem$.subscribe(data => {

      console.log('processItemPostResults')
      if (data.message) {  this.notifyEvent(`${data.message}`, 'Alert ')};

      if (data && data.resultErrorDescription) {
          this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription} ${data.message}`, 'Alert');
          return;
        }

      if (data.order) {
          this.orderService.updateOrderSubscription(data.order);
          this.addedItemOptions(data.order, data.posItemMenuItem, data.posItem);
        } else {
          this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription} ${data.message}`, 'Alert');
        }

      if (this.openDialogsExist) {
          this.notification('Item added to cart.', 'Check Cart');
        }
      }
    )
  }

  notification(message: string, title: string)  {
    if (this.openDialogsExist()) {
      this._snackBar.open(message, title, {
        duration: 2000,
        verticalPosition: 'top'
      });
    }
  }

  openDialogsExist(): boolean {
    if (!this.dialog.openDialogs || !this.dialog.openDialogs.length) return;
    // this.dialog.closeAll();
    return true
  }

  async scanBarcodeAddItem(barcode: string, quantity: number, input: any) {
     this.processAddItem(this.order, barcode, null, quantity, input);
  }

  promptSerial(menuItem: IMenuItem, id: number, editOverRide: boolean, serial: string): boolean {

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
        return true;
      }
    }

    return false;

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

  voidOrder(id: number) {
    // if (!id) {
    //   this.notifyEvent('Order not voided', 'Failed')
    //   return
    // }
    // const site = this.siteService.getAssignedSite();
    // this.orderService.voidOrder(site, id).subscribe(
    //   order => {
    //   if (order === 'Order Voided') {
    //     this.notifyEvent('Order Voided', 'Success')
    //     this.orderService.updateOrderSubscription(null)
    //     this.router.navigateByUrl('pos-orders')
    //   }
    //   if (order != 'Order Voided') {
    //     this.notifyEvent('Order Voided', 'Success')
    //   }
    // })
  }

  deleteOrder(id: number, confirmed: boolean) {
    const site = this.siteService.getAssignedSite();

    if (!confirmed) {
      const confirm = window.confirm('Are you sure you want to delete this order?')
      if (!confirm) { return }
    }

    if (this.order) {
      const orderDelete$ = this.orderService.deleteOrder(site, this.order.id)
      orderDelete$.subscribe(data => {
        if (data) {
          this._snackBar.open('Order deleted.', 'Alert', {verticalPosition: 'top', duration: 1000})
          this.clearOrder();
          if (this.router.url == '/pos-orders') {
            //then refresh orders
            return
          }

          this.router.navigate(['app-main-menu'])
        }
        if (!data) {
          this._snackBar.open('Order not deleted.', 'Alert', {verticalPosition: 'top', duration: 1000})
        }
      }, err => {
        this._snackBar.open('Order not deleted.', 'Alert', {verticalPosition: 'top', duration: 1000})
      })
    }
  }

  clearOrder() {
    this.orderService.updateOrderSubscription(null);
    const url = this.router.url;
    if (url === '/currentorder' || url === '/currentorder;mainPanel=true'
        || url === '/pos-payment' || url === '/pos-order-schedule') {
      this.router.navigate(['/pos-orders'])
      return
    }
    if (url === '/pos-orders') {
      // this.router.navigate(['app-main-menu'])
    }

  }


  closeOrder(site: ISite, order: IPOSOrder) {
    if (order) {
      const result$ = this.orderService.completeOrder(site, order.id)
      result$.subscribe(data=>  {
        this.notifyEvent(`Order Paid for`, 'Order Completed')
        this.orderService.updateOrderSubscription(data)
        this.printingService.previewReceipt()
      }
    )
   }
  }

  openPromptWalkThrough(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    if (!posItem || posItem.promptGroupID == 0 || !posItem.promptGroupID) { return }
    const prompt = this.promptGroupService.getPrompt(site, item.promptGroupID).subscribe ( prompt => {
      this.openPromptWalkThroughWithItem(prompt, posItem);
    })
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

    console.log('handleProcessItems', process)
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
            if  (!this.promptSerial(this.processItem.item, this.processItem.posItem.id, false, '')) {
              this.updateProcess();
            }
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

  refreshOrder(id: number) {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      const order$ = this.orderService.getOrder(site, this.order.id.toString() , this.order.history)
      // const source = timer(5000, 3000);
      order$.subscribe( data => {
          this.orderService.updateOrderSubscription(data)
      })
    }
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
            this.notifyEvent('Item Deleted', "Success")
            this.order.posOrderItems.splice(index, 1)
            this.orderService.updateOrderSubscription(item.order)
          }
        })
      }
    }
  }

  changePrepStatus(index: number, orderItem: PosOrderItem) {
    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.id) {
        const orderID = orderItem.orderID
        this.posOrderItemService.setItemPrep(site,orderItem).subscribe( item => {
          if (item) {
            this.notifyEvent('Item Prepped!', "Success")
            this.order.posOrderItems.splice(index, 1, item)
            this.orderService.updateOrderSubscription(this.order)
          }
        })
      }
    }
  }

  setItemsAsPrepped(orderID: number, printLocation: number): Observable<any> {
    if (orderID) {
      const site = this.siteService.getAssignedSite()
     return this.posOrderItemService.setItemsAsPrepped(site, orderID, printLocation).pipe(
        switchMap(data => {
          return this.orderService.getOrder(site, orderID.toString(), false)
        }))
    }
  }

  prepPrintUnPrintedItems(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite()
      this.posOrderItemService.setUnPrintedItemsAsPrinted(site, id).pipe(
        switchMap(data => {
          return this.orderService.getOrder(site, id.toString(), false)
        })).subscribe( order => {
          if (order) {
            this.notifyEvent('Item Sent to Prep!', "Success")
            this.orderService.updateOrderSubscription(order)
          }
      })
    }
  }

  prepPrintUnPrintedItem(index: number, orderItem: PosOrderItem) {
    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.id) {
        const orderID = orderItem.orderID
        this.posOrderItemService.setItemPrep(site,orderItem).subscribe( item => {
          if (item) {
            this.notifyEvent('Item Prepped!', "Success")
            this.order.posOrderItems.splice(index, 1, item)
            this.orderService.updateOrderSubscription(this.order)
          }
        })
      }
    }
  }

  validateCustomerForOrder(client: IClientTable, ordersRequireCustomer: boolean) {
    const accountLocked   = client.accountDisabled;
    const accountDisabled = client.accountLocked;
    let resultMessage = ''

    if (accountLocked || accountDisabled) {
      resultMessage = 'Problem account is locked or disabled.'
      this.notifyEvent('Problem account is locked or disabled.', 'Failure')
      return {valid: false, resultMessage: resultMessage}
    }

    if (ordersRequireCustomer) {
      if (client.dlExp || !client?.dlExp) {
        if (client.dlExp  && this.isDateExpired(client.dlExp)) {
           resultMessage =' Problem with state ID or state driver license expiration date.'
           return {valid: false, resultMessage: resultMessage}
        }
        if (!client.dlExp ) {
          resultMessage ='Driver license or ID expiration date does not exist for this customer'
          return {valid: false, resultMessage: resultMessage}
        }
        if (!client.dlNumber ) {
          resultMessage = 'Driver or ID number does not exist for this customer'
          return {valid: false, resultMessage: resultMessage}
        }
      }
    }

    if (client.patientRecOption) {
      if (!client.medLicenseNumber) {
        resultMessage = 'Problem with MED license.'
        return {valid: false, resultMessage: resultMessage}
      }
      if (!client.medPrescriptionExpiration) {
        resultMessage = 'Problem with MED expiration.'
        return {valid: false, resultMessage: resultMessage}
      }
      if (client.medPrescriptionExpiration) {
        if (this.isDateExpired(client.medPrescriptionExpiration)) {
          resultMessage = 'Problem with MED expiration.'
          return {valid: false, resultMessage: resultMessage}
        }
      }
    }

    return {valid: true, resultMessage: resultMessage}
  }


  isDateExpired(expiryDate: string) {
    const expiry = new Date(expiryDate)
    const now = new Date();
    now.setHours(0,0,0,0);
    console.log('expiry', expiry)
    console.log('now', now )
    if (expiry < now) {
      return true
    } else {
      return false
    }
  }



  notifyWithOption(message: string, title: string, notifyEnabled: boolean) {
    if (notifyEnabled) {
      this.notifyEvent(message, title)
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
      verticalPosition: 'bottom'
    });
  }
}
