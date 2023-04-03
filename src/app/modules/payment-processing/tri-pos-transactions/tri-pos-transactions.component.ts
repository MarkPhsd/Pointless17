import { Component, Inject,  OnInit , Optional} from '@angular/core';
import {  Observable, of, switchMap } from 'rxjs';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrdersService } from 'src/app/_services';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { authorizationPOST, TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  inputForm: FormGroup;
  uiTransaction: TransactionUISettings

  constructor(  public methodsService : TriPOSMethodService,
    public userAuthService: UserAuthorizationService,
    public auth                 : UserAuthorizationService,
    public paymentMethodsService: PaymentsMethodsProcessService,
    public paymentService       : POSPaymentService,
    private siteService         : SitesService,
    private orderService        : OrdersService,
    private setingsServerice: SettingsService,
    private fb: FormBuilder,
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

    this.initForm()

  }

  initForm() {
    this.inputForm = this.fb.group({
      tipValue: []
    })
  }

  ngOnInit(): void {
    const i = 0;
  }

  applyDropAmount(event) {
    this.tipValue = event;
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

  setTransactionInfo() {
    const item = {} as authorizationPOST;
    item.laneId = this.terminalSettings.triposLaneID;
    if (!this.tipValue) {this.tipValue = '0'}
    item.tipAmount = this.tipValue;
    item.transactionId = this.posPayment.respcode;
    item.transactionAmount = this.posPayment.amountPaid.toFixed(2).toString();

    this.processing = true;
    this.errorMessage = ''
    return item;
  }

  reverseAuthorization() {
    if (!this.validateTransaction()) { return }
    const site = this.siteService.getAssignedSite();
    let item = this.setTransactionInfo()
    item.paymentType = 'credit'
    this.processing$ =  this.methodsService.reversal(site, item ).pipe(switchMap(data => {
      // console.log(data.approvalNumber, data.isApproved)
      this.errorMessage = ''
      if (data._hasErrors) {
        this.displayErrors(data)
        return of (null)
      }
      this.posPayment.saleType      = 0;
      this.posPayment.amountPaid = 0
      this.posPayment.amountReceived = 0
      return this.paymentMethodsService.processTriPOSResponse(data ,this.posPayment, this.order)
    }
    )).pipe(switchMap(data => {
      this.initMessaging()
      if (!data) { return of(null)}
      this.dialogRef.close(true)
      return of(data)
    }))
  }

  completeAuthorization() {
    if (!this.validateTransaction()) { return }
    if (this.posPayment && this.terminalSettings.triposLaneID) {
      const site = this.siteService.getAssignedSite();
      const item = this.setTransactionInfo()
      const authorizationCompletion$ = this.methodsService.authorizationCompletion(site, item );

      this.processing$ =  authorizationCompletion$.pipe(
        switchMap(data => {
          this.errorMessage = ''
          if (data._hasErrors) {
            this.displayErrors(data)
            return of (null)
          }
          this.posPayment.saleType      = 1;
          return this.paymentMethodsService.processTriPOSResponse(data ,this.posPayment, this.order);
      }
      )).pipe(switchMap(data => {
        this.initMessaging();
        if (!data) { return of(null)}
        this.dialogRef.close(true)
        return of(data)
      }))
    }
  }

  initMessaging() {
    this.processing = false;
    this.errorMessage = ''
    this.message = ''
  }
  
  reset() {
    this.processing$ = null;
    this.initMessaging()
  }

  initTransaction( posPayment: IPOSPayment, terminal: ITerminalSettings) : authorizationPOST {
    const authorizationPOST = {} as authorizationPOST;
    if (!posPayment.tipAmount) { posPayment.tipAmount = 0}
    authorizationPOST.transactionAmount = Math.abs(this.posPayment.amountPaid).toFixed(2).toString();
    authorizationPOST.laneId            = terminal.triposLaneID;
    authorizationPOST.tipAmount         = posPayment.tipAmount.toString();
    return authorizationPOST;
  }

  authorizeAmount() {
    if (!this.validateTransaction()) { return }
    if (this.posPayment && this.terminalSettings.triposLaneID) {
      const item = this.initTransaction(this.posPayment, this.terminalSettings);
      const site = this.siteService.getAssignedSite();
      this.processing = true;
      this.errorMessage = ''
      this.processing$ =  this.methodsService.authorizeAmount( site, item ).pipe(switchMap(data => {
        if (data._hasErrors) {
          this.displayErrors(data)
          return of (null)
        }
        return this.paymentMethodsService.processAuthTriPOSResponse(data ,this.posPayment, this.order)
      })).pipe(switchMap(data => {
        this.reset()
        if (!data) { return of(null)}
        this.orderService.updateOrderSubscription(data);
        this.dialogRef.close(true)
        return of(data)
      }))
    }
  }

  payAmount() {
    if (!this.validateTransaction()) { return }

    if (this.posPayment && this.terminalSettings.triposLaneID) {
      if (!this.tipValue) {this.tipValue = '0'}

      const item = this.initTransaction(this.posPayment, this.terminalSettings);
      item.transactionId   = this.posPayment.refNumber;
      const site = this.siteService.getAssignedSite();
      this.processing = true;
      this.errorMessage = ''

      this.processing$ =  this.methodsService.sale(site, item )
        .pipe(switchMap(data => {
            this.errorMessage = ''
            if (data._hasErrors) {
              this.processing = false;
              this.displayErrors(data)
              return of (null)
            }
            this.posPayment.saleType      = 1;
            return this.paymentMethodsService.processTriPOSResponse(data ,this.posPayment, this.order)
          }
        )).pipe(switchMap(data => {
     
          if (!data || !data.payment) {
            this.siteService.notify('No Payment found', 'close', 4000, 'red');
            return of(null)
          }
          
          const payment = data.payment
          const trans = data.trans
          const order = data.order;

          if (!data || !data.order) {
            this.errorMessage = 'Unknown error occurred.'
            return this.orderService.getOrder(site, payment.orderID.toString(), false)
          }

          if (!this.paymentMethodsService.isTriPOSApproved(data.trans)) {
            this.errorMessage = trans?.captureStatus;
            return of(data.order)
          }
    
          this.reset()
          this.dialogRef.close(true)
          return of(data.order)

        })).pipe(switchMap(data => {
          this.orderService.updateOrderSubscription(data);
          return of(data);
      }))
    }
  }

  displayErrors(trans) {
    trans._errors.forEach(item => {
      this.errorMessage = `${item?.exceptionMessage} ${this.errorMessage}`
    })
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
          if (data._hasErrors) {
            this.displayErrors(data)
            return of (null)
          }
          return   this.paymentMethodsService.processTriPOSResponse(data ,this.posPayment, this.order)
      })).pipe(switchMap(data => {
          this.reset()
          return this.orderService.getOrder(site, this.order.id.toString(), false)
      })).pipe(switchMap(data => {
          this.orderService.updateOrderSubscription(data);
          this.dialogRef.close(true)
          return of(data)
      }))
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

  close() {
    this.dialogRef.close()
  }

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
