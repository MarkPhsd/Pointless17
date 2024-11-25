import { CommonModule } from '@angular/common';
import { Component, OnInit,Input, Inject,EventEmitter , Output} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings,  UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { KeyPadComponent } from 'src/app/shared/widgets/key-pad/key-pad.component';

@Component({
  selector: 'tip-entry-amount',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
  KeyPadComponent,
  ],
  templateUrl: './tip-entry.component.html',
  styleUrls: ['./tip-entry.component.scss']
})
export class TipEntryComponent implements OnInit  {
  uiTransactions: TransactionUISettings
  uiTransactions$ : Observable<TransactionUISettings>;
  customAmount: boolean;
  inputForm             : UntypedFormGroup;
  @Input()  paymentMethod: IPaymentMethod;
  @Input()  order        : IPOSOrder;
  @Input()  payment      : IPOSPayment;
  @Output() outPutTip   = new EventEmitter();
  @Output() specifiedTipAmount  = new EventEmitter();
  step                  = 1;
  @Input() changeDue   : any;
  inputDisabled: boolean;
  @Input() hideKeyPad: boolean;

  constructor(
              private snackBar : MatSnackBar,
              platFormService: PlatformService
            )
  {

    if (platFormService.androidApp) {
      this.inputDisabled = true;
    }
  }

  ngOnInit(): void {
    const i = 0;
  }

  customTipAmount(amount: number) {
    if (this.payment) {
      const value = parseFloat(amount.toString());
      if (!isNaN(value)) {
        const formattedValue = value.toFixed(2);
        console.log('customTipAmount', amount, formattedValue);
        this.tip(parseFloat(formattedValue));
        this.specifiedTipAmount.emit(parseFloat(formattedValue));
      } else {
        console.error('Invalid amount:', amount);
      }
    }
  }

  specifiedTip(amount: number) {
    if (this.payment) {
      const tipAmount =  this.payment?.amountPaid * (amount/100);
      const value = parseFloat(tipAmount.toString());
      if (!isNaN(value)) {
        const formattedValue = value.toFixed(2);
        console.log('specifiedTip', tipAmount, formattedValue);
        this.tip(parseFloat(formattedValue));
        this.specifiedTipAmount.emit(parseFloat(formattedValue));
      } else {
        console.error('Invalid amount:', tipAmount);
      }
    }
  }

  tip(amount: number) {
    const formattedValue = amount.toFixed(2);
    this.specifiedTipAmount.emit(parseFloat(formattedValue));
    // this.outPutTip.emit(amount)
  }

  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.snackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

}
