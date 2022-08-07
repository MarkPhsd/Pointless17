import { T } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit,OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription,Observable } from 'rxjs';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ItemWithAction, POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';

@Component({
  selector: 'app-adjust-item',
  templateUrl: './adjust-item.component.html',
  styleUrls: ['./adjust-item.component.scss']
})
export class AdjustItemComponent implements OnInit, OnDestroy {

  private _ItemWithAction : Subscription
  public  itemWithAction  : ItemWithAction;
  private id              : string;
  posItems                : PosOrderItem[];

  list$                   : Observable<IItemBasic[]>;
  setting                 : IItemBasic;
  settingID               : number;
  message                 = ''
  inventoryReturnDiscard  : boolean;
  value: any;
  order: IPOSOrder;

  initSubscriptions() {
    this._ItemWithAction = this.itemService.itemWithAction$.subscribe(data=> {
      this.itemWithAction = data
    })
  }

  constructor(
          private itemService: POSOrderItemServiceService,
          public  route: ActivatedRoute,
          private settingsService: SettingsService,
          private siteService: SitesService,
          private orderService: OrdersService,
          private orderMethodService: OrderMethodsService,
          private matSnackBar: MatSnackBar,
          private router: Router,
          private dialogRef: MatDialogRef<AdjustItemComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          )
  {
    if (data) {
      this.orderService.currentOrder$.subscribe(order => {

        if (order) {
          this.order = order;
        }

        if (data) {
          this.itemWithAction = data;
          this.posItems = data.items;
          this.itemService.updateItemWithAction(data);
        }
        this.inventoryReturnDiscard = true;

        this.getVoidReasons();
      })
    }

  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy() {
   if (this._ItemWithAction)  this._ItemWithAction.unsubscribe();
  }

  getVoidReasons() {
    console.log('action', this.itemWithAction.action)
    const site = this.siteService.getAssignedSite();
    if (!this.itemWithAction) { return }
    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'VoidOrder'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 1);
      return
    }

    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'VoidPayments'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 2);
      return
    }

    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'VoidItem'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 3);
      return
    }

    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'VoidMainFest'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 4);
      return
    }

    if (+this.itemWithAction.action  == 10) {
      console.log('orderr fund')
      this.posItems = this.itemWithAction?.order?.posOrderItems;
      this.list$  = this.settingsService.getVoidReasons(site, this.itemWithAction?.action);
      return
    }

    if (+this.itemWithAction.action  == 11) {
       console.log('item refund')
      this.posItems = this.itemWithAction?.items;
      this.list$  = this.settingsService.getVoidReasons(site, this.itemWithAction?.action);
      return
    }

    this.list$  = this.settingsService.getVoidReasons(site, this.itemWithAction.action );

  }

  closeDialog() {
    if (this.itemWithAction.typeOfAction.toLowerCase() == 'voidorder'.toLowerCase()  ||
        this.itemWithAction?.typeOfAction.toLowerCase()  === 'refundOrder'.toLowerCase()

      ) {
      this.updateOrderSubscription()
      return ;
    }
    this.dialogRef.close();
  }

  updateOrderSubscription() {
    if (this.itemWithAction.typeOfAction.toLowerCase() == 'voidorder'.toLowerCase()  ||
    this.itemWithAction?.typeOfAction.toLowerCase()  === 'refundOrder'.toLowerCase()
    ) {
      const site = this.siteService.getAssignedSite();
      this.orderService.getOrder(site, this.itemWithAction.id.toString() , false).subscribe(data => {
        this.orderService.updateOrderSubscription(data)
        this.dialogRef.close();
      })
    }
  }
  // void = 1,
  // priceAdjust = 2,
  // note = 3

  voidOrder(setting) {
    if (setting) {
      const site = this.siteService.getAssignedSite();

      this.itemWithAction.returnToInventory  = this.inventoryReturnDiscard
      this.itemWithAction.voidReason = setting.name
      this.itemWithAction.voidReasonID = setting.id
      let response$

      if (this.itemWithAction) {
        switch (this.itemWithAction.action) {
          case 1: //void
              response$ = this.orderService.voidOrder(site, this.itemWithAction)
              break;
          case 2: //priceAdjust

              break;
          case 2: //note

              break;
        }
        response$.subscribe(data => {
          if (data === 'success') {
            this.notifyEvent('Voided', 'Success')
            this.updateOrderSubscription()
            return
          }
            this.message = data;
            return
        })
      }
    }
  }

  async selectItem(setting) {

    if (this.itemWithAction.typeOfAction.toLowerCase() === 'VoidOrder'.toLowerCase()) {
      this.voidOrder(setting)
      return
    }

    if (setting && this.itemWithAction) {
      const site = this.siteService.getAssignedSite();

      this.itemWithAction.returnToInventory   = this.inventoryReturnDiscard
      this.itemWithAction.voidReason          = setting.name
      this.itemWithAction.voidReasonID        = setting.id
      let response$

      const value = this.itemWithAction.action as number;

      if (this.itemWithAction) {
        switch (value) {
          case 1: //void

              break;
          case 2: //priceAdjust

              break;
          case 3: //note
            response$ =  this.itemService.voidPOSOrderItem(site, this.itemWithAction)
            break;
          case 10:
            this.itemWithAction.order = this.order;
            response$ =  this.orderMethodService.refundOrder(this.itemWithAction )
            break;
          case 11:
            this.itemWithAction.order = this.order;
            this.itemWithAction.items = this.posItems;
            console.log(this.itemWithAction)
            response$ =  this.orderMethodService.refundItem(this.itemWithAction)
            break;
        }

        if (!response$) {
          this.notifyEvent('No items selected', 'Alert')
          return;
        }

        response$.subscribe(data => {

          if (value == 10) {
            this.orderService.updateOrderSubscription(data.order)

            if (!data.errorMessage) {
              this.notifyEvent(data.errorMessage, 'Result')
            }
            if (!data.errorMessage) {
              this.notifyEvent(data.message, 'Result')
            }

            const url = 'pos-payment'
            this.router.navigateByUrl(url)
            this.closeDialog();
            return
          }
          if (value == 11) {

            if (data.errorMessage) {
              this.notifyEvent(data.errorMessage, 'Result')
            }
            if (!data.errorMessage) {
              this.notifyEvent(data.message, 'Result')
            }

            this.orderService.updateOrderSubscription(data.order)

            this.closeDialog();
            return
          }

          if (data === 'Item voided') {
            this.updateSubscription()
            this.notifyEvent('Item voided', 'Result')
            this.closeDialog();
          }
        })
      }
    }

  }

  updateSubscription() {
    //update the order service.
    const site = this.siteService.getAssignedSite();
    const orderID = this.itemWithAction?.posItem?.orderID;
    this.orderService.getOrder(site, orderID.toString(), false).subscribe(data => {
        this.orderService.updateOrderSubscription(data)
      }
    )
  }

  notifyEvent(message: string, title: string) {
    this.matSnackBar.open(message, title,{
      duration: 2000,
      verticalPosition: 'top'
    })
  }
}


