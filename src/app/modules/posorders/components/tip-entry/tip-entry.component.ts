import { Component, OnInit,Input, Inject,EventEmitter , Output} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { TransactionUISettings,  UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';

@Component({
  selector: 'tip-entry-amount',
  templateUrl: './tip-entry.component.html',
  styleUrls: ['./tip-entry.component.scss']
})
export class TipEntryComponent implements OnInit  {
  uiTransactions: TransactionUISettings
  uiTransactions$ : Observable<TransactionUISettings>;

  inputForm             : FormGroup;
  @Input()  paymentMethod: IPaymentMethod;
  @Input()  order        : IPOSOrder;
  @Input()  payment      : IPOSPayment;
  @Output() outPutTip   = new EventEmitter();
  @Output() specifiedTipAmount  = new EventEmitter();
  step                  = 1;
  @Input() changeDue   : any;

  constructor(
              private snackBar : MatSnackBar,
              private fb       : FormBuilder,
              private router   : Router,
              private uISettingsService: UISettingsService,

            )
  {

  }

  ngOnInit(): void {
    const i = 0;
  }

  customTipAmount(amount) {
    if (this.payment) {
      const value = +amount;
      console.log('value', value)
      this.tip( ( amount )  )
    }
  }

  specifiedTip(amount: number) {
    const payment = this.payment
    if (payment) {
      const value = payment.amountPaid * (amount / 100 );
      this.tip(  +value.toFixed(2)  )
      this.specifiedTipAmount.emit( +value.toFixed(2))
    }
  }

  tip(amount: number) {
    this.outPutTip.emit(amount)
  }

  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.snackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

}