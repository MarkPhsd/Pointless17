import { HostListener, Injectable, OnDestroy } from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { AuthenticationService, MenuService, OrderPayload, OrdersService, TextMessagingService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import * as _  from "lodash";
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BehaviorSubject, catchError,concatMap,Observable, of, Subscription, switchMap } from 'rxjs';
import { IClientTable,  IPOSOrder, IPOSOrderSearchModel, IPOSPayment, IPurchaseOrderItem, IReconcilePayload, IServiceType, IUser, PosOrderItem, ProductPrice } from 'src/app/_interfaces';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
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
import { IReportItemSaleSummary } from '../reporting/reporting-items-sales.service';
import { AbstractControl,  ValidationErrors, ValidatorFn } from '@angular/forms';

import { StoreCreditMethodsService } from '../storecredit/store-credit-methods.service';

import { FastUserSwitchComponent } from 'src/app/modules/profile/fast-user-switch/fast-user-switch.component';
import * as uuid from 'uuid';
import { RequestMessagesComponent } from 'src/app/modules/admin/profiles/request-messages/request-messages.component';
import { IRequestMessage } from '../system/request-message.service';
import { error } from 'console';
import { IPositionElements } from 'ngx-infinite-scroll';
import { MenuItem } from 'electron';
import { ClientTableService } from '../people/client-table.service';
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

  emailSubjects = [
    {name: 'Please Complete', subject: 'Please review this order for prep. I would like it completed. I agree to pay when it the order is completed.', id: 1},
    {name: 'Please Review for Prep', subject: 'Please review this order for prep. I would like it confirmed and then please contact me.', id: 2},
    {name: 'Ready for Pickup', subject: 'Your order has been completed for Pickup.', id: 3},
    {name: 'Please Review for Prep', subject: 'Your order has been completed. We will notify you when it is en route for delivery.', id: 4},
    {name: 'Order Ready for Delivery', subject: 'Your order has been completed. We will notify you when it is en route for delivery.', id: 5},
    {name: 'Please Pay', subject: 'Your order has been completed. Please complete payment so we may schedule pickup or delivery.', id: 6},
    {name: 'Order Can Not be Completed', subject: 'Your order can not be completed. We will notify you of why in a separate email.', id: 7},
  ]

  public toggleChangeOrderType: boolean;

  private _posPaymentStepSelection     = new BehaviorSubject<IPaymentMethod>(null);
  public posPaymentStepSelection$      = this._posPaymentStepSelection.asObservable();

  private itemProcessSection      = 0
  private _itemProcessSection     = new BehaviorSubject<number>(null);
  public itemProcessSection$      = this._itemProcessSection.asObservable();

  processItem : ProcessItem

  public _quantityValue = new BehaviorSubject<number>(1);
  public  quantityValue$ = this._quantityValue.asObservable();

  private _assingedPOSItems = new BehaviorSubject<PosOrderItem[]>(null);
  public  assignedPOSItems$ = this._assingedPOSItems.asObservable();
  public  assignPOSItems       : PosOrderItem[];

  public _lastSelectedItem = new BehaviorSubject<PosOrderItem>(null);
  public  lastSelectedItem$ = this._lastSelectedItem.asObservable();

  private _posIssuePurchaseItem   = new BehaviorSubject<IPurchaseOrderItem>(null);
  public  posIssuePurchaseItem$ = this._posIssuePurchaseItem.asObservable();

  private _posIssueItem = new BehaviorSubject<PosOrderItem>(null);
  public  posIssueItem$ = this._posIssueItem.asObservable();
  public splitEntryValue  = 0;

  overrideClear: boolean;
  orderSearchEmployeeID: number;
  public get assignedPOSItem() {return this.assignPOSItems }

  priceCategoryID: number;

  ////////////

  lastOrder : IPOSOrder;
  subscriptionInitialized         : boolean;

  private _currentOrder       = new BehaviorSubject<IPOSOrder>(null);
  public currentOrder$        = this._currentOrder.asObservable();
  public currentOrder         = {} as IPOSOrder

  public order                : IPOSOrder;
  _order                      : Subscription;
  private _posOrders          = new BehaviorSubject<IPOSOrder[]>(null);
  public posOrders$           = this._posOrders.asObservable();

  //view type, order cards list or prep view
  private _viewOrderType      = new BehaviorSubject<number>(null);
  public viewOrderType$       = this._viewOrderType.asObservable();

  ///order Service
  posSearchModel  :IPOSOrderSearchModel
  public _posSearchModel     = new BehaviorSubject<IPOSOrderSearchModel>(null);
  public posSearchModel$      = this._posSearchModel.asObservable();

  private _lastItemAdded     = new BehaviorSubject<IMenuItem>(null);
  public lastItemAdded$      = this._lastItemAdded.asObservable();
  lastItemAddedExists : boolean;

  private _splitGroupOrder     = new BehaviorSubject<IPOSOrder>(null);
  public splitGroupOrder$      = this._splitGroupOrder.asObservable();

  public _sendOrder     = new BehaviorSubject<boolean>(null);
  public sendOrder$      = this._sendOrder.asObservable();

  public _scanner             = new BehaviorSubject<boolean>(null);
  public scanner$             = this._scanner.asObservable();

  private _templateOrder       = new BehaviorSubject<IPOSOrder>(null);
  public templateOrder$        = this._templateOrder.asObservable();
  public templateOrder         = {} as IPOSOrder

  private _bottomSheetOpen    = new BehaviorSubject<boolean>(null);
  public bottomSheetOpen$     = this._bottomSheetOpen.asObservable();

  selectedProductPrice: ProductPrice;
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
    if (id && id != 0) {
      const site = this.siteService.getAssignedSite();
      this.orderService.releaseOrder(site, id).subscribe()
    }
    this.clearOrderSubscription()
  }

  clearOrderSubscription() {
    localStorage.removeItem('orderSubscription')
    this.toolbarServiceUI.updateOrderBar(false)
    this.currentOrder = null;
    this._currentOrder.next(null)
    this.updateLastItemAdded(null)
    this.updateOrderSubscription(null);
  }

  updateOrderSubscriptionLoginAction(order: IPOSOrder) {
    this.storeCreditMethodService.updateSearchModel(null)
    this.getCost(order)
    this.updateOrderSubscriptionOnly(null);
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
      if (order.toString() == 'not found') { return; }

      try {
        order.cost = 0
        if (order.posOrderItems && order.posOrderItems.length>0) {
          order.posOrderItems.forEach(data => {
            if (data.wholeSaleCost) {
              order.cost = data.wholeSaleCost + +order?.cost
            }
          })
        }
      } catch (error) {

      }

    }
    return order
  }

  preSwitchOrder(order: IPOSOrder) {
    if (!this.currentOrder?.id || this.currentOrder?.id == 0) {
      this.splitEntryValue = 1;
    }
    if (this.currentOrder?.id != order?.id) {
      this.splitEntryValue = 1;
    }
  }

  updateOrder(order: IPOSOrder) {
    // console.trace('update order ', order)
    try {
      if (!order) {
        this.updateOrderSubscriptionOnly(null);
        this.setStateOrder(null)
        this.setActiveOrder(null)
        return
      }
      this.preSwitchOrder(order)
      this.updateOrderSubscriptionOnly(order);
      if (order?.service?.filterType == 0  ) {
      }
      this.setStateOrder(order);
      this._scanner.next(true)
    } catch (error) {
      console.log('error', error)
    }
  }

  setScanner() {
    this._scanner.next(true)
  }

  updateOrderSubscriptionOnly(order: IPOSOrder) {
    this.currentOrder = order;
    this.order = order;
    this._currentOrder.next(order);
  }

  getInventoryMonitor(site: ISite, id: number): Observable<IPOSOrder> {
    return this.orderService.inventoryMonitor(site, this.order.id).pipe(switchMap(data =>
      {
        this.updateOrder(data);
        return of(data)
      }
    ))
  }

  setOrderCostInfo(order) {
    if (order && order.posOrderItems) {
      order.posOrderItems.forEach(data => {
        data.traceProductCalc = +data.quantity -  +data.traceProductCount   ;
      })
      order.wholeSaleTraceCalcSum = 0
      let currentValue : number = 0
      let newValue: number = 0
      order.posOrderItems.forEach(data => {
        if (data.wholeSale) {
          if (+data.quantity) {
            newValue += +(+data.quantity * +data.wholeSale);
          }
          if (data.traceProductCount) {
            currentValue += +(data.traceProductCount + +data.wholeSale)
          }
        }
      })
      order.wholeSaleTraceCalcSum = newValue
      order.wholeSaleCostTotal    = currentValue;
    }
  }

  updateOrderSubscription(order: IPOSOrder) {

    this.storeCreditMethodService.updateSearchModel(null);

    this.updateOrder(order);
    this.setOrderCostInfo(order)
    if (!order || order == null) {
      order = this.getStateOrder();
      if (order) {
        this.toolbarServiceUI.updateOrderBar(false)
        return;
      }
      if (!order) {
        this.toolbarServiceUI.updateOrderBar(false);
      }
    }

    if (order && order.service && (order?.service?.filterType != 3 && order?.service?.filterType != 2)) {
      this.setScanner()
    }

    const site = this.siteService.getAssignedSite();
    const devicename = localStorage.getItem('devicename');
    if (order?.deviceName === devicename) { return };
    this.claimOrder(site, order)

  }

  claimOrder(site, order) {
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
    if (!order) {
      // console.log('remove order subscription')/
      localStorage.removeItem('orderSubscription')
      return;
    }
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

  updateOrderSearchModelDirect(searchModel: IPOSOrderSearchModel) {
    this.posSearchModel = searchModel;
    this._posSearchModel.next(searchModel);
  }

  updateOrderSearchModel(searchModel: IPOSOrderSearchModel) {
    if (!searchModel) {
      this._posSearchModel.next(null);
      return ;
    }

    if (!searchModel.onlineOrders) {  searchModel.onlineOrders = false }
    searchModel.clientID = this.setUserID()
    const model = JSON.parse(JSON.stringify(searchModel)) as IPOSOrderSearchModel
    this._posSearchModel.next(searchModel);
  }

  setUserID()  {
    const user = this.userAuthorization.currentUser()
    if (this.userAuthorization.isUser) {
      if (user && user.id && user.id != null) {
        return user.id
      }
    }
    return 0;
  }

  setEmployeeID(employeeID : number) {
    const user = this.userAuthorization.currentUser()
    const employee = (!this.userAuthorization.isAdmin || !this.userAuthorization.isManagement) && this.userAuthorization.isStaff
    const manager = this.userAuthorization.isManagement

    if (!this.showAllOrders && manager) {
      const id = employeeID;
      return id;
    }

    if (!this.showAllOrders && employee) {

      return  user.employeeID;
    }

    const auth = this.authenticationService._userAuths.value
    if (this.showAllOrders) {
      if (user && user.employeeID && user.employeeID != null) {
        // console.log('process' , this.userAuthorization.isStaff)
        return 0;
      }
    }

    if (this.showAllOrders && this.userAuthorization.isStaff ) {
      if (user && user.employeeID  && user.employeeID != null) {
        // console.log('process')
        return 0
      }
    }

    const id = employeeID;
    return id;
  }

  refreshAllOrders() {
    const searchModel = {} as IPOSOrderSearchModel
    searchModel.closedOpenAllOrders = 1
    searchModel.completionDate_From = null;
    searchModel.completionDate_To = null;
    searchModel.orderID = null;
    searchModel.employeeID = 0;
    searchModel.pageSize = 50;
    searchModel.pageNumber = 1;
    searchModel.searchOrderHistory = false
    searchModel.prepStatus  = null;
    searchModel.onlineOrders = null;
    searchModel.serviceTypeID = null;
    searchModel.suspendedOrder  = 0;
    searchModel.routeDetailID  = null;
    searchModel.greaterThanZero = 0;
    this.updateOrderSearchModel(searchModel)
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
    // console.log('item', item.id)
    this._lastSelectedItem.next(item)
  }

  initSubscriptions() {
    this._order = this.currentOrder$.subscribe(order => {
      this.order = order;
      if (this.overrideClear) { return }
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

    if ( this.overrideClear ) { return }

    // console.log('clear assigned items', this.overrideClear )
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
    if (!this.assignPOSItems) {
      // if (!this.overrideClear) {
        this.assignPOSItems= [] }
      // }
    this.assignPOSItems.push(item);
    // console.log('addAssignedItem', this.overrideClear, this.assignPOSItems )
    this._assingedPOSItems.next(this.assignPOSItems)
  }

  removeAssignedItem(item: PosOrderItem) {
    // console.log('removeAssignedItem', SItems )
    // console.log('remove assigned item')this.overrideClear, this.assignPO
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

  constructor(public  route                   : ActivatedRoute,
              private clientTableService      : ClientTableService,
              private dialog                  : MatDialog,
              public  authenticationService   : AuthenticationService,
              private userAuthService         : UserAuthorizationService,
              private siteService             : SitesService,
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
        const newItem     =  { orderID: order.id, itemID: itemID, quantity: quantity, menuItem: menuItem, price: price, changeSize: true };
        return this.posOrderItemService.putItem(site, newItem);
      })
    ).pipe(
      switchMap(data => {
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

    const searchResults = this.updateMenuSearchModel(item);

    if (add) {
      if (item && !item.itemType) {
        const site = this.siteService.getAssignedSite()
        return this.menuService.getMenuItemByID(site, item.id).pipe(switchMap(data => {
          item = data;
          if (item && (item.itemType && item.itemType.requireInStock == true))  {
            this.listItem(item.id);
            return of(null)
          }
          return this.addItemToOrderObs(order, item, 1, 0, passAlongItem)
        }))
      }
      if (item && (item.itemType && item.itemType.requireInStock == true))  {
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
    // console.log('update menusearch model')
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

  openOrderMessages(order: IPOSOrder) {

    let dialogRef: any;
    dialogRef = this.dialog.open(RequestMessagesComponent,
      { width:        '100%',
        minWidth:     '100%',
        maxWidth:     'max-width: 100vw !important',
        height:       '90vh',
        minHeight:    '90vh',
        data : order
      },
    )
  }

  listItem(id:number) {
    this.router.navigate(["/menuitem/", {id:id}]);
  }

  //customer
  sendRequestToPrep(order) {
    this.sendNotification(order, 1)
  }
 //customer
  sendRequestToCheck(order) {
    this.sendNotification(order, 2)
  }
  //biz
  sendNotifyOrderCompleted(order) {
    this.sendNotification(order, 7)
  }

 //biz
  sendNotifyForDelivery(order) {
    this.sendNotification(order, 6)
  }

 //biz
  sendNotifyForPayment(order) {
    this.sendNotification(order, 6)
  }

 //biz
 sendNotifyForCancelation(order) {
    this.sendNotification(order, 7)
 }

 sendNotification(order: IPOSOrder, id: number) {
    const item = this.emailSubjects.filter(items => { return items.id == id})[0];
    if (!item) {
      return
    }
    return this.sendTemplateOrder(order, '', item.name, item.subject).subscribe()
  }

  sendNotificationObs(order: IPOSOrder, id: number) {
    const item = this.emailSubjects.filter(items => { return items.id == id})[0];
    if (!item) {
      // console.log('no item!')
      return
    }
    return this.sendTemplateOrder(order, '', item.name, item.subject)
  }

  sendTemplateOrder(order: IPOSOrder, template: string, title: string, subject: string, method?: string):Observable<any> {

    if (!method) { method = ''}
    if (this.order && this.order.clients_POSOrders && this.order.clients_POSOrders.email) {
        const email = this.order.clients_POSOrders.email;

        return this.sendGridService.sendTemplateOrder(order.id, order.history, email, email, 'request', title,  subject ,method).pipe(
          switchMap(data => {

            // console.log(data)
            let response = 'Request Sent.'
            if (this.userAuthorization.user.roles =='user') {
              response = 'Request Sent. You may exit the order or application and wait for the response.'
            }

            if ((data && data?.isSuccessStatusCode) || data === 'Success') {
              this.siteService.notify(response, 'Close', 10000)
              return of(data)
            }

            if (!data || !data.isSuccessStatusCode) {
              this.siteService.notify('Email not sent. Check email settings, or contact store.', 'Close', 5000)
            }

            return of (data)
          }
        )
      )
    }
    this.siteService.notify('Request not sent, no email associated with this account', 'Close', 3000)
    return of ({})
  }

  sendOrderForMessageService(item : IRequestMessage, order: IPOSOrder, method?: string) {
    if (!method) { method = ''}
    if (this.order && this.order.clients_POSOrders && this.order.clients_POSOrders.email) {
        const email = this.order.clients_POSOrders.email;

        return this.sendGridService.sendTemplateOrder(order.id, order.history, email, this.order.clients_POSOrders.userName,
                                                      'request', item.subject,  item.message , method).pipe(
          switchMap(data => {

            let response = 'Request Sent.'
            if (this.userAuthorization.user.roles =='user') {
              response = 'Request Sent. You may exit the order or application and wait for the response.'
            }

            if ((data && data?.isSuccessStatusCode) || data === 'Success') {
              this.siteService.notify(response, 'Close', 10000)
              return of(data)
            }

            if (!data || !data.isSuccessStatusCode) {
              this.siteService.notify('Email not sent. Check email settings, or contact store.', 'Close', 5000)
            }

            return of (data)
          }
        )
      )
    }
    this.siteService.notify('Request not sent, no email associated with this account', 'Close', 3000)
    return of ({})
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
          return  this.sendGridService.sendTemplateOrder(order.id, order.history, order.clients_POSOrders.email,
                                                        clientName, template, "Your order is ready.", "Your order is ready.", ""  )
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
                   portionValue: string, packaging: string, assignedPOSItems: PosOrderItem[]
                   ,unitTypeID?, productPrice?: ProductPrice,cost?: number): Observable<ItemPostResults> {

    if (!barcode) { return null;}
    if (!order) {const order = {} as IPOSOrder}

    let passAlongItem = {} as any;

    if (this.assignPOSItems) {
      passAlongItem =  this.assignPOSItems[0];
    }

    const deviceName = localStorage.getItem('devicename');


    const newItem = { orderID: order.id, quantity: quantity, barcode: barcode, packaging: packaging,
                      portionValue: portionValue, deviceName: deviceName, passAlongItem: passAlongItem,
                      clientID: order.clientID , priceColumn : order.priceColumn, assignedPOSItems: assignedPOSItems,
                      unitTypeID: unitTypeID, productPrice: productPrice, wholesale: cost } as NewItem;
    // console.log(barcode)
    // console.log('new item', newItem)
    return this.posOrderItemService.addItemToOrderWithBarcode(site, newItem)
  }

  async addItemToOrder(order: IPOSOrder, item: IMenuItem, quantity: number) {
    await this.processAddItem(order, null, item, quantity, null);
  }

  addItemSimpleOverRide(order: IPOSOrder, item: IMenuItem, quantity: number) {
    return this.addItemToOrderObs(order, item, quantity, 0, null, null)
  }

  addItemToOrderObs(order: IPOSOrder, item: IMenuItem, quantity: number, rewardAvailableID: number, passAlongItem: PosOrderItem[],
                    selectedProductPrice?: ProductPrice, unitTypeID?: any): Observable<ItemPostResults> {
    this.selectedProductPrice = selectedProductPrice;
    let passAlong; // = passAlongItem[0]
    if (passAlongItem && passAlongItem[0]) {
      passAlong = passAlongItem[0]
    }
    return this.processItemPOSObservable( order, null, item, quantity, null , 0, 0,
                                          passAlong, this.assignPOSItems, unitTypeID, selectedProductPrice )
  }

  addItemToOrderFromBarcode(barcode: string, input, assignedItem, inputQuantity?, unitTypeID?, cost?) {
    const site = this.siteService.getAssignedSite();
    const item$ = this.menuService.getMenuItemByBarcode(site, barcode, this.order?.clientID);
    let quantity = 1;
    if (inputQuantity) {  quantity = inputQuantity }

    return   item$.pipe(switchMap( data => {
      if ( !data ) {

          return this.processItemPOSObservable( this.order, barcode, null, quantity, input, 0, 0,
                                                assignedItem, this.assignPOSItems,
                                                unitTypeID, null,
                                                cost);
        } else
        {
          if (data.length == 1 || data.length == 0) {
            return this.processItemPOSObservable(this.order, barcode, data[0], quantity,
                                                  input, 0, 0, assignedItem,
                                                  this.assignPOSItems, unitTypeID, null,
                                                  cost);
          } else {
            this.listBarcodeItems(data, this.order)
          }
        }
        return of(data);
      })
    )
  }

  listBarcodeItems(items: IMenuItem[], order: IPOSOrder) {
    if (items.length == 0) { return }
    this.openProductsByBarcodeList(items, order)
  }

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
      this.notifyEvent(`Item not found.`, 'Alert');
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

    // const valid = this.validateUser();
    // if (!valid) { return };
    this.initItemProcess();

    quantity = this.setQuantityValue(quantity)

    if (!this.validateItem(item, barcode)) { return }
    let passAlongItem;

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

  setQuantityValue(quantity) {
    if (quantity === 0 ) { quantity = 1 };
    if (this._quantityValue.value != 1 && this._quantityValue.value != 0) {
      quantity = this._quantityValue.value ;
      this._quantityValue.next(1)
      return quantity
    }
    this._quantityValue.next(quantity)
    return quantity
  }

  splitOrderFromGroup(id: number, groupID: number, order: IPOSOrder) {
    const site = this.siteService.getAssignedSite()
    return this.orderService.splitOrderFromGroup(site, id, groupID).pipe(switchMap(data => {
      this.setLastOrderByFilter(groupID, order)
      this.updateOrder(data);
      return of(data)
    }))
  }

  setLastOrderByFilter(groupID: number, order:IPOSOrder) {
    order.posOrderItems = order.posOrderItems.filter(data => {
      return data.splitGroupID != groupID;
    })
    this.setLastOrder(order)
  }

  scanBarcodedItem(site, order, barcode,quantity,packaging, portionValue, passAlongItems, unitTypeID,productPrice, cost){
    const newItem$ = this.scanItemForOrder(site, order, barcode, quantity, packaging,
              portionValue,
              passAlongItems,
              unitTypeID, productPrice,
              cost).pipe(switchMap(
        data => {
        this.processItemPostResultsPipe(data)
        return of(data);
      }
    ))

    const user$ = this.getUserOrCreateUser()
    return user$.pipe(switchMap(data => {
      return newItem$
    }))

  }

  getUserOrCreateUser(): Observable<IUser> {
    const user =  this.userAuthService.user;
    // const valid = this.validateUser();
    let user$ : Observable<IUser>;
    if (user) {
      // console.log('user logged in')
      return  of(user)
    } else {
      const site = this.siteService.getAssignedSite()
      return this.clientTableService.createGuestAccount(site)
    }
  }

  processItemPOSObservable( order : IPOSOrder ,
                            barcode: string,
                            item: IMenuItem,
                            quantity: number,
                            input: any,
                            rewardAvailableID: number,
                            rewardGroupApplied: number,
                            passAlongItem: PosOrderItem,
                            passAlongItems: PosOrderItem[],
                            unitTypeID?,
                            productPrice?: ProductPrice,
                            cost?: number) : Observable<ItemPostResults> {



    let tempItem = {} as ItemPostResults
    const user$ = this.getUserOrCreateUser()
    // return  user$.pipe(switchMap(data => { return of(tempItem)}))
    this.initItemProcess();
    if (!this.validateItem(item, barcode)) {  return of(null) }
    if (this.assignedPOSItem && !passAlongItem) { passAlongItem  = this.assignedPOSItem[0]; };
    order = this.validateOrder();
    this.overrideClear = false;
    if (item && item?.itemType.useType && item?.itemType?.useType.toLowerCase() === 'modifier') {
      this.assignPOSItems = passAlongItems
      this.overrideClear = true
    }

    if (order) {
      const site       = this.siteService.getAssignedSite();
      if (barcode)  {
        return this.scanBarcodedItem(site, order, barcode,quantity, input?.packageing,
                                      input?.portionValue, passAlongItems, unitTypeID,productPrice,cost)
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
          let newItem     = { orderID: order.id,
                              quantity: quantity,
                              menuItem: item,
                              passAlongItem: passAlongItem,
                              packaging: packaging,
                              portionValue: portionValue, barcode: '',
                              weight: 1, itemNote: itemNote,
                              deviceName: deviceName,
                              rewardAvailableID: rewardAvailableID,
                              rewardGroupApplied: rewardGroupApplied,
                              clientID: order.clientID,
                              splitGroupID: splitGroupID,
                              priceColumn : order?.priceColumn,
                              assignedPOSItems: passAlongItems,
                              productPrice: productPrice,
                              wholesale: cost,
                              unitTypeID: unitTypeID }

          if (order.id == 0 || !order.id) {
            const orderPayload = this.getPayLoadDefaults(null)
            const newItem$     = this.orderService.postOrderWithPayload(site, orderPayload).pipe(
              concatMap(data => {
                if (!data) {
                  this.order = data;
                  this.siteService.notify('No order started. There might be something wrong.', 'Close', 2000)
                  return of(null)
                }
                newItem.orderID = data.id;
                return this.posOrderItemService.postItem(site, newItem)
              })).pipe(
                concatMap(data => {
                  this.processItemPostResultsPipe(data)
                  return of(data);
              })
            )

            return user$.pipe(concatMap(data => {
              if (!data && data.id != 0) { return of(null)  }
              return newItem$
            }))
          }

          let postItem$ =  this.posOrderItemService.postItem(site, newItem).pipe(concatMap(
            data => {
              this.processItemPostResultsPipe(data)
              return of(data);
            }
          ))

          return user$.pipe(concatMap(data => {
            if (!data) { return of(null)  }
            return postItem$
          }))

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

  isProductLowCount(data: ItemPostResults) {
    if (data?.message === 'Manager OverRide' && data?.resultErrorDescription === 'Low Product Count') {
      //we have data.
      // console.log('isProductCount', data)
      const item = {menuItem: data.menuItem, quantity: data.quantity, order: data.order}

      const  requestData = {action:'saleAuth', postData: item}
      const request = { request: 'checkAuth', requestData: requestData}
      let dialogRef = this.checkAuthDialog(request,  request);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // this.editDialog.openSaleAuthDialog(order, item, quantity)
          this.addItemSimpleOverRide(data.order, data.menuItemWithPrice, data.quantity).subscribe(data => {
            // this.siteService.notify(`Item count low. Authorized`, 'close', 10000, 'green');
            this.authenticationService.overRideUser(null)
            this.authenticationService.updateUserAuthstemp(null);
            this._scanner.next(true)
          })

        } else {
          this.siteService.notify('Not authorized', 'close', 1000, 'red')
        }
      });
      return true
    }
    return false;
  }

  processItemPostResultsPipe(data) {

      if (!this.overrideClear) {  this.assignPOSItems = [];  }
      if (data?.message) {  this.notifyEvent(`Process Result: ${data?.message}`, 'Alert ')};

     if (this.isProductLowCount(data)) { return }

      if (data && data.resultErrorDescription && data.resultErrorDescription != null) {
        if (data && data.order) {   this.updateOrderSubscription(data.order);  }
        this.siteService.notify(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert', 5000, 'red');
        return;
      }

      if (data.order) {
        this.updateOrderSubscription(data.order);
        if (!data || !data.order) { return };

        if (this.processItem?.item?.caseQty>0 && this.processItem?.item?.caseRetail>0) {
        }

        this.addedItemOptions(data.order, data.posItemMenuItem, data.posItem, data.priceCategoryID);

        if (this.siteService.phoneDevice) {
          if (!this.siteService.isApp) {
            this.notifyItemAdded(data);
          }
        } else {

          const order = data.order as IPOSOrder;
          if (order && order.service && order.service.retailType) {
            this.toggleOpenOrderBar(this.userAuthorization.isStaff);
            return;
          }

          // console.log((order?.posOrderItems?.length , order.posOrderItems))
          if ((order && order.posOrderItems.length == 1) || this.authenticationService.isStaff) {
            this.toolbarServiceUI.updateOrderBar(true);
            return;
          }

          if (!this.siteService.isApp) {
            this.notifyItemAdded(data);
          }
        }

      } else {
        this.siteService.notify(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert', 5000, 'red');
        return;
      }

      if (this.openDialogsExist) {

      }

  }

  notifyItemAdded(data) {
    if (!this.toolbarServiceUI.orderBar || !this.platFormService.isApp) {
      this.siteService.notify(`Item added ${data?.posItemMenuItem?.name}`, 'close', 1000, 'green')
    }
  }

  toggleOpenOrderBar(isStaff: boolean) {
    let schedule = 'currentorder'
    if (isStaff) { schedule = '/currentorder/' }
    this.router.navigate([ schedule , {mainPanel:true}]);

    this.toolbarServiceUI.updateOrderBar(false)
    this.toolbarServiceUI.resetOrderBar(true)
  }

  toggleOpenOrderBarSub(id: number) {
    this.toolbarServiceUI.updateOrderBar(false)
    this.toolbarServiceUI.resetOrderBar(true)
    this.router.navigate(["/currentorder/", {mainPanel:true, id: id}]);
    this.setScanner()
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
    if ( quantity == 0 ) { quantity = 1 }
    return this.processItemPOSObservable(this.order, barcode, null, quantity, input, 0, 0, passAlongItem[0],
                                         passAlongItem);
  }

  newOrderWithPayloadMethod(site: ISite, serviceType: IServiceType, overRideNavigation?: boolean): Observable<any> {
      if (!site) { return of(null) }

      if (!this.userAuthorization?.user) {
        this.siteService.notify('Please login, user required', 'Alert', 1000)
        return of(null)
      }

      let orderPayload = this.getPayLoadDefaults(serviceType)
      let order: any;

      if (this.userAuthorization?.isUser) {
        orderPayload.order.suspendedOrder = true;
        orderPayload.order.onlineOrderID  = uuid.v4();
      }

      const order$ = this.orderService.postOrderWithPayload(site, orderPayload);

      return order$.pipe(switchMap( data => {
          order = data
          if (data.resultMessage) {return of(null)}
          if (!serviceType) {   serviceType = order.service  }
          this.processOrderResult(order, site, serviceType?.retailType, null, serviceType?.resaleType )
          if (overRideNavigation) {
            this.setActiveOrder(order)
            return of(null)
          }
          return this.navToDefaultCategory()
        })).pipe(switchMap( item => {
          if (item) {
            this.processOrderResult(order, site, serviceType?.retailType, item?.id, serviceType?.resaleType)
          }
          return of(order)
      }),
        catchError(data => {
        this.siteService.notify(`Order not started. ${data.toString()}`, 'Alert', 2000, 'red')
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
          if (!serviceType) {   serviceType = order.service  }
          // this.processOrderResult(order, site, serviceType?.retailType, null, serviceType?.resaleType)
          return this.navToDefaultCategory()
        })).pipe(switchMap( item => {
          this.processOrderResult(order, site, serviceType?.retailType, item?.id, serviceType?.resaleType)
          return of(order)
        }),
      catchError(data => {
        this.siteService.notify(`Order not started. ${data.toString()}`, 'Alert', 2000, 'red')
        return of(data)
    }))
  }

  //////////////////async await functions.
  newDefaultOrder(site: ISite)  {
    if (!site)        {  return }
    return this.newOrderWithPayload(site, null);
  }

  newOrderWithPayload(site: ISite, serviceType: IServiceType) {
    // console.log('new order with payload')
    const order$ = this.newOrderWithPayloadMethod(site, serviceType )
    let order: IPOSOrder;

    // console.log('newOrderWithPayload', serviceTfconsoleype, serviceType?.retailType)

    return order$.pipe(
      switchMap(data =>
        {
          order = data;
          if (!serviceType) {   serviceType = order.service  }

          if (!serviceType.retailType) {
            return  this.navToDefaultCategory()
          }
          if (serviceType?.resaleType) {
             this.router.navigate(['/buy-sale'])
             return of(data)
          }
          return of({id: 0})
        }
      )).pipe(switchMap( data => {
        let id = 0
        if (data && data?.id) {
          id = data?.id;
        }
        // console.log('serviceType', serviceType)
        this.processOrderResult(order, site, serviceType?.retailType, id, serviceType?.resaleType)
        return of(data)
    }))
  }

  // error:  catchError => {
  //   this.notifyEvent(`Error submitting Order # ${catchError}`, "Posted")
  // }

  newOrderFromTable(site: ISite, serviceType: IServiceType, uuID: string, floorPlanID: number, name: string, orderName?: string): Observable<IPOSOrder> {
    if (!site) { return }
    let orderPayload = this.getPayLoadDefaults(serviceType)
    if (!orderPayload.order) {
      orderPayload.order = {} as IPOSOrder
    }
    orderPayload.order.tableUUID = uuID;
    orderPayload.order.floorPlanID = floorPlanID;
    // orderPayload.order.customerName = name;
    if (orderName) {
      orderPayload.order.customerName = orderName;
    }
    orderPayload.order.tableName = name;

    // if ()
    return  this.orderService.postOrderWithPayload(site, orderPayload)
  }

  processOrderResult(order: IPOSOrder, site: ISite,  retailType: boolean, categoryID?: number, resaleType?: boolean) {
    if (order.resultMessage != undefined || order.resultMessage) {
      this.siteService.notify(`Error submitting Order ${order.resultMessage}`, "Close", 2000)
      return
    }
    this.setActiveOrder(order)

    // console.log('resaleType', resaleType)
    if (resaleType) {
      this.toolbarServiceUI.hidetoolBars()
      this.router.navigate(["/buy-sell"])
      return;
    }

    if (categoryID && categoryID != 0) {
      this.navToCategory(categoryID)
    }

    if (!retailType) {
      if (!categoryID) {
        this.navToMenu();
      }
    }
    if (retailType) {
      this.router.navigate(["currentorder", {mainPanel:true}])
    }

  }

  setLastOrder(order?) {
    if (order ) {
      const order = JSON.stringify(this.order)
      this.lastOrder =  JSON.parse(order)// structuredClone(this.order);
    }
    if (this.order) {
      const order = JSON.stringify(this.order)
      this.lastOrder =  JSON.parse(order)// structuredClone(this.order);
    }
  }

  setActiveOrder(order: IPOSOrder) {
    if (order) {
      if (!this.authenticationService?.deviceInfo?.phoneDevice) {
        this.toolbarServiceUI.updateOrderBar(true)
      }

      this.updateOrderSubscription(order)
      this.updateLastItemAdded(null)

      if (!order.history && this.platFormService.isApp()) {
        if (!order.completionDate && !order.preferredScheduleDate) {
          if (!this.authenticationService?.deviceInfo?.phoneDevice) {
            let showBar = true;
            if (this.uiSettingService.homePageSetting && this.uiSettingService.homePageSetting.hideSearchBar) {
              showBar = false;
            }
            if (showBar) {
              this.toolbarServiceUI.showSearchSideBar()
            }
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
    if (id) {
      return +id
    }
    return  0
  }

  navToDefaultCategory(): Observable<IMenuItem> {
    const deviceName = localStorage.getItem('devicename') 
    const site = this.siteService.getAssignedSite()
    const device$ =   this.uiSettingService.posDevice$
    let categoryID = 0

    return device$.pipe(switchMap(data => { 
      if (data) { 
        if (data?.defaultMenuCategoryID) { 
          categoryID = data?.defaultMenuCategoryID;
        }
      }
      return this.uiSettingService.transactionUISettings$
    })).pipe(switchMap(data =>  {
      // if (categoryID != 0) { 
      //   this.router.navigate(["/menuitems-infinite/", {categoryID:categoryID}]);
      //   return this.menuService.getMenuItemByID(site, categoryID)
      // }
      // if (data && data.defaultNewOrderCategoryID) {
      //   this.router.navigate(["/menuitems-infinite/", {categoryID: data?.defaultNewOrderCategoryID}]);
      //   return this.menuService.getMenuItemByID(site, data.defaultNewOrderCategoryID)
      // }
      return of(null)
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

          // console.log('afterclosed', data);

          if (data && data.result) {
            this.initItemProcess();
            return ;
          }

          if (data && data.result)  { this.updateProcess (); }

          if (!data || !data.result) {
            if (data.id){
              this.cancelItem(data.id, data?.orderID, false);
            }
            this.initItemProcess();
           }
        });
        return true;
      }
    }

    return false;

 }

 @HostListener("window:resize", [])
  get IsSmallDevice() {
    if (window.innerWidth < 599) {
      return true
    }
    return false
  }

  async  promptOpenPriceOption(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem): Promise<boolean> {

    if (!order || !item || !posItem) {return}
    const site = this.siteService.getAssignedSite()
    //if there are multiple prices for this item.
    //the webapi will return what price options are avalible for the item.
    //the pop up will occur and prompt with options.
    //the function will return true once complete.

    let width = '500px'
    let maxWidth = '500px'
    let minWidth = '500px'
    if (this.IsSmallDevice) {
      width     =       '100%'
      minWidth  =  '100% !important'
      maxWidth  =   '100% !important'
    }

    item =  this.menuService.getPricesFromProductPrices(item)
    if (item && item.priceCategories && item.priceCategories.productPrices.length > 1 ) {

      const  newItem = {order: order, item: item, posItem: posItem}
      const dialogRef = this.dialog.open(PriceOptionsComponent,
        {
          width:    width,
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
          this.cancelItem(posItem.id, posItem.orderID, false);
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

  cancelItem(id: number, orderID: number, notify : boolean ) {
    const site = this.siteService.getAssignedSite();
    if (id) {
      this.posOrderItemService.deletePOSOrderItem(site, id, orderID).subscribe(result => {
        if (result && result.scanResult) {
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
    // const confirm = window.confirm('Are you sure you want to do this action?')
    // if (!confirm) { return }

    // const site = this.siteService.getAssignedSite();
    // return this.orderService.voidOrder(site, id).pipe(
    //   switchMap( order => {
    //   if (order === 'Order Voided') {
    //     this.notifyEvent('Order Voided', 'Success')
    //     this.orderService.updateOrderSubscription(null)
    //     this.router.navigateByUrl('pos-orders')
    //   }
    //   if (order != 'Order Voided') {
    //     this.notifyEvent('Order Voided', 'Success')
    //   }
    //   return of(Data)
    // }))
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

  clearOrder() {
    this.currentOrder = null;
    this.order = null;
    localStorage.removeItem('orderSubscription')
    this.updateOrderSubscription(null);
    this.splitEntryValue = 0;
    this.navAfterClearOrder()
  }

  navAfterClearOrder() {
    if (this.userAuthorization?.user?.roles == 'user') {
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
        this.updateOrderSubscription(data)

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

    if (!this.order) { return }
    if (this.order.service.filterType == 1) {
      if (this.processItem?.item?.itemType?.requiresSerial) {
        if  (!this.promptSerial(this.processItem.item, this.processItem.posItem.id, false, '')) {
          return
        }
      }
      return;
    }

    // console.log('process', process)
    switch(process) {
      case  0: {

          if (this.selectedProductPrice) {
            this.selectedProductPrice = null;
            this.updateProcess();
            break
          }
          if (!this.priceCategoryID || this.priceCategoryID == 0) {
            this.promptOpenPriceOption(this.order,this.processItem.item,this.processItem.posItem)
            return
          }
          this.processInventoryPrice(this.order,this.processItem.item,this.processItem.posItem, this.priceCategoryID)
          break;
        }
      case  1: {
        // console.log('handle process 1')
          if (this.order.service.filterType == 1) {
            this.updateProcess();
            break;
          }

          if (this.processItem?.item?.itemType?.requiresSerial) {
            // console.log('case 1 requires serialCode', this.processItem?.item?.requiresSerial, this.processItem.posItem.serialCode)
            if  (!this.promptSerial(this.processItem.item, this.processItem.posItem.id, false, '')) {
              this.updateProcess();
            }
          } else {
            this.updateProcess();
          }
          break;
        }
      case  2: {
        if (this.order.service.filterType == 1) {
          this.updateProcess();
          break;
        }

        this.openQuantityPrompt(this.order, this.processItem.item, this.processItem.posItem);
        break;

      }
      case 3: {
        if (this.order.service.filterType == 1) {
          this.updateProcess();
          break;
        }
        // console.log('price change')
        this.openPriceChangePrompt(this.order,this.processItem.item,this.processItem.posItem);
        break;
      }
      case 4:
      case  5: {

        if (this.order.service.filterType == 1) {
          this.updateProcess();
          break;
        }

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
      case 6: {
        if (this.order.service.filterType == 1) {
          this.updateProcess();
          break;
        }

        this.openPromptWalkThrough(this.order,this.processItem.item,this.processItem.posItem)
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

  openPriceChangePrompt(order: IPOSOrder, menuItem: IMenuItem, posItem: IPurchaseOrderItem) {
    if (posItem) {
      if ( (menuItem && menuItem.itemType.pricePrompt))
      {
        const item = {
          orderItem: posItem,
          editField: 'price',
          menuItem: menuItem,
          // requireWholeNumber: menuItem.itemType.requireWholeNumber,
          instructions: 'Input Price'
        }
        this.fieldPrompt(item)
        return true;
      }
    }
    this.updateProcess();
    return false;
  }

  openQuantityPrompt(order: IPOSOrder, menuItem: IMenuItem, posItem: IPurchaseOrderItem): boolean {
      if (posItem) {
        if ( (menuItem && menuItem.itemType.promptQuantity))
        {
          const item = {orderItem: posItem,
            editField: 'quantity',
            menuItem: menuItem,

            requireWholeNumber: menuItem.itemType.requireWholeNumber,
            instructions: 'Input Quantity'

          }
          this.fieldPrompt(item)
          return true;
        }
      }
      this.updateProcess();
      return false;
   }

   @HostListener("window:resize", [])
   fieldPrompt(item) {
      let width = '500px'
      if (window.innerWidth < 768) {
        width = '100% !important'
      }
      // console.log('fieldPrompt', window.innerWidth, width);
      //'100% !important'

      console.log('width', width)
      let dialogRef =  this.editDialog.editDialog(item, width, '500px');
      dialogRef.afterClosed().subscribe(data => {
        if (data && data.result) {
          this.updateProcess();
          return ;
        }
        if (data && data.result)  { this.updateProcess(); }

        if (!data || !data.result) {
          if (data && data.id){
            this.cancelItem(data.id, data?.orderID, false);
          }
          this.updateProcess();
        }
      });
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

  removeItemFromListOBS(index: number, orderItem: PosOrderItem) {
    // console.log('removeItemFromListOBS')
    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.printed || this.order.completionDate ) {
        this.getVoidAuth(orderItem)
        return
      }

      if (orderItem.id) {
        const orderID = orderItem.orderID
        return  this.posOrderItemService.deletePOSOrderItem(site, orderItem.id, orderItem.orderID).pipe(
          switchMap( data => {
          if (data) {
            this.order.posOrderItems.splice(index, 1)
            this.updateOrderSubscription(data.order)
            this.updateLastItemAdded(null)
            return of(data)
          }
        }), catchError(data => {
              // this.siteService.notify('Error ' + data.toString(), 'Close', 5000, 'red')
              return of(data)
            }
          )
        )
      }

      // this.updateLastItemAdded(null)
    }
    return of(null)
  }

  removeItemFromList(index: number, orderItem: PosOrderItem) {

    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.printed || this.order.completionDate ) {
        this.getVoidAuth(orderItem)
        return
      }

      if (orderItem.id) {
        const orderID = orderItem.orderID
        this.posOrderItemService.deletePOSOrderItem(site, orderItem?.id, orderItem?.orderID).subscribe(
         { next:  item => {
            if (item) {
              this.order.posOrderItems.splice(index, 1)
              this.updateOrderSubscription(item.order)
              this.updateLastItemAdded(null)
              return;
            }
          }, error:  data => {
              console.log('error', data.toString)
            }
          }
        )
      }

      this.updateLastItemAdded(null)
    }
  }

  checkAuthDialog(item,  request) {
    let dialogRef: any;
    dialogRef =  this.dialog.open(FastUserSwitchComponent,
      { width     : '600px',
        minWidth  : '600px',
        height    : '750px',
        data      : request
      },
    )
    return dialogRef;
  }

  getSaleItemAuthAuth(order: IPOSOrder,item: IMenuItem, quantity: number) {
    if (this.authenticationService.userAuths.voidItem) {
      this.editDialog.openSaleAuthDialog(order, item, quantity)
      return
    }

    let  request = {action: 'price', request: 'checkAuth'}
    let dialogRef = this.checkAuthDialog(item,  request)

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editDialog.openSaleAuthDialog(order, item, quantity)
      } else {
        this.siteService.notify('Not authorized', 'close', 1000, 'red')
      }
    });
  }


  getVoidAuth(item) {
    // console.log('getVoidAuth')

    if (this.authenticationService.userAuths.voidItem) {
      this.editDialog.openVoidItemDialog(item)
      return
    }

    // console.log('getVoidAuth void item auth check')
    let  request = {action: 'voidItem', request: 'checkAuth'}
    // console.log('request', request)
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
      console.log('client.recoptions', client.patientRecOption)
      // if (clientType === )
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

  publishReconciliation(name : string, item: IReconcilePayload) {
    const site = this.siteService.getAssignedSite()
    const order$ = this.orderService.pOSTReconciliationOrder(site, name)
    return order$.pipe(switchMap(data => {
      item.id = data.id;
      return this.orderService.addReconciliationSection(site, item)
    })).pipe(switchMap(order => {
     this.setActiveOrder(order)
     return of(order)
    }))
  }


  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000,
      verticalPosition: 'bottom'
    });
  }
}
