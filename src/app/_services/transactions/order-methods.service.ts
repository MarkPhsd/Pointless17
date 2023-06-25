import { Injectable, OnDestroy } from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { AuthenticationService, MenuService, OrderPayload, OrdersService, TextMessagingService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as _  from "lodash";
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BehaviorSubject, catchError,Observable, of, Subscription, switchMap } from 'rxjs';
import { IClientTable, IPaymentResponse, IPOSOrder, IPOSOrderSearchModel, IPOSPayment, IPurchaseOrderItem, IServiceType, PaymentMethod, PosOrderItem, ProductPrice } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemPostResults, ItemWithAction, NewItem, POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
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
import { SendGridService } from '../twilio/send-grid.service';
import { UISettingsService } from '../system/settings/uisettings.service';
import { ProductListByBarcodeComponent } from 'src/app/modules/menu/product-list-by-barcode/product-list-by-barcode.component';
import { ToolBarUIService } from '../system/tool-bar-ui.service';
import { FloorPlanService } from '../floor-plan.service';
import { PrepPrintingServiceService } from '../system/prep-printing-service.service';
import { IReportItemSaleSummary } from '../reporting/reporting-items-sales.service';
import { AbstractControl,  ValidationErrors, ValidatorFn } from '@angular/forms';
import { BalanceSheetMethodsService } from './balance-sheet-methods.service';
import { ServiceTypeService } from './service-type-service.service';
import { StoreCreditMethodsService } from '../storecredit/store-credit-methods.service';
import { UserSwitchingService } from '../system/user-switching.service';
import { FastUserSwitchComponent } from 'src/app/modules/profile/fast-user-switch/fast-user-switch.component';

