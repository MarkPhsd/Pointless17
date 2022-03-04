import { Component, Inject, OnInit,OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subscription,Observable } from 'rxjs';
import { PosOrderItem } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
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

  list$                   : Observable<IItemBasic[]>;
  setting                 : IItemBasic;
  settingID               : number;

  inventoryReturnDiscard  : boolean;

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
          private matSnackBar: MatSnackBar,
          private dialogRef: MatDialogRef<AdjustItemComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          )
  {
    if (data) {

      this.inventoryReturnDiscard = true;
      this.itemWithAction = data
      this.itemService.updateItemWithAction(data);


    }
  }

  getVoidReasons() {
    const site = this.siteService.getAssignedSite();
    if (this.itemWithAction.typeOfAction === 'VoidOrder') {
      this.list$  = this.settingsService.getVoidReasons(site, 1);
      return
    }
    if (this.itemWithAction.typeOfAction === 'VoidPayments') {
      this.list$  = this.settingsService.getVoidReasons(site, 2);
      return
    }

    this.list$  = this.settingsService.getVoidReasons(site, 1);
  }

  closeDialog() {
    this.dialogRef.close();
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
          if (data === 'Item voided') {
            this.updateSubscription()
            this.notifyEvent('Item voided', 'Result')
            this.closeDialog();
          }
        })
      }
    }
  }

  async selectItem(setting) {

    if (this.itemWithAction.typeOfAction === 'VoidOrder') {
      this.voidOrder(setting)
      return
    }

    if (setting) {
      const site = this.siteService.getAssignedSite();

      this.itemWithAction.returnToInventory  = this.inventoryReturnDiscard
      this.itemWithAction.voidReason = setting.name
      this.itemWithAction.voidReasonID = setting.id
      let response$

      if (this.itemWithAction) {
        switch (this.itemWithAction.action) {
          case 1: //void
              response$ = await this.itemService.voidPOSOrderItem(site, this.itemWithAction)
              break;
          case 2: //priceAdjust

              break;
          case 2: //note

              break;
        }
        response$.subscribe(data => {
          if (data === 'Item voided') {
            this.updateSubscription()
            this.notifyEvent('Item voided', 'Result')
            this.closeDialog();
          }
        })
      }
    }

  }

  async updateSubscription() {
    //update the order service.
    const site = this.siteService.getAssignedSite();
    const orderID = this.itemWithAction.posItem.orderID;
    this.orderService.getOrder(site, orderID.toString(), false).subscribe(data => {
        this.orderService.updateOrderSubscription(data)
      }
    )
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this._ItemWithAction.unsubscribe();
  }

  notifyEvent(message: string, title: string) {
    this.matSnackBar.open(message, title,{
      duration: 2000,
      verticalPosition: 'top'
    })
  }
}
