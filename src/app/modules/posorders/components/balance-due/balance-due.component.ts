import { Component, OnInit,Input, Inject, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of,Subscription } from 'rxjs';
import {  switchMap } from 'rxjs/operators';
import { CardPointMethodsService } from 'src/app/modules/payment-processing/services';
import { IPOSOrder, IPOSPayment, IServiceType, ServiceType } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { IBalanceDuePayload } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { TransactionUISettings,  UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { DcapService } from 'src/app/modules/payment-processing/services/dcap.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { RStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-balance-due',
  templateUrl: './balance-due.component.html',
  styleUrls: ['./balance-due.component.scss']
})
export class ChangeDueComponent implements OnInit  {

  uiTransactions: TransactionUISettings
  uiTransactions$ : Observable<TransactionUISettings>;
  dCapReset$ : Observable<any>;
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

  isUser: boolean;
  isStaff: boolean;
  isAuthorized: boolean;

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {

    }
  }

  constructor(
              private userAuthorization: UserAuthorizationService,
              private paymentService: POSPaymentService,
              private siteService: SitesService,
              public orderMethodsService: OrderMethodsService,
              private orderService:  OrdersService,
              private toolbarServiceUI: ToolBarUIService,
              private snackBar : MatSnackBar,
              private fb       : UntypedFormBuilder,
              private uISettingsService: UISettingsService,
              private printingService: PrintingService,
              private paymentMethodProcessService: PaymentsMethodsProcessService,
              private methodsService: CardPointMethodsService,
              private orderMethodService: OrderMethodsService,
              private changeDetect : ChangeDetectorRef,
              private dCapService : DcapService,
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
      this.orderMethodsService.setLastOrder(data.order)
    }
    this.initForm();
    this.orderMethodsService.setScanner( )

  }

  printingCheck() {
    this._finalizer = this.printingService.printingFinalizer$.subscribe(data => {
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
    return this.paymentMethodProcessService.sendToPrep(order, true, this.uiTransactions)
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
    this.initAuthorization();
    this.initTransactionUISettings();
  }

  initTransactionUISettings() {
      this.uiTransactions$ = this.uISettingsService.getSetting('UITransactionSetting').pipe(
      switchMap(data => {
        if (data) {
          this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
          this.initDevice(this.uiTransactions)
          return of(this.uiTransactions)
        }
        if (!data) {
          this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
          this.initDevice(this.uiTransactions)
          return of(this.uiTransactions)
        }
    })).pipe(switchMap(data => {
      this.printing$ = this.processSendOrder(this.order)
      return of(data)
    })).pipe(switchMap(data => {
      if (this.uiTransactions.autoPrintReceiptOnClose) {
        this.printingService.previewReceipt(true, this.order)
      }
      return of(data)
    }))
  }

  initDevice(ui: TransactionUISettings) {
    if (ui.dCapEnabled) {
      const site = this.siteService.getAssignedSite();
      this.dCapReset$ = this.dCapService.resetDevice(localStorage.getItem('devicename'))
    }
  }

  initForm() {
    this.inputForm   = this.fb.group( {
      itemName       : [''],
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

        this.printingService.previewReceipt(       this.uiTransactions?.singlePrintReceipt, data);
        return of(data)
      }))
      return;
    }
    this.printingService.previewReceipt(this.uiTransactions?.singlePrintReceipt)
  }

  close() {
    this.paymentMethodProcessService._sendOrderOnExit.next(null)
    this.paymentMethodProcessService._sendOrderAndLogOut.next(null)
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
      if (this.uiTransactions.dCapEnabled) { 
        this.action$ = this.processDcapTip(amount)
        return;
      }
      this.action$ = this.applytoPOS(payment, amount, site)
    }
  }

  processDcapTip(amount: number) { 
    const device = localStorage.getItem('devicename')
    const site = this.siteService.getAssignedSite()
    const process$ = this.dCapService.adustByRecordNo(device, this.payment, amount)
    return process$.pipe(switchMap(data => { 
      const rstream = data as RStream;
      if (data) { 
        if (data?.cmdStatus?.toLowerCase === 'error'.toLowerCase) { 
          this.siteService.notify(data.cmdResponse + ' ' + data.textResponse, 'close',50000, 'red' )
          return of(null)
        }
      }
      return this.applytoPOS(this.payment, amount, site)
    }))
  }

  applytoPOS(payment, amount, site) { 
    payment.tipAmount = amount;
    const payment$ =  this.paymentService.putPOSPayment(site, payment);
    //process tip via credit card service.
    return  payment$.pipe(
      switchMap( data =>  {
          this.paymentService.updatePaymentSubscription(data)
          const orderID = data.orderID.toString();
          return this.orderService.getOrder(site, orderID, false);
      })).pipe(
        switchMap(data => {
        this.orderMethodsService.updateOrderSubscription(data)
        this.dialogRef.close()
        if (this.uiTransactions && this.uiTransactions.cardPointBoltEnabled) {
          this.capture(this.payment)
        }
        return of(data)
      }
    ))
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
