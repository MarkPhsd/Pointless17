// import { Route } from '@angular/router';
import { Observable, Subscription, of, switchMap, } from 'rxjs';
import {  Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild,EventEmitter,
         OnDestroy, TemplateRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ISite } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { AuthenticationService,  } from 'src/app/_services';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { RequestMessageMethodsService } from 'src/app/_services/system/request-message-methods.service';

@Component({
  selector: 'pos-order-items',
  templateUrl: './pos-order-items.component.html',
  styleUrls: ['./pos-order-items.component.scss'],
})
export class PosOrderItemsComponent implements OnInit, OnDestroy {

  action$: Observable<any>;
  @ViewChild('posOrderItemsPrepView') posOrderItemsPrepView: TemplateRef<any>;
  @ViewChild('posOrderItemsView') posOrderItemsView: TemplateRef<any>;
  @ViewChild('phoneDeviceView') phoneDeviceView: TemplateRef<any>;

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Input()  order          : IPOSOrder;
  @Input()  posOrderItems  : PosOrderItem[]
  @Input()  mainPanel      : boolean;
  @Output() outputRemoveItem  = new EventEmitter();
  @Input()  purchaseOrderEnabled: boolean;
  @Input()  disableActions = false;
  @Input()  printLocation  : number;
  @Input()  prepStatus     : boolean;
  @Input()  prepScreen     : boolean;
  @Input()  site:            ISite;
  @Input()  qrOrder        = false;
  @Input()  enableExitLabel : boolean;
  @Input()  userAuths       :   IUserAuth_Properties;
  @Input()  displayHistoryInfo: boolean;
  @Input()  enableItemReOrder  : boolean = false;
  @Input()  phoneDevice: boolean;
  @Input()  cardWidth: string;
  @Input()  isStaff: boolean;
  @Input() chartWidth: string;
  @Input() chartHeight: string;
  @Input() heightCalcStyle  : string;

  displayDevice: boolean;
  heightCacl = ''
  printAction$: Observable<any>;
  posDevice       :  ITerminalSettings;
  initStylesEnabled : boolean; // for initializing for griddisplay
  qrCodeStyle = ''
  mainStyle   =  ``
  @Input() deviceWidthPercentage = '100%'
  @Input() panelHeight = '100%';
  orderPrepStyle: string;
  _uiConfig      : Subscription;
  uiConfig       = {} as TransactionUISettings;
  @Input() orderItemsPanel: string;
  smallDevice    : boolean;
  animationState : string;
  _order         : Subscription;
  order$         : Observable<IPOSOrder>
  gridScroller   : '';

  bottomSheetOpen  : boolean ;
  _bottomSheetOpen : Subscription;
  wideBar          : boolean;
  posName          : string;
  chartCheck: boolean;
  nopadd      = `nopadd`
  conditionalIndex: number;
  _posDevice  : Subscription;
  currentRoute: string;
  androidApp = this.platformService.androidApp;
  _scrollStyle = this.platformService.scrollStyleWide;
  private styleTag: HTMLStyleElement;
  // private customStyleEl: HTMLStyleElement | null = null;
  @ViewChild('scrollDiv') scrollDiv: ElementRef;

  scanMode : number;

  scrollStyle = this.platformService.scrollStyleWide;
  user$ = this.authService.user$.pipe(switchMap(data => {
    if (this.phoneDevice) {
      this._scrollStyle = 'scrollstyle_1'
      this.setScrollBarColor(data?.userPreferences?.headerColor)
    }
    this.setScrollBarColor(data?.userPreferences?.headerColor)
    return of(data)
  }))


  get isNoPaymentPage() {
    if (this.currentRoute === 'pos-payment') {
      return false
    }
    return true

  }

  setScanMode(number) {
    this.scanMode = number
  }

  get currentItems() {

      if (this.scanMode == 1) {
        return this.posOrderItems.filter(data => {
          if (!data.prepByDate) {
            return data
          }
        })
      }

      if (this.scanMode == 2) {
        return this.posOrderItems.filter(data => {
          if (!data.deliveryByDate) {
            return data
          }
        })
      }

      return this.posOrderItems
  }

  routSubscriber() {

    this.currentRoute = this.router.url.split('?')[0].split('/').pop();
    this.router.events.subscribe(event => {
      if (event.constructor.name === "NavigationEnd") {
        this.currentRoute = this.router.url.split('?')[0].split('/').pop();
      }
    });
  }

  get posItemsView() {
    if (this.prepScreen) {
      return this.posOrderItemsPrepView
    }

    if (this.phoneDevice) {
      return this.phoneDeviceView
    }

    if (this.qrOrder) {
      return this.posOrderItemsView
    }

    return this.posOrderItemsView
  }

