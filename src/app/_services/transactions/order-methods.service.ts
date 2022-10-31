import { Injectable, OnDestroy } from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { AuthenticationService, MenuService, OrdersService, TextMessagingService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as _  from "lodash";
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BehaviorSubject, Observable, of, Subscription, switchMap } from 'rxjs';
import { IClientTable, IPaymentResponse, IPOSOrder, IPurchaseOrderItem, PosOrderItem, ProductPrice } from 'src/app/_interfaces';
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
import { MenuItemModalComponent } from 'src/app/modules/menu/menuitems/menu-item-card/menu-item-modal/menu-item-modal.component';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { PriceCategoriesService } from '../menu/price-categories.service';
import { StoreCreditIssueComponent } from 'src/app/modules/posorders/pos-order/store-credit-issue/store-credit-issue.component';
import { IPaymentMethod } from './payment-methods.service';
import { PlatformService } from '../system/platform.service';
import { ClientTableService } from '../people/client-table.service';
import { SendGridService } from '../twilio/send-grid.service';
import { UISettingsService } from '../system/settings/uisettings.service';
import { ProductListByBarcodeComponent } from 'src/app/modules/menu/product-list-by-barcode/product-list-by-barcode.component';
import { ToolBarUIService } from '../system/tool-bar-ui.service';
import { FloorPlanService } from '../floor-plan.service';

export interface ProcessItem {
  order   : IPOSOrder;
  item    : IMenuItem;
  posItem : IPurchaseOrderItem;
}

@Injectable({
  providedIn: 'root'
})
export class OrderMethodsService implements OnDestroy {

  public order                           : IPOSOrder;
  _order                          : Subscription;
  subscriptionInitialized         : boolean;

  private itemProcessSection      = 0
  private _itemProcessSection     = new BehaviorSubject<number>(null);
  public itemProcessSection$      = this._itemProcessSection.asObservable();

  processItem : ProcessItem

  private _assingedPOSItems = new BehaviorSubject<PosOrderItem[]>(null);
  public  assignedPOSItems$ = this._assingedPOSItems.asObservable();
  private assignPOSItems    : PosOrderItem[];

  private _posIssuePurchaseItem   = new BehaviorSubject<IPurchaseOrderItem>(null);
  public  posIssuePurchaseItem$ = this._posIssuePurchaseItem.asObservable();

  private _posIssueItem = new BehaviorSubject<PosOrderItem>(null);
  public  posIssueItem$ = this._posIssueItem.asObservable();

  public get assignedPOSItem() {return this.assignPOSItems }

