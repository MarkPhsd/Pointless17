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
  message = ''
  inventoryReturnDiscard  : boolean;
  value: any;

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
    // this.value = data;
    if (data) {
      this.inventoryReturnDiscard = true;
      this.itemWithAction = data;
      this.itemService.updateItemWithAction(data);
      this.getVoidReasons();
    }

  }

  // itemWithAction { "action": 1, "id": 567103, "typeOfAction": "VoidOrder" }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy() {
   if (this._ItemWithAction)  this._ItemWithAction.unsubscribe();
  }

  getVoidReasons() {
    const site = this.siteService.getAssignedSite();

    if (this.itemWithAction?.typeOfAction === 'VoidOrder') {
      this.list$  = this.settingsService.getVoidReasons(site, 1);
      return
    }

    if (this.itemWithAction?.typeOfAction === 'VoidPayments') {
      this.list$  = this.settingsService.getVoidReasons(site, 2);
      return
    }

    if (this.itemWithAction?.typeOfAction === 'VoidItem') {
      this.list$  = this.settingsService.getVoidReasons(site, 3);
      return
    }

    if (this.itemWithAction?.typeOfAction === 'VoidMainFest') {
      this.list$  = this.settingsService.getVoidReasons(site, 4);
      return
    }

    this.list$  = this.settingsService.getVoidReasons(site, 1);
  }

  closeDialog() {
    if (this.itemWithAction.typeOfAction.toLowerCase() == 'voidorder') {
      this.updateOrderSubscription()
      return ;
    }
    this.dialogRef.close();
  }

  updateOrderSubscription() {
    if (this.itemWithAction.typeOfAction.toLowerCase() == 'voidorder') {
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
            this.notifyEvent('Order voided', 'Success')
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

    if (this.itemWithAction.typeOfAction === 'VoidOrder') {
      this.voidOrder(setting)
      return
    }

    if (setting) {
      const site = this.siteService.getAssignedSite();

      this.itemWithAction.returnToInventory   = this.inventoryReturnDiscard
      this.itemWithAction.voidReason          = setting.name
      this.itemWithAction.voidReasonID        = setting.id
      let response$

      if (this.itemWithAction) {
        switch (this.itemWithAction.action) {
          case 1: //void

              break;
          case 2: //priceAdjust

              break;
          case 3: //note
            response$ = await this.itemService.voidPOSOrderItem(site, this.itemWithAction)
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

function switcMap(arg0: (data: any) => void) {
  throw new Error('Function not implemented.');
}

