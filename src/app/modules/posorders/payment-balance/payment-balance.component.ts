import { Component, OnInit, Input , OnDestroy, ChangeDetectorRef} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment, ISite, PosPayment } from 'src/app/_interfaces';
import { AuthenticationService, IDeviceInfo, OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { authorizationPOST, TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';
import { CardPointMethodsService, PointlessCCDSIEMVAndroidService } from '../../payment-processing/services';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { DcapService } from '../../payment-processing/services/dcap.service';
import { Capacitor } from '@capacitor/core';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { DcapMethodsService } from 'src/app/modules/payment-processing/services/dcap-methods.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { LogMessageInfo, SystemService } from 'src/app/_services/system/system.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { OrderHeaderComponent } from '../pos-order/order-header/order-header.component';
import { OrderTotalBoardComponent } from '../pos-order/order-total-board/order-total-board.component';
import { OrderTotalComponent } from '../pos-order/order-total/order-total.component';
import { DSIEMVAndroidPayBtnComponent } from '../pos-payment/dsiemvandroid-pay-btn/dsiemvandroid-pay-btn.component';

@Component({
  selector: 'app-payment-balance',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    OrderHeaderComponent,
    OrderTotalComponent,
    DSIEMVAndroidPayBtnComponent,
  ],
  templateUrl: './payment-balance.component.html',
  styleUrls: ['./payment-balance.component.scss']
})
export class PaymentBalanceComponent implements OnInit, OnDestroy {
  paxApp: boolean;
  timer: any;
  processing: boolean;
  cancelResponse: boolean;
  get platForm() {  return Capacitor.getPlatform(); }
  @Input() hideButtonOptions: boolean;
  @Input() qrOrder :boolean;
  @Input() order : IPOSOrder;
  @Input() mainPanel = true;
  @Input() uiTransactions: TransactionUISettings;
  @Input() disableOptions: boolean;

  void$: Observable<any>;
  action$: Observable<any>;
  printing$: Observable<any>;
  paymentsEqualTotal: boolean;
  site           : ISite;
  _order:          Subscription;
  _currentPayment: Subscription;
  posPayment     : IPOSPayment;
  isAuthorized   = false;
  isUser          : boolean;
  hidePrint:      boolean;
  href          : string;
  totalAuthPayments : number;
  incrementalAuth: PosPayment;
  authData: IUserAuth_Properties;


  authData$: Observable<IUserAuth_Properties>;
  @Input()  posDevice       :  ITerminalSettings;
  @Input()  deviceInfo: IDeviceInfo;
  _posDevice: Subscription;
  @Input() PaxA920 : boolean;
  paymentsFiltered: any[] = [];

  private selectedId$ = new BehaviorSubject<number | null>(null);
  public printData$: Observable<any> = this.selectedId$.pipe(
    switchMap(id => {
      if (!this.order || !id || id === 0) {
        return of(null); // Return an empty observable
      }
      const site = this.siteService.getAssignedSite();
      return this.posPaymentService.getTransactionData(site, id, this.order?.history);
    })
  );

  updatePaymentsFiltered() {
    if (!this.order?.posPayments) { return }
    if (this.order?.completionDate) {
      this.paymentsFiltered = this.order.posPayments.filter(item => item?.tranCode !== 'EMVPreAuth');
    } else {
      this.paymentsFiltered = this.order?.posPayments || [];
    }
  }

  triggerPrintData(id: number): void {
    this.selectedId$.next(id);
  }


  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
      this.getAuthTotalPayments();
      this.lastIncrementalAuth();
      this.updatePaymentsFiltered();
    })

    this._currentPayment = this.paymentService.currentPayment$.subscribe( data => {
      this.posPayment = data
      this.getAuthTotalPayments();
    })


    try {
      this._posDevice = this.uiSettingsService.posDevice$.subscribe(data => {
        this.posDevice = data;
      })
    } catch (error) {

    }
  }

  disableIfNotCredit() {
    if (this.uiTransactions?.disableNonCrediTip) {
      return true;
    }
    if (this.uiTransactions?.disableNonCrediTip) {
      if (this.posPayment.paymentMethod.isCreditCard) {
        return true
      }
    }
    return false
  }

  get isPaxEnabledTerminal() {
    if  (this.posDevice?.dsiEMVSettings?.TranDeviceID || this.posDevice?.dsiEMVSettings?.enabled ) {
      return true
    }
    return false
  }

  get isPax() {
    if (this.paxApp) { return true }
    const data = this.posDevice;
    if (data?.dsiEMVSettings) {
      if (data?.dsiEMVSettings?.deviceValue) {
        this.paxApp = true
        return true;
      }
    }
  }

  constructor(
              private paxAndroidService: PointlessCCDSIEMVAndroidService,
              private orderService: OrdersService,
              private orderMethodsService: OrderMethodsService,
              private siteService: SitesService,
              private paymentService: POSPaymentService,
              private paymentMethodService: PaymentMethodsService,
              private uiSettingsService: UISettingsService,
              private userSwitchingService:UserSwitchingService,
              private paymentMethodsProessService: PaymentsMethodsProcessService,
              private posPaymentService: POSPaymentService,
              public authenticationService: AuthenticationService,
              public  userAuthorization: UserAuthorizationService,
              private productEditButtonService: ProductEditButtonService,
              private editDialog      : ProductEditButtonService,
              private methodsService: CardPointMethodsService,
              private triposMethodService: TriPOSMethodService,
              private toolBarUI       : ToolBarUIService,
              private matSnackBar   : MatSnackBar,
              public  printingService: PrintingService,
              private settingsService: SettingsService,
              private toolbarUIService  : ToolBarUIService,
              private dcapService: DcapService,
              private systemService: SystemService,
              private dcapMethodsService: DcapMethodsService,
              private router: Router,
              private navigationService     : NavigationService,
            ) {
   }

   ngOnInit() {
    this.href = this.router.url;
    this.site = this.siteService.getAssignedSite();
    this.initSubscriptions();
    this.paymentsEqualTotal = false;
    if (this.order) {
      if ( this.order.balanceRemaining == 0)  {
        this.paymentsEqualTotal = true;
      }
      if ( this.order.balanceRemaining > 0)  {
        this.paymentsEqualTotal = false;
      }
    }

    if (this.userAuthorization.user.roles === 'user') {
      this.isUser = true;
    }

    this.authData$ = of(this.authenticationService._userAuths.value).pipe(switchMap(data => {
      this.authData = data;
      return of(data)
    }))

    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager,employee')

    if (this.href.substring(0, 11 ) === '/pos-payment') {
      this.hidePrint = true;
      return;
    }

    this.deviceInfo = this.authenticationService.deviceInfo;
  }


  isCashVoidAllowed(item: IPOSPayment, auth: IUserAuth_Properties) {
    if (this.authData?.enableCashVoid) {
      if (item?.paymentMethod?.isCash) {
        return true
      }
    }
  }
  getNumberOfPayments() {
    let count = 0
    const list = this.paymentsFiltered //?.length // || 0
    list.forEach(data => {
      if (data.amountPaid != 0) {
        count += 1;
      }
    })
    return count
  }

  editCart() {
    this.toolbarUIService.updateOrderBar(false,this.authenticationService.deviceInfo)
    this.toolbarUIService.resetOrderBar(true)
    this.router.navigate(["/currentorder/", {mainPanel:true}]);
    this.orderMethodsService.setScanner()
  }

  capture(item: IPOSPayment) {
    const site = this.siteService.getAssignedSite();
    if (this.order && this.uiTransactions.cardPointPreAuth && this.uiTransactions.cardPointBoltEnabled) {
      const payment$ =  this.paymentService.getPOSPayment(site, item.id, false)
      this.action$ = payment$.pipe(switchMap(payment => {
          this.methodsService.processCapture(item, this.order.creditBalanceRemaining,
                                                      this.uiTransactions)
                                                      return of(payment)
      }))
    }
  }

  getPaymentViewA(item: IPOSPayment) {

    if (
        (item.completionDate) ||
        (item.account && !item.completionDate) ||
        (item.completionDate && item.amountPaid != 0) ||
        (item && item.voidReason) ||
        (item.tranType  && item?.tranType?.toLowerCase()  === 'emvsale'.toLowerCase() ) ||
        (item.tranType  && item?.tranType?.toLowerCase()  === 'authorizationresponse'.toLowerCase() ) ||
        (item.tranType  && item?.tranType.toLowerCase()   === 'VoidSaleByRecordNo'.toLowerCase() ) &&
                           item?.tranType != 'incrementalAuthorizationResponse') {
      return true
                          }
      return false

  }

  getPaymentViewB(item) {
    const order = this.order;
    if (
      ( item?.tranCode != 'EMVPreAuth'      && order.balanceRemaining == 0 ||
        item?.tranCode != 'IncrementalAuth' && order.balanceRemaining == 0 ) ||
      ( item?.tranCode == 'EMVPreAuth'      && order.balanceRemaining != 0 ||
        item?.tranCode == 'IncrementalAuth' && order.balanceRemaining != 0)
    ) {
      return true
    }
    return false
  }

  emvDataCap(item) {
    const order = this.order;
    if (  item?.captureStatus != 'captured' )
      {
      return true
    }
    return false
  }


  dCapViewEnabled(item) {
    const uiTransactions = this.uiTransactions;
    if (!this.qrOrder) {
      if (item.completionDate) { return true }
      if (this.PaxA920) { return true;}
      if ((uiTransactions && uiTransactions?.dCapEnabled  && !item.completionDate) &&
          ((item.tranCode && item?.tranCode.toLowerCase() === 'emvpreauth') ||  (item?.tranCode && item?.tranCode.toLowerCase() === 'IncrementalAuth'.toLowerCase())) ) {
            return true
          }
    }
    return false
  }

  incrementalDCap(item: IPOSPayment) {

  }

  lastIncrementalAuth() {
    if ( this.order  &&
         !this.order.posPayments ||
        (  this.order && this.order.posPayments &&
           this.order.posPayments.length === 0 ) ){ return }

      const order = this.order
      if (!order) { return }
      if (!order.posPayments) {return }
      if (order.posPayments == null || order.posPayments == undefined) { return };

      try {
        this.order.posPayments.slice().reverse().forEach(data => {
          // console.log(data?.tranType && data.amountPaid)
          if (data?.tranType === 'incrementalAuthorizationResponse' && data?.amountPaid != 0) {
            this.incrementalAuth = data;

            return
          }
        })
      } catch (error) {
        console.log('lastIncrementalAuth error ', error)
      }
  }

  reverseIncrementalAuth(item: any) {
    const site = this.siteService.getAssignedSite()
    const auth = {} as authorizationPOST;
    // console.log(item)
    if (!item || !item.refNumber) {
      this.siteService.notify('Error with transaction, no transactionID.', 'close',2000, 'yellow')
      return
    }

    const terminal= this.settingsService.terminalSettings;
    if (!terminal) { return }

    auth.laneId = terminal?.triposLaneID;
    auth.transactionId = item?.refNumber;
    auth.paymentType = 'credit' //item?.paymentMethod?.name
    // console.log('auth', auth);

    this.action$ = this.triposMethodService.processIncrementalReversal(auth, item).pipe(
      switchMap(data => {
      // console.log('processIncrementalReversal result', data)
      return of(data)
    })).pipe( switchMap( data => {
      // console.log('payment', data)
      return this.orderMethodsService.refreshOrderOBS(item.orderID, false)
    })).pipe(switchMap( data => {
      // console.log('order', data)
      return of(data)
    })),
    catchError(err => {
      this.siteService.notify(`Error occured: ${err.toString()}`, 'close', 3000, 'red')
      return of(err)
    })

  }

  incrementTriPOS(item: IPOSPayment) {
    const amount =   this.order.creditBalanceRemaining - this.totalAuthPayments;
    const site = this.siteService.getAssignedSite()
    let transactionId
    let tranData
    const payment$ = this.paymentService.getPOSPayment(site, item.id, item.history)
    const terminal$ = this.settingsService.terminalSettings$;

    let payment:IPOSPayment;
    this.action$ =   payment$.pipe(switchMap(data => {

        item = data;
        payment = data;
        try {
          tranData = JSON.parse(item.transactionData);
        } catch (error) {
          this.siteService.notify('Error no transaction data found.', 'close', 5000, 'red')
          return  of(null)
        }
        return of(data)
      }
    )).pipe(switchMap( data=> {
        if (!data) {return of(null)}
        return  terminal$
      }
    )).pipe(switchMap(data => {

      if (!data) {return of(null)}
      if (tranData && tranData.transactionId) {
        transactionId = tranData.transactionId

        let refNumber = ''
        let ticketNumber = ''
        if (item)
        if (! data.triposLaneID) {
          this.siteService.notify(`No Lane ID, will not process.`, 'close', 3000, 'red')
        }

        if (payment) {
          if (payment.transactionIDRef) {
            ticketNumber = payment.transactionIDRef
          }
          if (!payment.transactionIDRef) {
            refNumber = payment.refNumber;
          }
          ticketNumber = refNumber
        }
        let increment =  this.order.creditBalanceRemaining - this.totalAuthPayments;

        return this.triposMethodService.processIncrement( site, tranData.transactionId, amount.toString(), data.triposLaneID, ticketNumber)
      }

    })).pipe(switchMap(data => {

      if (!data) {return of(null)}
      // console.log(data)
      if (data && !data._hasErrors && data.isApproved) {
        item.amountPaid = amount;
        item.amountReceived = 0;
        item.orderDate = null;
        try {
          item.transactionData = JSON.stringify(data)
        } catch (error) {

        }
        item = this.paymentMethodsProessService.applyTripPOSResponseToPayment(data, item, 0)
        item.id = 0;
        item.transactionIDRef  = transactionId;
        return this.paymentService.makePayment(site, item, this.order, amount, null)
      }
      if (data?.exceptionMessage) {
        this.siteService.notify(`Not approved: ${data?.exceptionMessage}`, 'close', 3000, 'red')
      } else {
        this.siteService.notify('Not approved: unknown. ', 'close', 3000, 'red')
      }
      return of(this.order)
    })).pipe(switchMap(data => {
      return   this.orderMethodsService.refreshOrderOBS(this.order.id, this.order.history)
    }))
  }

  getAuthTotalPayments() {
    let amount = 0
    this.totalAuthPayments = 0;

    if (!this.order || !this.order.posPayments) {return}

    if (this.uiTransactions && (this.uiTransactions?.triposEnabled ||  this.uiTransactions.cardPointBoltEnabled || this.uiTransactions.dCapEnabled) ) {
      amount = this.paymentMethodsProessService.getAuthTotal(this.order.posPayments)
    }

    this.totalAuthPayments = amount;
    return amount;
  }

  captureTriPOS(item: IPOSPayment) {

    const site = this.siteService.getAssignedSite();
    const payment$ =  this.paymentService.getPOSPayment(site, item.id, false)
    this.action$ = payment$.pipe(switchMap(payment => {

    let amount = this.totalAuthPayments; // this.order.creditBalanceRemaining;
      return this.triposMethodService.openDialogCompleteCreditPayment(this.order, amount,
                                                                payment, this.uiTransactions)
    }))
  }

  captureDCap(item: IPOSPayment, amount: number) {
    const device = localStorage.getItem('devicename')

    item.amountPaid  = amount;
    item.amountReceived = amount;
    this.action$ = this.dcapService.preAuthCaptureByRecordNoV2(device, item).pipe(switchMap(data => {
      // return this.paymentMethodsProessService.processDCAPPreauthResponse(data, item, this.order, device)
      this.orderMethodsService.updateOrder(data.order)
      return of(data.order)
    }))
  }

  incrementalAuthByRecordNo(item: IPOSPayment, amount: number) {
    const device = localStorage.getItem('devicename')
    item.amountPaid  = amount;
    item.amountReceived = amount;
    this.action$ = this.dcapService.incrementalAuthByRecordNoV2(device, item).pipe(switchMap(data => {
      this.orderMethodsService.updateOrder(data.order)
      // return this.paymentMethodsProessService.processDCAPPreauthResponse(data.response, item, this.order, device)
      return of(data.order)
    }))
  }

  editPayment(payment: IPOSPayment) {
      //get payment
      if (payment.tranCode === 'PayAPISale') {
        this.editDialog.openChangeDueDialog(payment, null, this.order)
        return;
      }

      if (!this.isPaxEnabledTerminal)  {
        this.siteService.notify("Please use a terminal with a credit card machine.", 'Close', 1000);
        return;
      }
      if (this.PaxA920) {
        return;
      }


      const site = this.siteService.getAssignedSite();
      if (payment.paymentMethodID == 0) {
        this.editDialog.openChangeDueDialog(payment, null, this.order)
        return;
      }
      const method$ = this.paymentMethodService.getPaymentMethod(site,payment.paymentMethodID)
      method$.subscribe( method => {
        this.editDialog.openChangeDueDialog(payment, method, this.order)
      })
   }

   ngOnDestroy(): void {
     if (this._currentPayment) {
      this._currentPayment.unsubscribe();
     }
     if (this._order) {
       this._order.unsubscribe();
     }
   }

   closeOrder() {
     if (this.order) {
     const site = this.siteService.getAssignedSite();
     const result$ = this.orderService.forceCompleteOrder(site, this.order.id)
     this.action$ = result$.pipe(switchMap(data =>  {
       this.paymentService.updatePaymentSubscription(null)
       this.orderMethodsService.updateOrderSubscription(null)
       this.toolBarUI.updateOrderBar(false,this.authenticationService.deviceInfo)
       return of(data)
     })).pipe(switchMap(data => {
      this.router.navigateByUrl('/pos-orders')
      return of(data)
     }))
    }
   }

   exitOrder() {
    this.orderMethodsService.clearOrder()
   }

   getPaymentMethod(id: number) {
      return this.paymentMethodService.getCacheMethod(this.site ,id)
   }

   voidPayment(payment) {
    //run void method.
    const message = 'Paypal can be voided from the POS Sales, but must be completed in the paypal account itself.'
    const method$ = this.getPaymentMethod(payment.paymentMethodID)
    if (payment.history) {
      this.siteService.notify('Payments that have been batched can not be voided here. Speak with administration.', 'Close', 4000)
      return
    }
    this.void$ = method$.pipe(switchMap( data=> {
        if (payment && data.name === 'paypal') {
          this.notify(message, 'Alert', 2000)
        }
        const itemdata = { payment: payment, uiSettings: this.uiTransactions}
        // console.log('using data', itemdata)
        this.productEditButtonService.openVoidPaymentDialog(itemdata)
        return of(data)
        }
      )
    )
  }

   requestVoidPayment(payment) {
    //run void method.
    if (payment) {
      //only manager can void.
      this.productEditButtonService.openVoidPaymentDialog(payment)
      return
    }
   }

   printPaymentReceipt(item) {

    this.orderMethodsService.selectedPayment = item;

    if (item && (item.groupID && item.groupID != 0)) {
        // console.log('prinint item group total')
        const site = this.siteService.getAssignedSite();
        this.printing$ = this.orderService.getPOSOrderGroupTotal(site, item.orderID, item.groupID).pipe(switchMap(data => {
        this.printingService.printOrder = data;
        this.printingService.previewReceipt(null, data);
        return of(data)
      }))
      return;
    }

    if (item) {
      this.printingService.previewReceipt()
    }
   }

   notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

  async printPax(data) {
    const site = this.siteService.getAssignedSite()
    if (!data) { return }
     await this.creditTicketPrint(data)
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

        const printData = this.dcapMethodsService.extractLineProperties(tran.RStream); // Pass only the RStream object
        try {
          if (!printData) {
            this.siteService.notify('No Print Data Created', 'close', 100000);
            return
           }
          await   this.printToPax(printData)
        } catch (error) {
          console.log('error', error)
        }
    } catch (error) {
      console.log('error', error)
    }
  }

  async printToPax(printData) {
    let item         = this.paxAndroidService.initTransactionForPrint(this.posDevice.dsiEMVSettings, printData)
    const printInfo    = this.paxAndroidService.mergePrintDataToTransaction(printData, item)
    let log = {} as LogMessageInfo
    log.type = "DCAP Printing"
    log.messageString = JSON.stringify(printInfo)
    this.systemService.secureLogger(log).subscribe(data => {})
    const printResult  =  dsiemvandroid.print(printInfo)
    this.checkResponse_Transaction('PRINT')
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

}
