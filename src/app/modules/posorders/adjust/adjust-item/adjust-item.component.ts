import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit,OnDestroy, EventEmitter ,Output, HostListener} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription,Observable, switchMap, of } from 'rxjs';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IItemBasic, OrderActionResult, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ItemWithAction, POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatToggleSelectorComponent } from 'src/app/shared/widgets/mat-toggle-selector/mat-toggle-selector.component';
// import { EventEmitter } from 'stream';

@Component({
  selector: 'app-adjust-item',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    MatToggleSelectorComponent,
  SharedPipesModule],
  templateUrl: './adjust-item.component.html',
  styleUrls: ['./adjust-item.component.scss']
})
export class AdjustItemComponent implements OnInit, OnDestroy {

  @Output() outPutDismissBottomSheet = new EventEmitter()
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
  actionResponse$ : Observable<any>;
  void$: Observable<any>;

  initSubscriptions() {
    this._ItemWithAction = this.itemService.itemWithAction$.subscribe(data=> {
      this.itemWithAction = data
    })
  }

  constructor(
          private itemService: POSOrderItemService,
          public  route: ActivatedRoute,
          private settingsService: SettingsService,
          private siteService: SitesService,
          private orderService: OrdersService,
          private uiSettingService: UISettingsService,
          private orderMethodService: OrderMethodsService,
          private matSnackBar: MatSnackBar,
          private router: Router,
          private dialogRef: MatDialogRef<AdjustItemComponent>,
          private _bottomSheetService  : MatBottomSheet,
          @Inject(MAT_DIALOG_DATA) public data: any,
          )
  {
    if (data) {
      this.orderMethodService.currentOrder$.subscribe(order => {
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


  get IsSmallDevice() {
    if (window.innerWidth < 599) {
      return true
    }
    return false
  }

  get IsTinyDevice() {
    if (window.innerWidth < 400) {
      return true
    }
    return false
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy() {
   if (this._ItemWithAction)  this._ItemWithAction.unsubscribe();
  }

  getVoidReasons() {
    const site = this.siteService.getAssignedSite();
    if (!this.itemWithAction) { return }


    // itemWithAction.action   = 4// actions.SaleAuth;
    // itemWithAction.menuItem = item;
    // itemWithAction.orderId  = orderID;
    // itemWithAction.typeOfAction = 'SaleAuth'
    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'SaleAuth'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 3);
      return
    }

    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'VoidOrder'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 3);
      return
    }

    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'VoidPayments'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 2);
      return
    }

    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'VoidItem'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 1);
      return
    }

    if (this.itemWithAction?.typeOfAction.toLowerCase()  === 'VoidMainFest'.toLowerCase() ) {
      this.list$  = this.settingsService.getVoidReasons(site, 4);
      return
    }

    if (+this.itemWithAction.action  == 10) {
      // console.log('order fund')
      this.posItems = this.itemWithAction?.order?.posOrderItems;
      this.list$  = this.settingsService.getVoidReasons(site, this.itemWithAction?.action);
      return
    }

    if (+this.itemWithAction.action  == 11) {
      // console.log('item refund')
      this.posItems = this.itemWithAction?.items;
      this.list$  = this.settingsService.getVoidReasons(site, this.itemWithAction?.action);
      return
    }

    this.list$  = this.settingsService.getVoidReasons(site, this.itemWithAction.action );
  }


  saleAuth(order: number, item: IMenuItem, quantity) {
    // itemWithAction.action   = 4// actions.SaleAuth;
    // itemWithAction.menuItem = item;
    // itemWithAction.orderId  = orderID;
    // itemWithAction.typeOfAction = 'SaleAuth';
    return this.orderMethodService.addItemSimpleOverRide(this.order, item, quantity).pipe(switchMap(data => {
      if (!data) {
        this.siteService.notify(`No data!`, 'Close', 20000, 'red')
      }
      if (data.resultErrorDescription) {
        this.siteService.notify(`Error: ${data.resultErrorDescription}`, 'Close', 20000, 'red')
      }
      this.updateOrderSub(data.order)
      return of(data)
    }))
  }

  closeDialog() {
    if (this.itemWithAction?.typeOfAction.toLowerCase() == 'voidorder'.toLowerCase()  ||
        this.itemWithAction?.typeOfAction.toLowerCase()  === 'refundOrder'.toLowerCase()
      ) {
      this.updateOrderSubscription();
      return;
    }
    console.log(this.IsSmallDevice, this.IsTinyDevice, window.innerWidth )
    if (!this.IsSmallDevice) {
      setTimeout(data => {
        console.log('timoutclose')
        this.dialogRef.close();
      }, 500);
    }else {
      console.log('dismiss')
      this.dialogRef.close();
      // this.dismiss()
      // this.dismiss()
    }

  }
  dismiss() {
    this._bottomSheetService.dismiss();
  }

  updateOrderSubscription() {
    if (this.itemWithAction.typeOfAction.toLowerCase() == 'voidorder'.toLowerCase()  ||
    this.itemWithAction?.typeOfAction.toLowerCase()  === 'refundOrder'.toLowerCase()
    ) {
      const site = this.siteService.getAssignedSite();
      this.orderService.getOrder(site, this.itemWithAction.id.toString() , false).subscribe(data => {
        this.updateOrderSub(data)
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

      if (this.order) {
        if (!this.itemWithAction.order) { this.itemWithAction.order  = {} as IPOSOrder}
        this.itemWithAction.order.history = this.order.history;
        this.itemWithAction.order.id = this.order.id;
      }

      let response$

      if (this.itemWithAction) {
        switch (this.itemWithAction.action) {
          case 1: //void
            response$ = this.orderService.voidOrder(site, this.itemWithAction)
            break;
          case 2: //priceAdjust
            return of(null)
            break;
          case 2: //note
            return of(null)
            break;
          case 3:
            response$ = this.orderService.voidOrder(site, this.itemWithAction);
            break;
        }
        return response$.pipe(
          switchMap(data => {
            // console.log('void order data', data)
            if (data === 'success') {
              this.notifyEvent('Voided', 'Success')
              this.updateOrderSubscription()
              return of(data)
            }
            this.notifyEvent(data.toString(), 'Not voided')
            this.message = data.toString();
            this.closeDialog();
            return of(data)
          }
        ))
      }
    }
  }

  updateOrderSub(order: IPOSOrder) {
    this.orderMethodService.updateLastItemAdded(null)
    this.orderMethodService.updateOrderSubscription(order)
    // this.dismiss()
    setTimeout(data => {
      this.dialogRef.close();
    }, 500);

    // if (this.bottomSheetRef) {
    //   this.bottomSheetRef.dismiss();
    // }
  }


  selectItem(setting) {

    if (this.itemWithAction.action == 3 ||
        this.itemWithAction.typeOfAction.toLowerCase() === 'VoidOrder'.toLowerCase()) {
      this.actionResponse$ = this.voidOrder(setting)
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
            response$ =  this.itemService.voidPOSOrderItem(site, this.itemWithAction)
            this.actionResponse$ = response$.pipe(switchMap(
              data => {
                  console.log('data', data)
                  if (data) {
                    let result = data as string;
                    const passGo = result.toLowerCase() === 'item voided'
                    console.log('passgo, ', passGo)
                    if (passGo ) {
                      this.updateSubscription()
                      this.notifyEvent('Item voided', 'Result')
                      this.closeDialog();
                    }
                  }
                  return of(data)
                }
              )
            )
            break;
          case 2: //priceAdjust
              break;
          case 3: //note
            this.actionResponse$ = this.voidOrder(setting)//  this.orderMethodService.voidOrder(this.itemWithAction.id)
            break;
          case 10:
            this.itemWithAction.order = this.order;
            const item = {} as OrderActionResult
            this.actionResponse$ = this.orderMethodService.refundOrder(this.itemWithAction).pipe(
              switchMap( data => {
                  if (data?.errorMessage) {
                    this.notifyEvent(data.errorMessage, 'Result')
                  }
                  if (data.message) {
                    this.notifyEvent(data.message, 'Result')
                  }
                  const url = 'pos-payment'
                  this.router.navigateByUrl(url)
                  this.updateOrderSub(data.order)
                  return of(data)
                }
              )
            )
            return;

            break;
          case 11:
            this.itemWithAction.order = this.order;
            this.itemWithAction.items = this.posItems;
            this.actionResponse$      = this.orderMethodService.refundItem(this.itemWithAction).pipe(
              switchMap( data =>{
                if (data?.errorMessage) {
                  this.notifyEvent(data?.errorMessage, 'Result')
                }
                if (!data?.errorMessage) {
                  this.notifyEvent(data?.message, 'Result')
                }
                this.updateOrderSub(data?.order)
                return of(data)
              })
            )
            break;
        }

        if (!response$) {
          this.notifyEvent('No items selected', 'Alert')
          return;
        }

      }
    }

  }

  updateSubscription() {
    //update the order service.
    const site = this.siteService.getAssignedSite();
    const orderID = this.itemWithAction?.posItem?.orderID;
    this.orderService.getOrder(site, orderID.toString(), false).subscribe(data => {
        this.orderMethodService.updateLastItemAdded(null)
        this.orderMethodService.updateOrderSubscription(data)
      }
    )
  }

  notifyEvent(message: string, title: string) {
    this.matSnackBar.open(message, title,{
      duration: 6000,
      verticalPosition: 'top'
    })
  }
}


