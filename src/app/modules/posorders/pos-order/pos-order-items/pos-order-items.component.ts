// import { Route } from '@angular/router';
import { Observable, Subscription, } from 'rxjs';
import {  Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild,EventEmitter, OnDestroy, TemplateRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ISite } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'pos-order-items',
  templateUrl: './pos-order-items.component.html',
  styleUrls: ['./pos-order-items.component.scss'],
})
export class PosOrderItemsComponent implements OnInit, OnDestroy {

  action$: Observable<any>;
  @ViewChild('posOrderItemsPrepView') posOrderItemsPrepView: TemplateRef<any>;
  @ViewChild('posOrderItemsView') posOrderItemsView: TemplateRef<any>;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Input()  order          : IPOSOrder;
  @Input()  posOrderItems  : PosOrderItem[]
  @Input()  mainPanel      : boolean;
  @Output() outputRemoveItem  = new EventEmitter();
  @Input()  purchaseOrderEnabled: boolean;

  @Input() printLocation  : number;
  @Input() prepStatus     : boolean;
  @Input() prepScreen     : boolean;
  @Input() site:            ISite;
  @Input() disableActions = false;
  @Input() qrOrder        = false;
  @Input() enableExitLabel : boolean;
  @Input() userAuths       :   IUserAuth_Properties;
  @Input() displayHistoryInfo: boolean;
  @Input() enableItemReOrder  : boolean = false;

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

  scrollStyle = this.platformService.scrollStyleWide;

  get posItemsView() {
    if (this.prepScreen) {
      return this.posOrderItemsPrepView
    }
    return this.posOrderItemsView
  }

  initSubscriptions() {
    try {
      this._uiConfig = this.uiSettingsService.transactionUISettings$.subscribe(data => {
          if (data) {
            this.uiConfig = data;
          }
        }
      )
    } catch (error) {
    }

    try {
      this._bottomSheetOpen = this.orderMethodService.bottomSheetOpen$.subscribe(data => {
        if (data) {
         this.bottomSheetOpen = data
        }
      })
    } catch (error) {
    }

    if (this.disableActions) {
      // this.refreshOrderFromPOSDevice()
    }

    try {
      if (!this.prepScreen) {
        if (!this.disableActions) {
          this._order = this.orderMethodService.currentOrder$.subscribe( order => {
            this.order = order
            if (this.order && this.order.posOrderItems)  {
              this.sortPOSItems(this.order.posOrderItems)
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

    return items
  }

  ngOnDestroy(): void {
      if (this._bottomSheetOpen) { this._bottomSheetOpen.unsubscribe()}
      if (this._order) { this._order.unsubscribe()}
      if (this._uiConfig) { this._uiConfig.unsubscribe()}
  }

  constructor(  private platformService: PlatformService,
                private _snackBar:    MatSnackBar,
                public  el:            ElementRef,
                public  route:         ActivatedRoute,
                private siteService:  SitesService,
                private uiSettingsService: UISettingsService,
                private orderMethodService: OrderMethodsService,
                private uiSettingService   : UISettingsService,
                private settingService: SettingsService,
                private router: Router,
              )
  {
    this.orderItemsPanel = 'item-list';
  }

  ngOnInit() {
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

    console.log('payload remove', payload)
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
    console.log(item)
  }

  resetAnimationState() {
    this.animationState = '';
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
      verticalPosition: 'bottom'
    });
  }

  getItemHeight() {
    if (!this.myScrollContainer) {
      return
    }
    const divTop = this.myScrollContainer.nativeElement.getBoundingClientRect().top;
    const viewportBottom = window.innerHeight;
    const remainingHeight = viewportBottom - divTop;
    this.myScrollContainer.nativeElement.style.height  = `${remainingHeight-10}px`;
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

  trackByFN(_, {id, unitName, unitPrice, quantity,
                modifierNote, serialCode, printed,
                serviceType, taxTotal , wicebt}: IPOSOrderItem): number {
    return id;
  }

}


