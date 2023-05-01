import { Component, ElementRef, EventEmitter, Input,
         OnInit, Output, OnDestroy,  ViewChild, HostListener, Renderer2, TemplateRef } from '@angular/core';
import { AuthenticationService, AWSBucketService, OrdersService, TextMessagingService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem,   }  from 'src/app/_interfaces/transactions/posorder';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { delay,  repeatWhen, switchMap  } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import {  trigger, animate, transition,  keyframes } from '@angular/animations';
import * as kf from '../../../_animations/list-animations';
import { fadeAnimation } from 'src/app/_animations';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PosOrderItemsComponent } from './pos-order-items/pos-order-items.component';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { ResizedEvent } from 'angular-resize-event';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { NewOrderTypeComponent } from '../components/new-order-type/new-order-type.component';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';
import { IServiceType } from 'src/app/_interfaces';
import { PrepPrintingServiceService } from 'src/app/_services/system/prep-printing-service.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { Capacitor } from '@capacitor/core';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
selector: 'app-pos-order',
templateUrl: './pos-order.component.html',
styleUrls: ['./pos-order.component.scss'],
  animations: [
    trigger('cardAnimator', [
    transition('* => wobble', animate(1000, keyframes(kf.wobble))),
    transition('* => swing', animate(1000, keyframes(kf.swing))),
    transition('* => jello', animate(1000, keyframes(kf.jello))),
    transition('* => zoomOutRight', animate(1000, keyframes(kf.zoomOutRight))),
    transition('* => slideOutLeft', animate(1000, keyframes(kf.slideOutLeft))),
    transition('* => rotateOutUpRight', animate(1000, keyframes(kf.rotateOutUpRight))),
    transition('* => flipOutY', animate(1000, keyframes(kf.flipOutY))),
  ]),
  fadeAnimation
  ]
})

export class PosOrderComponent implements OnInit ,OnDestroy {
  get platForm() {  return Capacitor.getPlatform(); }
  @ViewChild('lastImageDisplayView') lastImageDisplayView: TemplateRef<any>;
  @ViewChild('listViewType')   listViewType: TemplateRef<any>;
  @ViewChild('itemViewType')   itemViewType: TemplateRef<any>;
  @ViewChild('disEMVCardButton')   disEMVCardButton: TemplateRef<any>;
  @ViewChild('dsiEMVAndroidCardButton')   dsiEMVAndroidCardButton: TemplateRef<any>;
  @ViewChild('cardPointeButton')   cardPointeButton: TemplateRef<any>;
  @ViewChild('giftCardPayButton')   giftCardPayButton: TemplateRef<any>;
  @ViewChild('houseAccountButton')   houseAccountButton: TemplateRef<any>;
  @ViewChild('storeCreditPaybutton')   storeCreditPaybutton: TemplateRef<any>;
  @ViewChild('wicEBTButton')   wicEBTButton: TemplateRef<any>;
  @ViewChild('triPOSPaymentButton')   triPOSPaymentButton: TemplateRef<any>;
  @ViewChild('payButton')   payButton: TemplateRef<any>;
  @ViewChild('stripePayButton')   stripePayButton: TemplateRef<any>;

  action$: Observable<any>;
  deleteOrder$: Observable<any>;
  printLabels$:  Observable<any>;
  obs$ : Observable<any>[];
  userAuths       :   IUserAuth_Properties;
  _userAuths      : Subscription;
  gridheaderitem = 'grid-header-item-main'
  deviceWidthPercentage ='90%'
  orderItemsHeightStyle ='150px'
  windowHeight: number;
  CDK_DRAG_CONFIG = {}
  // @ViewChild('orderItems') orderItems: ElementRef;
  @Output() toggleOpenOrderBarForMe: EventEmitter<any> = new EventEmitter();
  // @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  openOrderBar                      : boolean;
  // @ViewChild('container') container : ElementRef;
  @Input() OrderID : string;
  @Input() mainPanel = false;

