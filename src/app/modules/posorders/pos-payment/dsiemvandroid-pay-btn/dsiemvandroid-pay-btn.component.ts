import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { IPaymentMethod } from 'ngx-paypal';
import { Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'dsiemvandroid-pay-btn',
  templateUrl: './dsiemvandroid-pay-btn.component.html',
  styleUrls: ['./dsiemvandroid-pay-btn.component.scss']
})
export class DSIEMVAndroidPayBtnComponent implements OnInit {

    @Input() order: IPOSOrder;
    @Input() uiTransactions: TransactionUISettings;
    @Input() platForm: string;
    @Input() creditBalanceRemaining: number;
    @Input() stripeTipValue: string;
    @Input() paymentAmount: number;
    stripeEnabled: boolean;
    paymentMethod$: Observable<IPaymentMethod>;
    @Output() setStep = new EventEmitter()
    stepSelection: number;
    paymentMethod: IPaymentMethod;
    @Input() devicename : string;

    constructor(
      private paymentsMethodsService: PaymentsMethodsProcessService,
      public  platFormService : PlatformService,) { }

    ngOnInit(): void {
      const i = 0
      // this.uiTransactions.dsiEMVAndroidEnabled
    }

    processDSIEMVAndroidCreditCardPayment(manual: boolean) {
      const order = this.order;
      if (order) {
        this.paymentsMethodsService.processDSIEMVAndroidCreditVoid(order, this.creditBalanceRemaining, manual, this.uiTransactions)
      }
    }
  }