  initSubscriptions() {
    try {
      this._uiConfig = this.uiSettingsService.transactionUISettings$.subscribe(data => {
        if (data) {    this.uiConfig = data; }
      })
    } catch (error) {
    }

    try {
      this._posDevice = this.uiSettingsService.posDevice$.subscribe(data => {
        this.posDevice = data;
      })
    } catch (error) {

    }


    try {
      this._bottomSheetOpen = this.orderMethodService.bottomSheetOpen$.subscribe(data => {
        if (data) { this.bottomSheetOpen = data }
      })
    } catch (error) {
    }

    if (this.disableActions) {
      this.mainPanel  = true
      this.qrOrder = false
      this.phoneDevice = false
      if (!this.initStylesEnabled) {
        this.initStyles()
        this.initStylesEnabled = true
      }

      if (!this.displayHistoryInfo) {
        this._order = this.orderMethodService.currentOrder$.subscribe( order => {
          this.order = order

          if (this.order && this.order.posOrderItems)  {
            this.posOrderItems = this.order.posOrderItems
            this.sortPOSItems(this.currentItems);
          }
        })
      }

    }

    try {
      if (!this.prepScreen && !this.displayHistoryInfo) {
        if (!this.disableActions) {
          this._order = this.orderMethodService.currentOrder$.subscribe( order => {
            this.order = order
            // console.log('order update', this.order?.posOrderItems)
            if (this.order && this.order.posOrderItems)  {
              this.posOrderItems = this.order.posOrderItems
              this.sortPOSItems(this.currentItems);
            }
          })
        }
      }
    } catch (error) {
    }

    setTimeout(() => {
      this.scrollToBottom();
    }, 200);

  }

  sendOrder() {
    if (this.remotePrint('printPrep', this.posDevice?.exitOrderOnFire)) {
      return
    }
  }

  setScrollBarColor(color: string, width?:number) {
    if (!width) { width = 25}
    if (!color) {    color = '#6475ac' }
    const css = this.authService.getAppToolBarStyle(color, 25)
    this.styleTag = this.renderer.createElement('style');
    this.styleTag.type = 'text/css';
    this.styleTag.textContent = css;
    this.renderer.appendChild(document.head, this.styleTag);
  }

  sortPOSItems(orderItems: PosOrderItem[]) {

    this.posOrderItems = this.sortItems(orderItems)

    setTimeout(() => {
      this.scrollToBottom();
    }, 200);
  }

  sortItems(items:  PosOrderItem[]) {
    // let list = items.sort((a, b) => (a.idRef > b.idRef) ? 1 : 1);
    // list = items.sort((a, b) => (a.productSortOrder > b.productSortOrder) ? 1 : -1);
    // list.forEach(data => {
    //   // console.log(data.productName, data.productSortOrder)
    // })
    this.conditionalIndex = 1;
    if (!this.conditionalIndex) { this.conditionalIndex = 1}
    items.forEach((item, index) => {
      if (item.id == item.idRef) {
        item.conditionalIndex = this.conditionalIndex++;
      } else {
          item.conditionalIndex = null; // or keep the previous value, depending on your needs
      }
    });
    return items;
  }


  ngOnDestroy(): void {
      if (this._bottomSheetOpen) { this._bottomSheetOpen.unsubscribe()}
      if (this._order) { this._order.unsubscribe()}
      if (this._uiConfig) { this._uiConfig.unsubscribe()}
  }

  constructor(  public platformService: PlatformService,
                public  el:            ElementRef,
                public  route:         ActivatedRoute,
                private siteService:  SitesService,
                private uiSettingsService: UISettingsService,
                private orderMethodService: OrderMethodsService,
                private uiSettingService   : UISettingsService,
                private settingService: SettingsService,
                private authService : AuthenticationService,
                private renderer: Renderer2,
                private paymentService: POSPaymentService,
                private navigationService : NavigationService,
                private _bottomSheetService  : MatBottomSheet,
                private messagingService: RequestMessageMethodsService,
                private router: Router
              )
  {
    this.orderItemsPanel = 'item-list';
    this.isStaff = this.authService.isStaff;

    this.heightCacl ='height:calc(75vh - 300px);padding-bottom:2px;overflow-y:auto;overflow-x:hidden;';

    if (this.heightCalcStyle === 'none') {
      this.heightCacl = '' // this.heightCalcStyle
    }

    if (window.innerWidth < 599) {   this.phoneDevice = true  }
    if (this.checkIfMenuBoardExists()) {
      this.displayDevice = true
      this.nopadd = 'nopadd-display'
    }

    // if (this.pax)
  }

  checkIfMenuBoardExists(): boolean {
    const url = this.router.url;
    return url.includes('menu-board');
  }

