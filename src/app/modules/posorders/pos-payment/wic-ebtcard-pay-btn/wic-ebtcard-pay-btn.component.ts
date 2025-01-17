import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { Observable,switchMap,of   } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'wic-ebtcard-pay-btn',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './wic-ebtcard-pay-btn.component.html',
  styleUrls: ['./wic-ebtcard-pay-btn.component.scss']
})
export class WicEBTCardPayBtnComponent implements OnInit {

  @Input() devicename: string;
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
  wicPayemnt : IPaymentMethod
  ebtPayment: IPaymentMethod;
  wicPayemnt$ : Observable<IPaymentMethod>
  ebtPayment$ : Observable<IPaymentMethod>
  // paymentMethodService
  constructor(
    private uISettingsService: UISettingsService,
    private sitesService: SitesService,
    private dialog: MatDialog,
    private paymentsMethodsService: PaymentsMethodsProcessService,
    private orderMethodsService: OrderMethodsService,
    private paymentMethodService: PaymentMethodsService,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    const i = 0
    const site = this.sitesService.getAssignedSite()
    this.ebtPayment$ = this.paymentMethodService.getPaymentMethodByName(site,'wic').pipe(
      switchMap(data => {
        this.ebtPayment = data;
        return of(data)
      })
    )
    this.wicPayemnt$ = this.paymentMethodService.getPaymentMethodByName(site,'ebt').pipe(
      switchMap(data => {
        this.wicPayemnt = data;
        return of(data)
      })
    )
  }

  applyEBTPayment() {

  }

  applyWICPayment() {

  }
}
