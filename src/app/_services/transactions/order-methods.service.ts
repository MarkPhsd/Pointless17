import { Injectable } from '@angular/core';
import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';
import { DevService, AnimationCountService } from 'src/app/_services/';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as _  from "lodash";
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Subscription } from 'rxjs';
import { IPOSOrder, IPurchaseOrderItem } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { Capacitor, Plugins } from '@capacitor/core';
import { ElectronService } from 'ngx-electron';
import { PromptWalkThroughComponent } from 'src/app/modules/posorders/prompt-walk-through/prompt-walk-through.component';
import { Data } from 'electron/main';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { T } from '@angular/cdk/keycodes';
import { PromptGroupService } from '../menuPrompt/prompt-group.service';
import { ISetting, ISite, IUser }   from 'src/app/_interfaces';
import { PromptWalkThroughService } from '../menuPrompt/prompt-walk-through.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderMethodsService {

  order            : IPOSOrder;
  _order           : Subscription;
  subscriptionInitialized: boolean;

  intSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(data => {
      this.order = data;
    })
  }

  constructor(private menuService             : MenuService,
              private awsBucket               : AWSBucketService,
              private router                  : Router,
              public route                    : ActivatedRoute,
              private dialog                  : MatDialog,
              private siteService             : SitesService,
              private orderService            : OrdersService,
              private _snackBar               : MatSnackBar,
              private posOrderItemService     : POSOrderItemServiceService,
              private promptGroupService      : PromptGroupService,
              private promptWalkService: PromptWalkThroughService,
              private electronService: ElectronService,) {

    this.intSubscriptions();
  }

  async doesOrderExist(site: ISite): Promise<boolean> {
    if (!this.subscriptionInitialized) { this.intSubscriptions(); }
    if (!this.order) {
      const result = await this.orderService.newDefaultOrder(site)
      if (!result) {
        this.notifyEvent(`No order assigned.`, 'Alert')
      }
      return result;
    }
    return true
  }

  async addItemToOrder(order: IPOSOrder, item: IMenuItem, quantity: number) {

    const site = this.siteService.getAssignedSite()
    const result = await this.doesOrderExist(site);

    if (!result) { return }
    if (!order) { order = this.order }

    if (order) {
      const newItem = { orderID: order.id, quantity: quantity, menuItem: item }
      const itemResult =  this.posOrderItemService.postItem(site, newItem).subscribe(data => {
        if (data.order) {
          this.orderService.updateOrderSubscription(data.order)
          this.addedItemOptions(order, item, data.posItem)
        } else {
          this.notifyEvent(`Error occured, this item was not added. ${data.resultErrorDescription}`, 'Alert')
        }
      })

    }
  }

  async scanBarcodeAddItem(barcode: string, quantity: number, input: any) {

      const site = this.siteService.getAssignedSite()
      const result = await this.doesOrderExist(site);
      if (!result) { return }
      const order = this.order

      const addItem$ = this.posOrderItemService.scanItemForOrder(site, order, barcode, 1);
          //or we refresh the order with the new item added
       addItem$.subscribe(
          data=> {
          if (data.menuItemWithPrice) {
            //this means we prompt for prices.
          }
          if (data.order) {
            this.orderService.updateOrderSubscription(data.order)
          }
          if (data.menuItem) {
            if (data.menuItem.length > 0) {
              //here we can and present a list of items found
            }
          }
          if (!data.order && data.menuItem) {
            this.notifyEvent(`${data.resultErrorDescription}`, 'Error', )
          }
        }
      )

      input.nativeElement.value = ''
  }

  addedItemOptions(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    this.openPromptWalkThrough(order, item,posItem)
    this.openQuantityPrompt(order,item,    posItem)
    this.openGiftCardPrompt(order,item,    posItem)
    this.openPriceChangePrompt(order,item, posItem)
  }

  openPriceChangePrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()

  }

  openGiftCardPrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()

  }

  openQuantityPrompt(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {
    const site = this.siteService.getAssignedSite()
  }

  async openPromptWalkThrough(order: IPOSOrder, item: IMenuItem, posItem: IPurchaseOrderItem) {

    const site = this.siteService.getAssignedSite()
    if (!posItem || posItem.promptGroupID == 0 || !posItem.promptGroupID) { return }

    const prompt = await this.promptGroupService.getPrompt(site, item.promptGroupID).pipe().toPromise()

    this.openPromptWalkThroughWithItem(prompt, posItem)

  }

  openPromptWalkThroughWithItem(prompt: IPromptGroup, posItem: IPurchaseOrderItem) {
    if (prompt) {

      prompt.posOrderItem = posItem;
      this.promptGroupService.updatePromptGroup(prompt);
      // encapsulation: ViewEncapsulation.None

      const dialogRef = this.dialog.open(PromptWalkThroughComponent,
        {
          width:     '90vw',
          maxWidth:  '1000px',
          height:    '90vh',
          maxHeight: '90vh',
          panelClass: 'foo'
        }
      )
      dialogRef.afterClosed().subscribe(result => {
        this.promptGroupService.updatePromptGroup(null)
        this.promptWalkService.updatePromptGroup(null)
      });
    }
  }



  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
