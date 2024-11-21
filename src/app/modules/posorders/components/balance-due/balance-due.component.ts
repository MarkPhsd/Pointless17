import { Component, OnInit,Input, Inject, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { interval, Observable, of,Subject,Subscription, timer } from 'rxjs';
import {  catchError, concatMap, switchMap, take, takeUntil } from 'rxjs/operators';
import { CardPointMethodsService, PointlessCCDSIEMVAndroidService } from 'src/app/modules/payment-processing/services';
import { IPOSOrder, IPOSPayment, IServiceType, PosPayment } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { IBalanceDuePayload } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { DSIEMVSettings, TransactionUISettings,  UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { DcapRStream, DcapService } from 'src/app/modules/payment-processing/services/dcap.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { DcapPayAPIService } from 'src/app/modules/payment-processing/services/dcap-pay-api.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { Router } from '@angular/router';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { DSIEMVTransactionsService, PrintData, RStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { DcapMethodsService } from 'src/app/modules/payment-processing/services/dcap-methods.service';
import { LogMessageInfo, SystemService } from 'src/app/_services/system/system.service';



@Component({
  selector: 'app-balance-due',
  templateUrl: './balance-due.component.html',
  styleUrls: ['./balance-due.component.scss']
})
export class ChangeDueComponent implements OnInit  {

  uiTransactions: TransactionUISettings
  uiTransactions$ : Observable<TransactionUISettings>;
  printData$ : Observable<any>;
  ui: TransactionUISettings
  dsiEmv : DSIEMVSettings
  terminalSettings:ITerminalSettings;
  terminalSettings$: Observable<ITerminalSettings>;
  response: DcapRStream;
  proccessing: boolean ;
  dCapReset$ : Observable<any>;
  printing$ : Observable<any>;
  action$   : Observable<any>;
  isApp = this.platFormService.isApp()
  inputForm             : UntypedFormGroup;
  @Input() paymentMethod: IPaymentMethod;
  @Input() order        : IPOSOrder;
  @Input() payment      : any;
  finalizer: boolean;
  _finalizer: Subscription;
  printAction$ : Observable<any>;
  serviceType$ : Observable<any>;
  step                  = 1;
  changeDue             : any;
  serviceType           : IServiceType;

  isUser: boolean;
  isStaff: boolean;
  isAuthorized: boolean;
  vice           : ITerminalSettings
  posDevice: ITerminalSettings;
  _posDevice          : Subscription;
  paxApp : boolean;
  androidApp = this.platFormService.androidApp;

  remainingTime: number = 0;
  private stopTimer$ = new Subject<void>(); // For stopping the timer when component is destroyed
  processing: boolean;
  private timer: any;
  instructions: string;
  cancelResponse: boolean;
  // Start the timer based on the passed duration
  startTimer(duration: number): void {
    this.remainingTime = duration;

    timer(0, 1000)  // Emit values every second
      .pipe(takeUntil(this.stopTimer$))  // Stop if component is destroyed
      .subscribe(val => {
        this.remainingTime = duration - val;  // Decrease the remaining time
        if (this.remainingTime <= 0) {
          this.bringtoFront()
          this.stopTimer();  // Clear timer when done
        }
      });
  }
 // Stop and clean up the timer
  stopTimer(): void {
    this.stopTimer$.next(); // Notify all subscribers to stop
    this.stopTimer$.complete(); // Complete the subject to clean up
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
  }

  get isPax() {
    if (this.paxApp) { return true }
    const data = this.terminalSettings;
    if (data?.dsiEMVSettings) {
      if (data?.dsiEMVSettings?.deviceValue) {
        this.paxApp = true
        return true;
      }
    }
  }


  async bringtoFront() {
    // console.log('pax', this.isPax)
    if (!this.isPax) { return }
    const options = {}
    await dsiemvandroid.bringToFront(options)
  }

  constructor(
              private paxAndroidService: PointlessCCDSIEMVAndroidService,
              private dcapMethodsService: DcapMethodsService,
              private dsiMVTransactionsService: DSIEMVTransactionsService,
               private navigationService     : NavigationService,
              private authenticationService : AuthenticationService,
              private userSwitchingService  : UserSwitchingService,
              private platFormService: PlatformService,
              private userAuthorization: UserAuthorizationService,
              private paymentService: POSPaymentService,
              private siteService: SitesService,
              public  orderMethodsService: OrderMethodsService,
              private orderService:  OrdersService,
              private toolbarServiceUI: ToolBarUIService,
              private snackBar : MatSnackBar,
              private fb       : UntypedFormBuilder,
              private uISettingsService: UISettingsService,
              private printingService: PrintingService,
              private paymentMethodProcessService: PaymentsMethodsProcessService,
              private payAPIService: DcapPayAPIService,
              private serviceTypeService:ServiceTypeService,
              private methodsService: CardPointMethodsService,
              private orderMethodService: OrderMethodsService,
              private changeDetect : ChangeDetectorRef,
              private dCapService : DcapService,
              private router: Router,
              private settingsService: SettingsService,
              private systemService: SystemService,
              private dialogRef: MatDialogRef<ChangeDueComponent>,
              @Inject(MAT_DIALOG_DATA) public data: IBalanceDuePayload
            )
  {

    this._posDevice = this.uISettingsService.posDevice$.subscribe(data => {
      this.posDevice = data;
   })

    if (data) {
      this.order = data.order
      this.payment = data.payment
      if (this.payment) { 
        this.getPrintData(this.payment.id)
      }
      this.paymentMethod = data.paymentMethod;
      this.changeDue = (this.payment?.amountReceived - this.payment?.amountPaid).toFixed(2)
      this.step = 1;
      if (this.payment && (!this.paymentMethod?.isCreditCard && !this.payment.account)) {
        this.step = 2
      }
      this.orderMethodsService.setLastOrder(data.order)
    }
    this.initForm();
    if (this.step == 1) {
      this.orderMethodsService.setScanner( )
    }
    this.isPax;
    this.bringtoFront()
  }

  async ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.


    this.printingCheck();
    this.initAuthorization();
    this.initTransactionUISettings();
    this.initTerminalSettings();
    this.isPax;
    await this.bringtoFront()
    this.startRepeatingFunction()

    if (this.order) {
      const site = this.siteService.getAssignedSite()
      this.serviceType$ = this.serviceTypeService.getTypeCached(site, this.order.serviceTypeID).pipe(switchMap(data => {
        return of(data)
      }))
    }


  }

  initTerminalSettings() {
    this.terminalSettings$ = this.settingsService.terminalSettings$.pipe(concatMap(data => {
      this.terminalSettings = data;
      this.dsiEmv = data?.dsiEMVSettings;

      if (!data) {
        const site = this.siteService.getAssignedSite();
        const device = localStorage.getItem('devicename');
        return this.getPOSDeviceSettings(site, device)
      }
      return of(data)
    }))
  }

  getPOSDeviceSettings(site, device) {
    return this.settingsService.getPOSDeviceSettings(site, device).pipe(concatMap(data => {
      this.settingsService.updateTerminalSetting(data)
      this.dsiEmv = data?.dsiEMVSettings;
      return of(data)
    }))
  }

  printingCheck() {
    this._finalizer = this.printingService.printingFinalizer$.subscribe(data => {
      this.changeDetect.detectChanges()
      this.finalizer = data;
      this.changeDetect.detectChanges()
    })
  }


  addNewOrder() {
    const site = this.siteService.getAssignedSite();
    const order = localStorage.getItem('orderSubscription')
    let defaultOrderTypeID = 0

    if (order && order != null) {
      this.paymentMethodProcessService.sendOrderProcessLockMethod(this.orderMethodsService.currentOrder)
    }

    let categoryID = 0

    if (this.posDevice) {
      if (this.posDevice?.defaultOrderTypeID  && this.posDevice?.defaultOrderTypeID != 0) {
        const serviceType$ = this.serviceTypeService.getType(site, this.posDevice.defaultOrderTypeID)
        this.action$ = serviceType$.pipe(switchMap(data => {
            return of(data)
        })).pipe(switchMap(data => {
            const order$ = this.addNewOrderByType(data)
            return order$
        }))
        return ;
      }
    }

    this.action$  = this.addNewOrderByType(null)
  }

  addNewOrderByType(serviceType) {
    const site = this.siteService.getAssignedSite();
    return this.paymentMethodProcessService.newOrderWithPayloadMethod(site, serviceType).pipe(switchMap(data => {
      setTimeout(() => {
        this.dialogRef.close()
      }, 100);
      return of(data)
    }))
  }

  newDefaultOrder(){
    const site = this.siteService.getAssignedSite();
    this.action$ = this.orderMethodsService.newOrderWithPayloadMethod(site, null).pipe(
     switchMap(data => {
        setTimeout(() => {
          this.dialogRef.close()
        }, 100);
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



  startRepeatingFunction() {
    interval(1000) // emit every second
      .pipe(take(15)) // limit to 15 iterations
      .subscribe(() => {
        this.bringtoFront()
      });
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
      // console.log('Auto Print Receipt on Close', this.uiTransactions?.autoPrintReceiptOnClose)
      if (this.uiTransactions?.autoPrintReceiptOnClose) {
        // console.log('Print Order', this.order?.id)
        this.printingService.previewReceipt(true, this.order)
      }
      return of(data)
    }))
  }

  initDevice(ui: TransactionUISettings) {
    const device = localStorage.getItem('devicename')
    if (ui.dCapEnabled && device) {
      this.dCapReset$ = this.dCapService.resetDevice(device).pipe(switchMap(data => {
        // console.log('data cap reset')
        return of(data)
      }), catchError(data => {
        console.log('data cap reset error', data)
        return of(data)
      }))
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


  printReceipt(){
    const order = this.order;

    const remotePrint = this.remotePrint('printReceipt', this.posDevice?.exitOrderOnFire, this.posDevice);
    if (remotePrint) {
      return;
    }

    if (this.uiTransactions.prepOrderOnExit) {
      this.printAction$ = this.paymentMethodProcessService.sendOrderOnExit(order).pipe(switchMap(data => {
        const site = this.siteService.getAssignedSite()
        return this.orderService.getOrder(site, order.id.toString(), order.history)
      })).pipe(switchMap(data => {
        this.orderMethodsService.updateOrder(data)
        this.printingService.previewReceipt(this.uiTransactions?.singlePrintReceipt, data);
        return of(data)
      }))
      return
    }

    this.printingService.previewReceipt(this.uiTransactions?.singlePrintReceipt, order)
  }

  remotePrint(message:string, exitOnSend: boolean, posDevice:ITerminalSettings) {
    const order = this.order;

    if (posDevice) {
      let pass = false
      if (posDevice?.remotePrepPrint) {
        if (message === 'printPrep') {
          pass = true
        }
        if (message === 'rePrintPrep') {
          pass = true
        }
        if (message == 'printReceipt') {
          pass = true
        }
      }
      if (posDevice?.remotePrint || pass) {
        const serverName = this.uiTransactions.printServerDevice;
        let remotePrint = {message: message,
                           deviceName:   this.posDevice?.deviceName,
                           printServer: serverName,
                           id: order.id,
                           history: order.history} as any;
        const site = this.siteService.getAssignedSite()
        this.printAction$ =  this.paymentService.remotePrintMessage(site, remotePrint).pipe(switchMap(data => {

          if (data) {
            this.siteService.notify('Print job sent', 'Close', 3000, 'green')
          } else {
            this.siteService.notify('Print Job not sent', 'Close', 3000, 'green')
          }

          if (posDevice?.exitOrderOnFire && message != 'printReceipt') {
            //then exit the order.
            this.orderMethodsService.clearOrder()
          }
          return of(data)
        }))
        return true;
      }
    }

    return false
  }


  close() {
    try {
      this.paymentMethodProcessService._sendOrderOnExit.next(null)
      this.paymentMethodProcessService._sendOrderAndLogOut.next(null)
      this.orderMethodService.clearOrder();
      this._closeOnly()
    } catch (error) {

    }
  }

  closeByOutPut(event) {
    this._closeOnly();
    this.orderMethodsService._scanner.next(true)
  }

  _closeOnly() {
    try {
      console.log('exit received')
      this.orderMethodsService._scanner.next(true)
      this.dialogRef.close()
    } catch (error) {

    }
  }

  viewReceipt() {
    const url = 'pos-payment'
    this.router.navigateByUrl(url)
    this._closeOnly()
  }

  customTipAmount(amount) {
    const payment = this.payment;
    if (!payment) {

    }
    if (payment) {
      // Ensure amount has 2 decimal places
      const formattedAmount = parseFloat(amount.toFixed(2));
      this.tip(formattedAmount);
    }
  }

  specifiedTip(amount: number) {
    const payment = this.payment;
    if (!payment) {
      // console.log('no payment', amount)
    }
    if (payment) {
      // Ensure amount has 2 decimal places
      const formattedAmount = parseFloat(amount.toFixed(2));
      // console.log('specifiedTip', amount, formattedAmount);
      this.tip(formattedAmount);
    }
  }

  tip(amount: number) {
    const formattedAmount = parseFloat(amount.toFixed(2));

    const site = this.siteService.getAssignedSite();
    const payment = this.payment;

    if (payment) {
      if (this.uiTransactions.dCapEnabled) {
        if (this.payment?.tranCode === 'EMVPreAuth') {
          this.action$ = this.completeAuthWithDcapTip(formattedAmount)
          return;
        }
        if (this.payment?.tranCode === 'PayAPISale') {
          this.action$ = this.processPayAPIAdjustSale(formattedAmount)
          return;
        }
        this.action$ = this.processDcapTip(formattedAmount)
        return;
      }
      this.action$ = this.applytoPOS(payment, formattedAmount, site)
    }
  }

  processPayAPIAdjustSale(amount) {
    const site = this.siteService.getAssignedSite()
    this.payment.tipAmount = amount;
    const process$ = this.payAPIService.payAPIAdjustSale(this.payment)
    return process$.pipe(switchMap(data => {
      if (data && !data.result) {
        this.siteService.notify(data?.resultMessage, 'close', 50000, 'red')
      }
      return this.getOrderUpdate(this.payment.orderID.toString(), site)
    }))
  }

  processDcapTip(amount: number) {

    const site = this.siteService.getAssignedSite()

    if (this.dsiEmv) {
      if (this.dsiEmv.v2) {
        return this.processDCAPTipV2(amount)
      }
    }
    const device = localStorage.getItem('devicename')
    const process$ = this.dCapService.adustByRecordNo(device, this.payment, amount);

    // console.log('processDcapTip')

    this.proccessing = true;
    return process$.pipe(switchMap(data => {
      // console.log(data, data.cmdStatus, data.textResponse)
      if (data.cmdStatus && data.cmdStatus.ToLower() == 'error') {
        this.siteService.notify(data?.cmdResponse + ' ' + data?.textResponse, 'close',50000, 'red' )
        return this.getOrderUpdate(this.payment.orderID.toString(), site)
      }

      if (data.cmdStatus && data.cmdStatus.ToLower() == 'approved') {
        return this.getOrderUpdate(this.payment.orderID.toString(), site)
      }

      if (data.captureStatus && data.captureStatus.ToLower() == 'captured') {
        return this.getOrderUpdate(this.payment.orderID.toString(), site)
      }

      if (data && data?.textResponse && data.textResponse.toLowerCase() != 'Approved'.toLowerCase()) {
        if (data?.cmdStatus?.toLowerCase === 'error'.toLowerCase) {
          this.siteService.notify(data?.cmdResponse + ' ' + data?.textResponse, 'close',50000, 'red' )
        }
      }
      this.proccessing = false;
      return this.getOrderUpdate(this.payment.orderID.toString(), site)
    }))
  }

  processDCAPTipV2(amount: number) {
    const device = localStorage.getItem('devicename')
    const process$ = this.dCapService.adustByRecordNoV2(device, this.payment, amount);
    this.proccessing = true;
    return process$.pipe(switchMap(data => {
       const result = data as any;
        if (!data.success) {
          this.siteService.notify(result?.response?.textResponse, 'close', 10000, 'red', 'top')
        }
        if (data.success) {
          this.payment = data?.payment;
        }
        this.orderMethodService.updateOrder(data?.order)
        this.proccessing = false;
        return of(data)
      })
    );
  }

  completeAuthWithDcapTip(amount: number) {
    const device = localStorage.getItem('devicename')
    const site = this.siteService.getAssignedSite()
    this.payment.tipAmount = amount;
    const process$ = this.dCapService.preAuthCaptureByRecordNoV2(device, this.payment)

    return process$.pipe(switchMap(data => {
      if (data && data.response.TextResponse  && data.response.TextResponse.toLowerCase() != 'Approved'.toLowerCase()) {
        if (data?.response?.CmdStatus?.toLowerCase === 'error'.toLowerCase) {
          this.siteService.notify(data?.response?.CmdStatus + ' ' + data?.response?.TextResponse, 'close',50000, 'red' )
          return of(null)
        }
      }
      return this.getOrderUpdate(this.payment?.orderID.toString(), site)
    }))

  }

  applytoPOS(payment:IPOSPayment, amount, site) {
    // console.log('applytoPOS')
    payment.tipAmount = amount;
    const payment$ =  this.paymentService.putPOSPayment(site, payment);
    //process tip via credit card service.
    return  payment$.pipe(
      switchMap( data =>  {
          this.paymentService.updatePaymentSubscription(data)
          const orderID = data.orderID.toString();
          return this.getOrderUpdate(orderID, site)
      }))
  }

  getOrderUpdate(orderID: string, site) {
    return  this.orderService.getOrder(site, orderID.toString(), false).pipe(
      switchMap(data => {
        this.orderMethodsService.updateOrderSubscription(data)
        setTimeout(() => {
          this.dialogRef.close()
        }, 100);

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

  logout() {
    this.close()
    if (this.uiTransactions?.prepOrderOnExit) {
      //switch order to current order
      const order = this.orderMethodsService.currentOrder
      if (!order) {
        this.postLogout()
        return
      }
      this.action$ = this.paymentMethodProcessService.sendOrderOnExit(order).pipe(switchMap(data => {
        // console.log('logout send data sendOrderOnExit', data)
        if (data) {

        }
        this.postLogout()
        return of(data)
      }))
      return;
    }
    this.postLogout()
  }


  postLogout() {
    if (this.authenticationService.authenticationInProgress) {
      this.userSwitchingService.clearLoggedInUser();
      return
    }

    if (this.authenticationService.authenticationInProgress) { return }
    this.userSwitchingService.clearLoggedInUser();
    // this.smallDeviceLimiter();
  }

  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.snackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

  navPOSOrders() {
    this.orderMethodsService.refreshAllOrders()
    this.navigationService.navPOSOrders()
    setTimeout(() => {
      this.dialogRef.close()
    }, 100);
  }

  async creditTicketPrint(data: string) {
    try {
        const tran = JSON.parse(data); // Parse the JSON string into an object
        if (!tran) { 
          this.siteService.notify('No tran data' , 'close', 100000);
          return;
        }
        if (!tran.RStream) { 
          this.siteService.notify('No rstream data', 'close', 100000);
          return
        }
        const printData = this.dcapMethodsService.extractLineProperties(tran?.RStream); // Pass only the RStream object
        try {
          if (!printData) {  
            this.siteService.notify('No printData', 'close', 100000)
            return;
          }
          await   this.printToPax(printData)
        } catch (error) {
          this.siteService.notify('Printing error' + JSON.stringify(error), 'close', 100000)
          console.log('error', error)  
        }
    } catch (error) {
      this.siteService.notify('Printing error 2' + JSON.stringify(error), 'close', 100000)
      console.log('error', error)     
    }
  }

  async printToPax(printData) {
    try {
      let item         = this.paxAndroidService.initTransactionForPrint(this.posDevice.dsiEMVSettings, printData)
      const printInfo    = this.paxAndroidService.mergePrintDataToTransaction(printData, item)
      const printResult  =  dsiemvandroid.print(printInfo)
      let log = {} as LogMessageInfo
      log.messageString = JSON.stringify(printInfo)
      this.systemService.secureLogger(log).subscribe(data => {})
      this.checkResponse_Transaction('PRINT')
    } catch (error) {
      this.siteService.notify('printToPax error' + JSON.stringify(error), 'close', 100000)
    }

  }

  checkResponse_Transaction(tranType) {
    this.processing = true;
    // console.log('checkResponse_Transaction', tranType)
    this.timer = setInterval(async () => {
      //PARAMDOWNLOAD
      if (tranType === 'RESET') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckReset(this.timer, tranType);
      }
      if (tranType === 'PRINT' || tranType == 'print') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckPrint(this.timer);
      }
    }, 500);
  }
  
  async intervalCheckPrint(timer: any) {
    let responseSuccess = '';
    const options = {}
    const paymentResponse = await dsiemvandroid.getResponse(options);
    console.log('printResponse', paymentResponse)
    if (paymentResponse && (paymentResponse.value !== '' )) {
      clearInterval(timer);  // Clear the interval here when the condition is met'
      await dsiemvandroid.clearResponse(options)
      console.log('clear response')
      await dsiemvandroid.bringToFront(options)
      console.log('bring to front')
      this.navigationService.navPOSOrders()
    }
  }

  async intervalCheckReset(timer: any, tranType?: string) {
    let responseSuccess = '';
    const options = {}
    const paymentResponse = await dsiemvandroid.getResponse(options);
    if (paymentResponse && (paymentResponse.value !== '' || this.cancelResponse)) {
      this.processing = false;
      responseSuccess = 'complete';
      const response = this.dcapMethodsService.convertToObject(paymentResponse.value)
      if (response) {
        clearInterval(timer);  // Clear the interval here when the condition is met'
        await dsiemvandroid.bringToFront(options)
        await dsiemvandroid.clearResponse(options)
      }
    }
  }

  getPrintData(id: number) { 
    if (id === 0) { return }
    const site = this.siteService.getAssignedSite();
    this.printData$ = this.paymentService.getTransactionData(site, id, this.order?.history);
  }
  
  
}
