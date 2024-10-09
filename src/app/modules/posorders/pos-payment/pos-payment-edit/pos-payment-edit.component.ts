import { Component, OnInit ,OnDestroy,Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPOSOrder, IPOSPayment, IUser, PaymentMethod } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { Observable,  Subscription, concatMap, of, switchMap } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { DSIEMVSettings, TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { DCAPAndroidRStream, DcapService } from 'src/app/modules/payment-processing/services/dcap.service';
import { TranResponse } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';

@Component({
  selector: 'pos-payment-edit',
  templateUrl: './pos-payment-edit.component.html',
  styleUrls: ['./pos-payment-edit.component.scss']
})
export class PosPaymentEditComponent implements OnInit, OnDestroy {

  orderHistory$   : Observable<IPOSOrder>

  inputForm       : UntypedFormGroup;

  paymentMethod$  : Observable<IPaymentMethod>;
  paymenthMethods$: Observable<IPaymentMethod[]>;
  paymentMethod   : IPaymentMethod;
  isUserStaff     : boolean;
  roles           : string;
  id              : string;

  deleteAllowed   = false;
  payment$        :Observable<IPOSPayment>;
  payment         : IPOSPayment;
  _payment        : Subscription;

  paymentMethods$: Observable<PaymentMethod[]>;
  history : boolean;
  employees$ = this.employeeService.getEmployees(this.siteService.getAssignedSite())
  action$: Observable<any>;

  _user: Subscription;
  user: IUser;
  _userAuths: Subscription;
  userAuths: IUserAuth_Properties;
  _uiTran:Subscription;
  uiTran: TransactionUISettings;
  terminalSettings$: Observable<ITerminalSettings>;
  terminalSettings: ITerminalSettings;
  dsiEmv: DSIEMVSettings;
  jsonRsponse: any;

  rStream: TranResponse;
  errorMessage: string;

  initSubscriptions() {
    this._payment = this.paymentService.currentPayment$.subscribe( payment => {
      this.payment   = payment

      this.history = payment?.history;
      if (payment && payment.history) {
        this.deleteAllowed = false
      }

      if (this.history) {
        const site  = this.siteService.getAssignedSite()
        this.orderHistory$  = this.orderService.getOrder(site, payment?.orderID.toString(), true)
      }

    });
  }

  initUserSubscriber() {
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user = data
    })

    this._userAuths = this.authenticationService.userAuths$.subscribe( data => {
      this.userAuths = data
    })

    this._uiTran = this.uiSettings.transactionUISettings$.subscribe(data => {
      this.uiTran = data;
    })

  }

  initTerminalSettings() {
    this.terminalSettings$ = this.settingsService.terminalSettings$.pipe(concatMap(data => {
      this.terminalSettings = data
      this.dsiEmv = this.terminalSettings?.dsiEMVSettings;
      if (!data) {
        const site = this.siteService.getAssignedSite();
        const device = localStorage.getItem('devicename');
        return this.getPOSDeviceSettings(site, device)
      }
      return of(data)
    })).pipe(concatMap(data => {
      return of(data)
    }))
  }

  getPOSDeviceSettings(site, device) {
    return this.settingsService.getPOSDeviceSettings(site, device).pipe(concatMap(data => {
      this.settingsService.updateTerminalSetting(data)
      this.dsiEmv = data?.dsiEMVSettings;
      return of(data)
    }))
  }

  constructor(
      private authenticationService: AuthenticationService,
      private paymentService      : POSPaymentService,
      private paymentMethodService: PaymentMethodsService,
      private userAuthorization   : UserAuthorizationService,
      private siteService         : SitesService,
      public  route               : ActivatedRoute,
      private orderService        : OrdersService,
      public  orderMethodsService: OrderMethodsService,
      private employeeService: EmployeeService,
      private _snackBar           : MatSnackBar,
      private _bottomSheet        : MatBottomSheet,
      private printingService     : PrintingService,
      private uiSettings: UISettingsService,
      private settingsService       : SettingsService,
      private dCapService           : DcapService,
      @Optional() private dialogRef  : MatDialogRef<PosPaymentEditComponent>,

  ) {
    this.roles = localStorage.getItem(`roles`)
    this.isUserStaff = this.userAuthorization.isCurrentUserStaff()

  }

  ngOnInit() {

    this.id = this.route.snapshot.paramMap.get('id');
    // this.history = +this.route.snapshot.paramMap.get('history');

    this.initSubscriptions()

    if (this.payment.id) {
      this.id = this.payment.id.toString();
    }
    this.getItem(parseInt(this.id));

    const site = this.siteService.getAssignedSite();
    this.paymentMethods$ =  this.paymentMethodService.getCacheList(site);
    this.initUserSubscriber();
    this.initTerminalSettings();
  }

  ngOnDestroy(): void {
    if (this._payment) { this._payment.unsubscribe()}
    this.paymentService.updatePaymentSubscription(null)
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
      this.orderService.getOrder(site, this.payment.orderID.toString(), this.history).subscribe( order => {
          this.orderMethodsService.updateOrderSubscription(order)
          this.printingService.previewReceipt();
        }
      )
    }
  }

  assignEmployeeID(id: number) {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.employeeService.getEmployee(site, id).pipe(switchMap(data => {
      this.payment.employeeName = data?.name;
      this.payment.employeeID = data?.id
      const item = {employeeID: data?.id, employeeName: data?.name}
      this.inputForm.patchValue(item)
      return this.paymentService.putPOSPayment(site, this.payment);
    }))
  }


  viewOrder(event) {
    if (!this.payment) { return }
    const history = this.payment.history
    const id      = this.payment.orderID;
    const site    = this.siteService.getAssignedSite();
    const order$  =  this.orderService.getOrder(site, id.toString(), this.history )
    order$.subscribe(data =>  { this.orderMethodsService.setActiveOrder( data)
      this._bottomSheet.dismiss();
    })
  }

  getPaymentMethod(methodID: number) {
    const site         = this.siteService.getAssignedSite()
    this.paymentMethod$ = this.paymentMethodService.getPaymentMethod(site, methodID)
  }

  getItem(id: number) {
    const site      = this.siteService.getAssignedSite()
    this.payment$  = this.paymentService.getPOSPayment(site, id, this.history);

    this.payment$.pipe(
      switchMap( data => {
        this.payment = data;
        this.initForm();
        return this.paymentMethodService.getCacheMethod(site,data.paymentMethodID)
      })).subscribe(data => {
        this.paymentMethod = data;
    })

  }

  updateItem(event) {
    if (this.payment && this.inputForm.value) {
      const site      = this.siteService.getAssignedSite()
      this.payment = this.inputForm.value;

      if (this.history) {
        this.paymentService.putPOSPaymentHistory(site,this.payment).subscribe(data => {
          this.payment = this.inputForm.value
          if (data?.errorMessage)  {
            this.siteService.notify(data?.errorMessage, 'Success' , 10000)
            return
          }

          this.siteService.notify('Payment History Saved', 'Success' , 10000)
        })
        return;
      }

      this.paymentService.putPOSPayment(site,this.payment).subscribe(data => {
        this.payment = this.inputForm.value
        this.notify('Payment saved', 'Success')
      })
    }
  }

  initFormData(data) {
    this.inputForm.patchValue(data)
  }

  updateItemExit(event) {
    if (this.payment && this.inputForm.value) {
      const site      = this.siteService.getAssignedSite()
      this.payment = this.inputForm.value;
      this.paymentService.putPOSPayment(site,this.payment).subscribe(data => {
        this.payment = this.inputForm.value
        this.notify('Payment saved', 'Success')
        this.onCancel(null);
      })
    }
  }

  deleteItem(event) {
    const site      = this.siteService.getAssignedSite()
    if (this.payment) {
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

  reOpenOrderSub() {
    const orderID   = this.payment.orderID;
    this.reOpenOrder(orderID)
  }

  canRefundByRecordNo() {
    if (this.user && this.dsiEmv && this.terminalSettings) {
      if (this.userAuths.refundPayment) {
        if (this.uiTran) {
          if (this.uiTran.dCapEnabled) {
            if (this.payment.recordNo) {
              if (this.payment.amountPaid >0) {
                return true
              }
            }
          }
        }
      }
    }
    return false;
  }

  voidByRecordNumber( ) {
    if (!this.terminalSettings?.name) {
      return this.siteService.notify('no Device name', 'Close', 3200)
    }
    if (!this.history) { this.history = false }

    this.action$ = this.dCapService.voidByRecordNumber(this.terminalSettings.name,  this.payment.id).pipe(switchMap(data => {
      console.log('rStream', data?.response)
      if ( data?.response) {
        this.siteService.notify(`Result ${JSON.stringify(data?.response?.CmdStatus)}`, 'close', 600000, )
      }
      if ( !data?.response) {
        this.siteService.notify(`Result ${JSON.stringify(data)}`, 'close', 600000, )
      }

      if (!data?.payment) {
        this.payment  = data?.payment;
        this.paymentService.updatePaymentSubscription(data?.payment);
        this.initFormData(data?.payment);
      }
      this.rStream =  data?.response;
      this.errorMessage = data?.errorMessage
      return of(data)
    }))
  }


  voidByInvoice( ) {
    if (!this.terminalSettings?.name) {
      return this.siteService.notify('no Device name', 'Close', 3200)
    }
    if (!this.history) { this.history = false }

    this.action$ = this.dCapService.voidSaleByInvoiceNo(this.terminalSettings.name,  this.payment.id).pipe(switchMap(data => {
      console.log('rStream', data?.response)
      if ( data?.response) {
        this.siteService.notify(`Result ${JSON.stringify(data?.response?.CmdStatus)}`, 'close', 600000, )
      }
      if ( !data?.response) {
        this.siteService.notify(`Result ${JSON.stringify(data)}`, 'close', 600000, )
      }

      if (!data?.payment) {
        this.payment  = data?.payment;
        this.paymentService.updatePaymentSubscription(data?.payment);
        this.initFormData(data?.payment);
      }
      this.rStream =  data?.response;
      this.errorMessage = data?.errorMessage
      return of(data)
    }))
  }


  refundByRecordNo() {

    if (!this.terminalSettings?.name) {
      return this.siteService.notify('no Device name', 'Close', 3200)
    }
    if (!this.history) { this.history = false }

    this.action$ = this.dCapService.refundByRecordNo(this.terminalSettings.name, this.history, this.payment.id, false).pipe(switchMap(data => {
      console.log('rStream', data?.response)
      if ( data?.response) {
        this.siteService.notify(`Result ${JSON.stringify(data?.response?.CmdStatus)}`, 'close', 600000, )
      }
      if ( !data?.response) {
        this.siteService.notify(`Result ${JSON.stringify(data)}`, 'close', 600000, )
      }

      if (!data?.payment) {
        this.payment  = data?.payment;
        this.paymentService.updatePaymentSubscription(data?.payment);
        this.initFormData(data?.payment);
      }
      this.rStream =  data?.response;
      this.errorMessage = data?.errorMessage
      return of(data)
    }))
  }

  refundByRecordNoRemoveTip( ) {
    this.action$ = this.dCapService.refundByRecordNo(this.terminalSettings.name, this.payment.history, this.payment.id, true).pipe(switchMap(data => {
      this.siteService.notify(`Result ${JSON.stringify(data)}`, 'close', 600000, )
      this.jsonRsponse = data;
      return of(data)
    }))
  }

  reOpenOrder(id: number) {
    if (!this.payment) {  return }
    const site      = this.siteService.getAssignedSite()
    const order$    = this.orderService.getOrder(site, this.payment.orderID.toString(), this.history)

    order$.pipe(
      switchMap(data => {
        data.completionDate = null;
        data.completionTime = null;
        return this.orderService.putOrder(site, data)
      })).subscribe(data => {
        this.notify('This order has been re-opened.', 'Success')
    })
  }

  onCancel(event) {
    console.log('cancel')
    this._bottomSheet.dismiss();
  }

  notify(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
