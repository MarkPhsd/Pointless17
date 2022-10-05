import { Component, OnInit, Input , OnDestroy} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPOSOrder, IPOSPayment, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { CardPointMethodsService } from '../../payment-processing/services';

@Component({
  selector: 'app-payment-balance',
  templateUrl: './payment-balance.component.html',
  styleUrls: ['./payment-balance.component.scss']
})
export class PaymentBalanceComponent implements OnInit, OnDestroy {

  @Input() order : IPOSOrder;
  @Input() mainPanel = true;
  @Input() uiTransactions: TransactionUISettings;

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
              private toolBarUI       : ToolBarUIService,
              private matSnackBar   : MatSnackBar,
              public printingService: PrintingService,
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
    this.router.navigate(["/currentorder/",{mainPanel:true}]);
    this.toolbarUIService.updateOrderBar(false)
    this.toolbarUIService.resetOrderBar(true)
  }

  capture(item: IPOSPayment) {
    if (this.order) {
      this.methodsService.processCapture(item, this.order.balanceRemaining,
                                                   this.uiTransactions)
    }
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

   async getPaymentMethod(id: number) {
      const method = await this.paymentMethodService.getCacheMethod(this.site ,id).pipe().toPromise();
      console.log('method name', method.name)
      if (method) {
        return method.name
      }
      return ''
   }

   voidPayment(payment) {
    //run void method.
    if (payment) {
      //only manager can void.
      this.productEditButtonService.openVoidPaymentDialog(payment)
      return
    }
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
    if (item) {
      this.printingService.previewReceipt()
    }
   }

   notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

}
