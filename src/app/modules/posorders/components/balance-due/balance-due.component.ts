import { Component, OnInit,Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { IPOSOrder, IPOSPayment, IServiceType, ServiceType } from 'src/app/_interfaces';
import { OrderPayload, OrdersService } from 'src/app/_services';
import { IBalanceDuePayload } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'app-balance-due',
  templateUrl: './balance-due.component.html',
  styleUrls: ['./balance-due.component.scss']
})
export class ChangeDueComponent   {

  inputForm             : FormGroup;
  @Input() paymentMethod: IPaymentMethod;
  @Input() order        : IPOSOrder;
  @Input() payment      : IPOSPayment;

  step                  = 1;
  changeDue             : any;
  serviceType           : IServiceType;

  constructor(private printingService: PrintingService,
              private printingServiceAndroid: PrintingAndroidService,
              private printingBTService : BtPrintingService,
              private paymentService: POSPaymentService,
              private siteService: SitesService,
              private orderService:  OrdersService,
              private toolbarServiceUI: ToolBarUIService,
              private snackBar : MatSnackBar,
              private fb       : FormBuilder,
              private router   : Router,

              private dialogRef: MatDialogRef<ChangeDueComponent>,
              @Inject(MAT_DIALOG_DATA) public data: IBalanceDuePayload
            )
  {
    if (data) {
      this.order = data.order
      this.payment = data.payment
      this.paymentMethod = data.paymentMethod;
      this.changeDue = (this.payment.amountReceived - this.payment.amountPaid).toFixed(2)
    }
    // this.initializeForm()
    this.initForm();
  }

  initForm() {
    this.inputForm   = this.fb.group( {
      itemName          : [''],
    })
  }

  clearSubscriptions() {
    // this.closeOrder();
    this.orderService.updateOrderSubscription(null) ;
    this.toolbarServiceUI.updateOrderBar(false);
  }

  printReceipt() {

  }

  close() {
    this.clearSubscriptions()
    this.router.navigateByUrl('/')
    this.dialogRef.close()
  }

  customTipAmount(amount) {
    if (this.payment) {
      const value = this.payment.amountPaid * (amount/100);
      console.log('value', value)
      this.tip( parseInt( value.toFixed(2) )  )
    }
   }

  specifiedTip(amount: number) {
    const payment = this.payment
    if (payment) {
      const value = payment.amountPaid * (amount / 100 );
      this.tip( parseInt( value.toFixed(2) )  )
    }
  }

  tip(amount: number) {
    const site = this.siteService.getAssignedSite();
    const payment = this.payment
    if (payment) {
      payment.tipAmount = amount;
      const payment$ =  this.paymentService.putPOSPayment(site, payment);
      //process tip via credit card service.
      payment$.subscribe(data => {
        this.paymentService.updatePaymentSubscription(data)
        this.orderService.getOrder(site, data.orderID.toString()).subscribe(order => {
          this.orderService.updateOrderSubscription(order)
          this.dialogRef.close()
        })
      }, err => {
        this.notify(err, "Failed to update Tip", 3000)
      })
    }
  }

  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.snackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }


}
