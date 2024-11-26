import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IPOSOrder } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'paypal-card-pay-btn',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,

  SharedPipesModule],
  templateUrl: './paypal-card-pay-btn.component.html',
  styleUrls: ['./paypal-card-pay-btn.component.scss']
})
export class PaypalCardPayBtnComponent implements OnInit {

  @Input() order: IPOSOrder;
  @Input() uiTransactions: TransactionUISettings;
  @Input() platForm: string;
  @Input() creditBalanceRemaining: number;

  constructor(
    private paymentsMethodsService: PaymentsMethodsProcessService,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    const i = 0
    // console.log(this.uiTransactions)
  }

  applyPayPalPayment(manual: boolean) {
    const order = this.order;
    if (order) {
      this.paymentsMethodsService.processPayPalCreditPayment(order, this.creditBalanceRemaining, false, this.uiTransactions)
    }
  }
}
