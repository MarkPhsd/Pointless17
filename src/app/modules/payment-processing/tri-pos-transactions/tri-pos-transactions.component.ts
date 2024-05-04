import { Component, Inject,  OnInit , Optional} from '@angular/core';
import {  Observable, of, switchMap } from 'rxjs';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { OrdersService } from 'src/app/_services';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { authorizationPOST, TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PrintingService } from 'src/app/_services/system/printing.service';

@Component({
  selector: 'app-tri-pos-transactions',
  templateUrl: './tri-pos-transactions.component.html',
  styleUrls: ['./tri-pos-transactions.component.scss']
})
export class TriPosTransactionsComponent implements OnInit {

  processing$: Observable<any>;
  terminalsettings$ : Observable<any>;
  posPayment: IPOSPayment;
  laneID: string;
  terminalSettings: ITerminalSettings;
  order: IPOSOrder;
  message: string;
  dataPass: any;
  transactionType: string;
  tipValue: string;
  processing: boolean;
  errorMessage: string;
  inputForm: UntypedFormGroup;
  uiTransaction: TransactionUISettings

  constructor(  public methodsService : TriPOSMethodService,
    public userAuthService: UserAuthorizationService,
    public auth                 : UserAuthorizationService,
    public paymentMethodsService: PaymentsMethodsProcessService,
    public paymentService       : POSPaymentService,
    private siteService         : SitesService,
    private orderService        : OrdersService,
    public orderMethodsService: OrderMethodsService,
    private setingsServerice: SettingsService,
    private printingService: PrintingService,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,

    @Optional() private dialogRef  : MatDialogRef<TriPosTransactionsComponent>,
    ) {

    if (!data) {
      this.message = "No Payment or Order Assigned."
      return;
    }

    //   const data = {order: order, posPayment: posPayment, uiTransactions: settings, manualPrompt: manualPrompt, action: 1}
    this.uiTransaction = data.settings;
    this.posPayment = data.posPayment;
    this.order = data.order;
    this.dataPass = data;

    this.terminalsettings$ =  this.getDevice();

    if (this.posPayment.amountPaid>0) {
      this.transactionType = 'Sale or Pre-Authorization'
    }

    if (this.posPayment.amountPaid<0) {
      this.transactionType = 'Refund'
    }
  }

  initForm() {
    this.inputForm = this.fb.group({
      itemName: ['0.00']
    })
  }

  ngOnInit(): void {
    this.initForm()
    const i = 0;
  }

  applyTipAmount(event) {
    this.tipValue = event;
    console.log('apply tip amount', this.tipValue, event)
  }

  addTipPercent(value) {
    if (value) {
      this.tipValue = ( this.posPayment.amountPaid * (value/100) ).toFixed(2);
    }
    if (value == 0) {
      this.tipValue = '0';
      return
    }
  }

  // laneId: "003"
  // ticketNumber: "256718"
  // tipAmount: null
  // transactionAmount: "10.00"
  // transactionId: "282092629"

  setTransactionInfo(): authorizationPOST {
    let item = {} as authorizationPOST;
    item.laneId = this.terminalSettings.triposLaneID;
    if (!this.tipValue) {this.tipValue = null}
    item.tipAmount = this.tipValue;
    item.configuration = {allowDebit: true, marketCode: this.MarketCode}
    item.transactionId = this.posPayment.respcode;
    if (!item.tipAmount) {
      item.tipAmount = '0'
    }

    item.transactionAmount = (this.posPayment.amountPaid + +this.tipValue).toFixed(2).toString();
    item.ticketNumber = this.posPayment.id.toString();
    item = this.setConfig(item)

    this.processing = true;
    this.errorMessage = ''
    return item;
  }

  get _tipValue() {
    // console.log('inputFormValue', this.inputForm.value)
    // if (this.inputForm) {
    //  const value =  this.inputForm.controls['itemName'].value
    //  this.tipValue = value;
    //  return value;
    // }
    if (!this.tipValue) {
      this.tipValue = '0.00'
    }
    return this.tipValue;
  }

