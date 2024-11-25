import { Component,Input, OnInit, Optional } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { IPOSOrder, IPOSPayment,IServiceType } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ChangeDueComponent } from '../balance-due/balance-due.component';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { options } from 'numeral';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatToggleSelectorComponent } from 'src/app/shared/widgets/mat-toggle-selector/mat-toggle-selector.component';

@Component({
  selector: 'new-order-type',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    MatToggleSelectorComponent,
  ],

  templateUrl: './new-order-type.component.html',
  styleUrls: ['./new-order-type.component.scss']
})
export class NewOrderTypeComponent  {

  order$: Observable<any>;
  process$: Observable<any>;
  message: string;
  @Input() paymentMethod: IPaymentMethod;
  @Input() order: IPOSOrder;
  @Input() payment: IPOSPayment;
  @Input() showCancel = true;

  updateItems: boolean ;
  serviceType  : IServiceType;
  serviceTypes$: Observable<IServiceType[]>;
  action$: Observable<any>;

  constructor(private siteService               : SitesService,
              private serviceTypeService        : ServiceTypeService,
              public  orderMethodsService       :  OrderMethodsService,
              public  orderService: OrdersService,
              private snackBar                  : MatSnackBar,
              private _bottomSheet              : MatBottomSheet,
              private userAuthorizationService  : UserAuthorizationService,
              private paymentMethodsProcess     : PaymentsMethodsProcessService,
              private authService               : AuthenticationService,
              @Optional() private dialogRef     : MatDialogRef<ChangeDueComponent>,
              )
  {
    const site = this.siteService.getAssignedSite();
    if (authService._userAuths.value) {
      const auth = authService._userAuths.value;
      if (auth.allowReconciliation && auth.adjustInventoryCount) {
        this.serviceTypes$ = this.serviceTypeService.getAllServiceTypes(site)
        return
      }
    }
    if (this.userAuthorizationService?.isAdmin) {
      this.serviceTypes$ = this.serviceTypeService.getAllServiceTypes(site);
      return;
    }
    this.serviceTypes$ = this.serviceTypeService.getSaleTypesCached(site)
    this.updateItems = true;
    const itemList = this.orderMethodsService.assignPOSItems;
    if (itemList.length>0) {
      this.updateItems = false;
    }

    if (!this.order) {
      if (this.orderMethodsService.toggleChangeOrderType) {
        this.order$ = this.orderMethodsService.currentOrder$.pipe(switchMap(data => {
          if (data) {
            this.order = data;
          }
          return of(data  )
        }))
      }
    }
  }


  newOrder(){
    const site = this.siteService.getAssignedSite();
    this.action$ = this.orderMethodsService.newDefaultOrder(site).pipe(switchMap(data => {
      this.onCancel()
      return of(data)
    }))
  }

  onCancel() {
    try {
      this.orderMethodsService.toggleChangeOrderType = false;
      this._bottomSheet.dismiss();
    } catch (error) {
      console.log('cancel', error)
    }
  }

  close() {
    try {
      this.orderMethodsService.toggleChangeOrderType = false;
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    } catch (error) {
    }
    this.onCancel();
  }

  setActiveOrder(order) {
    const site  = this.siteService.getAssignedSite();
    this.orderMethodsService.setActiveOrder(order)
  }

  orderByType(event) {
    if (this.orderMethodsService.toggleChangeOrderType) {
      this.changeOrderType(event);
      return
    }
    this.newOrderWithPayload(event);
  }

  changeOrderType(event) {
    const site = this.siteService.getAssignedSite();

    let order: IPOSOrder

    if (this.order) {
      order = this.order
    } else  {
      order = this.orderMethodsService.currentOrder;
    }
    const itemList = this.orderMethodsService.assignPOSItems;

    let options = 0
    if (this.updateItems) {
      options = 1
    }

    const list = []
    if (itemList) {
      itemList.forEach(data => {
        list.push(data.id)
      })

    }
    if (list) {
      if (list.length>0) {
        options = 0
      }
    }
    const changeItemType = {id: order.id, history: order.history, updateItems : options, itemList: list, orderTypeID: event.id};

    const item$ = this.orderService.changeOrderTypeV3(site, changeItemType)
    this.process$ = item$.pipe(
      switchMap(data => {
        this.message = 'Processed';
        this.orderMethodsService.updateOrderSubscription(data)
        this.orderMethodsService.toggleChangeOrderType = false
        try {
          this.close()
        } catch (error) {

        }
        try {
          this.onCancel();
        } catch (error) {

        }
        return of(data)
      })
    )
    return
  }

  removeSelectedItem(index){
    this.orderMethodsService.assignPOSItems.splice(index)
  }

  newOrderWithPayload(serviceType: IServiceType){
    const site = this.siteService.getAssignedSite();
    let sendOrder$ = of('true')
    this.action$ = sendOrder$.pipe(switchMap(data => {
      return this.paymentMethodsProcess.newOrderWithPayloadMethod(site, serviceType)
    })).pipe(
      switchMap(data => {
        this.close()
        return of(data)
      })
    )

  }

  notifyEvent(message: string, title: string) {
    this.snackBar.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }

}