export interface ProcessItem {
  order   : IPOSOrder;
  item    : IMenuItem;
  posItem : IPurchaseOrderItem;
}
export class DateValidators {
  static greaterThan(startControl: AbstractControl): ValidatorFn {
    return (endControl: AbstractControl): ValidationErrors | null => {
      const startDate: Date = startControl.value;
      const endDate: Date = endControl.value;
      if (!startDate || !endDate) {
        return null;
      }
      if (startDate >= endDate) {
        return { greaterThan: true };
      }
      return null;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrderMethodsService implements OnDestroy {

  public toggleChangeOrderType: boolean;

  private _posPaymentStepSelection     = new BehaviorSubject<IPaymentMethod>(null);
  public posPaymentStepSelection$      = this._posPaymentStepSelection.asObservable();

  private itemProcessSection      = 0
  private _itemProcessSection     = new BehaviorSubject<number>(null);
  public itemProcessSection$      = this._itemProcessSection.asObservable();

  processItem : ProcessItem

  private _assingedPOSItems = new BehaviorSubject<PosOrderItem[]>(null);
  public  assignedPOSItems$ = this._assingedPOSItems.asObservable();
  public  assignPOSItems       : PosOrderItem[];

  private _lastSelectedItem = new BehaviorSubject<PosOrderItem>(null);
  public  lastSelectedItem$ = this._lastSelectedItem.asObservable();

  private _posIssuePurchaseItem   = new BehaviorSubject<IPurchaseOrderItem>(null);
  public  posIssuePurchaseItem$ = this._posIssuePurchaseItem.asObservable();

  private _posIssueItem = new BehaviorSubject<PosOrderItem>(null);
  public  posIssueItem$ = this._posIssueItem.asObservable();
  public splitEntryValue  = 0;

  public get assignedPOSItem() {return this.assignPOSItems }

  priceCategoryID: number;

  ////////////

  private _currentOrder       = new BehaviorSubject<IPOSOrder>(null);
  public currentOrder$        = this._currentOrder.asObservable();
  public currentOrder         = {} as IPOSOrder

  lastOrder : IPOSOrder;

  public order                    : IPOSOrder;
  _order                          : Subscription;
  subscriptionInitialized         : boolean;

  private _posOrders          = new BehaviorSubject<IPOSOrder[]>(null);
  public posOrders$           = this._posOrders.asObservable();

  //applies to order filter for POS
  private _viewOrderType      = new BehaviorSubject<number>(null);
  public viewOrderType$       = this._viewOrderType.asObservable();

  ///order Service
  posSearchModel  :IPOSOrderSearchModel
  private _posSearchModel     = new BehaviorSubject<IPOSOrderSearchModel>(null);
  public posSearchModel$      = this._posSearchModel.asObservable();

  private _lastItemAdded     = new BehaviorSubject<IMenuItem>(null);
  public lastItemAdded$      = this._lastItemAdded.asObservable();
  lastItemAddedExists : boolean;

  private _splitGroupOrder     = new BehaviorSubject<IPOSOrder>(null);
  public splitGroupOrder$      = this._splitGroupOrder.asObservable();


  public _scanner             = new BehaviorSubject<boolean>(null);
  public scanner$             = this._scanner.asObservable();

  private _templateOrder       = new BehaviorSubject<IPOSOrder>(null);
  public templateOrder$        = this._templateOrder.asObservable();
  public templateOrder         = {} as IPOSOrder

  private _bottomSheetOpen    = new BehaviorSubject<boolean>(null);
  public bottomSheetOpen$     = this._bottomSheetOpen.asObservable();

  selectedPayment             : IPOSPayment;

  isApp                       = false;
  private orderClaimed                : boolean;

  getCurrentOrder() {
    if (!this.currentOrder) {
      this.currentOrder = this.getStateOrder();
    }
    return this.currentOrder;
  }

  get IsOrderClaimed() { return this.orderClaimed};

  updateTemplateOrder(order: IPOSOrder) {
    order = this.getCost(order)
    this._templateOrder.next(order)
  }

  getSelectedPayment() {
    const payment = this.selectedPayment ;
    this.selectedPayment = null
    return of(payment);
  }

  updateBottomSheetOpen(open: boolean) {
    this._bottomSheetOpen.next(open);
  }

  updateViewOrderType(value: number) {
    this._viewOrderType.next(value)
  }


  // updateLastItemAdded(item: IMenuItem) {
  //   this.orderService.updateLastItemAdded(item)
  // }

  updateLastItemAdded(item: IMenuItem) {
    this.lastItemAddedExists = false
    if (!item || !item.urlImageMain) {
      this._lastItemAdded.next(null)
      return;
    }
    this.lastItemAddedExists = true
    this._lastItemAdded.next(item)
  }

  updateOrderSubscriptionClearOrder(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.orderService.releaseOrder(site, id).subscribe()
    }
    this.clearOrderSubscription()
  }

  clearOrderSubscription() {
    localStorage.removeItem('orderSubscription')
    this.toolbarServiceUI.updateOrderBar(false)
    this.updateLastItemAdded(null)
    this.updateOrderSubscription(null);
  }

  updateOrderSubscriptionLoginAction(order: IPOSOrder) {
    this.storeCreditMethodService.updateSearchModel(null)
    this.getCost(order)
    this.currentOrder = order;
    this._currentOrder.next(order);
    if (order == null) {
      order = this.getStateOrder();
      order = this.getCost(order);
      if (order) {
        return;
      }
    }
  }

  getCost(order: IPOSOrder) {
    if (order ) {
      order.cost = 0
      if (order.posOrderItems && order.posOrderItems.length>0) {
        order.posOrderItems.forEach(data => {
          if (data.wholeSaleCost) {
            order.cost = data.wholeSaleCost + order.cost
          }
        })
      }
      // console.log('order cost', order?.cost)
    }
    return order
  }

  updateOrder(order: IPOSOrder) {
    try {
      this.currentOrder = order;
      this._currentOrder.next(order);
      this.setStateOrder(order);
      this._scanner.next(true)
    } catch (error) {
      console.log('error', error)
    }
  }

  setScanner() {
    this._scanner.next(true)
  }

  updateOrderSubscription(order: IPOSOrder) {
    this.updateOrder(order);
    if (order == null) {
      order = this.getStateOrder();
      if (order) {
        this.toolbarServiceUI.updateOrderBar(false)
        return;
      }
      if (!order) {
        this.toolbarServiceUI.updateOrderBar(false);
      }
    }

    this.storeCreditMethodService.updateSearchModel(null);
    this.setScanner()
    const site = this.siteService.getAssignedSite();
    const devicename = localStorage.getItem('devicename')
    if (order?.deviceName === devicename) { return }
    this.orderClaimed = false;
    if (order && order.id ) {
      const order$ = this.orderService.claimOrder(site, order.id.toString(), order.history)
      if (!order$) {
        this.orderClaimed = false;
        return
      }
      order$.subscribe(result => {
        this.orderClaimed = true;
      });
    }
  }

  setStateOrder(order) {
    order = this.getCost(order);
    const orderJson = JSON.stringify(order);
    localStorage.setItem('orderSubscription', orderJson);
  }

  getStateOrder(){
    try {
      let stringorder = localStorage.getItem('orderSubscription');
      let order = JSON.parse(stringorder) as IPOSOrder;
      if (order) {
        order = this.getCost(order)
      }
      return order;
    } catch (error) {
      return null;
    }
  }

  updateOrderSearchModel(searchModel: IPOSOrderSearchModel) {
    if (!searchModel) {
      this._posSearchModel.next(searchModel);
      return ;
    }
    const user = this.userAuthorization.currentUser()
    if (this.showAllOrders) {
      if (user && user.employeeID && user.employeeID != null) {
        searchModel.employeeID = 0
      }
    }
    if (!this.showAllOrders && this.userAuthorization.isStaff ) {
      if (user && user.employeeID  && user.employeeID != null) {
        searchModel.employeeID = user.employeeID
      }
    }
    if (!this.showAllOrders && this.userAuthorization.isUser) {
      if (user && user.id && user.id != null) {
        searchModel.clientID = user.id
      }
    }
    this.posSearchModel = searchModel
    this._posSearchModel.next(searchModel);
  }

  updateSplitGroup(data: IPOSOrder) {
    this._splitGroupOrder.next(data);
  }

  get showAllOrders() {
    let  user = this.userAuthorization.user
    if ( user && user.userPreferences) {
      return user.userPreferences.showAllOrders
    }
    return false
  }////////////

  updatePaymentMethodStep(item: IPaymentMethod) {
    this._posPaymentStepSelection.next(item)
  }

  updateLastItemSelected(item: PosOrderItem) {
    this._lastSelectedItem.next(item)
  }

  initSubscriptions() {
    this._order = this.currentOrder$.subscribe(order => {
      this.order = order;
      this.clearAssignedItems();
    })
  }

  initItemProcess(){
    this.updateOrderSubscription(this.order);
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
      return false;
    } else {
      this.addAssignedItem(item)
      return true;
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
        return +data.id == +item.id;
      }
    )

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
              public  authenticationService    : AuthenticationService,
              private siteService             : SitesService,
              private userSwitchingService    : UserSwitchingService,
              // private balanceSheetMethodsService    : BalanceSheetMethodsService,
              private editDialog              : ProductEditButtonService,
              private floorPlanService        : FloorPlanService,
              private menuService             : MenuService,
              private priceCategoriesService  : PriceCategoriesService,
              private platFormService         : PlatformService,
              private sendGridService         : SendGridService,
              private orderService            : OrdersService,
              private posOrderItemService     : POSOrderItemService,
              private promptWalkService       : PromptWalkThroughService,
              private promptGroupService      : PromptGroupService,
              private router                  : Router,
              private textMessagingService    : TextMessagingService,
              private toolbarServiceUI        : ToolBarUIService,
              private uiSettingService        : UISettingsService,
              private userAuthorization       : UserAuthorizationService,
              private _snackBar               : MatSnackBar,
              private storeCreditMethodService: StoreCreditMethodsService,

             ) {
    this.isApp = this.platFormService.isApp()
    const order = this.getStateOrder();
    if (order) {
      this.updateOrderSubscription(order)
    }
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    if (this._order){ this._order.unsubscribe()}
  }

