import { Component, OnInit, Input , OnDestroy} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPOSOrder, IPOSPayment, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'app-payment-balance',
  templateUrl: './payment-balance.component.html',
  styleUrls: ['./payment-balance.component.scss']
})
export class PaymentBalanceComponent implements OnInit, OnDestroy {

  @Input() order : IPOSOrder;

  paymentsEqualTotal: boolean;
  site           : ISite;
  _order:          Subscription;
  _currentPayment: Subscription;
  posPayment     : IPOSPayment;
  isAuthorized   = false;

  async initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
      console.log('balance updated', data)
    })
    this._currentPayment = this.paymentService.currentPayment$.subscribe( data => {
      this.posPayment = data
    })
  }

  constructor(private orderService: OrdersService,
              private siteService: SitesService,
              private paymentService: POSPaymentService,
              private paymentMethodService: PaymentMethodsService,
              private userAuthorization: UserAuthorizationService,
              private productEditButtonService: ProductEditButtonService,
              private editDialog      : ProductEditButtonService,
              private toolBarUI       : ToolBarUIService,
              private matSnackBar   : MatSnackBar,
              private printingService: PrintingService,
              private router: Router) {
   }

   ngOnInit() {
    this.site = this.siteService.getAssignedSite();
    this.paymentsEqualTotal = false;
    if (this.order) {
      if ( this.order.balanceRemaining == 0)  {
        this.paymentsEqualTotal = true;
      }

      if ( this.order.balanceRemaining > 0)  {
        this.paymentsEqualTotal = false;
      }

    }
    this.initSubscriptions();

    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')

   }

   editPayment(payment: IPOSPayment) {
    //get payment
    const site = this.siteService.getAssignedSite();
    const method$ = this.paymentMethodService.getPaymentMethod(site,payment.paymentMethodID)

    method$.subscribe( method => {
      this.editDialog.openChangeDueDialog(payment, method, this.order)
    })
   }

   ngOnDestroy(): void {
     //Called once, before the instance is destroyed.
     //Add 'implements OnDestroy' to the class.
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
     const result$ = this.orderService.completOrder(site, this.order.id)
     result$.subscribe(data=>  {
       this.router.navigateByUrl('/pos-orders')
       this.paymentService.updatePaymentSubscription(null)
       this.orderService.updateOrderSubscription(null)
       this.toolBarUI.updateOrderBar(false)
     })
    }
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
      //only manager can void. but should be voided.
      this.productEditButtonService.openVoidPaymentDialog(payment)
      return
    }
   }


   requestVoidPayment(payment) {
    //run void method.
    if (payment) {
      //only manager can void. but should be voided.
      this.productEditButtonService.openVoidPaymentDialog(payment)
      return
    }
   }

   printPaymentReceipt(item) {
     console.log('print')
    this.printingService.previewReceipt()
    if (item) {
      // this.printPaymentReceipt(item)
      this.printingService.previewReceipt()
    }
   }

   notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

}
