import { Component, OnInit, Input , OnDestroy, ChangeDetectorRef} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { timeStamp } from 'node:console';
import { catchError, Observable, of, Subscription, switchMap } from 'rxjs';
import { itemsAnimation } from 'src/app/_animations/list-animations';
import { IPOSOrder, IPOSPayment, ISite, PosPayment } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { authorizationPOST, TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';
import { CardPointMethodsService } from '../../payment-processing/services';
import { TryCatch } from '@sentry/angular';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';

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
  totalAuthTriPOSPayments : number;
  incrementalAuth: PosPayment;
  authData: IUserAuth_Properties;
  authData$: Observable<IUserAuth_Properties>;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
      this.gettriPOSTotalPayments();
      this.lastIncrementalAuth();

    })

    this._currentPayment = this.paymentService.currentPayment$.subscribe( data => {
      this.posPayment = data
      this.gettriPOSTotalPayments();
    })
  }

  constructor(private orderService: OrdersService,
              private orderMethodsService: OrderMethodsService,
              private siteService: SitesService,
              private paymentService: POSPaymentService,
              private paymentMethodService: PaymentMethodsService,
              private paymentMethodsProessService: PaymentsMethodsProcessService,
              public authenticationService: AuthenticationService,
              public  userAuthorization: UserAuthorizationService,
              private productEditButtonService: ProductEditButtonService,
              private editDialog      : ProductEditButtonService,
              private methodsService: CardPointMethodsService,
              private triposMethodService: TriPOSMethodService,
              private toolBarUI       : ToolBarUIService,
              private matSnackBar   : MatSnackBar,
              public  printingService: PrintingService,
              private settingsService: SettingsService,
              private changeDetect: ChangeDetectorRef,
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

    // this.userAuthorization.
    this.authData$ = this.authenticationService.userAuths$;
    // this.authenticationService.userAuths$.subscribe(data => {
    //   this.authData = data;
    //   // data.voidPayment
    // })
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager,employee')

    if (this.href.substring(0, 11 ) === '/pos-payment') {
      this.hidePrint = true;
      return;
    }
  }

  editCart() {
    this.toolbarUIService.updateOrderBar(false)
    this.toolbarUIService.resetOrderBar(true)
    this.router.navigate(["/currentorder/", {mainPanel:true}]);
    this.orderService.setScanner()
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

  lastIncrementalAuth() {
    if ( this.order  &&
         !this.order.posPayments ||
        (  this.order && this.order.posPayments &&
           this.order.posPayments.length === 0 ) ){ return }

      const order = this.order
      if (!order) { return }
      if (!order.posPayments) {return }
      if (order.posPayments == null || order.posPayments == undefined) { return };

      console.log('last incremental',  this.order.posPayments)
      try {
        this.order.posPayments.slice().reverse().forEach(data => {
          // console.log(data?.tranType && data.amountPaid)
          if (data?.tranType === 'incrementalAuthorizationResponse' && data?.amountPaid != 0) {
            this.incrementalAuth = data;
            return
          }
        })
      } catch (error) {
        console.log('lastIncrementalAuth error ', error)
      }
  }


  reverseIncrementalAuth(item: any) {
    const site = this.siteService.getAssignedSite()
    const auth = {} as authorizationPOST;
    // console.log(item)
    if (!item || !item.refNumber) {
      this.siteService.notify('Error with transaction, no transactionID.', 'close',2000, 'yellow')
      return
    }

    const terminal= this.settingsService.terminalSettings;
    if (!terminal) { return }

    auth.laneId = terminal?.triposLaneID;
    auth.transactionId = item?.refNumber;
    auth.paymentType = 'credit' //item?.paymentMethod?.name
    // console.log('auth', auth);

    this.action$ = this.triposMethodService.processIncrementalReversal(auth, item).pipe(
      switchMap(data => {
      // console.log('processIncrementalReversal result', data)
      return of(data)
    })).pipe( switchMap( data => {
      console.log('payment', data)
      return this.orderMethodsService.refreshOrderOBS(item.orderID, false)
    })).pipe(switchMap( data => {
      console.log('order', data)
      return of(data)
    })),
    catchError(err => {
      this.siteService.notify(`Error occured: ${err.toString()}`, 'close', 3000, 'red')
      return of(err)
    })

  }

  incrementTriPOS(item: IPOSPayment) {
    const amount = this.order.creditBalanceRemaining - item.amountPaid;
    const site = this.siteService.getAssignedSite()
    let transactionId
    let tranData
    const payment$ = this.paymentService.getPOSPayment(site, item.id, item.history)
    const terminal$ = this.settingsService.terminalSettings$;

    this.action$ =   payment$.pipe(switchMap(data => {
        item = data;
        try {
          tranData = JSON.parse(item.transactionData);
        } catch (error) {
          this.siteService.notify('Error no transaction data found.', 'close', 5000, 'red')
          console.log(item.transactionData, error)
          return  of(null)
        }
        return of(data)
      }
    )).pipe(switchMap( data=> {
        if (!data) {return of(null)}
        return  terminal$
      }
    )).pipe(switchMap(data => {
      console.log('terminal', data)

      if (!data) {return of(null)}

      console.log(tranData.transactionId)
      if (tranData && tranData.transactionId) {
        transactionId = tranData.transactionId

        if (! data.triposLaneID) {
          this.siteService.notify(`No Lane ID, will not process.`, 'close', 3000, 'red')
        }

        return this.triposMethodService.processIncrement( site, tranData.transactionId, amount.toString(), data.triposLaneID)
      }

    })).pipe(switchMap(data => {

      if (!data) {return of(null)}
      console.log(data)
      if (data && !data._hasErrors && data.isApproved) {
        item.amountPaid = amount;
        item.amountReceived = amount;
        item.orderDate = null;
        try {
          item.transactionData = JSON.stringify(data)
        } catch (error) {

        }
        item = this.paymentMethodsProessService.applyTripPOSResponseToPayment(data, item)
        item.id = 0;
        item.transactionIDRef  = transactionId;
        return this.paymentService.makePayment(site, item, this.order, amount, null)
      }
      if (data?.exceptionMessage) {
        this.siteService.notify(`Not approved: ${data?.exceptionMessage}`, 'close', 3000, 'red')
      } else {
        this.siteService.notify('Not approved: unknown. ', 'close', 3000, 'red')
      }
      return of(this.order)
    })).pipe(switchMap(data => {
      return   this.orderMethodsService.refreshOrderOBS(this.order.id, this.order.history)
    }))
  }

  gettriPOSTotalPayments() {
    let amount = 0
    if (!this.order || !this.order.posPayments) {return}

    if (this.uiTransactions.triposEnabled) {
      amount = this.triposMethodService.getAuthTotal(this.order.posPayments)
    }
    this.totalAuthTriPOSPayments = amount;
    return amount;
  }

  captureTriPOS(item: IPOSPayment) {

    const site = this.siteService.getAssignedSite();
    const payment$ =  this.paymentService.getPOSPayment(site, item.id, false)
    this.action$ = payment$.pipe(switchMap(payment => {
      let amount = this.totalAuthTriPOSPayments; // this.order.creditBalanceRemaining;

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
     const result$ = this.orderService.forceCompleteOrder(site, this.order.id)
     this.action$ = result$.pipe(switchMap(data =>  {
       this.paymentService.updatePaymentSubscription(null)
       this.orderService.updateOrderSubscription(null)
       this.toolBarUI.updateOrderBar(false)
       return of(data)
     })).pipe(switchMap(data => {
      this.router.navigateByUrl('/pos-orders')
      return of(data)
     }))
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

    if (item && (item.groupID && item.groupID != 0)) {
        console.log('prinint item group total')
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