  setPOSName(name: string): boolean {
    if (name.length) {
      if (name.length <= 5) {
        localStorage.setItem(`devicename`, name)
        if (localStorage.getItem(`devicename`) === name  ) {
          return true
        } else {
          return false
        }
      }
    } else {
      localStorage.removeItem('devicename');
      return false
    }
  }

  get posName(): string {
    const item = localStorage.getItem(`devicename`)
    return item
  };

  async doesOrderExist(site: ISite) {
    if (!this.subscriptionInitialized) { this.initSubscriptions(); }
    if (!this.order || (this.order.id === undefined)) {

      const order$ = this.newOrderWithPayloadMethod(site, null);
      const order  = await order$.pipe().toPromise();
      if (order) {
        this.order = order;
        this.updateOrderSubscription(this.order);
        return true;
      }
    }
    return true;
  }

  doesOrderExistObs(site: ISite): Observable<IPOSOrder> {
    if (!this.subscriptionInitialized) { this.initSubscriptions(); }
    if (!this.order || (this.order.id === undefined)) {
      const order$ = this.newOrderWithPayloadMethod(site, null);
      return  order$.pipe(switchMap(data => {
        this.order = data;
        this.updateOrderSubscription(this.order);
        return of(data)
      }),
      catchError(err => {
        return of(err)
      })
      );
    }
    return of(this.order)
  }

  appylySerial(id: number, serialCode: string) {
    const site = this.siteService.getAssignedSite();
    return this.posOrderItemService.appylySerial(site, id, serialCode, null)
  }

