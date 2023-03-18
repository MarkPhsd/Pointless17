import { Component, OnInit, Input , OnDestroy} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';
import { CardPointMethodsService } from '../../payment-processing/services';

@Component({
  selector: 'app-payment-balance',
  templateUrl: './payment-balance.component.html',
  styleUrls: ['./payment-balance.component.scss']
})
export class PaymentBalanceComponent implements OnInit, OnDestroy {
  @Input() qrOrder :boolean;
  @Input() order : IPOSOrder;
  @Input() mainPanel = true;
  @Input() uiTransactions: TransactionUISettings;
  void$: Observable<any>;
  action$: Observable<any>;
  printing$: Observable<any>;
  paymentsEqualTotal: boolean;
  site           : ISite;
  _order:          Subscription;
  _currentPayment: Subscription;
  posPayment     : IPOSPayment;
  isAuthorized   = false;
  isUser: boolean;
  hidePrint:      boolean;
  href          : string;

  async initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })

    this._currentPayment = this.paymentService.currentPayment$.subscribe( data => {
      this.posPayment = data
    })
  }

  constructor(private orderService: OrdersService,
              private orderMethodsService: OrderMethodsService,
              private siteService: SitesService,
              private paymentService: POSPaymentService,
              private paymentMethodService: PaymentMethodsService,
              public userAuthorization: UserAuthorizationService,
              private productEditButtonService: ProductEditButtonService,
              private editDialog      : ProductEditButtonService,
              private methodsService: CardPointMethodsService,
              private triposMethodService: TriPOSMethodService,
              private toolBarUI       : ToolBarUIService,
              private matSnackBar   : MatSnackBar,
              public printingService: PrintingService,
              private settingsService: SettingsService,
              private toolbarUIService  : ToolBarUIService,
              private router: Router) {
   }

   ngOnInit() {
    this.href = this.router.url;
    this.site = this.siteService.getAssignedSite();
    this.initSubscriptions();
    this.paymentsEqualTotal = false;
    if (this.order) {
      if ( this.order.balanceRemaining == 0)  {
        this.paymentsEqualTotal = true;
      }
      if ( this.order.balanceRemaining > 0)  {
        this.paymentsEqualTotal = false;
      }
    }

    if (this.userAuthorization.user.roles === 'user') {
      this.isUser = true;
    }
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')

    if (this.href.substring(0, 11 ) === '/pos-payment') {
      this.hidePrint = true;
      return;
    }
  }

  editCart() {
    this.toolbarUIService.updateOrderBar(false)
    this.toolbarUIService.resetOrderBar(true)
    this.router.navigate(["/currentorder/", {mainPanel:true}]);
  }

  capture(item: IPOSPayment) {
    const site = this.siteService.getAssignedSite();
    if (this.order && this.uiTransactions.cardPointPreAuth && this.uiTransactions.cardPointBoltEnabled) {
      const payment$ =  this.paymentService.getPOSPayment(site, item.id, false)
      this.action$ = payment$.pipe(switchMap(payment => {
          this.methodsService.processCapture(item, this.order.creditBalanceRemaining,
                                                      this.uiTransactions)
                                                      return of(payment)
      }))
    }
  }

  captureTriPOS(item: IPOSPayment) {
    this.uiTransactions.triposEnabled
    const site = this.siteService.getAssignedSite();
    const payment$ =  this.paymentService.getPOSPayment(site, item.id, false)
    this.action$ = payment$.pipe(switchMap(payment => {
      let amount = this.order.creditBalanceRemaining;
      if (this.uiTransactions.triposEnabled) {
        amount = item.amountPaid;
      }
      return this.triposMethodService.openDialogCompleteCreditPayment(this.order, amount,
                                                                payment, this.uiTransactions)
    }))
  }

  editPayment(payment: IPOSPayment) {
      //get payment
      const site = this.siteService.getAssignedSite();
      if (payment.paymentMethodID == 0) {
        this.editDialog.openChangeDueDialog(payment, null, this.order)
        return;
      }
      const method$ = this.paymentMethodService.getPaymentMethod(site,payment.paymentMethodID)
      method$.subscribe( method => {
        this.editDialog.openChangeDueDialog(payment, method, this.order)
      })
   }

   ngOnDestroy(): void {
     if (this._currentPayment) {
      this._currentPayment.unsubscribe();
     }
     if (this._order) {
       this._order.unsubscribe();
     }
   }

   closeOrder() {
     if (this.order) {
     const site = this.siteService.getAssignedSite();
     const result$ = this.orderService.completeOrder(site, this.order.id)
     result$.subscribe(data=>  {
       this.router.navigateByUrl('/pos-orders')
       this.paymentService.updatePaymentSubscription(null)
       this.orderService.updateOrderSubscription(null)
       this.toolBarUI.updateOrderBar(false)
     })
    }
   }

   exitOrder() {
    this.orderMethodsService.clearOrder()
   }

   getPaymentMethod(id: number) {
      return this.paymentMethodService.getCacheMethod(this.site ,id)
   }

   voidPayment(payment) {
    //run void method.
    const message = 'Paypal can be voided from the POS Sales, but must be completed in the paypal account itself.'
    const method$ = this.getPaymentMethod(payment.paymentMethodID)
    this.void$ = method$.pipe(switchMap( data=> {
        if (payment && data.name === 'paypal') {
          this.notify(message, 'Alert', 2000)
        }
        const itemdata = { payment: payment, uiSettings: this.uiTransactions}
        this.productEditButtonService.openVoidPaymentDialog(itemdata)
        return of(data)
        }
      )
    )
  }

   requestVoidPayment(payment) {
    //run void method.
    if (payment) {
      //only manager can void.
      this.productEditButtonService.openVoidPaymentDialog(payment)
      return
    }
   }

   printPaymentReceipt(item) {

    this.orderService.selectedPayment = item;
    console.log(item)
    if (item && (item.groupID && item.groupID != 0)) {
      const site = this.siteService.getAssignedSite();
        this.printing$ = this.orderService.getPOSOrderGroupTotal(site, item.orderID, item.groupID).pipe(switchMap(data => {
        this.orderService.printOrder = data;
        this.printingService.previewReceipt();
        return of(data)
      }))
      return;
    }

    if (item) {
      this.printingService.previewReceipt()
    }
   }

   notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

}
