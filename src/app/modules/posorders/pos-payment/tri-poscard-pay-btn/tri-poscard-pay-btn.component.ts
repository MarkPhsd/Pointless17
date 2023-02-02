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
import { TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';

@Component({
  selector: 'app-tri-poscard-pay-btn',
  templateUrl: './tri-poscard-pay-btn.component.html',
  styleUrls: ['./tri-poscard-pay-btn.component.scss']
})
export class TriPOSCardPayBtnComponent implements OnInit {

  action$: Observable<any>;
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
    private triposMethod: TriPOSMethodService,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    const i = 0
  }

  processTransaction(manual: boolean) {
    const order = this.order;
    if (order) {
      console.log('process')
      this.action$ = this.triposMethod.openDialogCreditPayment(order, this.creditBalanceRemaining, false, this.uiTransactions)
    }
  }

}
