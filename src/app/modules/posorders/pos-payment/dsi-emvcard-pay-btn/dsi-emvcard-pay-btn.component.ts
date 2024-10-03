import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IPaymentMethod } from 'ngx-paypal';
import { Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'dsi-emvcard-pay-btn',
  templateUrl: './dsi-emvcard-pay-btn.component.html',
  styleUrls: ['./dsi-emvcard-pay-btn.component.scss']
})
export class DsiEMVCardPayBtnComponent implements OnInit {

  
  @ViewChild('regularStyle') regularStyle: TemplateRef<any>;
  @ViewChild('footerStyle') footerStyle: TemplateRef<any>;

  @Input() footerButton: boolean;
  @Input() dCap : boolean;
  @Input() order: IPOSOrder;
  @Input() uiTransactions: TransactionUISettings;
  @Input() platForm: string;
  @Input() creditBalanceRemaining: number;
  @Input() stripeTipValue: string;
  @Input() paymentAmount: number;
  @Input() preAuth: boolean;
  @Input() autoPay: boolean;
  @Input() manual: boolean;
  @Input() creditOnly: boolean;
  @Input() debitOnly: boolean;
  themeClass = '';
  stripeEnabled: boolean;
  paymentMethod$: Observable<IPaymentMethod>;

  stepSelection: number;
  paymentMethod: IPaymentMethod;
  @Input() devicename : string;

  constructor(
    private sitesService    : SitesService,
    private dsiProcess      : DSIProcessService,
    private paymentsMethodsService: PaymentsMethodsProcessService,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {

    if (this.debitOnly) { 
      this.themeClass = 'button-debit payment-buttons';
    }
    if (this.creditOnly) { 
      this.themeClass = 'button-credit payment-buttons';
    }
    if (this.manual) { 
      this.themeClass = 'button-manual payment-buttons';
    }
    const i = 0
  }

  processPayment(manual: boolean) {
    if (this.uiTransactions && this.uiTransactions.dCapEnabled) {
      if (this.preAuth) {
        this.processDCAPPreAuthCardPayment(manual)
        return;
      }
      this.processDCAPCreditCardPayment(manual)
      return;
    }
    this.processDSICreditCardPayment(manual)
    return;
  }

  processDSICreditCardPayment(manual: boolean) {
    const order = this.order;
    if (order) {
      let amount = this.getValidAmount()
      this.paymentsMethodsService.processSubDSIEMVCreditPayment(order, amount, manual)
    }
  }

  processDCAPCreditCardPayment(manual: boolean) {
    const order = this.order;
    if (order) {
      let amount = this.getValidAmount()
      this.paymentsMethodsService.processDCAPVCreditPayment(order, amount, manual, this.autoPay, false, this.creditOnly, this.debitOnly)
    }
  }

  processDCAPPreAuthCardPayment(manual: boolean) {
    const order = this.order;
    if (order) {
      let amount = this.getValidAmount()
      this.paymentsMethodsService.processDCAPVCreditPayment(order, amount, manual, false, true, this.creditOnly, this.debitOnly)
    }
  }

  getValidAmount() {
    const order = this.order;
    let amount = this.creditBalanceRemaining
    if (order) {
      if (this.paymentAmount && this.paymentAmount !=0) {
        amount= this.roundToPrecision(  this.paymentAmount, 2) 
      }
      if (amount > this.creditBalanceRemaining) {
        amount  = this.roundToPrecision( this.creditBalanceRemaining, 2) 
      }
    }
    return  this.roundToPrecision(amount,2)
  }

  async dsiResetDevice() {
    const response  = await this.dsiProcess.pinPadReset( );
    this.sitesService.notify('PIN Pad Reset', 'Success', 1000)
  }

  
  roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    const valueResult = Math.round(value * factor) / factor;
    return valueResult
  }

  get  buttonView() {
    if (this.footerButton) {
      return this.footerStyle;
    }
    return this.regularStyle;
  }
  // @Input() order: IPOSOrder;
  // @Input() uiTransactions: TransactionUISettings;
  // @Input() platForm: string;
  // @Input() creditBalanceRemaining: number;
  // @Input() stripeTipValue: string;
  // @Input() paymentAmount: number;
  // @Input() preAuth: boolean;
  // @Input() autoPay: boolean;
  // stripeEnabled: boolean;
  // paymentMethod$: Observable<IPaymentMethod>;

  // stepSelection: number;
  // paymentMethod: IPaymentMethod;
  // @Input() devicename : string;

  // constructor(
  //   private sitesService    : SitesService,
  //   private dsiProcess      : DSIProcessService,
  //   private paymentsMethodsService: PaymentsMethodsProcessService,
  //   public  platFormService : PlatformService,) { }

  // ngOnInit(): void {
  //   const i = 0
  // }

  // processPayment(manual: boolean) {
  //   if (this.uiTransactions && this.uiTransactions.dCapEnabled) {
  //     if (this.preAuth) {
  //       this.processDCAPPreAuthCardPayment(manual)
  //       return;
  //     }
  //     this.processDCAPCreditCardPayment(manual)
  //     return;
  //   }
  //   this.processDSICreditCardPayment(manual)
  //   return;
  // }

  // processDSICreditCardPayment(manual: boolean) {
  //   const order = this.order;
  //   if (order) {
  //     let amount = this.getValidAmount()
  //     this.paymentsMethodsService.processSubDSIEMVCreditPayment(order, amount, manual)
  //   }
  // }

  // processDCAPCreditCardPayment(manual: boolean) {
  //   const order = this.order;
  //   if (order) {
  //     let amount = this.getValidAmount()
  //     this.paymentsMethodsService.processDCAPVCreditPayment(order, amount, manual, this.autoPay, false)
  //   }
  // }

  // processDCAPPreAuthCardPayment(manual: boolean) {
  //   const order = this.order;
  //   if (order) {
  //     let amount = this.getValidAmount()
  //     this.paymentsMethodsService.processDCAPVCreditPayment(order, amount, manual, false, true)
  //   }
  // }

  // getValidAmount() {
  //   const order = this.order;
  //   let amount = this.creditBalanceRemaining
  //   if (order) {
  //     if (this.paymentAmount && this.paymentAmount !=0) {
  //       amount = this.paymentAmount
  //     }
  //     if (amount > this.creditBalanceRemaining) {
  //       amount  = this.creditBalanceRemaining
  //     }
  //   }
  //   return amount
  // }

  // async dsiResetDevice() {
  //   const response  = await this.dsiProcess.pinPadReset( );
  //   this.sitesService.notify('PIN Pad Reset', 'Success', 1000)
  // }

  // processDCAPCreditCardPaymentSub(manual: boolean) {
  //   const site = this.siteService.getAssignedSite();
  //   const  posPayment = {} as IPOSPayment;
  //   posPayment.orderID = order.id;
  //   posPayment.zrun = order.zrun;
  //   posPayment.reportRunID = order.reportRunID;

  //   const payment$  = this.paymentService.postPOSPayment(site, posPayment)

  //   const paymentProcess = {order: order, posPayment: posPayment, settings: settings, manualPrompt: manualPrompt, action: 1}

  //   return payment$.pipe(
  //     switchMap(data =>
  //     {
  //       data.amountPaid = amount;
  //       paymentProcess.posPayment = data;
  //       this.dialogRef = this.dialogOptions.openTriPOSTransaction(
  //         paymentProcess
  //       );
  //       this._dialog.next(this.dialogRef)
  //       return of(data)
  //     }
  //   ))
  // }

}
