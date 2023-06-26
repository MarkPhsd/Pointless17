import { Component,Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { IPOSOrder, IPOSPayment,IServiceType } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ChangeDueComponent } from '../balance-due/balance-due.component';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

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
  updateItems = false;
  serviceType  : IServiceType;
  serviceTypes$: Observable<IServiceType[]>;
  action$: Observable<any>;

  constructor(private siteService       : SitesService,
              private serviceTypeService: ServiceTypeService,
              public  orderMethodsService      :  OrderMethodsService,
              public  orderService: OrdersService,
              private snackBar          : MatSnackBar,
              private _bottomSheet      : MatBottomSheet,
              private userAuthorizationService: UserAuthorizationService,
              @Optional() private dialogRef  : MatDialogRef<ChangeDueComponent>,
              )
  {
    const site = this.siteService.getAssignedSite();

    if (this.userAuthorizationService.isManagement) {
      this.serviceTypes$ = this.serviceTypeService.getAllServiceTypes(site)
    }
    if (!this.userAuthorizationService.isManagement) {
      this.serviceTypes$ = this.serviceTypeService.getSaleTypesCached(site)
    }

  }

  onCancel() {
    try {
      this.orderMethodsService.toggleChangeOrderType = false;
      this._bottomSheet.dismiss();
    } catch (error) {
      console.log(error)
    }
  }

  newOrder(){
    const site = this.siteService.getAssignedSite();
    const order$ = this.orderMethodsService.newDefaultOrder(site)
    this.close()
  }

  close() {
    try {
      this.orderMethodsService.toggleChangeOrderType = false;
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    } catch (error) {

      console.log(error)
    }

    this.onCancel();
  }

  setActiveOrder(order) {
    const site  = this.siteService.getAssignedSite();
    this.orderMethodsService.setActiveOrder(site,order)
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
    const item$ = this.orderService.changeOrderType(site, this.orderMethodsService.currentOrder.id, event.id, this.updateItems)
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
    this.action$ = this.orderMethodsService.newOrderWithPayload(site, serviceType).pipe(
      switchMap(data => {
        this.close()
        return of(data)
      }
    ))
  }

  notifyEvent(message: string, title: string) {
    this.snackBar.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }

}
