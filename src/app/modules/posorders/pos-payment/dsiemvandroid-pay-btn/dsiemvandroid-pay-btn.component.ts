import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { IPaymentMethod } from 'ngx-paypal';
import { Observable } from 'rxjs';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings, } from 'src/app/_services/system/settings/uisettings.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'dsiemvandroid-pay-btn',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './dsiemvandroid-pay-btn.component.html',
  styleUrls: ['./dsiemvandroid-pay-btn.component.scss']
})
export class DSIEMVAndroidPayBtnComponent implements OnInit {

    @ViewChild('regularStyle') regularStyle: TemplateRef<any>;
    @ViewChild('footerStyle') footerStyle: TemplateRef<any>;

    @Input() order: IPOSOrder;
    @Input() uiTransactions: TransactionUISettings;
    @Input() platForm: string;
    @Input() creditBalanceRemaining: number;
    @Input() stripeTipValue: string;
    @Input() paymentAmount: number;
    @Input() footerButton: boolean;

    @Input() posPayment: IPOSPayment;
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
      // this.uiTransactions.
    }

    processDSIEMVAndroidCreditCardPayment(manual: boolean) {
      const order = this.order;
      if (order) {
        if (this.posPayment) {
          this.paymentsMethodsService.openPaymentDialog(this.posPayment, 3)
          return;
        }
        this.paymentsMethodsService.processDSIEMVAndroidTransaction(order, this.creditBalanceRemaining,
                                                                    manual, this.uiTransactions)
      }
    }

    get  buttonView() {
      if (this.footerButton) {
        return this.footerStyle;
      }
      return this.regularStyle;
    }

  }
