import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { Observable,switchMap,of   } from 'rxjs';
import { StripeCheckOutComponent } from 'src/app/modules/payment-processing/stripe-check-out/stripe-check-out.component';
import { IPOSOrder } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { StripeAPISettings, TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'stripe-card-pay-btn',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './stripe-card-pay-btn.component.html',
  styleUrls: ['./stripe-card-pay-btn.component.scss']
})
export class StripeCardPayBtnComponent implements OnInit {

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

  // paymentMethodService
  constructor(
    private uISettingsService: UISettingsService,
    private sitesService: SitesService,
    private dialog: MatDialog,
    private paymentsMethodsProcessService: PaymentsMethodsProcessService,
    private orderMethodsService: OrderMethodsService,
    private paymentMethodService: PaymentMethodsService,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    const i = 0
    this.initStripe();
    const site = this.sitesService.getAssignedSite()
    this.paymentMethod$ = this.paymentMethodService.getPaymentMethodByName(site,'stripe').pipe(
      switchMap(data => {
        this.paymentMethod = data;
        return of(data)
      })
    )
  }

  addStripeTipPercent(value) {
    if (value) {
      this.stripeTipValue = ( this.paymentAmount * (value/100) ).toFixed(2);
    }
  }

  initStripe() {
    this.uISettingsService.getSetting('StripeAPISettings').subscribe(data => {
      if (data) {
        const stripeAPISettings   = JSON.parse(data.text) as StripeAPISettings;
        this.stripeEnabled        = stripeAPISettings?.enabled;
      }
    });
  }

  applyStripePayment() {
    const order = this.order;
    if (order) {
      const data = {title: 'Payment', amount: this.creditBalanceRemaining, tip: this.stripeTipValue}
      this.openStripePayment(data)
    }
  }

  openStripePayment(data: any){
    let dialogRef: any;
    const site = this.sitesService.getAssignedSite();
    dialogRef = this.dialog.open(StripeCheckOutComponent,
      { width:        '100vw',
        minWidth:     '100vw',
        maxWidth:     '100vw',
        height:       '800px',
        minHeight:    '800px',
        data: data,
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return }
      this.paymentsMethodsProcessService.processResults(result, this.paymentMethod);
      this.resetPaymentMethod();
    });

  }

  resetPaymentMethod() {
    // this.initForms();
    // this.paymentMethod = null;
    this.stepSelection = 1;
  }


}