  id: any = '';
  order$: Observable<IPOSOrder>;
  serviceType$: Observable<IServiceType>;
  printAction$:  Observable<any>;
  isNotInSidePanel: boolean
  sidePanelWidth: number
  sidePanelPercentAdjust: number
  smallDevice : boolean;
  phoneDevice = false;
  bucketName:             string;
  awsBucketURL:           string;
  currentPage: any;
  @Input() itemsPerPage  = 8

  _creditPaymentAmount = 0;
  dsiEMVEnabled = this.paymentsMethodsService.DSIEmvSettings?.enabled;
  _openBar      : Subscription;
  openBar       : boolean;

  isAuthorized  : boolean;
  isUser        : boolean;
  isStaff       : boolean;
  listView      : boolean;

  itemsPrinted  : boolean;
  paymentsMade  : boolean;
  _transactionUI:   Subscription;
  _order        :   Subscription;
  order         :   IPOSOrder;
  posOrderItem  :   PosOrderItem;
  gramCountProgress: any;
  canRemoveClient = false;

  orderlayout     = 'order-layout';
  orderItemsPanel = 'item-list';
  infobuttonpanel = 'info-button-panel';
  gridspan3       = 'grid-span-3'
  gridRight       = 'grid-order-header';
  user          : any;
  _user: Subscription;

  _uiSettings: Subscription;
  uiSettings : UIHomePageSettings;
  wideBar    =  true;
  enableLimitsView : boolean;
  _uiTransactionSettings: Subscription;
  uiTransactionSettings : TransactionUISettings;
  uiTransactions
  devicename = localStorage.getItem('devicename')

  emailOption : boolean;
  ssmsOption   : boolean;
  purchaseOrderEnabled: boolean;
  private _items : Subscription
  assignedItems:  PosOrderItem[];
  bottomSheet$: Observable<any>;
  posDevice$      : Observable<ITerminalSettings>;
  posDevice       :  ITerminalSettings;
  enableExitLabel : boolean;
  prepOrderOnClose: boolean;
  refundItemsAvalible;
  uiTransactionSetting$: Observable<TransactionUISettings>;
  uiTransactionSetting : TransactionUISettings;

  // @ViewChild('houseAccountButton')   houseAccountButton: TemplateRef<any>;
  // @ViewChild('storeCreditPaybutton')   storeCreditPaybutton: TemplateRef<any>;
  // @ViewChild('wicEBTButton')   wicEBTButton: TemplateRef<any>;
  // @ViewChild('triPOSPaymentButton')   triPOSPaymentButton: TemplateRef<any>;
  // @ViewChild('payButton')   payButton: TemplateRef<any>;

  get stripePayButtonView() {
    if ( this.order && this.order.balanceRemaining != 0 && !this.platFormService.isApp() ) {
      return this.stripePayButton
    }
    return null;
  }

  get wicEBTButtonView() {
    if ( (!this.paymentsEqualTotal &&
          !this.order.completionDate &&
          this.order?.balanceRemaining != 0)) {
        if (this.order.wicTotal>0 || this.order.ebtTotal>0){
          return this.wicEBTButton
        }
    }
    return null;
  }


  get storeCreditPaybuttonView() {
    if ( this.order && this.order.clientID &&  (!this.paymentsEqualTotal && !this.order.completionDate && this.order?.balanceRemaining != 0)) {
      return this.storeCreditPaybutton
    }
    return null;
  }

  get triPOSPaymentButtonView() {
    // console.log(this.devicename, this.uiTransactionSetting?.triposEnabled, this.order.balanceRemaining, this.order?.balanceRemaining != 0)
    if ( this.devicename &&
          this.uiTransactionSettings?.triposEnabled &&
          (this.order && this.order?.balanceRemaining != 0) ) {
      return this.triPOSPaymentButton
    }
    return null;
  }

  get houseAccountButtonView() {
    if (  (this.userAuths && this.userAuths.houseAccountPayment) && this.order.clientID != 0 &&
            this.order?.clients_POSOrders?.client_Type?.name.toLowerCase() === 'house account') {
      return this.houseAccountButton
    }
    return null;
  }