  reverseAuthorization() {
    if (!this.validateTransaction()) { return }
    const site = this.siteService.getAssignedSite();
    let item = this.setTransactionInfo()
    item.paymentType = 'credit'
    item.ticketNumber = this.posPayment?.id.toString();
    item.referenceNumber = this.posPayment?.refNumber.toString();

    this.processing$ =  this.methodsService.reversal(site, item ).pipe(switchMap(data => {

      this.errorMessage = ''
      if ((data && data.statusCode  && data?.statusCode  === 'Approved') || data.isApproved) {

      }else {
        if ((data._hasErrors  || data._errors.length>0 ) && !data.isApproved) {
          this.displayErrors(data);
          return of (null);
        }
      }

      this.posPayment.saleType        = 0;
      this.posPayment.amountPaid      = 0
      this.posPayment.amountReceived  = 0
      this.posPayment.respcode        = data?.transactionId;
      this.posPayment.refNumber       = data?.transactionId;
      this.posPayment.tranType        = data?._type;

      return this.paymentService.putPOSPayment(site, this.posPayment)
      return this.paymentMethodsService.processTriPOSResponse(data ,this.posPayment, this.order, 0)
    }
    )).pipe(switchMap(data => {
      this.posPayment = data;
      this.initMessaging();
      return this.orderService.getOrder(site, data.orderID, false)
    })).pipe(switchMap(data => {
      // console.log('put update', data)
      if (!data) { return of(null)}
      this.orderMethodsService.updateOrder(data);
      this.dialogRef.close(true)
      return of(data)
    }))
  }

  completeAuthorization() {
    if (!this.validateTransaction()) { return }
    if (this.posPayment && this.terminalSettings.triposLaneID) {
      const site = this.siteService.getAssignedSite();
      let item = this.setTransactionInfo();

      item.tipAmount = this._tipValue;
      item.ticketNumber = this.posPayment.id.toString()
      item.referenceNumber = this.posPayment.id.toString()
      if (item.referenceNumber) {
        item.ticketNumber    = this.posPayment.refNumber;
        item.referenceNumber = this.posPayment.refNumber;
      }

      const authorizationCompletion$ = this.methodsService.authorizationCompletion(site, item );
      this.processing$ =  authorizationCompletion$.pipe(
        switchMap(data => {

          this.initMessaging();
          if (data._hasErrors || !data.isApproved) {

            this.displayErrors(data)
            return of (null)
          }
          this.posPayment.amountPaid = data.totalAmount;
          this.posPayment.amountReceived = data.totalAmount;
          this.posPayment.saleType      = 1;
          return this.paymentMethodsService.processTriPOSResponse(data ,this.posPayment, this.order, +this.tipValue);
      }
      )).pipe(switchMap(data => {

        console.log('data result of completion', data)
        if (!data) { return of(null)};
        this.initMessaging();
        this.dialogRef.close(true);
        return of(data);
      }))
    }
  }

  initMessaging() {
    // console.trace('initMessaging')
    this.processing = false;
    this.errorMessage = ''
    this.message = ''
  }

  reset() {
    this.processing$ = null;
    this.initMessaging()
  }

  initTransaction( posPayment: IPOSPayment, terminal: ITerminalSettings) : authorizationPOST {
    let authorizationPOST = {} as authorizationPOST;
    if (!posPayment.tipAmount) { posPayment.tipAmount = 0}

    if (!this.tipValue || +this.tipValue == 0) { authorizationPOST.tipAmount = null}
    if (this.tipValue && +this.tipValue != 0)  { authorizationPOST.tipAmount =  this.tipValue}

    authorizationPOST.transactionAmount = Math.abs(this.posPayment.amountPaid + posPayment.tipAmount ).toFixed(2).toString();
    authorizationPOST.laneId            = terminal.triposLaneID;

    authorizationPOST.ticketNumber      = this.posPayment.id.toString();
    authorizationPOST.referenceNumber   = this.posPayment.id.toString();

    authorizationPOST                   = this.setConfig(authorizationPOST)
    return authorizationPOST;
  }