  addPriceToItem(order: IPOSOrder,  menuItem: IMenuItem, price: ProductPrice,
                 quantity: number, itemID: number): Observable<any> {

    const site          = this.siteService.getAssignedSite();
    if (!order)         { order = this.order };

    return this.doesOrderExistObs(site).pipe(
      switchMap(order => {
        this.order = order;
        this.updateOrderSubscription(order)
        const newItem     =  { orderID: order.id, itemID: itemID, quantity: quantity, menuItem: menuItem, price: price };
        return this.posOrderItemService.putItem(site, newItem);
      })
    ).pipe(
      switchMap(data => {
        // console.log('data', data.posItem)
        if (data.order) {
          this.order = data.order
          this.updateOrderSubscription(data.order)
          this.updateProcess()
          return of(data)
        } else {
          this.notifyEvent(`Error occured, this item was not changed. ${data.resultErrorDescription}`, 'Alert')
          return of(null)
        }
      }
    ),
    catchError(err => {
      this.notifyEvent(`Error occured, this item was not changed. ${err}`, 'Error');
      // console.log('error occured', err)
      return of(err)
    }))
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

  ///1. List item. 2. Add Item 3. View Sub Groups of Items.   //either move to s
  menuItemActionObs(order: IPOSOrder, item: IMenuItem, add: boolean,
                    passAlongItem: PosOrderItem[]): Observable<ItemPostResults> {
    const searchResults = this.updateMenuSearchModel(item)
    if (add) {
      if (item && (item.itemType.requireInStock == true))  {
        this.listItem(item.id);
        return of(null)
      }
      return  this.addItemToOrderObs(order, item, 1, 0, passAlongItem)
    }
    this.listItem(item.id);
    return of(null)
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
    if (item?.itemType?.name?.toLowerCase() == 'category') {
      model.categoryID   = item.categoryID
      this.menuService.updateSearchModel(model)
      this.router.navigate(["/menuitems-infinite/", {categoryID:item.id }])
      return true
    }

    if (item?.prodModifierType == 4) {
      model.subCategory  = item.id.toString()
      this.menuService.updateSearchModel(model)
      this.router.navigate(["/menuitems-infinite/", {categoryID:item.id }])
      return true
    }

    if (item?.prodModifierType == 5) {
      model.subCategoryID  = +item.id
      this.menuService.updateSearchModel(model)
      this.router.navigate(["/menuitems-infinite/", {subCategoryID:item.id }])
      return true
    }

    if (item?.prodModifierType == 6) {
      model.departmentID = item.id
      this.menuService.updateSearchModel(model)
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

  scanItemForOrder(site: ISite, order: IPOSOrder, barcode: string, quantity: number,
                   portionValue: string, packaging: string, assignedPOSItems: PosOrderItem[]): Observable<ItemPostResults> {

    if (!barcode) { return null;}
    if (!order) {const order = {} as IPOSOrder}

    let passAlongItem = {} as any;

    if (this.assignPOSItems) {
      passAlongItem =  this.assignPOSItems[0];
    }

    const deviceName = localStorage.getItem('devicename');

    const newItem = { orderID: order.id, quantity: quantity, barcode: barcode, packaging: packaging,
                      portionValue: portionValue, deviceName: deviceName, passAlongItem: passAlongItem,
                      clientID: order.clientID , priceColumn : order.priceColumn, assignedPOSItems: assignedPOSItems } as NewItem;

    // console.log(newItem)
    return this.posOrderItemService.addItemToOrderWithBarcode(site, newItem).pipe(switchMap(data => {
      // console.log('data', data)
      return of(data)
    }))
  }

  async addItemToOrder(order: IPOSOrder, item: IMenuItem, quantity: number) {
    await this.processAddItem(order, null, item, quantity, null);
  }

  addItemToOrderObs(order: IPOSOrder, item: IMenuItem, quantity: number, rewardAvailableID: number, passAlongItem: PosOrderItem[]) {
    let passAlong; // = passAlongItem[0]
    if (passAlongItem && passAlongItem[0]) {
      passAlong = passAlongItem[0]
    }
    return this.processItemPOSObservable(order, null, item, 1, null , 0, 0,
                                          passAlong, this.assignPOSItems )
  }



  // refreshOrder(id: number, history) {
  //   if (this.order) {
  //     const site = this.siteService.getAssignedSite();
  //     const order$ = this.orderService.getOrder(site, this.order.id.toString() ,
  //                                                this.order.history)

  //     order$.subscribe( data => {
  //         this.updateOrderSubscription(data)
  //     })
  //   }
  // }

  refreshOrder(id: number) {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      const order$ = this.orderService.getOrder(site, id.toString() , this.order.history)
      // const source = timer(5000, 3000);
      order$.subscribe( data => {
          this.updateOrderSubscription(data)
      })
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
      // this.notifyEvent(`Item not found.`, 'Alert');
      return false;
    }

    if (item && !item.active){
      this.notifyEvent(`Item not active`, 'Alert');
      return false;
    }

    if (item && !item.itemType) {
      this.notifyEvent(`Item not found or configured properly. Item type is not assigned.`, 'Alert');
      return false;
    }

    return true
  }

  validateOrder(): IPOSOrder {
    let order = this.getCurrentOrder();

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

    // console.log('processAddItem assigned items', this.assignedPOSItem);

    if (this.assignedPOSItem) {  passAlongItem  = this.assignedPOSItem; };

    order = this.validateOrder();

    if (order) {
      const site       = this.siteService.getAssignedSite();
      const passAlongItems = this.assignPOSItems;

      if (barcode)  {
        const addItem$ = this.scanItemForOrder(site, order, barcode, quantity,  input?.packaging,
                                               input?.portionValue, passAlongItems)
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
                                weight: 1, itemNote: itemNote, deviceName: deviceName, assignedPOSItems: passAlongItems } as NewItem
          const addItem$    = this.posOrderItemService.postItem(site, newItem)
          this.processItemPostResults(addItem$)
          return true
        }

      } catch (error) {
        console.log('error', error)
      }
    }
  }

