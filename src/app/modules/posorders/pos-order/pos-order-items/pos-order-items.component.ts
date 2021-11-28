// import { Route } from '@angular/router';
import { Subscription } from 'rxjs';
import {  Component, ElementRef, HostBinding, HostListener, Input, OnInit, Output, ViewChild,EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

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

  initSubscriptions() {

    this._bottomSheetOpen = this.orderService.bottomSheetOpen$.subscribe(data => {
      this.bottomSheetOpen = data
    })
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
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
                private productEditButtonService: ProductEditButtonService,
                private posOrderItemService: POSOrderItemServiceService,
                private uiSettingsService: UISettingsService,
              )
 {
    this.orderItemsPanel = 'item-list';
 }

  async ngOnInit() {
    await this.uiSettingsService.subscribeToCachedConfig()
    this.initSubscriptions();
    this.orderItemsPanel = 'item-list';
    // this.getUIConfig()
  }

  // getUIConfig() {
  //   const uiConfig  = {} as TransactionUISettings
  //   const UI$ = this.uiSettingsService.getTransactionUISettings(true).subscribe(data => {
  //     this.uiConfig = JSON.parse(data.text) as TransactionUISettings
  //   })
  // }

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
    console.log(payload)
    const index = payload.index;
    const orderItem = payload.item
    if (orderItem) {
      const site = this.siteService.getAssignedSite()
      if (orderItem.printed || this.order.completionDate ) {
        //only manager can void. but should be voided.
        this.productEditButtonService.openVoidItemDialog(orderItem)
        return
      }

      if (orderItem.id) {
        const orderID = orderItem.orderID
        let item = await this.posOrderItemService.deletePOSOrderItem(site, orderItem.id).pipe().toPromise();
        if (item) {
            this.notifyEvent('Item Deleted', "")
            this.updateSubscription(orderID)
            this.order.posOrderItems.splice(index, 1)
        }
        this.updateSubscription(orderID);
      }
    }
  }

  async updateSubscription(orderID: number) {
    const site = this.siteService.getAssignedSite();
    const order = await this.orderService.getOrder(site, orderID.toString(), false).pipe().toPromise();
    this.orderService.updateOrderSubscription(order)
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


