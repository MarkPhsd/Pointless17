import { Component,Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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

@Component({
  selector: 'new-order-type',
  templateUrl: './new-order-type.component.html',
  styleUrls: ['./new-order-type.component.scss']
})
export class NewOrderTypeComponent  {

  process$: Observable<any>;
  message: string;
  @Input() paymentMethod: IPaymentMethod;
  @Input() order: IPOSOrder;
  @Input() payment: IPOSPayment;
  @Input() showCancel = true;

  updateItems: boolean = true;
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
  }


  newOrder(){
    const site = this.siteService.getAssignedSite();
    const order$ = this.orderMethodsService.newDefaultOrder(site).pipe(switchMap(data => {
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

    if (event && event.filterType && event.filterType != 0 ) {
      this.updateItems = true;
    }

    const order = this.orderMethodsService.currentOrder;

    const item$ = this.orderService.changeOrderType(site, order.id, 
                                                    event.id, this.updateItems, order.history)
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
