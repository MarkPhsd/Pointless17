// import { Route } from '@angular/router';
import { Observable, Subscription, of, switchMap, } from 'rxjs';
import {  Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild,EventEmitter,
         OnDestroy, TemplateRef, Renderer2 } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ISite } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
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

  //grid;
  @Input() disableActions = false;

  @Input() printLocation  : number;
  @Input() prepStatus     : boolean;
  @Input() prepScreen     : boolean;
  @Input() site:            ISite;
  @Input() qrOrder        = false;
  @Input() enableExitLabel : boolean;
  @Input() userAuths       :   IUserAuth_Properties;
  @Input() displayHistoryInfo: boolean;
  @Input() enableItemReOrder  : boolean = false;
  @Input() phoneDevice: boolean;
  @Input() cardWidth: string;
  @Input() isStaff: boolean;

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
  order$        : Observable<IPOSOrder>
  gridScroller   : '';

  bottomSheetOpen  : boolean ;
  _bottomSheetOpen : Subscription;

  wideBar         : boolean;
  posName: string;

  nopadd = `nopadd`
  conditionalIndex: number;

  _posDevice: Subscription;

  androidApp = this.platformService.androidApp;
  _scrollStyle = this.platformService.scrollStyleWide;
  private styleTag: HTMLStyleElement;
  // private customStyleEl: HTMLStyleElement | null = null;
  @ViewChild('scrollDiv') scrollDiv: ElementRef;

  scrollStyle = this.platformService.scrollStyleWide;
  user$ = this.authService.user$.pipe(switchMap(data => {
    if (this.phoneDevice) {
      this._scrollStyle = 'scrollstyle_1'
      this.setScrollBarColor(data?.userPreferences?.headerColor)
    }
    this.setScrollBarColor(data?.userPreferences?.headerColor)
    return of(data)
  }))

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
          console.log('order update', this.order.posOrderItems)
          if (this.order && this.order.posOrderItems)  {
            this.sortPOSItems(this.order.posOrderItems);
          }
        })
      }

    }

    try {
      if (!this.prepScreen && !this.displayHistoryInfo) {
        if (!this.disableActions) {
          this._order = this.orderMethodService.currentOrder$.subscribe( order => {
            this.order = order
            console.log('order update', this.order?.posOrderItems)
            if (this.order && this.order.posOrderItems)  {
              this.sortPOSItems(this.order.posOrderItems);
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
    // console.log(this.posOrderItems)
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
                private orderMethodsService: OrderMethodsService,
                private ordersService:   OrdersService,
                private paymentService: POSPaymentService,
                private navigationService : NavigationService,
                private _bottomSheetService  : MatBottomSheet,
              )
  {
    this.orderItemsPanel = 'item-list';
    this.isStaff = this.authService.isStaff;
  }

  dismiss() {
    this._bottomSheetService.dismiss();
  }

  dismissItemsView(event) {
    this.dismiss();
  }

  ngOnInit() {

    if (window.innerWidth < 599) {   this.phoneDevice = true  }
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
    this.initStyles()
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
    if (!this.myScrollContainer) {
      return
    }
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
    this.navigationService.makePaymentFromSidePanel(true, this.phoneDevice,this.isStaff, this.order);
    this.dismiss();
  }

  viewCart() {
    this.orderMethodService.toggleOpenOrderBarSub(+this.order.id);
    this.dismiss();
  }
  trackByFN(_, {id, unitName, unitPrice, quantity,
                modifierNote, serialCode, printed,
                serviceType, taxTotal , wicebt}: IPOSOrderItem): number {
    return id;
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
          console.log(data)
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

  clearOrder() {
    this.orderMethodsService.clearOrder()
  }

}


