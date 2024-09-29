import { Component, ElementRef, EventEmitter, Input,
         OnInit, Output, OnDestroy,  ViewChild, HostListener, Renderer2, TemplateRef } from '@angular/core';
import { AuthenticationService, AWSBucketService, IItemBasicB, MenuService, OrdersService, TextMessagingService } from 'src/app/_services';
import { IPOSOrder, JSONOrder, PosOrderItem,   }  from 'src/app/_interfaces/transactions/posorder';
import { Observable, of, Subscription } from 'rxjs';
import { concatMap, delay,  repeatWhen, switchMap  } from 'rxjs/operators';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import {  trigger, animate, transition,  keyframes } from '@angular/animations';
import * as kf from '../../../_animations/list-animations';
import { fadeAnimation } from 'src/app/_animations';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
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
import { IProduct, IServiceType, ISite } from 'src/app/_interfaces';
import { PrepPrintingServiceService } from 'src/app/_services/system/prep-printing-service.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { Capacitor } from '@capacitor/core';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { CoachMarksClass, CoachMarksService } from 'src/app/shared/widgets/coach-marks/coach-marks.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { PosOrderItemMethodsService } from 'src/app/_services/transactions/pos-order-item-methods.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';

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
  processing: boolean;
  showLabelPrint: any;
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
  @ViewChild('roundOrder') roundOrder : TemplateRef<any>;
  @ViewChild('rewardsTemplate') rewardsTemplate : TemplateRef<any>;
  @ViewChild('reconcile') reconcile : TemplateRef<any>;


  //purchaseItemSales
  @ViewChild('purchaseItemSales') purchaseItemSales: TemplateRef<any>;
  @ViewChild('importPurchaseOrder')   importPurchaseOrder: TemplateRef<any>;
  @ViewChild('purchaseItemHistory') purchaseItemHistory: TemplateRef<any>;
  @ViewChild('poItemValues') poItemValues: TemplateRef<any>;
  @ViewChild('labelPrintChild') labelPrintChild: TemplateRef<any>;
  @ViewChild('newItemEntry') newItemEntry: TemplateRef<any>;

  //Coaching Elements
  @ViewChild('coachingstoreCredit', {read: ElementRef}) coachingstoreCredit: ElementRef;
  @ViewChild('coachingCustomerInfo', {read: ElementRef}) coachingCustomerInfo: ElementRef;
  @ViewChild('coachingpurchaseOrderView', {read: ElementRef}) coachingpurchaseOrderView: ElementRef;
  @ViewChild('coachingpayOptions', {read: ElementRef}) coachingpayOptions: ElementRef;
  @ViewChild('coachingchangeType', {read: ElementRef}) coachingchangeType: ElementRef;
  @ViewChild('coachingTransferOrder', {read: ElementRef}) coachingTransferOrder: ElementRef;
  @ViewChild('coachingexitButton', {read: ElementRef}) coachingexitButton: ElementRef;
  @ViewChild('coachingSuspend', {read: ElementRef}) coachingSuspend: ElementRef;
  @ViewChild('coachingAdjustment', {read: ElementRef}) coachingAdjustment: ElementRef;
  @ViewChild('coachingListView', {read: ElementRef}) coachingListView: ElementRef;

  newItemEnabled: boolean;
  product$: Observable<IProduct>;

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
  client$: Observable<any>;

  product: IProduct;
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
  dsiEMVEnabled = this.paymentsMethodsService?.DSIEmvSettings?.enabled;
  enablePreAuth = this.paymentsMethodsService?.DSIEmvSettings?.partialAuth;
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
  filteredList: PosOrderItem[]
  orderlayout     = 'order-layout';
  orderItemsPanel = 'item-list';
  infobuttonpanel = 'info-button-panel';
  gridspan3       = 'grid-span-3'
  gridRight       = 'grid-order-header';
  user          : any;
  _user: Subscription;

  menuCategoryID: number;
  _uiSettings: Subscription;
  uiSettings : UIHomePageSettings;
  wideBar    =  true;
  enableLimitsView : boolean;

  uiTransactionSetting$ : Observable<TransactionUISettings>;
  uiTransactionSetting  : TransactionUISettings;
  _uiTransactionSettings: Subscription;
  uiTransactionSettings : TransactionUISettings;
  saveaction$ : Observable<IProduct>;
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
  _lastItem: Subscription;
  _quantitySubscriptions: Subscription;
  quantityEntryValue : number = 1;
  reconcileValueForm: FormGroup;
  reconcileEntryValue : number = 1;

   _ItemsSheet : MatBottomSheetRef
   bottomSheetItemsOpen : boolean;

  selectedItem: PosOrderItem;
  lastSelectedItem$: Subscription;
  searchForm: FormGroup;
  bayName: string;
  bayNames = [];

  salesDateForm: FormGroup;
  categories$      : Observable<IMenuItem[]>;
  departments$     : Observable<IMenuItem[]>;
  productTypes$    : Observable<IItemType[]>;

  menuToggleEnabled: boolean;

  dateFrom: any;
  dateTo: any;
  // _assignedItems: Subscription;
  // assignedItems: PosOrderItem[]
  // initItemSubscription() {
  //   this._assignedItems = this.orderMethodsService.assignedPOSItems$.subscribe(data =>{

  //   })
  // }
  get stripePayButtonView() {
    if ( this.order && this.order.balanceRemaining != 0 && !this.platFormService.isApp() ) {
      return this.stripePayButton
    }
    return null;
  }

  setKeyPadValue(event) {
    // set this value for Scanning Items. ;
    // reset this value when order changes, when item is added.
    // when leaving this screen.
    // when modifying anything else.
    // when screen refreshes.
    // this.
    // console.log(event, event.value)
    // return;
    if (event) {
      this.orderMethodsService._quantityValue.next(event)
    }
  }

  get reconcileView() {
    if (this.order && this.order?.service?.filterType == 2) {
      return this.reconcile
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

  get rewardsView() {
    if (this.uiTransactionSettings?.rewardsEnabled) {
      return this.rewardsTemplate
    }
    return null
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

  initLastItemSelectedSubscriber() {
    this.product = {} as IProduct
    this._lastItem = this.orderMethodsService.lastItemAdded$.subscribe(data => {
      const site = this.siteService.getAssignedSite();

      if (data) {
        // console.log('menu item selected', data)
        this.product$ = this.menuService.getProduct(site, data.id).pipe(switchMap(data => {
          // data.caseQty
          this.product = {} as IProduct
          if (data.caseQty>0 && data.caseRetail) {
            this.product = data;
          }

          return of(data)
        }))
      }
    })
  }

  initAssignedItemsSubscriber() {
    this._items = this.orderMethodsService.assignedPOSItems$.subscribe(data => {
      this.assignedItems = data;
      if (data && data.length>0) {
        this.refundItemsAvalible = true;
      }
      this.refundItemsAvalible = false;
    })
  }

  setDefaultFirstMenu(event) {
    this.menuCategoryID = event
    if (event) {
      // console.log('setDefaultFirstMenu', event)
    }
  }


  gettransactionUISettingsSubscriber() {
    this.uiTransactionSetting$ =  this.uiSettingsService.transactionUISettings$.pipe(switchMap(data => {
      if (data) {
        return of(data)
      }
      return this.settingService.getUITransactionSetting()
    })).pipe(switchMap(data => {
      // console.log('enableRounding- cached', data?.enableRounding)
      if (data) {
        this.uiTransactionSetting = data;
        this.prepOrderOnClose = data?.prepOrderOnClose;
      }
      return of(data)
    }))
  }

  homePageSettingSubscriber() {
    this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe( data => {
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

  lastSelectedItemSubscriber(){
    this.lastSelectedItem$ = this.orderMethodsService.lastSelectedItem$.subscribe(data => {
      this.selectedItem = data;
    })
  }

  get isInventoryMonitor() {
    if (this.order?.customerName == 'Inventory Monitor') {
      return true
    }
    return false
  }

  inventoryMonitorDiscrepencies() {
    const site = this.siteService.getAssignedSite()
    this.processing = true;
    this.action$ = this.orderMethodsService.getInventoryMonitor(site, this.order.id).pipe(switchMap(data => {
      this.processing = false;
      return of(data)
    }))
  }

  currentOrderSusbcriber() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {

      if (this.order?.serviceTypeID != data?.serviceTypeID) {
        this.order = data
        this.initPurchaseOrderOption(this.order?.serviceTypeID);
      } else {
        this.order = data
      }

      this.canRemoveClient = true;

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

  get isApp() {  return this.platFormService.isApp()  }

  userAuthSubscriber() {
    this._userAuths = this.authenticationService.userAuths$.subscribe(data => {
      if (data) { this.userAuths = data; }
    })
  }

  onResizedorderHeightPanel(event: ResizedEvent) {
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
        // console.log(this.orderItemsHeightStyle)
      }
    })
  }

  initQuickMenus(event) {
    console.log(event,event.value)
    this.menuToggleEnabled = event;

  }

  initPurchaseOrderOption(id: number) {
    // console.log('initPurchaseOrderOption', id)
    if (!id) { return }
    this.purchaseOrderEnabled = false
    if (this.userAuthorization.isManagement || this.userAuthorization.isAdmin) {
      const site = this.siteService.getAssignedSite()

      this.serviceType$ = this.serviceTypeService.getTypeCached (site,id).pipe(
        switchMap(data => {
          this.listView = false;

          if (data && data.filterType == null) {
            this.listView = false;
          }

          if (data  && data.filterType) {
            if ( data?.filterType == 1 ||  data.filterType == -1 ||
                 data?.filterType == 2 || data?.filterType == 3 ) {
              this.purchaseOrderEnabled = true
              this.listView = true;
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

    this.initReconcilePanel()
    try {
      this._quantitySubscriptions =  this.orderMethodsService.quantityValue$.subscribe(data => {
        this.quantityEntryValue = data;
      })
    } catch (error) {

    }
  }

  initReconcilePanel() {
    const site          = this.siteService.getAssignedSite()
    this.refreshDepartments();
    this.refreshCategories();
    this.productTypes$        = this.itemTypeService.getItemTypesByUseType(site, 'product')
  }

  refreshDepartments() {
    const site          = this.siteService.getAssignedSite()
    this.departments$   = this.menuService.getListOfDepartmentsAll(site).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  refreshCategories() {
    const site          = this.siteService.getAssignedSite()
    this.categories$    = this.menuService.getListOfCategoriesAll(site)
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
              private fbProductsService: FbProductsService,
              public platFormService    : PlatformService,
              private navigationService : NavigationService,
              private orderService      : OrdersService,
              public  orderMethodsService: OrderMethodsService,
              private paymentService    : POSPaymentService,
              private awsBucket         : AWSBucketService,
              private printingService   : PrintingService,
              private _snackBar         : MatSnackBar,
              private router            : Router,
              public  route             : ActivatedRoute,
              private siteService       : SitesService,
              private toolbarUIService       : ToolBarUIService,
              private bottomSheet            : MatBottomSheet,
              public  userAuthorization      : UserAuthorizationService,
              private authenticationService  : AuthenticationService,
              public  uiSettingsService      : UISettingsService,
              private serviceTypeService     : ServiceTypeService,
              private settingService         : SettingsService,
              private _bottomSheet           : MatBottomSheet,
              private inventoryAssignmentService: InventoryAssignmentService,
              private posOrderItemService    : POSOrderItemService,
              private coachMarksService      : CoachMarksService,
              private manifestService        : ManifestInventoryService,
              private productEditButtonService: ProductEditButtonService,
              private prepPrintingService    : PrepPrintingServiceService,
              private menuService            : MenuService,
              private posOrderItemMethodsService: PosOrderItemMethodsService,
              private fb                     : FormBuilder,
              private itemTypeService        : ItemTypeService,
              private el                     : ElementRef) {


    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    const id = this.route.snapshot.paramMap.get('id');
    if (outPut) {
      this.mainPanel = true
    }
    this.refreshOrder(+id);
  }

  initTransactionUISettings() {
    this.uiSettingsService.transactionUISettings$.subscribe( data => {
        this.uiTransactions = data
      }
    )
  }

  async ngOnInit() {
    this.initTransactionUISettings();
    this.getDeviceInfo();
    this.initAuthorization();
    this.gettransactionUISettingsSubscriber();
    this.updateItemsPerPage();
    this.bucketName     = await this.awsBucket.awsBucket();
    this.awsBucketURL   = await this.awsBucket.awsBucketURL();
    this.sidePanelWidth = this.el.nativeElement.offsetWidth;
    this.initSubscriptions();
    this.lastSelectedItemSubscriber();
    this.initReconcileSearchForm();
    this.initSalesDateForm();

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

  setDateRange(event) {
    if (event) {
      const range = event?.value;
      // this.dateFrom = range.dateFrom;
      // this.dateTo   = range.dateTol;
    }
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
    this.listView = event;
  }

  get purchaseOrderItemView() {
    if (!this.userAuths?.editProduct) { return }
    if (this.smallDevice) { return }
    if (!this.mainPanel) { return null }
    if (this.order && this.order.service && (this.order.service?.filterType == 1 || this.order.service?.name.toLowerCase() === 'purchase order')) {
      return this.purchaseItemSales;
    }
    return null
  }

  roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    const valueResult = Math.round(value * factor) / factor;
    // console.log('valueResult',value, valueResult) ;
    return valueResult
  }

  get cashDiscount() {
    const ui = this.uiTransactions;

    if (ui?.dcapSurchargeOption == 3) {
      return this.roundToPrecision( this.order.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 2) {
      return this.roundToPrecision( this.order.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 1 ) {
      return this.roundToPrecision( this.order.balanceRemaining * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (!ui?.dcapSurchargeOption && ui.dcapDualPriceValue ) {
      return this.roundToPrecision( this.order.balanceRemaining * (1 + +ui.dcapDualPriceValue) , 5)
    }
    return null
  }

  //purchaseItemHistory
  get purchaseItemHistoryView() {
    if (!this.userAuths?.editProduct) { return }
    if (this.smallDevice) { return }
    if (!this.mainPanel) { return null }
    if (this.order && this.order.service &&
      (this.order.service?.filterType == 1 || this.order.service?.name.toLowerCase() === 'purchase order')) {
        return this.purchaseItemHistory;
    }
    return null
  }

  get importPurchaseOrderView() {
    if (this.showLabelPrint) { return null}
    if (!this.userAuths?.editProduct) { return }
    if (this.smallDevice) { return }
    if (!this.mainPanel) { return null }
    if (!this.isNotPurchaseOrder) {
      return this.importPurchaseOrder;
    }
    return null
  }



  get labelPrintView() {
    if (this.showLabelPrint) { return this.labelPrintChild }
    return null;
  }

  get isNotPurchaseOrder() {
    if ( this.order?.service?.filterType  == 1) { return false}
    if ( this.order?.service?.filterType  == 2) { return false }
    return true;
  }

  get poItemvaluesView() {
    if (this.showLabelPrint) { return null}
    if (!this.userAuths?.editProduct) { return }
    if (!this.smallDevice &&  !this.mainPanel) { return null }
    if (this.order && this.order?.service && (this.order.service?.filterType == 1 || this.order?.service?.name.toLowerCase() === 'purchase order')) {
      return this.poItemValues;
    }
    return null
  }

  get getListViewType() {
    if (this.listView) {
      return this.listViewType
    }
    if (!this.listView) {
      return this.itemViewType;
    }
  }

  get roundOrderView() {
    if (this.uiTransactionSetting && this.uiTransactionSetting?.enableRounding) {
      if (!this.paymentsEqualTotal && (!this.order?.service?.filterType || this.order?.service?.filterType == 0)) {
        return this.roundOrder
      }
    }
  }

  setScannerFocus(event) {
    // console.log('set scanner focus')
    this.orderMethodsService.setScanner()
  }

  receiveOrder() {
    if (this.order) {
      this.action$ = this._makeManifest().pipe(switchMap(data => {
        this.manifestService.openManifestForm(data.id, true)
        return of(data)
      }))
    }
  }

  getDeviceInfo() {
    const devicename = localStorage.getItem('devicename')
    if (devicename && this.isApp) {

      if (this.posDevice) {
        this.enableExitLabel = this.posDevice?.enableExitLabel;
        return;
      }
      this.posDevice$ = this.uiSettingsService.getPOSDeviceSettings(devicename).pipe(
        switchMap(data => {
          try {
            const posDevice = JSON.parse(data.text) as ITerminalSettings;
            this.uiSettingsService.updatePOSDevice(posDevice)
            this.posDevice = posDevice;
            this.enableExitLabel = posDevice.enableExitLabel;
            return of(posDevice)
          } catch (error) {
            this.siteService.notify(`Error setting device info, for device: ${devicename}` + JSON.stringify(error), 'Close', 10000, 'yellow')
          }
          return of(null)
        }
      ))
    }
  }



  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {
    }
  }

  openClient() {
    if (this.order && this.order.clients_POSOrders) {
      this.router.navigate(["/profileEditor/", {id: this.order.clientID}]);
    }
  }

  //check order status:
  refreshOrder(id?: number) {

    if (!this.order) { return }
    if (this.order?.service?.filterType == 2) {
      this.refreshSearch(this.order)
    }

  }

  changeTransactionType(event) {
    this.orderMethodsService.toggleChangeOrderType = true;
    const bottomSheet = this._bottomSheet.open(NewOrderTypeComponent)
    this.bottomSheet$ = bottomSheet.afterDismissed()
    this.bottomSheet$.subscribe(data => {
      this.orderMethodsService.toggleChangeOrderType = false;
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
        return this._makeManifest()
      }
      this.notifyEvent('Order must be of a purchase order type to create a manifest.', 'Alert')
      return of(null);
    })).pipe(switchMap(data => {
      if (!data) { return  of(null)}
      this.manifestService.openManifestForm(data?.id, false)
      return of(data)
    }))
    this.action$ = action$;
  }

  _makeManifest() {
    const site = this.siteService.getAssignedSite()
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

  checkIfPaymentsMade() {
    this.paymentsMade = false
    if (this.order && this.order.posPayments) {
      if (this.order.posPayments.length > 0) {
        this.paymentsMade = true
        return true
      }
    }
  }

  setBillOnHold() {
    const site = this.siteService.getAssignedSite()

    if (!this.order.orderFeatures) {
      this.order.orderFeatures = {} as JSONOrder
    }
    this.order.orderFeatures.billOnHold = 1

    const order$ = this.orderService.setOrderFeatures(site, this.order.id, this.order.orderFeatures);
    this.action$ = order$.pipe(switchMap(data => {
      if (data) {
        this.orderMethodsService.updateOrder(this.order)
      }
      return of(data)
    }));
  }

  removeZerValueItems() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.orderService.deleteZeroQuantityItems(site,this.order.id)
  }

  sendToPrep() {
    if (this.order) {
      this.printAction$ = this.paymentsMethodsService.sendToPrep(this.order, true, this.uiTransactionSetting)
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
      const order$ = this.orderService.getCurrentPOSOrder(this.siteService.getAssignedSite(),localStorage.getItem('devicename'))
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
      this.orderMethodsService.updateOrderSubscription(data)
    })
  }

  currentPOSOrderExists() {
    const posName = localStorage.getItem('devicename')
    if ( posName != '' && posName != undefined  && posName != null ) {
      return true
    }
  }

  clearOrder(event) {
    this.orderMethodsService.clearOrder()
  }

  voidOrder() {
     this.productEditButtonService.openVoidOrderDialog(this.order)
  }

  refundItem(event) {
    if (this.assignedItems) {
      this.productEditButtonService.openRefundItemDialog(this.assignedItems)
    }
  }

  refundOrder(event) {
    this.productEditButtonService.openRefundOrderDialog(this.order)
  }

  deleteOrder(event) {
    if (!this.userAuths?.deleteOrder) {
      this.siteService.notify("Delete order is not allowed", 'Close', 3000, 'red')
    }
    if (this.userAuths?.deleteOrder) {
      this.deleteOrder$ = this.orderMethodsService.deleteOrder(this.order.id, false).pipe(switchMap(data => {
        return of(data)
      }))
    }
  }

  ngOnDestroy() {
    if (this.id) { clearInterval(this.id); }
    if(this._order) { this._order.unsubscribe() }
    if (this._transactionUI) { this._transactionUI.unsubscribe()}
    this.orderMethodsService.updateBottomSheetOpen(false)
    if (this._user) { this._user.unsubscribe()}
    if (this._uiSettings) { this._uiSettings.unsubscribe()}
    if (this._uiTransactionSettings) { this._uiTransactionSettings.unsubscribe()}
    this.uiTransactionSetting$  = null;
    if (this.bottomSheet$) {
      this.bottomSheet$ = null;
    }
    if (this.lastSelectedItem$) { this.lastSelectedItem$.unsubscribe()}
  }

  suspendOrder() {
    if (this.order) {
      this.action$ = this.orderMethodsService.suspendOrder(this.order)
    };
  }

  removeDiscount(event) {
    const result = window.confirm('Are you sure you want to remove the discounts?');
    if (result) { return };
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      let item$ = this.posOrderItemService.removeOrderDiscount(site, this.order.id);
      item$.subscribe(data => {
        this.orderMethodsService.updateOrderSubscription(data);
      })
    };

  }

  removeSuspension() {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.suspendedOrder = false;
      this.orderService.putOrder(site, this.order).subscribe( data => {
        this.notifyEvent('This suspension is removed', 'Success')
      })
    };
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  assignCustomer(event) {
    if (event) {
      this.assignClientID(event.id)
    }
  }

  assignClientID(id: number) {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.clientID = id
      this.client$ =   this.orderService.putOrder(site, this.order).pipe(switchMap(data => {
        this.orderMethodsService.updateOrderSubscription(data)
        return of(data)
      }))
    }
    return of(this.order)
  }

  removeClient() {
    if (this.order) {
      this.assignClientID(0);
    }
  }

  houseAccountPayment() {
    this.action$ =  this.orderMethodsService.suspendOrder(this.order)
  }

  //loop the items
  //print labels
  //update the items that have the label printed
  ///update the inventory
  //update the subscription order Info
  printLabels(newLabels: boolean) {
    const joinLabels = true
    this.printLabels$ = this.printingService.printLabels(this.order , newLabels, joinLabels).pipe(
      concatMap(data => {
        console.log('data', data, joinLabels)
        if (joinLabels) {
          this.printingService.printJoinedLabels();
        }
        const site = this.siteService.getAssignedSite()
        return  this.orderService.getOrder(site, this.order.id.toString(), this.order.history)
      }
    )).pipe(concatMap(data => {
      this.orderMethodsService.updateOrder(data)
      return of(data)
    }))
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
      this.bottomSheetItemsOpen = true
      this.orderMethodsService.updateBottomSheetOpen(true)
      this._ItemsSheet = this.bottomSheet.open(PosOrderItemsComponent)
    }
  }

  dismiss() {
    this._ItemsSheet.dismiss();
    this.bottomSheetItemsOpen = false
  }

  dismissItemsView(event) {
    this.dismiss();
  }

  closeOrder() {
    if (this.order && this.order.id) {
      const site = this.siteService.getAssignedSite();
      const result$ = this.orderService.forceCompleteOrder(site, this.order.id)
      this.action$ = result$.pipe(switchMap(data =>  {
        this.paymentService.updatePaymentSubscription(null)
        this.orderMethodsService.updateOrderSubscription(null)
        this.toolbarUIService.updateOrderBar(false)
        return of(data)
      })).pipe(switchMap(data => {
      this.router.navigateByUrl('/pos-orders')
      return of(data)
      }))
   }
  }

  openReceiptView() {
    this.printingService.previewReceipt()
  }

  sendOrderToCustomer() {
    this.order.clients_POSOrders.id
  }

  textNotify() {
    this.orderMethodsService.sendSSMSOrderISReady(this.order)
  }

  emailNotifyOrder(event) {
    this.orderMethodsService.emailOrder(this.order).subscribe(data => {
      this.orderMethodsService.notifyEvent('Email Sent', 'Sent');
    })
  }

  emailOrder(event) {
    this.orderMethodsService.emailOrder(this.order).subscribe(data => {
      if (data && (data.isSuccessStatusCode || data.toString() == 'Success')) {
        this.orderMethodsService.notifyEvent('Email Sent', 'Success')
        return;
      }
      if (!data.isSuccessStatusCode) {
        this.orderMethodsService.notifyEvent('Email not sent. Check email settings', 'Failed')
        return;
      }
    })
  }

  hideNewItemEntryForm(event) {
    this.newItemEnabled = false
  }

  get newItemEntryView() {
    if (!this.order.completionDate || this.order.history ) {
      return this.newItemEntry
    }
    return null
  }

  initPopOver() {
    if (this.user?.userPreferences && this.user?.userPreferences?.enableCoachMarks ) {
      this.coachMarksService.clear()
      this.addCoachingList()
      this.coachMarksService.showCurrentPopover();
    }
  }

  roundOrderComplete() {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.orderService.roundOrder(site, this.order.id).pipe(switchMap(data => {
      this.orderMethodsService.updateOrder(data)
      return of(data)
    }))
  }

  addCoachingList() {
    this.coachMarksService.add(new CoachMarksClass(this.coachingstoreCredit.nativeElement, "Store Credit:  When a customer is assigned to the order, and there is store credit associated with them, you will automatically see that here."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingCustomerInfo.nativeElement, "Order Name or Customer Identifier: This section helps name or describe the order, or assign a customer or purchase order to the company you are buying from."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingpurchaseOrderView.nativeElement, "Purchase Orders: When in purchase orders you will see the purchase history of items you are buying."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingpayOptions.nativeElement, "Payment Options: Allows to do more than just choose credit or cash. Split check, pay with multiple tenders."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingchangeType.nativeElement, "Sale or Transaction Type:  Change the order name, and behavior of the order, to a different sale type, like Take Out vs. Dine In. Or converts the sale to a Purchase Order."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingTransferOrder.nativeElement, "When authorized a user can transfer one order to another balance sheet. A notification is sent to management."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingexitButton.nativeElement, " Exit: Leaves the order but does not delete it."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingSuspend.nativeElement, "Suspending Order:  Suspend the order so that it will not be deleted when the day is closed. This holds it for later payment."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingAdjustment.nativeElement, "Adjustment: Void, and Refunds"));
    this.coachMarksService.add(new CoachMarksClass(this.coachingListView.nativeElement, "Item View Toggle: Changes the layout of how you see the items on the order."));
  }


  updateValues(item: PosOrderItem) {
    const  colName = 'quantity'
    const order$ = this.posOrderItemMethodsService.saveSub(item, colName).pipe(
      switchMap(data => {
        return of(data)
      }
    ))
    return order$
  }

  initSalesDateForm() {
    this.salesDateForm = this.fb.group({
      start: [],
      end: []
    })

    this.salesDateForm.valueChanges.subscribe( res=> {
      if (this.salesDateForm.controls['start'].value){
        this.dateFrom = this.salesDateForm.controls['start'].value
      }
      if (this.salesDateForm.controls['end'].value){
        this.dateTo = this.salesDateForm.controls['end'].value
      }
      console.log(this.dateFrom, this.dateTo)
    })
  }

  initReconcileSearchForm() {
    this.searchForm   = this.fb.group( {
      itemName          : [''],
      itemTypeID        : [],
      brandID           : [],
      categoryID        : [],
      departmentID      : [],
      subCategoryID     : [],
      viewAll           : [1],
      bayName           : [],
      scanned           : [],
    });

    this.reconcileValueForm = this.fb.group({
      itemName: []
    })
  }

  resetReconciliationSearch(){
    this.initReconcileSearchForm();
    // this.refreshSearch(null)
    this.filteredList =  JSON.parse(JSON.stringify(this.order.posOrderItems))
    console.log('filteredllist', this.filteredList)
  }
  updateRemaingCount() {

  }

  setReconcileEntry(event) {
    //sets the quantity of the current item seected.
    //updates and refreshes the order.
    //we can use the editfield property.

    const item = this.orderMethodsService._lastSelectedItem.value //.subscribe(item => {
    let posItem = item as unknown as PosOrderItem;
    const site = this.siteService.getAssignedSite()
    if (posItem) {

      let item = {id: posItem.id, quantity: event} as PosOrderItem
      // console.log('item', item)
      this.action$ = this.posOrderItemService.changeItemQuantityReconcile(site, item).pipe(switchMap(data => {
        this.orderMethodsService.updateOrderSubscription(data)
        this.reconcileValueForm = this.fb.group({
          itemName: []
        })
        return of(data)
      }))
    }
  }

  filterRreconciliationView() {
    this.order.posOrderItems.filter(data => {
      return this.refreshSearch(data)
    })
  }

  refreshSearch(data) {

    const search = this.searchForm.value;
    const department = search.departmentID?.id

    const departmentID  = search.departmentID?.id;
    const itemTypeID    = search.itemTypeID?.id ;
    const categoryID    = search.categoryID?.id;
    const name          = search.itemName;
    const scanned       = search?.scanned;
    const bayName       = this.bayName as string;

    this.filteredList =  this.order.posOrderItems.filter(item => {
      const isDepartmentMatch = departmentID ? item.departmentID === departmentID : true;
      const isItemTypeMatch = itemTypeID ? item.itemTypeID === itemTypeID : true;
      const isCategoryMatch = categoryID ? item.categoryID === categoryID : true;
      const isNameMatch = name ? (item.productName.toLowerCase().includes(name.toLowerCase())) : true;
      const isBayName = bayName ? item.bayName === bayName : true;
      const isScannedMatch = scanned !== undefined ? (scanned ? item.traceOrderDate !== null : item.traceOrderDate === null) : true;
      return isDepartmentMatch && isItemTypeMatch && isCategoryMatch && isNameMatch &&  isScannedMatch && isBayName ;
    })
  }

  getBayNameList() {
    if (!this.order) { return }
    if (!this.order.posOrderItems) { return }

    const list = this.order.posOrderItems;
    if (!list) { return }
    const uniqueBayNames: string[] = [... this.order.posOrderItems.reduce((uniqueNames, obj) => {
        uniqueNames.add(obj.bayName);
        return uniqueNames;
    }, new Set<string>())];

    this.bayNames = uniqueBayNames;
  }

  applyReconciliation() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.orderService.applyReconciliation(site, this.order.id).pipe(switchMap(data => {
      this.siteService.notify('Reconciliation complete.', 'Close', 3000, 'green')
      return of(data)
    }))
  }

  deleteReconciliation() {
    const warn = window.confirm('Are you sure you want to delete your work?')
    if (!warn) { return }
  }


}