  priceCategoryID: number;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(order => {
      this.order = order;
      this.clearAssignedItems();
    })
  }

  initItemProcess(){
    this.orderService.updateOrderSubscription(this.order);
    this.processItem = null;
    this._itemProcessSection.next(0)
  }

  updatePOSIssueItem(item: PosOrderItem) {
    this._posIssueItem.next(item)
  }

  updatePOSIssuePurchaseItem(item: IPurchaseOrderItem) {
    this._posIssuePurchaseItem.next(item)
  }

  updateProcess()  {
    this.itemProcessSection = this.itemProcessSection +1
    this._itemProcessSection.next(this.itemProcessSection)
    this.handleProcessItem()
  }

  clearAssignedItems() {
    this.assignPOSItems = null;
    this._assingedPOSItems.next(null)
  }

  updateAssignedItems(item: PosOrderItem) {

    if (this.isItemAssigned(item.id)) {
      this.removeAssignedItem(item)
    } else {
      this.addAssignedItem(item)
    }
  }

  addAssignedItem(item: PosOrderItem) {
    if (!this.assignPOSItems) { this.assignPOSItems= [] }
    this.assignPOSItems.push(item);
    this._assingedPOSItems.next(this.assignPOSItems)
  }

  removeAssignedItem(item: PosOrderItem) {
    if (!this.assignPOSItems) {
      this._assingedPOSItems.next(null)
    }

    const index = this.assignPOSItems.findIndex( data => {
        // console.log(data.productName + ' ' + data.id)
        return +data.id == +item.id;
      }
    )
    // if (index) {
      // console.log(this.assignPOSItems, item.productName, item.id, index)
    // }
    this.assignPOSItems.splice(index, 1)
    this._assingedPOSItems.next(this.assignPOSItems)
  }

  isItemAssigned(id: number): boolean {
    if (!this.assignPOSItems) {
      return false
    };
    let i = 0
    let result = false
    this.assignPOSItems.forEach( data => {
      if (data.id == id ) {
        result = true;
        return
      }
      i = i+1
    })
    return result
  }

  constructor(public route                    : ActivatedRoute,
              private dialog                  : MatDialog,
              private siteService             : SitesService,
              private orderService            : OrdersService,
              private clientTableService      : ClientTableService,
              private _snackBar               : MatSnackBar,
              private posOrderItemService     : POSOrderItemServiceService,
              private editDialog              : ProductEditButtonService,
              private promptGroupService      : PromptGroupService,
              private userAuthorization       : UserAuthorizationService,
              private menuService             : MenuService,
              private priceCategoriesService  : PriceCategoriesService,
              private platFormService         : PlatformService,
              private sendGridService         : SendGridService,
              private router                  : Router,
              private promptWalkService       : PromptWalkThroughService,
              private uiSettingService        : UISettingsService,
              private textMessagingService    : TextMessagingService,
              private toolbarServiceUI        : ToolBarUIService,
              public authenticationService    : AuthenticationService,
              private floorPlanService        : FloorPlanService,
             ) {
    this.initSubscriptions();

  }

  ngOnDestroy(): void {
    if (this._order){ this._order.unsubscribe()}
  }

  async doesOrderExist(site: ISite) {
    if (!this.subscriptionInitialized) { this.initSubscriptions(); }
    if (!this.order || (this.order.id === undefined)) {

      const order$ = this.orderService.newOrderWithPayloadMethod(site, null);
      const order  = await order$.pipe().toPromise();
      if (order) {
        this.order = order;
        this.orderService.updateOrderSubscription(this.order);
        return true;
      }
      // this.orderService.newDefaultOrder(site);
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

  clearOrderFromFloorPlan(site, floorPlanID: number, tableUUID: string): Observable<any> {
    return this.floorPlanService.clearTable(site, floorPlanID, tableUUID )
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


  emailOrderByEntry(order: IPOSOrder) {
    this.editDialog.emailOrderEntry( order)
  }

  emailOrderFromEntry(order: IPOSOrder, email: string) : Observable<any> {
    if (order && email) {
        return  this.sendGridService.sendOrder(order.id, order.history, email, email  )
    }
    this.notifyEvent('No email in contact', 'Alert')
    return null
  }


  emailOrder(order: IPOSOrder) : Observable<any> {
    if (order && order.clientID) {
      if (order.clients_POSOrders.email) {
        const clientName = `${order?.clients_POSOrders?.firstName} ${order?.clients_POSOrders?.lastName}`
        return  this.sendGridService.sendOrder(order.id, order.history, order.clients_POSOrders.email, clientName  )
      }
    }
    this.notifyEvent('No email in contact', 'Alert')
    return null
  }

  sendSSMSOrderISReady(order: IPOSOrder) {
    const site = this.siteService.getAssignedSite()
    if (order.clients_POSOrders && order.clients_POSOrders.cellPhone && order.clients_POSOrders.firstName) {
      this.textMessagingService.sendOrderIsReady(site,order.clients_POSOrders.cellPhone,order.clients_POSOrders.firstName, order.id )
    }
  }

  emailNotifyOrder(order: IPOSOrder) : Observable<any> {
    if (order && order.clientID) {

      if (order.clients_POSOrders.email) {
        const clientName = `${order?.clients_POSOrders?.firstName} ${order?.clients_POSOrders?.lastName}`
        if (this.uiSettingService.homePageSetting) {
          const set = this.uiSettingService.homePageSetting;
          const template = set.sendGridOrderReadyNotificationTemplate
          return  this.sendGridService.sendTemplateOrder(order.id, order.history, order.clients_POSOrders.email, clientName, template, "Your order is ready."  )
        }
      }
    }
    this.notifyEvent('No email in contact', 'Alert')
    return null
  }

  async addItemToOrderWithBarcodePromise(site: ISite, newItem: NewItem):  Promise<ItemPostResults> {
    if (!newItem) {return}
    return await this.posOrderItemService.addItemToOrderWithBarcode(site, newItem).pipe().toPromise();
  }

  scanItemForOrder(site: ISite, order: IPOSOrder, barcode: string, quantity: number, portionValue: string, packaging: string): Observable<ItemPostResults> {
    if (!barcode) {return null;}
    if (!order) {const order = {} as IPOSOrder}
    const deviceName = localStorage.getItem('devicename')
    const newItem = { orderID: order.id, quantity: quantity, barcode: barcode, packaging: packaging, portionValue: portionValue, deviceName: deviceName  } as NewItem
    return this.posOrderItemService.addItemToOrderWithBarcode(site, newItem)
  }

  async addItemToOrder(order: IPOSOrder, item: IMenuItem, quantity: number) {
    await this.processAddItem(order, null, item, quantity, null);
  }

  finalizeOrder(paymentResponse: IPaymentResponse, paymentMethod: IPaymentMethod, order: IPOSOrder): number {

    if (paymentMethod.reverseCharge) {

    }

    const payment = paymentResponse.payment;
    // console.log('finalizeorder balance greater than 0', order.balanceRemaining > 0)
    if (order.balanceRemaining > 0) { return 0 };

    // console.log('finalizeorder', payment , paymentMethod)
    if (payment && paymentMethod) {

      if (paymentMethod.isCreditCard) {
        if (this.platFormService.isApp()) {
          this.editDialog.openChangeDueDialog(payment, paymentMethod, order)
        }
        return 1
      }

      if (payment.amountReceived >= payment.amountPaid) {
        if (this.platFormService.isApp()) {
          this.editDialog.openChangeDueDialog(payment, paymentMethod, order)
        }
        return 1
      }

      return 0

    }
  }

  validateUser(): boolean {
    const valid = this.userAuthorization.validateUser()
    if (!valid) {
      //login prompt
      const ref = this.authenticationService.openLoginDialog()
      this.notifyEvent('Please login, or create your account to place an order. Carts require a registerd user to be created.', 'Alert')
      return false
    } {
      return true
    }
  }



  validateItem(item, barcode) {
    if (!item && !barcode) {
      this.notifyEvent(`Item not found`, 'Alert');
      return false;
    }
    if (!barcode && !item && !item.itemType) {
      this.notifyEvent(`Item not found or configured properly. Item type is not assigned.`, 'Alert');
      return false;
    }
    return true
  }

  validateOrder(): IPOSOrder {
    let order = this.orderService.getCurrentOrder();

    if (!order || order == null) {
      order = {} as IPOSOrder
      order.id    = 0;
    }

    return order;
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

    if (!this.validateItem(item, barcode)) { return }

    let passAlongItem;
    if (this.assignedPOSItem) {  passAlongItem  = this.assignedPOSItem; };

    order = this.validateOrder();

    if (order) {
      const site       = this.siteService.getAssignedSite();

      if (barcode)  {
        const addItem$ = this.scanItemForOrder(site, order, barcode, quantity,  input?.packaging,  input?.portionValue)
        this.processItemPostResults(addItem$)
        return false;
      }

      try {
        let packaging      = '';
        let portionValue   = '';
        let itemNote       = '';
        if (input) {
          packaging        = input?.packaging;
          portionValue     = input?.portionValue;
          itemNote         = input?.itemNote;
        }

        if (item) {
          const deviceName  = localStorage.getItem('devicename')
          const newItem     = { orderID: order.id, quantity: quantity, menuItem: item, passAlongItem: passAlongItem,
                                packaging: packaging, portionValue: portionValue, barcode: '',
                                weight: 1, itemNote: itemNote, deviceName: deviceName } as NewItem
          const addItem$    = this.posOrderItemService.postItem(site, newItem)
          this.processItemPostResults(addItem$)
          return true
        }

      } catch (error) {
        console.log('error', error)
      }
    }
  }

  // tslint:disable-next-line: typedef
  processItemPostResults(addItem$: Observable<ItemPostResults>) {

    this.priceCategoryID = 0;

    addItem$.subscribe(data => {
      if (data) {

      }
        if (data?.message) {  this.notifyEvent(`Process Result: ${data?.message}`, 'Alert ')};


        if (data && data.resultErrorDescription) {
          this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert');
          return;
        }

        if (data.order) {
          this.orderService.updateOrderSubscription(data.order);
          this.addedItemOptions(data.order, data.posItemMenuItem, data.posItem, data.priceCategoryID);
          if (data.order.posOrderItems.length == 1 ) {
            this.toolbarServiceUI.updateOrderBar(true)
          }
        } else {
          this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert');
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

  refundOrder(item: ItemWithAction) {
    const site = this.siteService.getAssignedSite();
    return this.orderService.refundOrder(site,item);
  }

  refundItem(item: ItemWithAction) {
    const site = this.siteService.getAssignedSite();
    return this.orderService.refundItem(site,item);
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


  openProductsByBarcodeList(items: IMenuItem[], order: IPOSOrder) {
    const  newItem = { item: items, order: order}
    const dialogRef = this.dialog.open(ProductListByBarcodeComponent,
      {
        width:     '500px',
        maxWidth:  '500px',
        height:    '75vh',
        maxHeight: '675px',
        panelClass: 'foo',
        data: newItem
      }
    )
    dialogRef.afterClosed().subscribe(result => {
      //use this to remove item if price isn't choice.
      // this.promptGroupService.updatePromptGroup(null)
      // this.promptWalkService.updatePromptGroup(null)
      if (!result) {

        return
      }
      if (result) {
        // this.orderMethodService.scanBarcodeAddItem(barcode, 1, this.input)
        return
      }

    });
  }

  cancelItem(id: number, notify : boolean ) {
    const site = this.siteService.getAssignedSite();
    if (id) {
      this.posOrderItemService.deletePOSOrderItem(site, id).subscribe(result => {
        if (result.scanResult) {
          this.notifyWithOption('Item Deleted', 'Notice', notify)
        } else  {
          this.notifyWithOption('Item must be voided', 'Notice', notify)
        }
        if (result && result.order) {
          this.orderService.updateOrderSubscription(result.order);
          this.initItemProcess();
        }
      })
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

    if (!confirmed && id) {
      const confirm = window.confirm('Are you sure you want to delete this order?')
      if (!confirm) { return }
    }

    if (id) {

      const orderDelete$ = this.orderService.deleteOrder(site, id)
      orderDelete$.subscribe(
        {next: data => {
            if (data) {
              this._snackBar.open('Order deleted.', 'Alert', {verticalPosition: 'top', duration: 1000})
              this.clearOrder();
              if (this.router.url == '/pos-orders') {
                return
              }
              this.router.navigate(['app-main-menu'])
            }
            if (!data) {
              this._snackBar.open('Order not deleted.', 'Alert', {verticalPosition: 'top', duration: 1000})
            }
          }, error : err => {
            this._snackBar.open('Order not deleted.', 'Alert', {verticalPosition: 'top', duration: 1000})
          }
        }
      )
    }
  }

  clearOrder() {

    // localStorage.setItem('orderSubscription', null);
    localStorage.removeItem('orderSubscription')
    this.orderService.updateOrderSubscription(null);

    if (this.userAuthorization.user.roles = 'user') {
      this.router.navigate(['/app-main-menu']);
      return;
    }

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
        // this.printingService.previewReceipt()
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

  processInventoryPrice(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem, priceCategoryID : number) {
    const site = this.siteService.getAssignedSite()
    const price$ = this.priceCategoriesService.getPriceCategory(site,priceCategoryID);
    price$.subscribe(data => {
      // const priceCategory                   = this.shapePriceCategory(data)
      this.processItem.item.priceCategories = data;
      this.promptOpenPriceOption(this.order,this.processItem.item,this.processItem.posItem)
      return
    })
  }

  //, pricing:  priceList[]
  async addedItemOptions(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem, priceCategoryID : number) {
    const processItem    = {} as ProcessItem;
    processItem.item     = item;
    processItem.order    = order;
    processItem.posItem  = posItem;
    this.processItem     = processItem;
    this._itemProcessSection.next(0)
    this.itemProcessSection = 0;
    this.order           = order;
    this.priceCategoryID = priceCategoryID;
    this.handleProcessItem();
  }

  async handleProcessItem() {
    let process = this.itemProcessSection;

    if (!this.processItem) {
      this.orderService.updateOrderSubscription(this.order)
      return
    }

    if ( !this.itemProcessSection && this.processItem?.item?.itemType?.type.toLowerCase() === 'store credit'.toLowerCase()) {
      process = 4;
      this.itemProcessSection = 4;
    }

    switch(process) {
      case  0: {
          if (this.priceCategoryID == 0) {
            this.promptOpenPriceOption(this.order,this.processItem.item,this.processItem.posItem)
            return
          }
          this.processInventoryPrice(this.order,this.processItem.item,this.processItem.posItem, this.priceCategoryID)
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
        break;
      }
      case  3: {
        this.openQuantityPrompt(this.order,this.processItem.item,this.processItem.posItem);
        break;
      }
      case  4: {
        if ( !this.itemProcessSection && this.processItem?.item?.itemType?.type.toLowerCase() === 'store credit'.toLowerCase()) {
          this.openGiftCardPrompt(this.order,this.processItem.item,this.processItem.posItem);
          return
        }
        this.updateProcess()
        break;
      }
      case 5: {
        this.openPriceChangePrompt(this.order,this.processItem.item,this.processItem.posItem);
        break;
      }
      case 6: {
        this.orderService.updateOrderSubscription(this.order);
        break;
      }
      case 7: {

        // this.orderService.updateOrderSubscription(this.order);
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
    // encapsulation: ViewEncapsulation.None
    this.updatePOSIssuePurchaseItem(posItem);

    const dialogRef = this.dialog.open(StoreCreditIssueComponent,
      {
        width:     '500px',
        maxWidth:  '500px',
        height:    '500px',
        maxHeight: '500px',
      }
    )
    dialogRef.afterClosed().subscribe(result => {
      // this.promptGroupService.updatePromptGroup(null)
      // this.promptWalkService.updatePromptGroup(null)
      // if (result) {
      //   this.updateProcess();
      // }
      if (!result) { this.initItemProcess(); }
      return;
    });

    this.updateProcess() //

    return;

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
        this.editDialog.openVoidItemDialog(orderItem)
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

  getLoginActions(): Observable<IPOSOrder> {
    const site = this.siteService.getAssignedSite()
    const item = localStorage.getItem('loginAction') //., JSON.stringify(loginAction))

    if (!item) { return }
    const action = JSON.parse(item)

    // console.log('get login actions', action)/
    if (action?.name === 'setActiveOrder') {
      // console.log('get login actions 2', action)
      return this.orderService.getOrder(site, action.id, false).pipe(
        switchMap(order => {
          this.orderService.updateOrderSubscriptionLoginAction(order)
          localStorage.removeItem('loginAction')
          this.router.navigate(['pos-payment'])
          return of(order)
        })
      )
    }
    // const order = {} as IPOSOrder
    return null
  }


  notifyWithOption(message: string, title: string, notifyEnabled: boolean) {
    if (notifyEnabled) {
      this.notifyEvent(message, title)
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'bottom'
    });
  }
}