  getRef(item:authorizationPOST, posPayment: IPOSPayment ) {
    if (this.posPayment.transactionIDRef ) {
      item.ticketNumber    = posPayment.transactionIDRef;
      item.referenceNumber = posPayment.transactionIDRef;
    }
    if (!this.posPayment.transactionIDRef && posPayment.id !=0 ) {
      item.ticketNumber    = posPayment.id.toString();
      item.referenceNumber = posPayment.id.toString();
    }
    return item
  }

  authorizeAmount() {
    if (!this.validateTransaction()) { return }
    if (this.posPayment && this.terminalSettings.triposLaneID) {
      let item        = this.initTransaction(this.posPayment, this.terminalSettings);
      const site      = this.siteService.getAssignedSite();
      this.processing = true;
      this.errorMessage = ''

      item.ticketNumber;
      // console.log('Refernce Number', item.ticketNumber)
      // console.log('Ticket Number', item.referenceNumber)

      item = this.getRef(item, this.posPayment)

      this.processing$ =  this.methodsService.authorizeAmount( site, item ).pipe(switchMap(data => {

        if ((data._hasErrors && data._errors.length>0) || !data.isApproved) {
          this.displayErrors(data)
          return of (null)
        }
        if (!this.posPayment.transactionIDRef) {
          this.posPayment.transactionIDRef = item.ticketNumber;
        }
        return this.paymentMethodsService.processAuthTriPOSResponse(data ,this.posPayment, this.order, +this.tipValue)
      })).pipe(switchMap(data => {
        this.reset()
        if (!data) { return of(null)}
        this.orderMethodsService.updateOrderSubscription(data);
        this.dialogRef.close(true)
        return of(data)
      }))
    }
  }

  public get MarketCode() {
    let  marketCode = 'Retail'
      //Those value should be a string of alpha characters, and not numeric. TriPOS “FoodRestaurant” translates to market code 4 on Express, and triPOS “Retail” translates to market code 7 on Express.
      // if (this.terminalSettings.)
    if (this.terminalSettings && this.terminalSettings.triPOSMarketCode == 7) {
      return 'FoodRestaurant'
    }
    if (this.terminalSettings && this.terminalSettings.triPOSMarketCode == 4) {
      return  'Retail'
    }

    return marketCode;
  }

  setConfig(item: authorizationPOST ):authorizationPOST {
    item.configuration= {allowDebit: true, marketCode : this.MarketCode};
    return item;
  }

  payAmount() {
    if (!this.validateTransaction()) { return }
    if (this.posPayment && this.terminalSettings.triposLaneID) {
      let item             = this.initTransaction(this.posPayment, this.terminalSettings);
      item.tipAmount       = this._tipValue;
      item                 = this.setConfig(item)
      item.transactionId   = this.posPayment.refNumber;
      const site           = this.siteService.getAssignedSite();
      this.processing      = true;
      this.errorMessage    = ''

      this.processing$  =  this.methodsService.sale(site, item )
                          .pipe(switchMap(data => {
            this.printingService.saveCreditCardSale(JSON.stringify(data), this.order?.orderCode)

            this.errorMessage = ''
            if ((data._hasErrors && data._errors.length>0) || !data.isApproved) {
              this.processing = false;
              this.displayErrors(data)
              return of (null)
            }
            this.posPayment.saleType      = 1;
            return this.paymentMethodsService.processTriPOSResponse(data ,this.posPayment, this.order, +this.tipValue)
          }
        )).pipe(switchMap(data => {
          //return the current order. Error messsage should have been
          if (!data || !data.payment) {   return of(this.order)  }

          const payment = data.payment
          const trans = data.trans
          const order = data.order;

          if (!data || !data.order) {
            this.siteService.notify('Unknown error occurred.', 'close', 4000, 'red');
            this.errorMessage = 'Unknown error occurred.'
            return this.orderService.getOrder(site, this.order.id.toString(), false)
          }

          if (!this.paymentMethodsService.isTriPOSApproved(data.trans)) {
            this.errorMessage = trans?.captureStatus;
            return of(data.order)
          }

          this.reset()
          this.dialogRef.close(true)
          return of(data.order)

        })).pipe(switchMap(data => {
          if (data) {
            this.orderMethodsService.updateOrderSubscription(data);
            return of(data);
          }
      }))
    }
  }

