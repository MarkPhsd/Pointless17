import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IPaymentMethod } from 'ngx-paypal';
import { Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'dsi-emvcard-pay-btn',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './dsi-emvcard-pay-btn.component.html',
  styleUrls: ['./dsi-emvcard-pay-btn.component.scss']
})
export class DsiEMVCardPayBtnComponent implements OnInit, OnChanges {

  @ViewChild('regularStyle') regularStyle: TemplateRef<any>;
  @ViewChild('footerStyle')  footerStyle: TemplateRef<any>;
  @Input()  footerText: string;
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
    private paymentsMethodsService: PaymentsMethodsProcessService,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    if (this.debitOnly) {
      if (this.footerText) {
        this.themeClass = 'button-debit';
      } else {
        this.themeClass = 'button-debit payment-buttons';
      }
    }
    if (this.creditOnly) {
      if (this.footerText) {
        this.themeClass = 'button-credit';
      } else {
        this.themeClass = 'button-credit payment-buttons';
      }
    }
    if (this.manual) {
      if (this.footerText) {
        this.themeClass = 'button-manual';
      } else {
        this.themeClass = 'button-manual payment-buttons';
      }
    }
    const i = 0
  }

  ngOnChanges() {
    return this.buttonView
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

}
