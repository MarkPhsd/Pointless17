import { Component,  Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPaymentMethod } from 'ngx-paypal';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'cash-payment-buttons',
  templateUrl: './cash-payment-button.component.html',
  styleUrls: ['./cash-payment-button.component.scss']
})
export class CashPaymentButtonComponent implements OnInit {

  themeClass = 'dark-theme-green';

  @Input() order: IPOSOrder;
  @Input() uiTransactions: TransactionUISettings;
  @Input() platForm: string;
  @Input() creditBalanceRemaining: number;
  @Input() stripeTipValue: string;
  @Input() paymentAmount: number;
  @Input() posPayment: IPOSPayment;
  @Input() isApp: boolean;
  @Input() devicename : string;

  stripeEnabled: boolean;
  paymentMethod$: Observable<IPaymentMethod>;

  stepSelection: number;
  paymentMethod: IPaymentMethod;
  action$: Observable<any>;

  constructor(
    private sitesService    : SitesService,
    private paymentsMethodsService: PaymentsMethodsProcessService,
    private orderMethodsService: OrderMethodsService,
    private paymentMethodService: PaymentMethodsService,
    private router: Router,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    const i = 0
  }

  applyCashPayment(amount: number) {

    if (amount == 0) {
      this.cashPayment()
      return;
    }
    const site = this.sitesService.getAssignedSite()
    this.posPayment = {} as IPOSPayment;
    const order = this.order;

    if (this.posPayment) {
      this.action$ = this.paymentMethodService.getCashPaymentMethod(site, 'Cash').pipe(switchMap(method => {
        if (!method) {
          return this.sitesService.notifyObs('Cash Payment not found.', 'close', 5000, 'red')
        }
        return this.paymentsMethodsService.processCashPayment(site, this.posPayment, order, amount, method )
      })).pipe(switchMap( data => {
        if (!data) {
          return this.sitesService.notifyObs('Cash payment not successfull ', 'close', 5000, 'red')
        }
        return of(data.order)
      })).pipe(switchMap(data => {
        if (!order) {
          return this.sitesService.notifyObs('Order not found ', 'close', 5000, 'red')
        }
        this.orderMethodsService.updateOrderSubscription(data)
        this.router.navigate(['pos-payment']);
        return of(data)
      })),
      catchError(data => {
        return this.sitesService.notifyObs('Error occured: ' + data.toString(), 'close', 5000, 'red')
      })
    }

    if (!this.posPayment) {
      this.sitesService.notify('No payment assigned', 'Alert', 2000)
    }
  }

  cashPayment() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.paymentMethodService.getPaymentMethodByName(site,'cash').pipe(switchMap(data => {
      this.orderMethodsService.updatePaymentMethodStep(data)
      this.router.navigate(['pos-payment']);
      return of(data)
    }))
  }


}
