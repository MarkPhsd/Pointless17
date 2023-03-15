import { Component, Inject, OnInit,OnDestroy } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { isNull } from 'lodash';
import { Subscription,Observable, switchMap, EMPTY, of, catchError } from 'rxjs';
import { CardPointMethodsService } from 'src/app/modules/payment-processing/services';
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
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { authorizationPOST, TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';

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
  action$                 : Observable<any>;
  voidAction$ : Observable<any>;
  settings: TransactionUISettings;
  terminalSettings: ITerminalSettings;
  deviceSettings$ : Observable<any>;

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
                private cardPointMethdsService: CardPointMethodsService,
                private triPOSMethodService   : TriPOSMethodService,
                private userAuthorization     : UserAuthorizationService,
                private adjustMentService     : AdjustmentReasonsService,
                private productEditButonService: ProductEditButtonService,
                private manifestService       : ManifestInventoryService,
                private settingsService       : SettingsService,
                private dialogRef             : MatDialogRef<AdjustPaymentComponent>,
                @Inject(MAT_DIALOG_DATA) public data: OperationWithAction,
                )
  {
    if (data) {
      this.deviceSettings$ = this.getDevice();
      this.settings        =  data.uiSetting;
      const site           = this.siteService.getAssignedSite();
      this.isAuthorized    = this.userAuthorization.isUserAuthorized('admin, manager')
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

  getDevice() {
    const name = localStorage.getItem('devicename');
    const site = this.siteService.getAssignedSite();

    if (!name) {
      this.siteService.notify('A credit card void cant be made if there is no device associated.', 'Alert',2000);
      return of(null)
    }

    return this.settingsService.getSettingByName(site, name).pipe(switchMap(data => {
      if (data && data.text) {
        this.terminalSettings = JSON.parse(data.text)
        if (!this.terminalSettings.triposLaneID) {
          this.terminalSettings.triposLaneID = '4'
        }
      }
      return of(data)
    }),catchError(data => {
      return of(null)
    }))
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
      // console.log(setting)
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
      this.resultAction.action = 1;
      const method = this.resultAction.paymentMethod;
      let response$: Observable<OperationWithAction>;

      if (this.resultAction) {
        if (method) {
          if (method.isCreditCard) {
            this.voidPayment.voidReason = this.resultAction.voidReason

            if (this.settings.dsiEMVNeteEpayEnabled) {
              if (this.isDSIEmvPayment && this.voidPayment) {
                this.voidDSIEmvPayment();
                return ;
              }
            }

            if (this.settings.triposEnabled) {
              const site = this.siteService.getAssignedSite()
              let item = {} as authorizationPOST
              item.laneId  = this.terminalSettings.triposLaneID;
              item.transactionID = this.payment.refNumber;
              this.action$ = this.triPOSMethodService.void(site, item).pipe(switchMap(data => {
                console.log(data)
                if (this.validateTriPOSVoid(data)) {
                  this.resultAction.payment.amountPaid = 0;
                  this.resultAction.payment.amountReceived = 0;
                  this.resultAction.payment.refNumber = data.transactionId;
                  this.resultAction.payment.tranType = data._type;
                  this.resultAction.payment.voidReason = this.resultAction.voidReason;
                  this.resultAction.payment.transactionData = JSON.stringify(data)
                  return of(this.resultAction)
                }

                this.resultAction = null
                return of(this.resultAction)
              })).pipe(switchMap(resultAction => {
                if (!resultAction) {
                  this.notifyEvent('Void not allowed by user', 'CC Result')
                  return of(null)
                }
                if (resultAction) {
                  return this.pOSPaymentService.voidPayment(site, resultAction);
                }
              })).pipe(
                switchMap(data => {
                  if (!data || !data.result) {
                    if ( data?.resultMessage == null ) {
                      this.notifyEvent(`Void failed: user may not be authorized`, 'Void Result')
                      return of(null)
                      return
                    }
                    this.notifyEvent(`Void failed: ${data?.resultMessage}`, 'Void Result')
                    return of(null)
                  }
                  this.updateVoidPayment(data)
                  return of(data)
              }))

              return;

            }

            if (this.settings.cardPointBoltEnabled) {
              if ( this.voidPayment.respstat) {
                const voidByRef$ = this.cardPointMethdsService.voidByRetRef(this.voidPayment.retref);

                this.action$ = voidByRef$.pipe(
                  switchMap( data => {
                    if (data && data === "Void Not Allowed") {
                      return of(null)
                    }

                    if (data && data?.respstat && data?.respstat.toLowerCase() == 'a') {
                      this.resultAction.payment.amountPaid = 0;
                      this.resultAction.payment.amountReceived = 0;
                      this.resultAction.payment.voidReason = this.resultAction.voidReason;
                      this.resultAction.payment.retref   = data?.retref;
                      this.resultAction.payment.respstat = data?.respstat;
                      this.resultAction.payment.respcode = data?.respcode;
                      return of(this.resultAction)
                    }

                    if (data && data?.respstat && data?.respstat.toLowerCase() == 'b') {
                      this.notifyEvent('Please retry', 'Alert')
                    }
                    if (data && data?.respstat && data?.respstat.toLowerCase() == 'c') {
                      this.notifyEvent(`Declined, refund most likely required.  ${data?.resptext}`, 'Alert');
                      const confirm = window.confirm('This credit card transaction may already be voided. If you want to void the record of the payment here, you can press okay to continue. Otherwise the payment will remain as it appears.')
                    }

                    if (confirm) {
                      this.resultAction.payment.amountPaid = 0;
                      this.resultAction.payment.amountReceived = 0;
                      this.resultAction.payment.voidReason = this.resultAction.voidReason;
                      return of(this.resultAction)
                    }

                    this.resultAction = null
                    return of(this.resultAction)

                  })).pipe(
                    switchMap( resultAction => {
                      if (!resultAction) {
                        this.notifyEvent('Void not allowed by user', 'CC Result')
                        return of(null)
                      }
                      if (resultAction) {
                        return this.pOSPaymentService.voidPayment(site, resultAction);
                      }
                    })
                  ).pipe(
                  switchMap(data => {
                    if (!data || !data.result) {
                      if ( data?.resultMessage == null ) {
                        this.notifyEvent(`Void failed: user may not be authorized`, 'Void Result')
                        return
                      }

                      this.notifyEvent(`Void failed: ${data?.resultMessage}`, 'Void Result')
                      return
                    }
                    this.updateVoidPayment(data)
                    return of(data)
                  }))
                  return;
              }
            }

            response$ = this.pOSPaymentService.voidPayment(site, this.resultAction)
            this.action$ = this.updateVoidPaymentResponse(response$)

          } else {
            response$ = this.pOSPaymentService.voidPayment(site, this.resultAction)
            this.action$ = this.updateVoidPaymentResponse(response$)
          }
        }
      }
    }
  }


  validateTriPOSVoid(data) {
    if (data.statusCode.toLowerCase() === "Approved".toLowerCase()) {
      return true;
    }
    return false;

  }
  updateVoidPayment(response: OperationWithAction) {

    const site = this.siteService.getAssignedSite();
    const item$ = this.updateOrderSubscription()

    if (response && response.result) {
      item$.subscribe( order => {
        this.orderService.updateOrderSubscription(order)
        this.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
        this.closeDialog(response.payment, response.paymentMethod);
      });
      return
    }

    if (response.purchaseOrderPayment && response.purchaseOrderPayment.giftCardID != 0) {
      const valueToReduce = response.payment.amountPaid
      this.closeDialog(response.payment, response.paymentMethod);
      if (response.purchaseOrderPayment && response.purchaseOrderPayment.giftCardID) {
        this.storeCreditService.updateCreditValue(site ,response.purchaseOrderPayment.giftCardID, valueToReduce).subscribe(data => {
          if (data == null) { return }
          this.storeCreditMethodService.updateSearchModel(null)
        })
      }
      return;
    }

  }


  voidDSIEmvPayment() {
    if (this.voidPayment) {
      const voidPayment = this.voidPayment;

      if (voidPayment) {
        this.paymentsMethodsService.processDSIEMVCreditVoid(voidPayment)
        //  this.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
        this.closeDialog(null, null);
      }
    }
  }

 get isDSIEmvPayment() {
    if (this.voidPayment) {
      const voidPayment = this.voidPayment;
      if (voidPayment.trancode && voidPayment.trancode.toLowerCase() ===  'EMVSale'.toLowerCase()) {
        return true
      }
    }
  }

  updateVoidPaymentResponse(response$: Observable<OperationWithAction>) {
    const site = this.siteService.getAssignedSite();
    return response$.pipe(
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
        return of(null)
      }
    )).pipe(switchMap(data => {
      if (data == null) { return }
      this.storeCreditMethodService.updateSearchModel(null)
      return of(data)
    }))

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
