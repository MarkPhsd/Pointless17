import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Navigation, Router } from '@angular/router';
import { IPaymentMethod } from 'ngx-paypal';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'cash-payment-buttons',
  templateUrl: './cash-payment-button.component.html',
  styleUrls: ['./cash-payment-button.component.scss']
})
export class CashPaymentButtonComponent implements OnInit {

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
  @Output() setStep = new EventEmitter()
  stepSelection: number;
  paymentMethod: IPaymentMethod;
  action$: Observable<any>;

  constructor(
    private uISettingsService: UISettingsService,
    private sitesService    : SitesService,
    private dialog          : MatDialog,
    private dsiProcess      : DSIProcessService,
    private orderService    : OrdersService,
    private paymentsMethodsService: PaymentsMethodsProcessService,
    private orderMethodsService: OrderMethodsService,
    private paymentMethodService: PaymentMethodsService,
    private router: Router,
    public  platFormService : PlatformService,) { }

  ngOnInit(): void {
    const i = 0
  }

  applyCashPayment(amount: number) {
    const site = this.sitesService.getAssignedSite()
    this.posPayment = {} as IPOSPayment;
    console.log('original order at apply cash', this.order)
    const order = this.order;

    if (this.posPayment) {
      this.action$ = this.paymentMethodService.getCashPaymentMethod(site, 'Cash').pipe(switchMap(method => {

        if (!method) {
          this.sitesService.notify('Cash Payment not found.', 'close', 5000, 'red')
          return of(null)
        }

        return this.paymentsMethodsService.processCashPayment(site, this.posPayment, order, amount, method )

      })).pipe(switchMap( data => {

        // console.log('process cash payment results', data);

        if (!data) {
          this.sitesService.notify('Cash payment not successfull ', 'close', 5000, 'red')
          return of(null)
        }

        return of(data.order) // this.orderService.getOrder(site, order.id.toString(), false )

      })).pipe(switchMap(data => {

        // console.log('data from getOrder', data, order)
        if (!order) {
          this.sitesService.notify('Order not found ', 'close', 5000, 'red')
          return of(null)
        }
        this.orderService.updateOrderSubscription(data)
        this.router.navigate(['pos-payment']);
        return of(data)

      })),
      catchError(data => {

        this.sitesService.notify('Error occured: ' + data.toString(), 'close', 5000, 'red')
        return of(data)

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
