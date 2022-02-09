import { Component, OnInit ,OnDestroy,Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPOSPayment } from 'src/app/_interfaces';
import { OrdersService  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { Observable,  Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialogRef } from '@angular/material/dialog';
import { PrintingService } from 'src/app/_services/system/printing.service';

@Component({
  selector: 'pos-payment-edit',
  templateUrl: './pos-payment-edit.component.html',
  styleUrls: ['./pos-payment-edit.component.scss']
})
export class PosPaymentEditComponent implements OnInit, OnDestroy {

  inputForm       : FormGroup;

  paymenthMethods$: Observable<IPaymentMethod[]>;
  paymentMethod   : IPaymentMethod;
  isUserStaff     : boolean;
  roles           : string;
  id              : string;

  deleteAllowed = false;
  payment         : IPOSPayment;
  _payment        : Subscription;

  initSubscriptions() {
    this._payment = this.paymentService.currentPayment$.subscribe( payment => {
      this.payment   = payment
      if (payment && payment.history) {
        this.deleteAllowed = false
      }
    });
  }

  constructor(
      private paymentService      : POSPaymentService,
      private paymentMethodService: PaymentMethodsService,
      private userAuthorization   : UserAuthorizationService,
      private siteService         : SitesService,
      public  route               : ActivatedRoute,
      private orderService        : OrdersService,
      private _snackBar           : MatSnackBar,
      private _bottomSheet        : MatBottomSheet,
      private printingService     : PrintingService,
      @Optional() private dialogRef  : MatDialogRef<PosPaymentEditComponent>,

  ) {
    this.roles = localStorage.getItem(`roles`)
    this.isUserStaff = this.userAuthorization.isCurrentUserStaff()
  }

  async ngOnInit() {
    this.initSubscriptions()
    if (!this.payment){
      this.id = this.route.snapshot.paramMap.get('id');
      this.getItem(parseInt(this.id));
    }
    this.initForm();
  }

  initForm() {
    this.inputForm = this.paymentService.initForm(this.inputForm)
    if (this.payment) {
      this.inputForm.patchValue(this.payment)
    }
  }

  printCheck(event) {
    if (this.payment) {
      const site      = this.siteService.getAssignedSite()
      this.orderService.getOrder(site, this.payment.orderID.toString(), this.payment.history).subscribe( order => {
          this.orderService.updateOrderSubscription(order)
          this.printingService.previewReceipt();
        }
      )
    }
  }

  viewOrder(event) {
    if (!this.payment) { return }
    const history = this.payment.history
    const id      = this.payment.orderID;
    const site    = this.siteService.getAssignedSite();
    const order$  =  this.orderService.getOrder(site, id.toString(), history )
    order$.subscribe(data =>  { this.orderService.setActiveOrder(site, data)
      this._bottomSheet.dismiss();
    })
  }

  async getPaymentMethod(methodID: number) {
    const site         = this.siteService.getAssignedSite()
    this.paymentMethod = await  this.paymentMethodService.getPaymentMethod(site, methodID).pipe().toPromise()
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.paymentService.updatePaymentSubscription(null)
  }

  async getItem(id: number) {
    console.log('payment id', this.id)
    const site      = this.siteService.getAssignedSite()
    const payment$  = this.paymentService.getPOSPayment(site, id, false)
    this.payment    = await payment$.pipe().toPromise();

    if (this.payment) {
      const methodID = this.payment.paymentMethodID
      this.getPaymentMethod(methodID);
    }
  }

  updateItem(event) {
    if (this.payment) {
      const site      = this.siteService.getAssignedSite()
      this.payment = this.inputForm.value;
      this.paymentService.putPOSPayment(site,this.payment)
      this.payment = this.inputForm.value
      this.notify('Payment saved', 'Success')
    }
  }

  updateItemExit(event) {
    if (this.payment) {
      const site      = this.siteService.getAssignedSite()
      this.payment = this.inputForm.value;
      this.paymentService.putPOSPayment(site,this.payment)
      this.payment = this.inputForm.value
      this.notify('Payment saved', 'Success')
      this.onCancel(null);
    }
  }

  deleteItem(event) {
    const site      = this.siteService.getAssignedSite()
    if (this.payment) {
      console.log('payment', this.payment)
      const orderID   = this.payment.orderID;
      if (this.paymentMethod && this.paymentMethod.isCreditCard) {
        const result = window.confirm('Warning, this should not be deleted unless you have also canceled or managed the transaction with the processor.');
        if (result) {
          this.deletePayment(orderID)
        }
      } else {
        console.log('legal', this.payment)
        this.deletePayment(orderID)
      }
    }
  }

  deletePayment(orderID: number) {
    const site      = this.siteService.getAssignedSite()
    if (this.payment) {
      const payment = this.payment
      this.paymentService.deletePOSPayment(site, this.payment.id).subscribe(data => {
        const nextAction = window.confirm("Do you wish to re-open this order and apply a new payment?")
        if (nextAction) {
          this.reOpenOrder(orderID)
        }
      })
    }
  }


  reOpenOrder(id: number) {
    const site      = this.siteService.getAssignedSite()
    const order     = this.orderService.getOrder(site, id.toString(), false ).subscribe( data => {
      data.completionDate = null
      data.completionTime = null;
      this.orderService.putOrder(site, data).subscribe(data => {
        this.notify('This order has been re-opened.', 'Success')
      })
    })
  }

  onCancel(event) {
    console.log('cancel')
    this._bottomSheet.dismiss();
    // this.location.back();
  }

  notify(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
