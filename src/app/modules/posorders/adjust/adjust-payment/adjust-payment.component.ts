import { Component, Inject, OnInit,OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subscription,Observable, switchMap, EMPTY } from 'rxjs';
import { IPOSOrder, IPOSPayment, OperationWithAction } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { StoreCreditMethodsService } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
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
  public  resultAction  : OperationWithAction;
  private id              : string;
  manifest                : InventoryManifest;
  list$                   : Observable<IItemBasic[]>;
  setting                 : IItemBasic;
  settingID               : number;
  isAuthorized            = false;
  payment                 : IPOSPayment;
  voidPayment             : IPOSPayment;

  initSubscriptions() {
    if (!this.manifest) {
      this._paymentWithAction = this.pOSPaymentService.paymentWithAction$.subscribe(data=> {
        this.resultAction = data
      })
    }
  }

  constructor( private  pOSPaymentService     : POSPaymentService,
                private paymentsMethodsService: PaymentsMethodsProcessService,
                private storeCreditMethodService : StoreCreditMethodsService,
                public  route                 : ActivatedRoute,
                private siteService           : SitesService,
                private orderService          : OrdersService,
                private matSnackBar           : MatSnackBar,
                private storeCreditService    : StoreCreditService,
                private userAuthorization     : UserAuthorizationService,
                private adjustMentService     : AdjustmentReasonsService,
                private productEditButonService: ProductEditButtonService,
                private manifestService       : ManifestInventoryService,
                private dialogRef             : MatDialogRef<AdjustPaymentComponent>,
                @Inject(MAT_DIALOG_DATA) public data: OperationWithAction,
                )
  {
    if (data) {
      const site = this.siteService.getAssignedSite();
      this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
      let action = 2;
      if (data.action) { action =  data.action };

      if (this.data.manifest) {
        this.manifest = data.manifest;
        this.id       = data.id.toString();
        this.list$    = this.adjustMentService.getReasonsByFilter(site, 4);
        this.resultAction = data
        return
      }

      this.resultAction  = data
      this.pOSPaymentService.updateItemWithAction(data);
      this.list$         = this.adjustMentService.getReasonsByFilter(site, action);
      this.payment       = data.payment;
      this.pOSPaymentService.getPOSPayment(site,this.payment.id, false).subscribe(data => {
        this.voidPayment = data;
      })

    }
  }

  closeDialog(payment: IPOSPayment , method: IPaymentMethod ) {
    console.log('closeDialog', payment, method)
    if (payment) {
      if (method && (method.isCreditCard || method.wic || method.ebt )) {
        if (method.isCreditCard) {
          const data = { payment: payment, id: payment.id, voidPayment: payment }
          this.productEditButonService.openDSIEMVTransaction(data)
        }
      }
    }
    this.dialogRef.close();
  }

  closeManifestDialog(message: string ) {
    this.dialogRef.close(message);
  }

  // void = 1,
  // priceAdjust = 2,
  // note = 3
  selectItem(setting) {

    if (this.voidPayment) {
      this.voidPaymentFromSelection(setting)
      return
    }

    if (this.manifest) {
      this.rejectManifestItemsFromSelection(setting)
      return
    }

  }

  rejectManifestItemsFromSelection(setting) {
    if (setting) {
      console.log(setting)
      const site = this.siteService.getAssignedSite();
      this.resultAction.voidReason = setting.name
      this.resultAction.voidReasonID = setting.id
      this.resultAction.action = 1;

      let response$: Observable<OperationWithAction>;

      if (this.resultAction) {
        if (this.manifest) {
          const items = this.manifest.inventoryAssignments;
          this.closeManifestDialog(this.resultAction.voidReason);
        }
        // response$ = this.inventoryAssignmentService.putInventoryAssignmentList(site, this.resultAction)//.pipe().toPromise();
        // this.updateManifestResponse(response$)
      }
    }
  }


  voidPaymentFromSelection(setting) {
    if (setting) {
      const site = this.siteService.getAssignedSite();
      this.resultAction.voidReason = setting.name
      this.resultAction.voidReasonID = setting.id
      let response = {} as OperationWithAction;
      this.resultAction.action = 1;
      const method = this.resultAction.paymentMethod;
      let response$: Observable<OperationWithAction>;
      if (this.resultAction) {
        if (method) {
          if (method.isCreditCard) {
            console.log(method.isCreditCard, method.name)

            if (this.isDSIEmvPayment) {
              this.voidDSIEmvPayment();
              return ;
            }

            response$ = this.pOSPaymentService.voidPayment(site, this.resultAction)//.pipe().toPromise();
            this.updateVoidPaymentResponse(response$)

          } else {

            response$ = this.pOSPaymentService.voidPayment(site, this.resultAction)//.pipe().toPromise();
            this.updateVoidPaymentResponse(response$)
          }
        }
      }
    }
  }

  voidDSIEmvPayment() {
    if (this.voidPayment) {
      const voidPayment = this.voidPayment;
      if (voidPayment) {
        this.paymentsMethodsService.processDSIEMVCreditVoid(voidPayment)
      }
    }
  }

 get isDSIEmvPayment() {
    if (this.voidPayment) {
      const voidPayment = this.voidPayment;
      // if (voidPayment.entryMethod === 'CHIP READ/CONTACT') {
        if (voidPayment.trancode ===  "EMVSale") {
          return true
        }
      // }
    }
  }

  updateVoidPaymentResponse(response$: Observable<OperationWithAction>) {
    const site = this.siteService.getAssignedSite();
    // response$.subscribe( response => {
    //     if (response && response.result) {
    //       const item$ = this.updateOrderSubscription()
    //       item$.subscribe( order => {
    //         this.orderService.updateOrderSubscription(order)
    //         this.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
    //         this.closeDialog(response.payment, response.paymentMethod);
    //       });
    //     }
    //   }
    // )
    console.log('updateVoidPaymentResponse')
    response$.pipe(
      switchMap(response => {

        if (response && response.result) {
          const item$ = this.updateOrderSubscription()
          item$.subscribe( order => {
            this.orderService.updateOrderSubscription(order)
            this.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
            this.closeDialog(response.payment, response.paymentMethod);
          });
        }

        if (response.purchaseOrderPayment && response.purchaseOrderPayment.giftCardID != 0) {
          const valueToReduce = response.payment.amountPaid
          this.closeDialog(response.payment, response.paymentMethod);
          return this.storeCreditService.updateCreditValue(site ,response.purchaseOrderPayment.giftCardID, valueToReduce)
        }

        return EMPTY
      }
    )).subscribe(data => {
      this.storeCreditMethodService.updateSearchModel(null)
    })

  }

  updateManifestResponse(response$: Observable<OperationWithAction>) {
    response$.subscribe( response => {
        if (response && response.result) {
          const item$ = this.updateManifestSubscription();
          item$.subscribe( data => {
            this.manifestService.updateCurrentInventoryManifest(data)
            this.notifyEvent('Manifest updated.', 'Result')
            this.closeDialog(response.payment, response.paymentMethod);
          });
        }
      }
    )
  }

  updateManifestSubscription(): Observable<InventoryManifest> {
    const site = this.siteService.getAssignedSite();
    const orderID = this.resultAction.payment.orderID;
    return this.manifestService.get(site, +this.id)
  }

  updateOrderSubscription(): Observable<IPOSOrder> {
    const site = this.siteService.getAssignedSite();
    const orderID = this.resultAction.payment.orderID;
    return this.orderService.getOrder(site, orderID.toString(), false)
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
