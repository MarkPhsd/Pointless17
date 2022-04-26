import { Component, Inject, OnInit,OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subscription,Observable } from 'rxjs';
import { IPOSPayment, PaymentWithAction } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';
import { RequestMessageService } from 'src/app/_services/system/request-message.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'app-adjust-payment',
  templateUrl: './adjust-payment.component.html',
  styleUrls: ['./adjust-payment.component.scss']
})
export class AdjustPaymentComponent implements OnInit, OnDestroy {

  private _paymentWithAction : Subscription
  public  paymentWithAction  : PaymentWithAction;
  private id              : string;

  list$                   : Observable<IItemBasic[]>;
  setting                 : IItemBasic;
  settingID               : number;
  isAuthorized            = false;
  payment                 : IPOSPayment;
  voidPayment   : IPOSPayment;
  initSubscriptions() {
    this._paymentWithAction = this.pOSPaymentService.paymentWithAction$.subscribe(data=> {
      this.paymentWithAction = data
    })
  }

  constructor( private  pOSPaymentService     : POSPaymentService,
                private paymentMethodService: PaymentMethodsService,
                private paymentsMethodsService: PaymentsMethodsProcessService,
                public  route                 : ActivatedRoute,
                private siteService           : SitesService,
                private orderService          : OrdersService,
                private matSnackBar           : MatSnackBar,
                private userAuthorization     : UserAuthorizationService,
                private adjustMentService     : AdjustmentReasonsService,
                private productEditButonService: ProductEditButtonService,
                private requestMessageService : RequestMessageService,
                private dialogRef: MatDialogRef<AdjustPaymentComponent>,
                @Inject(MAT_DIALOG_DATA) public data: PaymentWithAction,
                )
  {
    if (data) {
      const site = this.siteService.getAssignedSite();
      this.paymentWithAction = data
      this.pOSPaymentService.updateItemWithAction(data);
      this.list$  = this.adjustMentService.getReasonsByFilter(site, 2);
      this.payment = data.payment;
      this.pOSPaymentService.getPOSPayment(site,this.payment.id, false).subscribe(data => {
        this.voidPayment = data;
      })
      this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
    }
  }

  // ngOnInit(): void {
  //   //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //   //Add 'implements OnInit' to the class.
  //   const i =0
  // }

  closeDialog(payment: IPOSPayment , method: IPaymentMethod ) {

    if (payment) {
      if (!method || method.isCreditCard || method.wic || method.ebt ) {
        const data = { payment: payment, id: payment.id }
        this.productEditButonService.openDSIEMVTransaction(data)
      }
    }

    this.dialogRef.close();

  }

  // void = 1,
  // priceAdjust = 2,
  // note = 3
  async selectItem(setting) {

    if (setting) {
      const site = this.siteService.getAssignedSite();
      console.log('setting', setting)
      this.paymentWithAction.voidReason = setting.name
      this.paymentWithAction.voidReasonID = setting.id
      let response = {} as PaymentWithAction;
      this.paymentWithAction.action = 1;
      const method = this.paymentWithAction.paymentMethod;
      let response$: Observable<PaymentWithAction>;

      if (this.paymentWithAction) {
        if (method) {
          if (method.isCreditCard) {
            if (this.isDSIEmvPayment()) {
              this.voidDSIEmvPayment();
              return ;
            }
            this.notifyEvent('Payment Must be Voided by CC Service', 'Result')
            response$ = this.pOSPaymentService.voidPayment(site, this.paymentWithAction)//.pipe().toPromise();
            this.updateResponse(response$)
          } else {
            response$ = this.pOSPaymentService.voidPayment(site, this.paymentWithAction)//.pipe().toPromise();
            this.updateResponse(response$)
          }
        }
      }
    }

  }

  voidDSIEmvPayment() {
    if (this.voidPayment) {
      const voidPayment = this.voidPayment;

      if (voidPayment) {
        this.paymentsMethodsService.processDSIEMVCreditVoid(this.voidPayment)
      }

    }
  }
  isDSIEmvPayment() {
    if (this.voidPayment) {
      const voidPayment = this.voidPayment;
      if (voidPayment.entryMethod === 'CHIP READ/CONTACT') {
        if (voidPayment.trancode ===  "EMVSale") {
          return true
        }
      }
    }
  }

  updateResponse(response$: Observable<PaymentWithAction>) {
    response$.subscribe( response => {
        if (response && response.result) {
          this.updateSubscription()
          this.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
          this.closeDialog(response.payment, response.paymentMethod);
        }
      }
    )
  }

  async updateSubscription() {
    //update the order service.
    const site = this.siteService.getAssignedSite();
    const orderID = this.paymentWithAction.payment.orderID;
    const order = await this.orderService.getOrder(site, orderID.toString(), false).pipe().toPromise();
    this.orderService.updateOrderSubscription(order)
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    if (this._paymentWithAction) {
      this._paymentWithAction.unsubscribe();
    }
  }

  notifyEvent(message: string, title: string) {
    this.matSnackBar.open(message, title,{
      duration: 2000,
      verticalPosition: 'top'
    })
  }
}