  dismiss() {
    this._bottomSheetService.dismiss();
  }

  dismissItemsView(event) {
    this.dismiss();
  }

  ngOnInit() {

    this.routSubscriber();

    let uiHomePage = this.uiSettingService.homePageSetting;
    this.wideBar   = true;

    if (!uiHomePage) {
      this.settingService.getUIHomePageSettings().subscribe(data => {
        uiHomePage = data;
      })
    }

    if (uiHomePage) {  this.wideBar = uiHomePage.wideOrderBar  }

    this._uiConfig = this.uiSettingsService.transactionUISettings$.subscribe(data => {
      this.uiConfig = data;
      if (!data) {   this.getTransactionUI()   }
    })

    this.initSubscriptions();
    this.initStyles();
    // this.getItemHeight()
  }

  initStyles() {


    if (this.prepScreen)  {  this.orderItemsPanel = 'item-list-prep';  }
    if (!this.prepScreen) {  this.orderItemsPanel = 'item-list';  }



    if (this.prepScreen) {
      this.deviceWidthPercentage = '265px'
      this.panelHeight = ''
      this.orderPrepStyle = ''
      return;
    }

    this.qrCodeStyle = ''
    this.deviceWidthPercentage = '100%'

    if (!this.mainPanel) {
      this.deviceWidthPercentage = '345px'
    }

    if (!this.mainPanel && !this.qrOrder) {
      this.mainStyle = `main-panel ${this.orderItemsPanel}`
      return;
    }

    if (this.platformService.androidApp) {
      this.panelHeight = ''
      this.heightCacl = 'padding-bottom:2px;overflow-y:auto;overflow-x:hidden;' // this.heightCalcStyle
      return;
    }

    if (this.qrOrder) {
      this.panelHeight = 'calc(100vh - 550px)'
      this.qrCodeStyle = 'qr-style'
      this.mainStyle = `${this.qrCodeStyle} orderItemsPanel`
      return;
    }

    if (this.mainPanel) {
      this.mainStyle = `main-panel orderItemsPanel`
      this.panelHeight = 'calc(100vh - 100px)'
      if (window.innerWidth < 768) {
        this.panelHeight = 'calc(100vh - 200px)'
      }
    }

    if (this.phoneDevice) {
      this.mainStyle = `phone-panel ${this.orderItemsPanel}`
      this.panelHeight = ''
    }

    if (this.platformService.androidApp || this.phoneDevice) {
      this.panelHeight = ''
      this.heightCacl = 'padding-bottom:2px;overflow-y:auto;overflow-x:hidden;' // this.heightCalcStyle
    }

  }