  get dsiButtonView() {
    if (    this.devicename && (this.uiTransactionSettings && this.uiTransactionSettings?.dsiEMVNeteEpayEnabled)
      && this.order && this.order?.balanceRemaining != 0) {
      return this.disEMVCardButton
    }
    return null;
  }

  get giftCardButtonView() {
    if (  (!this.paymentsEqualTotal &&
           !this.order.completionDate &&
           this.order?.balanceRemaining != 0)) {
      if (this.uiTransactionSetting?.enableGiftCards) {
        return this.giftCardPayButton;
      }
    }
    return null;
  }

  get cardPointButtonView() {
    if (this.devicename &&
      this.uiTransactionSettings?.cardPointBoltEnabled &&
      (this.order && this.order?.balanceRemaining != 0)) {
        return this.cardPointeButton
      }
      return null;
  }

  get dsiEMVAndroidCardButtonView() {
    if ((this.platForm === 'android') &&
        this.devicename &&
        this.uiTransactionSettings?.cardPointAndroidEnabled &&
        (this.order && this.order?.balanceRemaining != 0)) {
          return this.dsiEMVAndroidCardButton
    }
    return null;
  }

  transactionUISettingsSubscriber() {
    this._transactionUI = this.uiSettingsService.transactionUISettings$.subscribe( data => {
      this.enableLimitsView  = false;
      if (data) {
        this.uiTransactionSettings = data;
        this.enableLimitsView = data.enableLimitsView
      }
    });
  }


  initAssignedItemsSubscriber() {
    this._items = this.orderMethodService.assignedPOSItems$.subscribe(data => {
      this.assignedItems = data;
      if (data && data.length>0) {
        this.refundItemsAvalible = true;
      }
      this.refundItemsAvalible = false;
    })
  }


  gettransactionUISettingsSubscriber() {
    this.uiTransactionSetting$ = this.settingService.getUITransactionSetting().pipe(
      switchMap( data => {
        this.uiSettingsService.updateUISubscription(data);
        this.prepOrderOnClose = data?.prepOrderOnClose;
        return of(data)
      })
    )
  }

  homePageSettingSubscriber() {
    this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe ( data => {
      this.uiSettings = data;
      if (data) {
        if (data.outGoingCustomerSupportEmail) {
          this.emailOption = true
        }
        if (data.twilioEnabled) {
          this.ssmsOption = true
        }
        if (data.wideOrderBar) {
          this.wideBar = true;
        }
      }
    })
  }

