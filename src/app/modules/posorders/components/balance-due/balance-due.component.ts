import { Component, OnInit,Input, Inject, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, of, Subscribable, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CardPointMethodsService } from 'src/app/modules/payment-processing/services';
import { IPOSOrder, IPOSPayment, IServiceType, ServiceType } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { IBalanceDuePayload } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrepPrintingServiceService } from 'src/app/_services/system/prep-printing-service.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { TransactionUISettings,  UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'app-balance-due',
  templateUrl: './balance-due.component.html',
  styleUrls: ['./balance-due.component.scss']
})
export class ChangeDueComponent implements OnInit  {
  uiTransactions: TransactionUISettings
  uiTransactions$ : Observable<TransactionUISettings>;

  printing$ : Observable<any>;
  action$   : Observable<any>;
  inputForm             : UntypedFormGroup;
  @Input() paymentMethod: IPaymentMethod;
  @Input() order        : IPOSOrder;
  @Input() payment      : IPOSPayment;
  finalizer: boolean;
  _finalizer: Subscription;

  step                  = 1;
  changeDue             : any;
  serviceType           : IServiceType;

  constructor(
              private paymentService: POSPaymentService,
              private siteService: SitesService,
              public orderMethodsService: OrderMethodsService,
              private orderService:  OrdersService,
              private toolbarServiceUI: ToolBarUIService,
              private snackBar : MatSnackBar,
              private fb       : UntypedFormBuilder,
              private router   : Router,
               private uISettingsService: UISettingsService,
              private printingService: PrintingService,
              private paymentMethodProcessService: PaymentsMethodsProcessService,
              private methodsService: CardPointMethodsService,
              private orderMethodService: OrderMethodsService,
              private prepPrintingService: PrepPrintingServiceService ,
              private changeDetect : ChangeDetectorRef,
              private dialogRef: MatDialogRef<ChangeDueComponent>,
              @Inject(MAT_DIALOG_DATA) public data: IBalanceDuePayload
            )
  {
    if (data) {
      this.order = data.order
      this.payment = data.payment
      this.paymentMethod = data.paymentMethod;
      this.changeDue = (this.payment.amountReceived - this.payment.amountPaid).toFixed(2)
      this.step = 1;
      if (!this.paymentMethod?.isCreditCard && !this.payment.account) {
        this.step = 2
      }
      this.printing$ = this.processSendOrder(data.order)
    }
    this.initForm();
    this.orderMethodsService.setScanner( )
  }

  printingCheck() {
    this._finalizer = this.printingService.printingFinalizer$.subscribe(data => {
      // console.log('finalizer for balance due', data)
      this.changeDetect.detectChanges()
      this.finalizer = data;
      this.changeDetect.detectChanges()
    })
  }

  newDefaultOrder(){
    const site = this.siteService.getAssignedSite();
    this.action$ = this.orderMethodsService.newOrderWithPayloadMethod(site, null).pipe(
     switchMap(data => {
      this.dialogRef.close()
       return of(data)
     })
   )
   }

  processSendOrder(order: IPOSOrder) {
    return this.paymentMethodProcessService.sendToPrep(order, true)
  }

  changeStep() {
    if (this.step == 2) {
      this.step = 1
      return
    }
    if (this.step == 1) {
      this.step = 2
      return
    }
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.printingCheck();
    this.initTransactionUISettings();
  }

  initTransactionUISettings() {
      this.uiTransactions$ = this.uISettingsService.getSetting('UITransactionSetting').pipe(
      switchMap(data => {
        if (data) {
          this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
          return of(this.uiTransactions)
        }
        if (!data) {
          this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
          return of(this.uiTransactions)
        }
    }))
  }

  initForm() {
    this.inputForm   = this.fb.group( {
      itemName          : [''],
    })
  }

  clearSubscriptions() {
    this.orderMethodsService.updateOrderSubscription(null) ;
    this.toolbarServiceUI.updateOrderBar(false);
  }

  printReceipt() {
    if (this.payment && (this.payment.groupID && this.payment.groupID != 0)) {
      const site = this.siteService.getAssignedSite();
       this.printing$ = this.orderService.getPOSOrderGroupTotal(site, this.payment.orderID, this.payment.groupID).pipe(switchMap(data => {
        this.printingService.printOrder = data;
        this.printingService.previewReceipt(null, data);
        return of(data)
      }))
      return;
    }
    this.printingService.previewReceipt()
  }

  close() {
    // this.clearSubscriptions()
    // this.router.navigateByUrl('/')
    this.orderMethodService.clearOrder();
    this.dialogRef.close()

  }

  customTipAmount(amount) {
    if (this.payment) {
      const value = +amount;
      console.log('value', value)
      this.tip( ( amount )  )
    }
  }

  specifiedTip(amount: number) {
    const payment = this.payment
    if (payment) {
      const value = payment.amountPaid * (amount / 100 );
      this.tip(  +value.toFixed(2)  )
    }
  }

  tip(amount: number) {
    const site = this.siteService.getAssignedSite();
    const payment = this.payment
    if (payment) {
      payment.tipAmount = amount;

      const payment$ =  this.paymentService.putPOSPayment(site, payment);
      //process tip via credit card service.
      payment$.pipe(
        switchMap( data =>  {
            this.paymentService.updatePaymentSubscription(data)
            const orderID = data.orderID.toString();
            return this.orderService.getOrder(site, orderID, false);
        })).subscribe(data => {
          this.orderMethodsService.updateOrderSubscription(data)
          this.dialogRef.close()
          if (this.uiTransactions && this.uiTransactions.cardPointBoltEnabled) {
            this.capture(this.payment)
          }
        }
      )
    }
  }

  capture(item: IPOSPayment) {

    if (this.order) {
      this.methodsService.processCapture(item, this.order.balanceRemaining,
                                                   this.uiTransactions)
    }

  }

  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.snackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

}
