import { Component,Input, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { IPOSOrder, IPOSPayment,IServiceType } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ChangeDueComponent } from '../balance-due/balance-due.component';

@Component({
  selector: 'new-order-type',
  templateUrl: './new-order-type.component.html',
  styleUrls: ['./new-order-type.component.scss']
})
export class NewOrderTypeComponent  {

  @Input() paymentMethod: IPaymentMethod;
  @Input() order: IPOSOrder;
  @Input() payment: IPOSPayment;
  @Input() showCancel = true;

  serviceType  : IServiceType;
  serviceTypes$: Observable<IServiceType[]>;

  constructor(private siteService       : SitesService,
              private serviceTypeService: ServiceTypeService,
              private orderService      : OrdersService,
              private snackBar          : MatSnackBar,
              private _bottomSheet      : MatBottomSheet,
              @Optional() private dialogRef  : MatDialogRef<ChangeDueComponent>,
              )
  {
    const site = this.siteService.getAssignedSite();
    this.serviceTypes$ = this.serviceTypeService.getSaleTypesCached(site)
  }

  onCancel() {
    this._bottomSheet.dismiss();
  }

  newOrder(){
    const site = this.siteService.getAssignedSite();
    const order$ = this.orderService.newDefaultOrder(site)
    this.close()
  }

  close() {
    try {
      if (this.dialogRef) {
        this.dialogRef.close();
        return
      }  else {
        this._bottomSheet.dismiss();
      }
    } catch (error) {
      console.log(error)
    }
  }

  setActiveOrder(order) {
    const site  = this.siteService.getAssignedSite();
    this.orderService.setActiveOrder(site,order)
  }

  newOrderByType(event) {
    this.newOrderWithPayload(event);
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