  currentOrderSusbcriber() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
      this.canRemoveClient = true
      if (this.order) {
        this.initPurchaseOrderOption(this.order?.serviceTypeID);
      }
      if (this.order && this.order.posOrderItems && this.order.posOrderItems.length > 0) {
        this.canRemoveClient = false
      }
      if (this.order && this.order.posPayments && this.order.posPayments.length > 0)  {
        this.canRemoveClient = false
      }
      if (!data) { return }
      this.checkIfPaymentsMade()
      this.checkIfItemsPrinted()
    })
  }

  get isApp() {
   return this.platFormService.isApp()
  }

  userAuthSubscriber() {
    this._userAuths = this.authenticationService.userAuths$.subscribe(data => {
      if (data) {
        this.userAuths = data;
      }
    })
  }
  onResizedorderHeightPanel(event: ResizedEvent) {
    // console.log('order header event', event)
    this.uiSettingsService.updateorderHeaderHeight(event.newRect.height, this.windowHeight) //this.orderHeightPanel.nativeElement.offsetHeight)
    this.resizePanel()
  }

  onResizedorderLimitsPanel(event: ResizedEvent) {
    this.uiSettingsService.updateLimitOrderHeight(event.newRect.height, this.windowHeight) //(this.orderLimitsPanel.nativeElement.offsetHeight)
    this.resizePanel()
  }

  onResizedorderSpecialsPanel(event: ResizedEvent) {
    this.uiSettingsService.updatespecialOrderHeight(event.newRect.height, this.windowHeight) //(this.orderSpecialsPanel.nativeElement.offsetHeight)
    this.resizePanel()
  }

  onResizedorderCustomerPanel(event: ResizedEvent) {
    // console.log('onResizedorderCustomerPanel',  event.newRect.height )
    this.uiSettingsService.updatecustomerOrderHeight(event.newRect.height,this.windowHeight) //(this.orderCustomerPanel.nativeElement.offsetHeight)
    this.resizePanel()
  }

  resizePanel() {
    this.uiSettingsService.remainingHeight$.subscribe(data => {
      if (this.mainPanel) {
        this.orderItemsHeightStyle = `calc(100vh -${ - 100}px)`
        if (this.smallDevice) {
          this.orderItemsHeightStyle = `calc(100vh -${ - 100}px)`
        }
        return;
      }
      if (data) {
        const value = +data.toFixed(0)
        let cartHeight = 70;
        if (this.uiTransactionSettings && this.uiTransactionSettings?.displayEditCardOnHeader) {
          cartHeight = 0
        }
        this.orderItemsHeightStyle = `${value - cartHeight}px`
        if (this.smallDevice) {
          this.orderItemsHeightStyle = `${value - cartHeight - 30}px`
        }
      }
    })
  }

  initPurchaseOrderOption(id: number) {
    if (!id) { return }
    if (this.userAuthorization.isManagement) {

      const site = this.siteService.getAssignedSite()
      this.serviceType$ = this.serviceTypeService.getType (site,id).pipe(
        switchMap(data => {
          this.purchaseOrderEnabled = false
          if (data) {
            if ( data?.filterType == 1  ||  data.filterType == -1 ) {
              this.purchaseOrderEnabled = true
            }
          }
          return of(data)
        })
      )
    }
  }

  userSubscriber() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })
  }

  initSubscriptions() {
    this.transactionUISettingsSubscriber();
    this.homePageSettingSubscriber();
    this.currentOrderSusbcriber();
    this.userSubscriber();
    this.initBarSubscription();
    this.resizePanel();
    this.initAssignedItemsSubscriber();
    this.userAuthSubscriber();
  }

  initBarSubscription() {
    this._openBar = this.toolbarUIService.orderBar$.subscribe(data => {
      this.openBar = data
    })
  }

  get paymentsEqualTotal() {
    if (!this.order) { return }
    if (this.order.completionDate) {
      return true;
    }
    return this.paymentsMethodsService.isOrderBalanceZero(this.order)
  }

  public get creditPaymentAmount() {
    if (!this._creditPaymentAmount || this._creditPaymentAmount != 0) {
      if (this.order.creditBalanceRemaining == 0) {
        return  this.order.balanceRemaining;
      }
      return  this.order.creditBalanceRemaining;
    }
    return this._creditPaymentAmount;
  }


  constructor(

              private paymentsMethodsService: PaymentsMethodsProcessService,
              private renderer          : Renderer2,
              public platFormService    : PlatformService,
              private navigationService : NavigationService,
              private orderService      : OrdersService,
              private awsBucket         : AWSBucketService,
              private printingService   : PrintingService,
              private _snackBar         : MatSnackBar,
              private router            : Router,
              public  route             : ActivatedRoute,
              private siteService       : SitesService,
              private toolbarUIService  : ToolBarUIService,
              private bottomSheet       : MatBottomSheet,
              private orderMethodService: OrderMethodsService,
              public  userAuthorization : UserAuthorizationService,
              private authenticationService: AuthenticationService,
              public  uiSettingsService  : UISettingsService,
              private serviceTypeService: ServiceTypeService,
              private settingService    : SettingsService,
              private _bottomSheet     : MatBottomSheet,
              private inventoryAssignmentService: InventoryAssignmentService,
              private posOrderItemService: POSOrderItemService,
              private manifestService: ManifestInventoryService,
              private productEditButtonService: ProductEditButtonService,
              private prepPrintingService: PrepPrintingServiceService,
              private el                : ElementRef) {

    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    if (outPut) {
      this.mainPanel = true
    }
    this.refreshOrder();

  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    this.phoneDevice = false
    this.deviceWidthPercentage = '90%'
    this.gridRight       = 'grid-order-header ';
    this.orderlayout     = 'order-layout-empty';
    this.resizePanel();

    this.windowHeight = window.innerHeight;
    this.gridheaderitem  = 'grid-header-item'

    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.infobuttonpanel = 'grid-order-header'
      this.gridspan3       = ''
      this.gridRight       = 'grid-order-header';
    }

    if (window.innerWidth < 599) {
      this.phoneDevice = true
      this.deviceWidthPercentage = '65%'
    }

    if (this.mainPanel && !this.smallDevice) {
      this.orderlayout     = 'order-layout reverse'
      this.gridheaderitem  = 'grid-header-item-main'
      this.gridRight       = 'order-layout-buttons'// 'grid-order-header reverse'
    }

    if (!this.mainPanel) {
      this.orderItemsPanel = 'item-list-side-panel'
      this.infobuttonpanel ='grid-buttons'
      this.gridspan3       = ''
      this.gridRight       = 'grid-header-order-total'
    }
  }

  toggleListView(event) {
    console.log(event)
    this.listView = event;
  }

  get getListViewType() {
    if (this.listView) {
      return this.listViewType
    }
    if (!this.listView) {
      return this.itemViewType;
    }
  }

  getDeviceInfo() {
    const devicename = this.orderService.posName
    if (devicename && this.isApp) {
      this.posDevice$ = this.uiSettingsService.getPOSDeviceSettings(devicename).pipe(
        switchMap(data => {
          try {
            const posDevice = JSON.parse(data.text) as ITerminalSettings;
            this.uiSettingsService.updatePOSDevice(posDevice)
            this.posDevice = posDevice;
            this.enableExitLabel = posDevice.enableExitLabel;

            return of(posDevice)
          } catch (error) {

             this.siteService.notify('Error setting device info.' + error, 'Close', 5000, 'yellow')
          }
          return of(null)
        }
      ))
    }
  }

  async ngOnInit() {
    this.getDeviceInfo();
    this.initAuthorization();
    this.gettransactionUISettingsSubscriber();
    this.updateItemsPerPage();
    this.bucketName     =   await this.awsBucket.awsBucket();
    this.awsBucketURL   = await this.awsBucket.awsBucketURL();
    this.sidePanelWidth = this.el.nativeElement.offsetWidth;
    this.initSubscriptions();

    if (this.sidePanelWidth < 210) {
      this.isNotInSidePanel = false
      this.sidePanelPercentAdjust = 80
    } else {
      this.isNotInSidePanel = true
      this.sidePanelPercentAdjust = 60
    }

    if (!this.toolbarUIService.swapMenuWithOrderBoolean) {
      this.toolbarUIService.hidetoolBars();
    }
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {
    }
    // if (this.userAuthorization.)
  }

  openClient() {
    if (this.order && this.order.clients_POSOrders) {
      this.router.navigate(["/profileEditor/", {id: this.order.clientID}]);
    }
  }

  //check order status:
  refreshOrder() {
    if (this.order) {
      this.orderMethodService.refreshOrder(this.order.id)
    }
  }

  changeTransactionType(event) {
    this.orderService.toggleChangeOrderType = true;
    const bottomSheet = this._bottomSheet.open(NewOrderTypeComponent)
    this.bottomSheet$ = bottomSheet.afterDismissed()
    this.bottomSheet$.subscribe(data => {
      this.orderService.toggleChangeOrderType = false;
    })
  }

  checkIfItemsPrinted() {
    this.itemsPrinted = false
    if (this.order && this.order.posOrderItems) {
      if (this.order.posOrderItems.length > 0) {
        const items = this.order.posOrderItems
        items.forEach( data => {
          if (data.printed) {
            this.itemsPrinted = true
            return true
          }
        })
      }
    }
  }

  applyDiscount(event) {

  }

  makeManifest(event) {
    const site = this.siteService.getAssignedSite()
    const action$ = this.serviceTypeService.getType(site, this.order.serviceTypeID).pipe(switchMap(data => {

      if (data.filterType == 1 || data.filterType == -1) {
        const manifest = {} as InventoryManifest

        manifest.description = this.order.id.toString()
        manifest.type = this.order.serviceType
        manifest.sourceSiteID = site.id
        manifest.sourceSiteName = site.name
        manifest.sourceSiteURL = site.url
        manifest.destinationID = site.id
        manifest.destinationSiteName = site.name
        manifest.destinationURL = site.url
        return this.inventoryAssignmentService.createManifestFromOrder( site, manifest, this.order  )

      }
      this.notifyEvent('Order must be of a purchase order type to create a manifest.', 'Alert')
      return of(null)
    })).pipe(switchMap(data => {
      //navigate to inventory open manifest.
      // this.openManifestEditor(data)
      if (!data) { return  of(null)}
      this.manifestService.openManifestForm(data?.id)
      return of(data)
    }))
    this.action$ = action$;

  }

  checkIfPaymentsMade() {
    this.paymentsMade = false
    if (this.order && this.order.posPayments) {
      if (this.order.posPayments.length > 0) {
        this.paymentsMade = true
        return true
      }
    }
  }

  sendToPrep() {
    if (this.order) {
      this.printAction$ = this.orderMethodService.sendToPrep(this.order, true)
    }
  }

  logAnimation(event) {
    // console.log(event)
  }

  getImageUrl(imageName: string): any {
    let imageUrl: string
    let ary: any[]
    if ( imageName ) {
      ary = this.awsBucket.convertToArrayWithUrl( imageName, this.awsBucketURL)
      imageUrl = ary[0]
    }
    return imageUrl
  }

  async assignCurrentOrder() {
    if (this.currentPOSOrderExists()) {
      const order$ = this.orderService.getCurrentPOSOrder(this.siteService.getAssignedSite(),this.orderService.posName)
    } else {
      if (!this.order) {
        this.order$ = null
        return
      }
      const order$ = this.orderService.getOrder(this.siteService.getAssignedSite(),  this.order.id.toString(), this.order.history)
    }
    this.refreshObservable(this.order$)
  }

  refreshObservable(order$: Observable<IPOSOrder>) {
    order$.pipe(
      repeatWhen(x => x.pipe(delay(3500)))).subscribe(data => {
      this.orderService.updateOrderSubscription(data)
    })
  }

  currentPOSOrderExists() {
    if ( this.orderService.posName != '' && this.orderService.posName != undefined  && this.orderService.posName != null ) {
      return true
    }
  }

  clearOrder(event) {
    this.orderMethodService.clearOrder()
  }

  voidOrder() {
     this.productEditButtonService.openVoidOrderDialog(this.order)
  }

  refundItem(event) {
    if (this.assignedItems) {
      // console.log(this.assignedItems)
      // console.log('what is happening.')
      this.productEditButtonService.openRefundItemDialog(this.assignedItems)
    }
  }

  refundOrder(event) {
    this.productEditButtonService.openRefundOrderDialog(this.order)
  }

  deleteOrder(event) {
    this.deleteOrder$ = this.orderMethodService.deleteOrder(this.order.id, false).pipe(switchMap(data => {

      return of(data)
    }))
  }

  ngOnDestroy() {
    if (this.id) { clearInterval(this.id); }
    if(this._order) { this._order.unsubscribe() }
    if (this._transactionUI) { this._transactionUI.unsubscribe()}
    this.orderService.updateBottomSheetOpen(false)
    if (this._user) { this._user.unsubscribe()}
    if (this._uiSettings) { this._uiSettings.unsubscribe()}
    if (this._uiTransactionSettings) { this._uiTransactionSettings.unsubscribe()}
    this.uiTransactionSetting$  = null;

    if (this.bottomSheet$) {
      this.bottomSheet$ = null;
    }
  }

  suspendOrder() {
    if (this.order) {
      this.action$ = this.orderMethodService.suspendOrder(this.order)
    };
  }

  removeDiscount(event) {

    const result = window.confirm('Are you sure you want to remove the discounts?');
    if (result) { return };
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      let item$ = this.posOrderItemService.removeOrderDiscount(site, this.order.id);
      item$.subscribe(data => {
        this.orderService.updateOrderSubscription(data);
      })
    };

  }

  removeSuspension() {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.suspendedOrder = false;
      this.orderService.putOrder(site, this.order).subscribe( data => {
        this.notifyEvent('This suspension is removed', 'Success')
        // this.router.navigateByUrl('/pos-orders')
      })
    };
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  async assignCustomer(event) {
    if (event) {
      await this.assignClientID(event.id)
    }
  }

  async assignClientID(id: number) {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.clientID = id
      const order = await this.orderService.putOrder(site, this.order).pipe().toPromise()
      this.orderService.updateOrderSubscription(order)
    }
  }

  async  removeClient() {
    if (this.order) {
      await this.assignClientID(0);
    }
  }


  houseAccountPayment() {
    this.action$ =  this.orderMethodService.suspendOrder(this.order)
  }

  //loop the items
  //print labels
  //update the items that have the label printed
  ///update the inventory
  //update the subscription order Info
  printLabels(newLabels: boolean) {
    this.printLabels$ = this.printingService.printLabels(this.order , newLabels).pipe(
        switchMap(data => {

          this.printingService.printJoinedLabels();
          return of(data)
        }
      )
    )
  }

  setStep(value:number) {
  }

  rePrintLabels() {
    this.printLabels(false)
  }

  get isLastImageDisplayOn() {
    // console.log('this.mainPanel', this.mainPanel)
    // console.log('this.qrOrder', this.qrOrder)
    // const qrView = (!this.qrOrder || this.qrOrder == undefined)
    // console.log('qrView', qrView)
    // console.log('this.mainPanel', this.mainPanel)
    // console.log('this.orderMethodsService.lastItemAddedExists', this.orderMethodsService.lastItemAddedExists)
    // if (this.mainPanel) {
      // if (this.orderMethodsService.lastItemAddedExists) {
        // console.log('display view')
    return this.lastImageDisplayView
      // }
    // }
    console.log('dont display view')
    return null
  }

  //get item
  //print maybe
  //update inventory


  // //get item
  // //print maybe
  // //update inventory
  // printLabel(item: PosOrderItem) {

  //   const site = this.siteService.getAssignedSite();
  //   let printerName = ''


  returnMenuItem(item: IMenuItem): Observable<IMenuItem> {
    return
  }

  makePayment() {
    this.openOrderBar = false
    this.navigationService.makePaymentFromSidePanel(this.openOrderBar, this.smallDevice,
      this.isStaff, this.order  )
  }

  printReceipt() {
    this.openReceiptView();
  }

  showItems() {
    this.toolbarUIService.updateOrderBar(false)
    if (this.order) {
      this.orderService.updateBottomSheetOpen(true)
      this.bottomSheet.open(PosOrderItemsComponent)
    }
  }

  openReceiptView() {
    this.printingService.previewReceipt()
  }

  textNotify() {
    // this.outPutTextNotify.emit(true)
    this.orderMethodService.sendSSMSOrderISReady(this.order)
  }

  emailNotifyOrder(event) {
    this.orderMethodService.emailOrder(this.order).subscribe(data => {
      // if (data.isSuccessStatusCode  || data === 'success') {
      this.orderMethodService.notifyEvent('Email Sent', 'Sent');
      //   this.orderMethodService.notifyEvent('Email Sent', 'Success')
      //  }
      // if (!data.isSuccessStatusCode) {
      //   this.orderMethodService.notifyEvent('Email not sent. Check email settings', 'Failed')
      // }
    })
  }

  emailOrder(event) {
    this.orderMethodService.emailOrder(this.order).subscribe(data => {
      if (data.isSuccessStatusCode) {
        this.orderMethodService.notifyEvent('Email Sent', 'Success')
       }
      if (!data.isSuccessStatusCode) {
        this.orderMethodService.notifyEvent('Email not sent. Check email settings', 'Failed')
      }
    })
  }

}
