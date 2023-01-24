import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPaymentMethod } from 'ngx-paypal';
import { Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { StoreCreditMethodsService } from 'src/app/_services/storecredit/store-credit-methods.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'gift-card-pay-btn',
  templateUrl: './gift-card-pay-btn.component.html',
  styleUrls: ['./gift-card-pay-btn.component.scss']
})
export class GiftCardPayBtnComponent implements OnInit {

  @Input() order: IPOSOrder;
  @Input() uiTransactions: TransactionUISettings;
  @Input() platForm: string;
  @Input() creditBalanceRemaining: number;
  @Input() stripeTipValue: string;
  @Input() paymentAmount: number;
  @Input() paymentsEqualTotal: boolean;
  stripeEnabled: boolean;
  paymentMethod$: Observable<IPaymentMethod>;
  @Output() setStep = new EventEmitter()
  stepSelection: number;
  paymentMethod: IPaymentMethod;
  @Input() devicename : string;

  constructor(private storeCreditMethodsService: StoreCreditMethodsService ) { }

  ngOnInit(): void {
    const i = 0
  }

  giftCard() {
    if (this.order) {
      this.storeCreditMethodsService.openStoreCreditPopUp(0, 0)
    }
  }

}