  getTransactionUI() {
    this.uiSettingsService.getSetting('UITransactionSetting').subscribe(data => {
      if (data) {
        const config = JSON.parse(data.text)
        this.uiSettingService.updateUISubscription(config)
      }
    })
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {

    this.smallDevice = false

    if (this.prepScreen) { return }
    this.orderItemsPanel = 'item-list';

    if (window.innerWidth < 768) {
      this.smallDevice = true
    }

    if (window.innerWidth < 500) {
      this.deviceWidthPercentage = '95%'
    }

    // this.getItemHeight()
    //the heights of this panel are what control
    //the inside scroll section.
    //changing this to a dynamic ng-style will allow controlling
    //the absolute relative value of the height, ensuring the proper scroll height.
    if (!this.mainPanel) {
      this.orderItemsPanel = 'item-list-side-panel'
    }

    if (this.mainPanel) {
      this.gridScroller = ''
    }
  }

  removeItemFromList(payload: any) {
    // console.log('remove item from list', payload)
    if (this.order.completionDate && (this.userAuths && this.userAuths.disableVoidClosedItem)) {
      this.siteService.notify('Item can not be voided or refunded. You must void the order from Adjustment in Cart View', 'close', 10000, 'red')
      return
    }
    const index = payload.index;
    const orderItem = payload.item
    this.orderMethodService.removeItemFromList(index, orderItem)
  }

  setAsPrepped(index) {
    if (this.disableActions) {return}
    const item =  this.order.posOrderItems[index]
    if (!item)  { return }
    this.orderMethodService.changePrepStatus(index, item)
  }

  swipeAction(i) {
    if (this.prepScreen) {
      this.setAsPrepped(i)
      return
    }
    this.swipeItemFromList(i)
  }

  swipeItemFromList(index) {
    if (this.disableActions) {return}
    const item =  this.order.posOrderItems[index]
    if (!item)  { return }
    this.action$ = this.orderMethodService.removeItemFromListOBS(index, item);
  }

  startAnimation(state) {
    if (!this.animationState) {
      this.animationState = state
    }
  }

  logItem(item) {
    // console.log(item)
  }

  resetAnimationState() {
    this.animationState = '';
  }

  notifyEvent(message: string, action: string) {
    this.siteService.notify(message, action, 3000)
  }

  getItemHeight() {

    if (this.chartHeight || this.chartCheck) {
      // console.log('chartHeight', this.chartHeight)
      this.chartCheck = true
      if (!this.chartHeight) {
        this.myScrollContainer.nativeElement.style.height  = `${this.chartHeight}`;
      }
      return
    }

    if (window.innerWidth < 599) {   this.phoneDevice = true  }

    if (!this.myScrollContainer) {
      return
    }

    if (this.displayDevice) {
      this.myScrollContainer.nativeElement.style.height  = '';
      return
    }

    if (this.platformService.androidApp) {
      this.myScrollContainer.nativeElement.style.height  = '100%';
      return;
    }

    if (this.heightCalcStyle === 'none') {
      this.myScrollContainer.nativeElement.style.height = '100%'
      return
    }

    if (this.phoneDevice) {
      this.myScrollContainer.nativeElement.style.height = '100%'
      return;
    }
    if (this.smallDevice) {
      this.myScrollContainer.nativeElement.style.height = '100%'
      return
    }

    console.log('get item height', this.phoneDevice)
    const divTop = this.myScrollContainer.nativeElement.getBoundingClientRect().top;
    const viewportBottom = window.innerHeight;
    const remainingHeight = viewportBottom - divTop;


    if (!this.disableActions) {
      this.myScrollContainer.nativeElement.style.height  = `${remainingHeight-10}px`;
    }
    if (this.disableActions) {
      this.myScrollContainer.nativeElement.style.height  = `${remainingHeight - 50}px`;
    }

  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.myScrollContainer) {
          this.myScrollContainer.nativeElement.scrollTop =
            this.myScrollContainer.nativeElement.scrollHeight;
        }
        this.getItemHeight()
      } catch(err) {
        console.log(err)
      }
    }, 300);
  }

  viewPayment() {
    this.navigationService.makePaymentFromSidePanel(false, this.phoneDevice, this.isStaff, this.order);
    this.dismiss();
  }

  viewCart() {
    this.orderMethodService.toggleOpenOrderBarSub(+this.order.id);
    this.dismiss();
  }

  printOrder() {
    this.remotePrint('printReceipt', false)
  }

  remotePrint(message:string, exitOnSend: boolean) {
    const order = this.order;
    let pass = false
    if (message == 'printReceipt') {
      pass = true
    }
    if (this.posDevice) {
      if (message === 'printPrep') {
        if (this.posDevice?.remotePrepPrint) {
          pass = true
        }
      }
      if (message === 'rePrintPrep') {
        if (this.posDevice?.remotePrepPrint) {
          pass = true
        }
      }
      if (this.posDevice?.remotePrint || pass) {
        const serverName = this.uiConfig.printServerDevice;
        let remotePrint = {message: message, deviceName: this.posDevice.deviceName,
                           printServer: serverName,id: order.id,history: order.history} as any;
        const site = this.siteService.getAssignedSite()
        this.printAction$ =  this.paymentService.remotePrintMessage(site, remotePrint).pipe(switchMap(data => {

          if (data) {
            this.siteService.notify('Print job sent', 'Close', 3000, 'green')
          } else {
            this.siteService.notify('Print Job not sent', 'Close', 3000, 'green')
          }

          if (this.posDevice?.exitOrderOnFire) {
            //then exit the order.
            this.clearOrder()
          }
          return of(data)
        }))
        return true;
      }
    }

    return false
  }

  reSendOrder() {
    if (this.remotePrint('rePrintPrep', this.posDevice?.exitOrderOnFire)) {
      return
    }
  }

  completePrepTypeNotifier(){
    if (this.scanMode == 1 || this.scanMode==2) {
      const order = this.order
      if (order) {

        let message = ''
        if (this.scanMode == 1) {
          message = 'Prep work on order completed.'
        }
        if (this.scanMode == 2) {
          message = 'Driver has confirmed order for delivery.'
        }

        if (!message) { return }


        const item$ =  this.uiSettingService.homePageSetting$.pipe(switchMap(data => {
          const email  = data?.salesReportsEmail ?? data?.administratorEmail
          return   this.messagingService.prepCompleted(order,  message, email )
        })).pipe(switchMap(data => {
          this.siteService.notify("Request Sent", 'close', 2000, 'green')
          return of(data)
        }))

        this.action$ = item$
      }
    }
  }

  trackByFN(_, {id, unitName, unitPrice, quantity,
        modifierNote, serialCode, printed,
        serviceType, taxTotal , wicebt}: IPOSOrderItem): number {
    return id;
  }

  clearOrder() {
    this.orderMethodService.clearOrder()
  }

}


