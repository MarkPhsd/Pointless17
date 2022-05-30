// import { Route } from '@angular/router';
import { Observable, Subscription, } from 'rxjs';
import {  Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild,EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ISite } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { SettingsService } from 'src/app/_services/system/settings.service';
@Component({
  selector: 'pos-order-items',
  templateUrl: './pos-order-items.component.html',
  styleUrls: ['./pos-order-items.component.scss'],
})
export class PosOrderItemsComponent implements OnInit, OnDestroy {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Input()  order          : IPOSOrder;
  @Input()  mainPanel      : boolean;
  @Output() outputRemoveItem  = new EventEmitter();

  @Input() printLocation  : number;
  @Input() prepStatus     : boolean;
  @Input() prepScreen     : boolean;
  @Input() site:            ISite;
  @Input() disableActions = false;

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
      this._bottomSheetOpen = this.orderService.bottomSheetOpen$.subscribe(data => {
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
          this._order = this.orderService.currentOrder$.subscribe( order => {
            this.order = order
            setTimeout(() => {
              this.scrollToBottom();
            }, 200);
          })
        }
      }
    } catch (error) {
    }

    setTimeout(() => {
      this.scrollToBottom();
    }, 200);

  }

  ngOnDestroy(): void {
      if (this._bottomSheetOpen) { this._bottomSheetOpen.unsubscribe()}
      if (this._order) { this._order.unsubscribe()}
      if (this._uiConfig) { this._uiConfig.unsubscribe()}
  }

  constructor(
                private orderService: OrdersService,
                private _snackBar:    MatSnackBar,
                public el:            ElementRef,
                public route:         ActivatedRoute,
                private siteService:  SitesService,
                private uiSettingsService: UISettingsService,
                private orderMethodService: OrderMethodsService,
                private uiSettingService   : UISettingsService,
                private settingService: SettingsService,
              )
  {
      this.orderItemsPanel = 'item-list';
  }

  ngOnInit() {

    let uiHomePage =  this.uiSettingService.homePageSetting;

    if (!uiHomePage) {
      this.settingService.getUIHomePageSettings().subscribe(data => {
        uiHomePage = data;
      })
    }

    if (uiHomePage) {
      this.wideBar = uiHomePage.wideOrderBar
    }

    this._uiConfig = this.uiSettingsService.transactionUISettings$.subscribe(data => {
      this.uiConfig = data;
      if (!data) {
        this.getTransactionUI()
      }
    })

    if (this.prepScreen) {
      this.orderItemsPanel = 'item-list-prep';
    }
    if (!this.prepScreen) {
      this.orderItemsPanel = 'item-list';
    }
    this.initSubscriptions();
  }

  getTransactionUI() {
    this.uiSettingsService.getSetting('UITransactionSetting').subscribe(data => {
      if (data) {
        const config = JSON.parse(data.text)
        this.uiSettingService.updateUITransactionSubscription(config)
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

    if (!this.mainPanel) {
      this.orderItemsPanel = 'item-list-side-panel'
    }

    if (this.mainPanel) {
      this.gridScroller = ''
    }
  }

  async removeItemFromList(payload: any) {
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

  async swipeItemFromList(index) {
    if (this.disableActions) {return}
    const item =  this.order.posOrderItems[index]
    if (!item)  { return }
    this.orderMethodService.removeItemFromList(index, item)
  }

   updateSubscription(orderID: number) {
    const site = this.siteService.getAssignedSite();
    this.orderService.getOrder(site, orderID.toString(), false).subscribe(order => {
      this.orderService.updateOrderSubscription(order)
    })
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

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.myScrollContainer) {
          this.myScrollContainer.nativeElement.scrollTop =
            this.myScrollContainer.nativeElement.scrollHeight;
        }
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


