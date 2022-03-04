// import { Route } from '@angular/router';
import { Subscription } from 'rxjs';
import {  Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild,EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-order-items',
  templateUrl: './pos-order-items.component.html',
  styleUrls: ['./pos-order-items.component.scss'],
})
export class PosOrderItemsComponent implements OnInit {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Input() order          : IPOSOrder;
  @Input() mainPanel      : boolean;
  @Output() outputRemoveItem  = new EventEmitter();

  _uiConfig      : Subscription;
  uiConfig       = {} as TransactionUISettings;

  orderItemsPanel: string;
  smallDevice    : boolean;
  animationState : string;
  _order         : Subscription;
  gridScroller   : '';

  bottomSheetOpen  : boolean ;
  _bottomSheetOpen : Subscription;

  wideBar         : boolean;

  initSubscriptions() {

    this._bottomSheetOpen = this.orderService.bottomSheetOpen$.subscribe(data => {
      this.bottomSheetOpen = data
    })

    this._order = this.orderService.currentOrder$.subscribe( order => {
      this.order = order
      // console.log('pos order items ', this.order )
      setTimeout(() => {
        this.scrollToBottom();
      }, 200);
    })

    this._uiConfig = this.uiSettingsService.transactionUISettings$.subscribe(data => {
      this.uiConfig = data;
    })

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
              )
 {
    this.orderItemsPanel = 'item-list';
 }

  async ngOnInit() {

    let uiHomePage =  this.uiSettingService.homePageSetting

    if (!uiHomePage) {
      uiHomePage = await this.uiSettingService.subscribeToCachedHomePageSetting('UIHomePageSettings');
    }

    if (uiHomePage) {
      this.wideBar = uiHomePage.wideOrderBar
    }
    await this.uiSettingsService.subscribeToCachedConfig()
    this.initSubscriptions();
    this.orderItemsPanel = 'item-list';
  }


  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false

    // this.gridRight       = 'grid-order-header ';
    // this.orderlayout     = 'order-layout-empty';
    this.orderItemsPanel = 'item-list';

    if (window.innerWidth < 768) {
      this.smallDevice = true
      // this.orderItemsPanel = 'item-list-small';
    }

    if (!this.mainPanel) {
      this.orderItemsPanel = 'item-list-side-panel'
    }

    if (this.mainPanel) {
      this.gridScroller = ""
    }
  }

  async removeItemFromList(payload: any) {
    const index = payload.index;
    const orderItem = payload.item
    // this.orderMethodService.addItemToOrder
    this.orderMethodService.removeItemFromList(index, orderItem)

  }

  async updateSubscription(orderID: number) {
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
      console.log('scrolling')
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


}


