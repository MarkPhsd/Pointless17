import { I } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit,OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subscription,Observable, switchMap, EMPTY, of, catchError } from 'rxjs';
import { CardPointMethodsService } from 'src/app/modules/payment-processing/services';
import { IPOSOrder, IPOSPayment, OperationWithAction } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';

import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { StoreCredit, StoreCreditMethodsService } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
import { AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';

import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { authorizationPOST, TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';
import { TriposResult } from 'src/app/_services/tripos/triposModels';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

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
  toggleVoid: boolean;
  inputForm: UntypedFormGroup;
  voidAmount: number;

  initSubscriptions() {
    if (!this.manifest) {
      this._paymentWithAction = this.pOSPaymentService.paymentWithAction$.subscribe(data=> {
        this.resultAction = data

      })
    }
  }

  initVoidForm() {
    this.inputForm = this.fb.group({
      value: [],
    })
  }

  constructor( private  pOSPaymentService     : POSPaymentService,
                private paymentsMethodsService: PaymentsMethodsProcessService,
                private storeCreditMethodService : StoreCreditMethodsService,
                public  route                 : ActivatedRoute,
                private siteService           : SitesService,
                private orderService          : OrdersService,
                private matSnackBar           : MatSnackBar,
                private storeCreditService    : StoreCreditService,
                private fb                    : UntypedFormBuilder,
                private cardPointMethdsService: CardPointMethodsService,
                private triPOSMethodService   : TriPOSMethodService,
                private userAuthorization     : UserAuthorizationService,
                private adjustMentService     : AdjustmentReasonsService,
                private productEditButonService: ProductEditButtonService,
                private manifestService       : ManifestInventoryService,
                private settingsService       : SettingsService,
                private orderMethodsService   : OrderMethodsService,
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

  public get MarketCode() {
    let  marketCode = 'Retail'
    if (this.terminalSettings && this.terminalSettings.triPOSMarketCode == 7) {
      return 'FoodRestaurant'
    }
    if (this.terminalSettings && this.terminalSettings.triPOSMarketCode == 4) {
      return  'Retail'
    }
    return marketCode;
  }

  setConfig(item: authorizationPOST ):authorizationPOST {
    item.configuration = {allowDebit: true, marketCode : this.MarketCode};
    return item;
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
      }
    }
  }

  setVoidAmount(event) {
    if (!event || event == 0) { return }
    if (!this.resultAction || !this.resultAction.payment) { return }
    if (!this.resultAction.payment.voidAmount) { this.resultAction.payment.voidAmount = 0}

    const currentAmount = this.resultAction.payment.amountPaid -this.resultAction.payment.voidAmount;

    if (event == 0) {
      this.voidAmount = 0
      return;
    }

    if ( event < currentAmount) {
      const voidAmount = event;
      this.voidAmount = event;
      return;
    }

    this.voidAmount = currentAmount
  }

  voidPaymentFromSelection(setting) {

    if (setting) {
      const site = this.siteService.getAssignedSite();
      this.resultAction.voidReason = setting.name
      this.resultAction.voidReasonID = setting.id
      this.resultAction.action = 1;
      const method = this.resultAction.paymentMethod;
      let response$: Observable<OperationWithAction>;

      //establish the amount to void for tripos
      //later we will use for other payment processors.
      if (this.voidAmount == 0) {
        this.setVoidAmount(this.resultAction.payment.amountPaid)
      }

      if (this.resultAction) {

        const paymentMethod = this.payment.paymentMethod;

        if (method) {
          // console.log('void / Reversal result 2');
          if (paymentMethod.name.toLowerCase( )== 'rewards points') {
            this.voidPayment.voidReason = this.resultAction.voidReason
            this.resultAction.order = this.orderMethodsService.currentOrder;
            response$ = this.pOSPaymentService.voidPayment(site, this.resultAction)
            this.action$ = this.updateVoidPaymentResponse(response$);
            return;
          }

          if (paymentMethod?.companyCredit) {
            this.voidPayment.voidReason = this.resultAction.voidReason
            const credit = {} as StoreCredit;

            this.resultAction.payment = this.payment;
            const msg ='Unable to void this store credit. Before voiding this order, please ensure the card can be voided.';
            const getPayment$ = this.pOSPaymentService.getPOSPayment(site, this.payment.id, false);

            this.action$ =
              getPayment$.pipe(
                switchMap ( payment => {
                  this.payment = payment;
                  credit.cardNum = payment.cardNum;
                  credit.reduceValue = payment.amountPaid;

                  return this.storeCreditService.updateCreditValue(site, credit)
              })).pipe( switchMap ( data => {
                  if (data) {
                    return this.voidPaymentWithAction(this.resultAction)
                  }
                  if (!data) {
                    this.siteService.notify(msg, 'Alert', 1000)
                    return of(null)
                  }
                }
              )),catchError(err => {
                this.siteService.notify(`Error ${err}`, 'Error Voiding', 5000)
                return of(err)
              })
            return;

          }

          if (paymentMethod.isCreditCard) {
            this.voidPayment.voidReason = this.resultAction.voidReason;
            this.voidPayment = this.resultAction.payment;

            if (this.settings.dsiEMVNeteEpayEnabled) {
              if (this.settings.dsiEMVNeteEpayEnabled && this.voidPayment) {
                this.voidDSIEmvPayment();
                return ;
              }
            }

            if (this.settings.dCapEnabled) {

              if (this.voidPayment) {
                this.voidDCapPayment();
                return ;
              }
            }

            if (this.settings.triposEnabled) {

              // console.log('void / Reversal result 5');
              if(!this.voidPayment.entrymode) {
                this.siteService.notify('No Transaction Data Found', "Close', 'yellow", 4000);
                return
              }

              if (this.voidPayment.entrymode) {

                try {
                  let paymentType = this.voidPayment.entrymode ;
                  if ( !paymentType ) {
                    this.siteService.notify('No Payment type identitified', 'Close', 5000, 'red')
                    return of(null)
                  }
                  const site = this.siteService.getAssignedSite()
                  let item = {} as authorizationPOST
                  item.laneId  = this.terminalSettings.triposLaneID;
                  item.paymentType = paymentType;
                  item.transactionId = this.payment.refNumber;
                  item = this.setConfig(item)
                  //the original transaction nuber is used if partial void.
                  if (this.voidAmount != this.resultAction?.payment?.amountPaid + this.resultAction?.payment?.voidAmount) {
                    item.transactionId = this.payment.refNumber;
                  }



                  if (!this.voidAmount) {
                    this.voidAmount = this.resultAction.payment.amountPaid
                  }

                  this.resultAction.voidAmount = this.voidAmount
                  item.transactionAmount = this.voidAmount.toString();
                  let process$ : Observable<TriposResult>;

                  if (this.toggleVoid) {
                    // console.log('void  7');
                    return;
                    process$ = this.triPOSMethodService.void(site, item)
                  }
                  if (!this.toggleVoid) {
                    // console.log('reversal  7');
                    //need to assign ticketNumber & referenceNumber
                    //should be the same as the sale
                    item.ticketNumber = this.resultAction.payment?.transactionIDRef.toString();
                    item.referenceNumber = this.resultAction.payment?.transactionIDRef.toString();
                    process$ = this.triPOSMethodService.reversal(site, item)
                  }

                  console.log('void / Reversal result 8', item);

                  this.action$ = process$.pipe(switchMap(data => {
                    console.log('void / Reversal result', data);

                    if (!data || !this.validateTriPOSVoid(data)) {
                        this.siteService.notify(`Reversal response failed. Run again as a void. Code: ${data?.statusCode}`, 'Close', 5000, 'red')
                      return of(this.resultAction)
                    }

                    if (this.validateTriPOSVoid(data)) {
                      this.resultAction = this.applyTriPOSResults(data, this.resultAction.voidReason)
                      return of(this.resultAction)
                    }

                    this.resultAction = null;

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
                        }
                        this.notifyEvent(`Void failed: ${data?.resultMessage}`, 'Void Result')
                        return of(null)
                      }
                      this.updateVoidPayment(data)
                      return of(data)
                  }))
                }
                catch (error) {
                  this.siteService.notify('Error parsing data' + error, 'Close', 5000, 'red')
                }
                return;
              }

              this.siteService.notify('Void not Completed', 'Close', 5000, 'red')
              return
            }

            if (this.settings.cardPointBoltEnabled) {
              if (!this.voidPayment.respstat) {
                this.siteService.notify('No respstat for CardPoint Transaction', 'close', 6000, 'red')
                return of({})
              }
              if ( this.voidPayment.respstat) {
                const voidByRef$ = this.cardPointMethdsService.voidByRetRef(this.voidPayment.retref);

                this.action$ = voidByRef$.pipe(
                  switchMap( data => {
                    if (data && data === "Void Not Allowed") {
                      return of(null)
                    }

                    if (data && data?.respstat && data?.respstat.toLowerCase() == 'a') {
                      this.resultAction = this.applyCardPointResults(data, this.resultAction.voidReason)
                      return of(this.resultAction)
                    }

                    if (data && data?.respstat && data?.respstat.toLowerCase() == 'b') {
                      this.notifyEvent('Please retry', 'Alert')
                    }
                    if (data && data?.respstat && data?.respstat.toLowerCase() == 'c') {
                      this.notifyEvent(`Declined, refund most likely required.  ${data?.resptext}`, 'Alert');
                      const confirm = window.confirm('This credit card transaction may already be voided.' +
                                                     ' If you want to void the record of the payment here, you can press okay to continue. ' +
                                                     ' Otherwise the payment will remain as it appears.')
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
            // console.log('No Card Processor Used 2.');
            response$ = this.pOSPaymentService.voidPayment(site, this.resultAction)
            this.action$ = this.updateVoidPaymentResponse(response$)
          }
        }
      }
    }
  }

  voidAllItems() {
    // this.po
  }

  applyCardPointResults(data, voidReason) {
    this.resultAction.payment.amountPaid = 0;
    this.resultAction.payment.amountReceived = 0;
    this.resultAction.payment.voidReason = voidReason // this.resultAction.voidReason;
    this.resultAction.payment.retref   = data?.retref;
    this.resultAction.payment.respstat = data?.respstat;
    this.resultAction.payment.respcode = data?.respcode;
    return this.resultAction
  }

  applyTriPOSResults(data, voidReason) {
    console.log('apply tri pos result', data)
    this.resultAction.payment.amountPaid = 0;
    this.resultAction.payment.amountReceived = 0;
    //preserve the original transaction code.
    // this.resultAction.payment.refNumber = data.transactionId;
    this.resultAction.payment.respcode = data.transactionId;
    this.resultAction.payment.tranType = data._type;
    this.resultAction.payment.voidReason = voidReason //this.resultAction.voidReason;
    this.resultAction.payment.transactionData = JSON.stringify(data);
    this.resultAction.payment.refNumber = data.transactionId;
    return this.resultAction
  }

  // accountNumber: "************0011"
  // approvalNumber: "268138"
  // balanceAmount: 0
  // cardLogo: "Mastercard"
  // convenienceFeeAmount: 0
  // isApproved: true
  // isOffline: false
  // merchantId: "364802098"
  // paymentType: "Credit"
  // statusCode: "Approved"
  // terminalId: "001"
  // totalAmount: 40
  // transactionDateTime: "2023-04-14T09:46:44-07:00"
  // transactionId: "227653562"

  voidPaymentWithAction(action: OperationWithAction) {
    let voidPayment$ : Observable<OperationWithAction>;
    const site = this.siteService.getAssignedSite();
    if (!action) {
      this.notifyEvent('Void not allowed by user', 'CC Result')
      voidPayment$ =  of(null)
    }
    if (action) {
      voidPayment$ = this.pOSPaymentService.voidPayment(site, action);
    }

    return  voidPayment$.pipe(
      switchMap(data => {
        if (!data || !data?.result) {
          if ( data?.resultMessage == null ) {
            this.notifyEvent(`Void failed: user may not be authorized`, 'Void Result')
            return of(null)
          }
          this.notifyEvent(`Void failed: ${data?.resultMessage}`, 'Void Result')
          return of(null)
        }
        this.updateVoidPayment(data)
        return of(data)
    }))

  }

  validateTriPOSVoid(data) {
    if (!data) {return false}
    console.log(data)

    if (data && data.isApproved) {
      return true;
    }

    if (data.statusCode.toLowerCase() === "approved".toLowerCase()) {
      return true;
    }
    return false;
  }

  updateVoidPayment(response: OperationWithAction) {
    const site = this.siteService.getAssignedSite();
    const item$ = this.updateOrderSubscription()

    if (response && response.result) {
      item$.subscribe( order => {
        this.orderMethodsService.updateOrderSubscription(order)
        this.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
        this.closeDialog(response.payment, response.paymentMethod);
      });
      return
    }

  }

  voidDSIEmvPayment() {
    if (this.voidPayment) {
      const voidPayment = this.voidPayment;
      if (voidPayment) {
        this.paymentsMethodsService.processDSIEMVCreditVoid(voidPayment)
        this.closeDialog(null, null);
      }
    }
  }

  //const device = localStorage.getItem('devicename')
  voidDCapPayment() {
    if (this.voidPayment) {
      const voidPayment = this.voidPayment;
      if (voidPayment) {
        this.action$ =  this.paymentsMethodsService.processDcapCreditVoid(voidPayment).pipe(switchMap(data => {
          setTimeout(() => {
            this.closeDialog(null, null);
          }, 50)
          return of(data)
        }))
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
    let order: IPOSOrder
    let response: OperationWithAction
    return response$.pipe(
      switchMap(response => {

        if (response && response.result) {
          this.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
        }

        return this.orderService.getOrder(site, response.payment.orderID.toString(), false)

      }
    )).pipe(switchMap(data => {

      // console.log('getting order', data)
      this.orderMethodsService.updateOrderSubscription(data)
      this.storeCreditMethodService.updateSearchModel(null)

      this.dialogRef.close();

      if (data == null) { return }
      return of(response)
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