  displayErrors(trans) {
    let message = ''
    this.errorMessage = ''
    if (trans._errors) {
      if (trans._hasErrors) {
        trans._errors.forEach(item => {
          if (item.exceptionMessage) {
            message = `${message} Exception: ${item?.exceptionMessage}`
          }
          if (item.developerMessage) {
            message = `${message} Developer  ${item?.developerMessage}`
          }
          if (item.userMessage) {
            message = `${message} User Message  ${item?.userMessage}`
          }
        })
      }
    }

    if (trans._processor) {
      if (trans._hasErrors) {
        trans._errors.forEach(item => {
          if (item.exceptionMessage) {
            message = `${message} Exception: ${item?.exceptionMessage}`
          }
          if (item.developerMessage) {
            message = `${message} Developer  ${item?.developerMessage}`
          }
          if (item.userMessage) {
            message = `${message} User Message  ${item?.userMessage}`
          }
        })
      }
    }

    if (message != '') {
      this.errorMessage = `${message}`
    }

    message = `${message} ${trans?._processor?.expressResponseMessage}`
    this.siteService.notify(`Response not approved. Response given ${trans?.statusCode}. Messages: ${message}. ` , 'Failed', 3000)
  }

  refundAmount() {
    if (!this.validateTransaction()) { return }
    if (this.posPayment && this.terminalSettings.triposLaneID) {
      const item = this.initTransaction(this.posPayment, this.terminalSettings);
      const site = this.siteService.getAssignedSite();
      this.processing = true;
      this.errorMessage = ''
      this.posPayment.saleType = 3;

      this.processing$ =  this.methodsService.refund(site, item ).pipe(
        switchMap(data => {
          this.errorMessage = ''
          if ((data._hasErrors && data._errors.length>0) || !data.isApproved) {
            this.displayErrors(data)
            return of (null)
          }
          return   this.paymentMethodsService.processTriPOSResponse(data ,this.posPayment, this.order, +this.tipValue)
        })).pipe(switchMap(data => {
          // return this.orderService.getOrder(site, this.order.id.toString(), false)
          // return the current order. Error messsage should have been
          if (!data || !data.payment) { return of(this.order)  }

          const trans = data.trans

          if (!data || !data.order) {
            this.siteService.notify('Unknown error occurred.', 'close', 4000, 'red');
            this.errorMessage = 'Unknown error occurred.'
            return this.orderService.getOrder(site, this.order.id.toString(), false)
          }

          if (!this.paymentMethodsService.isTriPOSApproved(data.trans)) {
            this.errorMessage = trans?.captureStatus;
            return of(data.order)
          }

          this.reset()
          this.dialogRef.close(true)
          return of(data.order)

      }))

      //   .pipe(switchMap(data => {
      //    this.reset()
      //     this.orderService.updateOrderSubscription(data);
      //     this.dialogRef.close(true)
      //     return of(data)
      // }))
    }
  }

  reboot() {
    const site = this.siteService.getAssignedSite();
    this.processing$ = this.methodsService.reboot(site, null )
  }

  getDevice() {
    const name = localStorage.getItem('devicename');
    const site = this.siteService.getAssignedSite()
    return this.setingsServerice.getSettingByName(site, name).pipe(switchMap(data => {
      if (data && data.text) {
        this.terminalSettings = JSON.parse(data.text)
        if (!this.terminalSettings.triposLaneID) {
          this.terminalSettings.triposLaneID = '4'
        }
      }
      return of(data)
    }))
  }

  close() {   this.dialogRef.close()  }

  validateTransaction() {
    let result = true;
    if (!this.posPayment) {
      this.siteService.notify('No Payment', 'Alert', 2000)
       result = false
    }
    if (!this.terminalSettings) {
      this.siteService.notify('No device settings', 'Alert', 2000)
       result = false
    }
    if (!this.uiTransaction) {
      this.siteService.notify('No system settings', 'Alert', 2000)
        result = false
    }
    return result
  }

}