  processItemPOSObservable(
                            order : IPOSOrder ,
                            barcode: string,
                            item: IMenuItem,
                            quantity: number,
                            input: any,
                            rewardAvailableID: number,
                            rewardGroupApplied: number,
                            passAlongItem: PosOrderItem,
                            passAlongItems: PosOrderItem[]) : Observable<ItemPostResults> {


    const valid = this.validateUser();
    if (!valid) {
      this.notifyEvent(`Invalid user.`, 'Alert ')
      return
    };

    this.initItemProcess();
    if (quantity === 0 ) { quantity = 1 };

    if (!this.validateItem(item, barcode)) {
      return of(null)
    }

    if (this.assignedPOSItem && !passAlongItem) {  passAlongItem  = this.assignedPOSItem[0]; };

    order = this.validateOrder();

    if (order) {

      const site       = this.siteService.getAssignedSite();
      if (barcode)  {
        return this.scanItemForOrder(site, order, barcode, quantity,  input?.packaging,
                                    input?.portionValue,
                                    passAlongItems).pipe(switchMap(
          data => {
            this.processItemPostResultsPipe(data)
            return of(data);
          }
        ))
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
          const splitGroupID = this.splitEntryValue;
          let newItem     = { orderID: order.id, quantity: quantity, menuItem: item,
                              passAlongItem: passAlongItem,
                              packaging: packaging, portionValue: portionValue, barcode: '',
                              weight: 1, itemNote: itemNote, deviceName: deviceName,
                              rewardAvailableID: rewardAvailableID,
                              rewardGroupApplied: rewardGroupApplied, clientID: order.clientID, splitGroupID: splitGroupID,
                              assignedPOSItems: passAlongItems }

          if (order.id == 0 || !order.id) {
            const orderPayload = this.getPayLoadDefaults(null)
            return this.orderService.postOrderWithPayload(site, orderPayload).pipe(
              switchMap(data => {
                // console.log('post order', data)
                if (!data) {
                  this.siteService.notify('No order started. There might be something wrong.', 'Close', 2000)
                  return of(null)
                }
                newItem.orderID = data.id;
                return this.posOrderItemService.postItem(site, newItem)
              })).pipe(
                switchMap(data => {
                  this.processItemPostResultsPipe(data)
                  return of(data);
              })
            )
          }

          return  this.posOrderItemService.postItem(site, newItem).pipe(switchMap(
            data=> {
              this.processItemPostResultsPipe(data)
              return of(data);
            }
          ))
        }

      } catch (error) {
        this.notifyEvent(error, 'Alert ')
        console.log('error', error)

      }
    }
    this.notifyEvent('Nothing added.', 'Alert ')
    return of(null)
  }

  // tslint:disable-next-line: typedef
  processItemPostResults(addItem$: Observable<ItemPostResults>) {
    this.priceCategoryID = 0;
    addItem$.subscribe(data => {
        this.processItemPostResultsPipe(data)
      }
    )
  }

  getOrderFromItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite()
      return  this.posOrderItemService.getPOSOrderItem(site,id).pipe(switchMap(data => {
        return this.orderService.getOrder(site, data.orderID.toString(), false)
      }))
    }
  }

  processItemPostResultsPipe(data) {
      // console.log('processItemPostResults', data);
      if (data) {
      }

      this.assignPOSItems = [];
      // this.assignPOSItems.push(null);

      if (data?.message) {  this.notifyEvent(`Process Result: ${data?.message}`, 'Alert ')};

      if (data && data.resultErrorDescription && data.resultErrorDescription != null) {
         this.siteService.notify(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert', 5000, 'red');
        return;
      }

      if (data.order) {
        this.updateOrderSubscription(data.order);
        this.addedItemOptions(data.order, data.posItemMenuItem, data.posItem, data.priceCategoryID);

        if (this.siteService.phoneDevice) {
        } else {
          const order = data.order as IPOSOrder;
          if (order && order.service && order.service.retailType) {
            this.toggleOpenOrderBar(this.userAuthorization.isStaff)
            this.toolbarServiceUI.updateOrderBar(false)
            return;
          }
          if (order && order.posOrderItems.length == 1 ) {
            this.toolbarServiceUI.updateOrderBar(true)
          }
          if (!this.toolbarServiceUI.orderBar) {
            this.siteService.notify(`Item added ${data?.posItemMenuItem?.name}`, 'close', 1000, 'green')
          }
        }

      } else {
        // console.log('data.Error 2 ', data)
        this.siteService.notify(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert', 5000, 'red');
        return;
      }

      if (this.openDialogsExist) {
        // this.notification('Item added to cart.', 'Check Cart');
      }

  }

  toggleOpenOrderBar(isStaff: boolean) {
    let schedule = 'currentorder'
    if (isStaff) { schedule = '/currentorder/' }
    this.router.navigate([ schedule , {mainPanel:true}]);
    this.toolbarServiceUI.updateOrderBar(false)
    this.toolbarServiceUI.resetOrderBar(true)
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

  scanBarcodeAddItemObservable(barcode: string, quantity: number, input: any, passAlongItem: PosOrderItem[]) {
    return this.processItemPOSObservable(this.order, barcode, null, quantity, input, 0, 0, passAlongItem[0],
                                         passAlongItem);
 }

   newOrderWithPayloadMethod(site: ISite, serviceType: IServiceType): Observable<any> {
    // console.log('new order with payload')

    if (!site) { return of(null) }
    if (!this.userAuthorization.user) {
      this.siteService.notify('user required', 'Alert', 1000)
      return of(null)
    }
    const orderPayload = this.getPayLoadDefaults(serviceType)
    let order: any;
    const order$ = this.orderService.postOrderWithPayload(site, orderPayload);

    return order$.pipe(
      switchMap( data => {
        order = data
        this.processOrderResult(order, site)
        return this.navToDefaultCategory()
      })).pipe(switchMap( item => {
        this.processOrderResult(order, site, item?.id)
        return of(order)
      }),
        catchError(data => {
        this.siteService.notify(`Order not started. ${data}`, 'Alert', 2000, 'red')
        return of(data)
      }))

  }

  newOrderWithPayloadObs(site: ISite, serviceType: IServiceType) {
    // console.log('new order with payload')
    let order: any
    const order$ = this.newOrderWithPayloadMethod(site, serviceType )
    return order$.pipe(
          switchMap( data => {
            order = data
            this.processOrderResult(order, site)
            return this.navToDefaultCategory()
          })).pipe(switchMap( item => {
            this.processOrderResult(order, site, item?.id)
            return of(order)
          }),
          catchError(data => {
          this.siteService.notify(`Order not started. ${data}`, 'Alert', 2000, 'red')
          return of(data)
        }))
  }


  //////////////////async await functions.
  newDefaultOrder(site: ISite)  {
    if (!site)        {  return }
    this.newOrderWithPayload(site, null);
  }

  newOrderWithPayload(site: ISite, serviceType: IServiceType) {
    // console.log('new order with payload')
    const order$ = this.newOrderWithPayloadMethod(site, serviceType )
    let order: IPOSOrder;

    return order$.pipe(
      switchMap(data =>
        {
          order = data;
          return  this.navToDefaultCategory()
        }
      )).pipe(switchMap( data => {
        this.processOrderResult(order, site,  data?.id)
        return of(data)
    }))
  }

  // error:  catchError => {
  //   this.notifyEvent(`Error submitting Order # ${catchError}`, "Posted")
  // }

  newOrderFromTable(site: ISite, serviceType: IServiceType, uuID: string, floorPlanID: number, name: string): Observable<IPOSOrder> {
    if (!site) { return }
    let orderPayload = this.getPayLoadDefaults(serviceType)
    if (!orderPayload.order) {
      orderPayload.order = {} as IPOSOrder
    }
    orderPayload.order.tableUUID = uuID;
    orderPayload.order.floorPlanID = floorPlanID;
    orderPayload.order.customerName = name;
    orderPayload.order.tableName = name;
    return  this.orderService.postOrderWithPayload(site, orderPayload)
  }

  processOrderResult(order: IPOSOrder, site: ISite, categoryID?: number ) {
    if (order.resultMessage != undefined) {
      this.siteService.notify(`Error submitting Order ${order.resultMessage}`, "Posted", 2000)
      return
    }
    this.setActiveOrder(site, order)

    // console.log('processsorderresult', categoryID)
    if (categoryID) {
      this.navToCategory(categoryID)
    }
    if (!categoryID) {
      this.navToMenu();
    }
  }

  setLastOrder() {
    if (this.order) {
      const order = JSON.stringify(this.order)
      this.lastOrder =  JSON.parse(order)// structuredClone(this.order);
    }
  }

  setActiveOrder(site, order: IPOSOrder) {

    if (order) {

      if (!this.authenticationService?.deviceInfo?.phoneDevice) {
        this.toolbarServiceUI.updateOrderBar(true)
      }

      this.updateOrderSubscription(order)
      this.updateLastItemAdded(null)

      if (!order.history && this.platFormService.isApp()) {
        if (!order.completionDate && !order.preferredScheduleDate) {
          if (!this.authenticationService?.deviceInfo?.phoneDevice) {
            this.toolbarServiceUI.showSearchSideBar()
          }
          return
        }
      }
    }
  }

  getPayLoadDefaults(serviceType: IServiceType): OrderPayload {
    const orderPayload = {} as OrderPayload;
    orderPayload.client = null;
    orderPayload.serviceType = serviceType;
    orderPayload.deviceName = this.devicename;
    const order = {} as IPOSOrder;
    order.deviceName =  orderPayload.deviceName;
    order.employeeID = +this.getEmployeeID();
    orderPayload.order = order
    return orderPayload
  }

  getEmployeeID(): number {
    const id = +this.authenticationService?.userValue?.id;
    // const id = localStorage.getItem('employeeIDLogin')  ;
    // console.log('employeeIDLogin', id)
    if (id) {
      return +id
    }
    return  0
  }

  navToDefaultCategory(): Observable<IMenuItem> {

    return this.uiSettingService.transactionUISettings$.pipe(switchMap(data => {
      // console.log('transaction ui settings', data)
      const site = this.siteService.getAssignedSite()
      if (data && data.defaultNewOrderCategoryID) {
        return this.menuService.getMenuItemByID(site, data.defaultNewOrderCategoryID)
      }
      // console.log('no default categoryID')
      return of(null)
    })).pipe(switchMap(data => {
      ///nav to category
      if (!data) {
        // console.log('no category')
        return of(null)
      }

      if (data) {
        this.router.navigate(["/menuitems-infinite/", {categoryID:data.id}]);
      }
      return of(data)
    }))
  }


 navToMenu() {
    // determine device type so weknow how to respond
    //if it's a phone. then we can go to the menu.
    if (this.router.url != '/app-main-menu'){
      if (this.router.url.substring(0, '/menuitems-infinite'.length) != '/menuitems-infinite') {
         this.router.navigate(['/app-main-menu']);
        return
      }
    }
  }

  navToCategory(categoryID: number) {
    this.router.navigate(["/menuitems-infinite/", {categoryID:categoryID}]);
  }

  get devicename(): string {
    try {
      if (localStorage.getItem('devicename')) {
        return localStorage.getItem('devicename')
      }
    } catch (error) {

      return '';
    }
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
            this.updateOrderSubscription(this.order)
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

    item =  this.menuService.getPricesFromProductPrices(item)
    if (item && item.priceCategories && item.priceCategories.productPrices.length > 1 ) {

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
        const resultValue        = result.result;
        this.updatePOSIssueItem(result.posItem)
        this.posOrderItemService.updatePOSItemSubscription(result.posItem)
        this.processItem.posItem = result.posItem

        if (!resultValue) {
          this.cancelItem(posItem.id, false);
          return
        }
        if (resultValue) {
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
          // this.notifyWithOption('Item Deleted', 'Notice', notify)
        } else  {
          this.siteService.notify('Item must be voided', 'Notice', 1500, 'yellow')
        }
        if (result && result.order) {
          this.updateOrderSubscription(result.order);
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

  deleteOrder(id: number, confirmed: boolean): Observable<any> {
    const site = this.siteService.getAssignedSite();

    if (!confirmed && id) {
      const confirm = window.confirm('Are you sure you want to delete this order?')
      if (!confirm) { return of(null)}
    }

    if (id) {

      const orderDelete$ = this.orderService.deleteOrder(site, id)
      return orderDelete$.pipe(
        switchMap(
           data => {
            if (data) {
              this.siteService.notify('Order deleted.', 'Alert', 1000, 'green' ) // {verticalPosition: 'top', duration: 1000})
              this.clearOrder();
              if (this.router.url == '/pos-orders') {
                return
              }
              this.router.navigate(['app-main-menu'])
            }
            if (!data) {
              this.siteService.notify('Order not deleted.', 'Alert', 1000, 'red' ) // {verticalPosition: 'top', duration: 1000})
            }
            return of(data)
          }),
          catchError(error => {
            this.siteService.notify('Order not deleted.', 'Alert', 1000, 'red' ) //{verticalPosition: 'top', duration: 1000, 'red'})
            return of(error)
          }
        )
      )
    }
    return of(null)
  }

  suspendOrder(order: IPOSOrder): Observable<IPOSOrder> {
    if (order) {

      if (order.clientID == 0) {
        this.siteService.notify('Assign this order a customer for reference', 'Alert', 1500, 'yellow')
        return of(null)
      }

      const site = this.siteService.getAssignedSite();
      this.order.suspendedOrder = true;
      this.order.orderLocked = null;
      const suspend$ =  this.orderService.putOrder(site, this.order)

      return  suspend$.pipe(
        switchMap(data =>{
          this.clearOrder()
          this.siteService.notify('This order has been suspended', 'Success', 1000, 'green')
          this.router.navigateByUrl('/pos-orders');
          return of(data)
        })
       )

     };
     return of(null)
  }

  exitOrder() {
    this.clearOrder();
  }

  clearOrder() {

    // localStorage.setItem('orderSubscription', null);
    localStorage.removeItem('orderSubscription')
    this.updateOrderSubscription(null);
    this.splitEntryValue = 0;
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

    //then close the order bar.

  }

  closeOrder(site: ISite, order: IPOSOrder) {
    if (order) {
      const result$ = this.orderService.completeOrder(site, order.id)
      result$.subscribe(data=>  {
        this.notifyEvent(`Order Paid for`, 'Order Completed')
        this.updateOrderSubscription(data)

      }
    )
   }
  }




  openPromptWalkThrough(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
    if (!posItem || posItem.promptGroupID == 0 || !posItem.promptGroupID) { return }
    const prompt = this.promptGroupService.getPrompt(site, item.promptGroupID).subscribe ( prompt => {
      // console.log('openPromptWalkThrough', prompt, posItem)
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



 addedItemOptions(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem, priceCategoryID : number) {
    this.updateLastItemAdded(item)
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

  handleProcessItem() {
    let process = this.itemProcessSection;

    if (!this.processItem) {
      this.updateOrderSubscription(this.order)
      return
    }

    if ( !this.itemProcessSection && this.processItem?.item?.itemType?.type.toLowerCase() === 'store credit'.toLowerCase()) {
      process = 4;
      this.itemProcessSection = 4;
    }

    switch(process) {
      case  0: {
          if (!this.priceCategoryID || this.priceCategoryID == 0) {
            this.promptOpenPriceOption(this.order,this.processItem.item,this.processItem.posItem)
            return
          }
          this.processInventoryPrice(this.order,this.processItem.item,this.processItem.posItem, this.priceCategoryID)
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
        if (
              this.processItem?.item?.itemType?.type.toLowerCase() === 'store credit'.toLowerCase() ||
              this.processItem?.item?.itemType?.type.toLowerCase() === 'gift card'.toLowerCase()
            )
          {
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
        this.updateOrderSubscription(this.order);
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
        width:        '100%',
        minWidth:     '100%',
        maxWidth:     'max-width: 100vw !important',
        height:       '100vh',
        minHeight:    '100vh',
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
      let item = posItem as unknown as PosOrderItem
      this.posOrderItemService.updatePOSItemSubscription(item)
      const dialogRef = this.dialog.open(PromptWalkThroughComponent,
        { width:        '100%',
          minWidth:     '100%',
          maxWidth:     'max-width: 100% !important',
          height:       '100vh',
          minHeight:    '100vh',
        },
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

  refreshOrderOBS(id: number, history: boolean) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      const order$ = this.orderService.getOrder(site, this.order.id.toString() , this.order.history)
      // const source = timer(5000, 3000);
     return order$.pipe(switchMap(data => {
          this.updateOrderSubscription(data)
          return of(data)
      }))
    }
    this.updateOrderSubscription(null)
    return of(null)
  }

  removeItemFromList(index: number, orderItem: PosOrderItem) {
    console.log('removeItemFromList')
    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.printed || this.order.completionDate ) {
        this.getVoidAuth(orderItem)
        return
      }

      if (orderItem.id) {
        const orderID = orderItem.orderID
        this.posOrderItemService.deletePOSOrderItem(site, orderItem.id).subscribe( item=> {
          if (item) {
            this.order.posOrderItems.splice(index, 1)
            this.updateOrderSubscription(item.order)
            this.updateLastItemAdded(null)
          }
        })
      }
    }
  }

  checkAuthDialog(item,  request) {
    let dialogRef: any;
    dialogRef =  this.dialog.open(FastUserSwitchComponent,
      { width     : '600px',
        minWidth  : '600px',
        height    : '600px',
        data      : request
      },
    )
    return dialogRef;
  }

  getVoidAuth(item) {
    console.log('getVoidAuth')

    if (this.authenticationService.userAuths.voidItem) {
      this.editDialog.openVoidItemDialog(item)
      return
    }

    console.log('getVoidAuth void item auth check')
    let  request = {action: 'voidItem', request: 'checkAuth'}
    console.log('request', request)
    let dialogRef = this.checkAuthDialog(item,  request)

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editDialog.openVoidItemDialog(item)
      } else {
        this.siteService.notify('Not authorized', 'close', 1000, 'red')
      }
    });
  }

  getRefundAuth(item) {
    let  request = {action: 'refundItem', request: 'checkAuth'}
    let dialogRef = this.checkAuthDialog(item,  request)
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editDialog.openVoidItemDialog(item)
      } else {
        this.siteService.notify('Not authorized', 'close', 1000, 'red')
      }
    });
  }

  changePrepStatus(index: number, orderItem: PosOrderItem) {
    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.id) {
        const orderID = orderItem.orderID
        this.posOrderItemService.setItemPrep(site,orderItem).subscribe( item => {
          if (item) {
            // this.notifyEvent('Item Prepped!', "Success")
            this.order.posOrderItems.splice(index, 1, item)
            this.updateOrderSubscription(this.order)
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

  setItemGroupAsPrepped(site: ISite, id: number, startDate: string, endDate: string, currentList: IReportItemSaleSummary): Observable<IReportItemSaleSummary> {
    if (id) {
      const site = this.siteService.getAssignedSite()
     return this.posOrderItemService.setItemGroupAsPrepped(site, id, startDate, endDate).pipe(
        switchMap(data => {
          if (data) {
            return of(null)
          }
          return of(null)
        }))
    }
  }

  setOneItemFromGroupAsPrepped(id: number, startDate: string, endDate: string, currentList: any[]): Observable<any> {
    if (id) {
      const site = this.siteService.getAssignedSite()
     return this.posOrderItemService.setOneItemFromGroupAsPrepped(site, id, startDate, endDate).pipe(
        switchMap(data => {
          if (data) {
            return of(null)
          }
          return of(null)
        }))
    }
  }



  prepPrintUnPrintedItem(index: number, orderItem: PosOrderItem) {
    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.id) {
        const orderID = orderItem.orderID
        this.posOrderItemService.setItemPrep(site,orderItem).subscribe( item => {
          if (item) {
            this.order.posOrderItems.splice(index, 1, item)
            this.updateOrderSubscription(this.order)
          }
        })
      }
    }
  }


  validateMEdExpriationDate(checkDateValue: string) {
    const currentDate = new Date();
    const checkDate = new Date(checkDateValue);

    if(checkDate > currentDate){

    }else{
        return 'Given date is not greater than the current date.';
    }
  }

  validateCustomerForOrder(client: IClientTable, requiresLicenseValidation: boolean, clientType: string) {
    const accountLocked   = client.accountDisabled;
    const accountDisabled = client.accountLocked;
    let resultMessage = ''

    if (accountLocked || accountDisabled) {
      resultMessage =resultMessage +  'Problem account is locked or disabled.'
      this.notifyEvent('Problem account is locked or disabled.', 'Failure')
      return {valid: false, resultMessage: resultMessage}
    }

    if (requiresLicenseValidation) {
      if (client.dlLicenseEXP || !client?.dlLicenseEXP) {
        if (client.dlLicenseEXP  && this.isDateExpired(client.dlLicenseEXP)) {
           resultMessage = resultMessage + ' Problem with state ID or state driver license expiration date.'
           return {valid: false, resultMessage: resultMessage}
        }
        if (!client.dlLicenseEXP ) {
          resultMessage = resultMessage + `Driver license or ID expiration date does not exist for this customer ${client.dlLicenseEXP}`
          return {valid: false, resultMessage: resultMessage}
        }
      }
    }

    if (client.patientRecOption) {

      if (!client.medPrescriptionExpiration || this.isDateExpired(client.medPrescriptionExpiration)) {
        resultMessage = resultMessage +  'Problem with MED expiration.'
        return {valid: false, resultMessage: resultMessage}
      }

      if (clientType === 'patient') {
        if (!client.medLicenseNumber) {
          resultMessage = resultMessage +  'Problem with MED license.'
          return {valid: false, resultMessage: resultMessage}
        }
        return {valid: true, resultMessage: resultMessage}
      }

      if (clientType === 'caregiver') {
        // console.log('instertiaryNum', client.insTertiaryNum)
        if (!client.insTertiaryNum || client.insTertiaryNum == '') {
          resultMessage = resultMessage + 'Problem with Patient Account #.'
          return {valid: false, resultMessage: resultMessage}
        }

        if (!client.medLicenseNumber) {
          resultMessage = resultMessage +  'Problem with Caregiver license.'
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
    // console.log('expiry', expiry)
    // console.log('now', now )
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
          this.updateOrderSubscriptionLoginAction(order)
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
      duration: 4000,
      verticalPosition: 'bottom'
    });
  }
}
