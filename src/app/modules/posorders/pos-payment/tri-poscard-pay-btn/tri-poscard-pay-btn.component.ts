import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { IPaymentMethod } from 'ngx-paypal';
import { Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';

import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

import { TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-tri-poscard-pay-btn',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
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
    private triposMethod: TriPOSMethodService,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    const i = 0
  }

  processTransaction(manual: boolean) {
    const order = this.order;
    if (order) {
      let amount = this.creditBalanceRemaining
      if (this.paymentAmount && this.paymentAmount !=0) {
        amount = this.paymentAmount
      }
      this.action$ = this.triposMethod.openDialogCreditPayment(order, amount, false, this.uiTransactions)
    }
  }

}
