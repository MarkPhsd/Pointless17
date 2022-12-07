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

  constructor(private siteService       : SitesService,
              private serviceTypeService: ServiceTypeService,
              public orderService      : OrdersService,
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
      this.orderService.toggleChangeOrderType = false;
      this._bottomSheet.dismiss();
    } catch (error) {
      console.log(error)
    }
  }

  newOrder(){
    const site = this.siteService.getAssignedSite();
    const order$ = this.orderService.newDefaultOrder(site)
    this.close()
  }

  close() {
    try {
      this.orderService.toggleChangeOrderType = false;
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
    this.orderService.setActiveOrder(site,order)
  }

  orderByType(event) {
    if (this.orderService.toggleChangeOrderType) {
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
    const item$ = this.orderService.changeOrderType(site, this.orderService.currentOrder.id, event.id, this.updateItems)
    this.process$ = item$.pipe(
      switchMap(data => {
        this.message = 'Processed';
        this.orderService.updateOrderSubscription(data)
        this.orderService.toggleChangeOrderType = false
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
    const order$ = this.orderService.newOrderWithPayload(site, serviceType)
    this.close()
  }

  notifyEvent(message: string, title: string) {
    this.snackBar.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }

}
