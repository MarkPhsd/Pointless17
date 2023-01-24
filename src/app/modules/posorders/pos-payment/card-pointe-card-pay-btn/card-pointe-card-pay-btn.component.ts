import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IPaymentMethod } from 'ngx-paypal';
import { Observable } from 'rxjs';
import { CardPointMethodsService } from 'src/app/modules/payment-processing/services';
import { IPOSOrder } from 'src/app/_interfaces';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'card-pointe-card-pay-btn',
  templateUrl: './card-pointe-card-pay-btn.component.html',
  styleUrls: ['./card-pointe-card-pay-btn.component.scss']
})
export class CardPointeCardPayBtnComponent implements OnInit {

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
    private uISettingsService: UISettingsService,
    private sitesService    : SitesService,
    private dialog          : MatDialog,
    private dsiProcess      : DSIProcessService,
    private paymentsMethodsService: PaymentsMethodsProcessService,
    private orderMethodsService: OrderMethodsService,
    private paymentMethodService: PaymentMethodsService,
    private cardPointMethodsService: CardPointMethodsService,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    const i = 0
  }

  applyBoltPayment(manual: boolean) {
    const order = this.order;
    if (order) {
      this.cardPointMethodsService.processSubCreditPayment(order, this.creditBalanceRemaining, false, this.uiTransactions)
    }
  }

}
