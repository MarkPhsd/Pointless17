import { Component, Inject, OnInit, Optional } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, catchError, concatMap, of, switchMap } from 'rxjs';
import { IPOSPayment, IPOSOrder } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { DSIEMVSettings, TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { DcapMethodsService } from 'src/app/modules/payment-processing/services/dcap-methods.service';
import { DcapService,DcapRStream } from 'src/app/modules/payment-processing/services/dcap.service';

@Component({
  selector: 'app-dcaptransaction',
  templateUrl: './dcaptransaction.component.html',
  styleUrls: ['./dcaptransaction.component.scss']
})
export class DCAPTransactionComponent implements OnInit {
  resultMessage: any;
  get isDev() {
    return this.siteService.isDev

  }
  action$: Observable<any>;
  processing$: Observable<any>;
  manual: boolean = false;
  posPayment: IPOSPayment;
  laneID: string;
  terminalSettings: ITerminalSettings;
  order: IPOSOrder;
  message: string;
  dataPass: any;
  transactionType: string;
  tipValue: string;
  processing: boolean;
  errorMessage: string;
  inputForm: UntypedFormGroup;
  ui: TransactionUISettings
  dsiEmv : DSIEMVSettings
  amount: number;
  jsonView: boolean;
  jsonData: any;
  uiSettings$: Observable<TransactionUISettings>;
  autoActionData: any;
  terminalSettings$: Observable<ITerminalSettings>;
  result: any;
  response: DcapRStream;

  constructor(
    public  userAuthService       : UserAuthorizationService,
    public  auth                  : UserAuthorizationService,
    public  paymentMethodsService : PaymentsMethodsProcessService,
    public  paymentService        : POSPaymentService,
    private siteService           : SitesService,
    public  orderMethodsService   : OrderMethodsService,
    private settingsService       : SettingsService,
    private uiSettingService      : UISettingsService,
    private fb                    : UntypedFormBuilder,
    private dCapService           : DcapService,
    private dcapMethodsService : DcapMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef  : MatDialogRef<DCAPTransactionComponent>)
    {
      if (!data) {
        this.message = "No Payment or Order Assigned."
        return;
      }
      this.ui = data?.settings;

      if (!this.ui) {
        if (this.uiSettingService._transactionUISettings.value) {
          this.ui = this.ui = this.uiSettingService._transactionUISettings.value;
          this.uiSettings$  = of(this.uiSettingService._transactionUISettings.value)
        } else {
          this.uiSettings$ = this.settingsService.getUITransactionSetting().pipe(switchMap(data => {
            this.ui = data;
            return of(data)
          }))
        }
      }

      this.posPayment = data?.payment;
      this.order = data?.order;
      this.dataPass = data;
      this.amount =  data?.value;
      this.autoActionData = data;

    }

    autoActions(data) {
      console.log('auto pay', data?.autoPay, data?.value)
      if (data?.autoPay) {
        if (data?.value> 0 ) {
          this.payAmount();
          return;
        }
        if (data?.value<0) {
          console.log('auto Refund', data?.value )
          this.refundAmount();
          return;
        }
      }

      if (data?.autoAuth) {
        if (data?.value>0) {
          console.log('auto auth', data?.value )
          this.preAuth();
          return;
        }
      }
    }

    initForm() {
      this.inputForm = this.fb.group({
        itemName: ['0.00']
      })
    }

    ngOnInit(): void {
      this.initForm()
      const i = 0;
      this.initTerminalSettings()
    }

    initTerminalSettings() {
      this.terminalSettings$ = this.settingsService.terminalSettings$.pipe(concatMap(data => {
        this.terminalSettings = data;
        this.dsiEmv = data?.dsiEMVSettings;
        if (!data) {
          const site = this.siteService.getAssignedSite();
          const device = localStorage.getItem('devicename');
          return this.getPOSDeviceSettings(site, device)
        }
        return of(data)
      })).pipe(concatMap(data => {
        if (this.autoActionData) {
          console.log('auto actions', this.terminalSettings , this.dsiEmv)
          if (this.terminalSettings && this.dsiEmv) {
            this.autoActions(this.autoActionData)
          }
          return of(data)
        }
      }))
    }


  getPOSDeviceSettings(site, device) {
    return this.settingsService.getPOSDeviceSettings(site, device).pipe(concatMap(data => {
      this.settingsService.updateTerminalSetting(data)
      this.dsiEmv = data?.dsiEMVSettings;
      return of(data)
    }))
  }

  refundAmount() {
    if (!this.validateTransactionData()) { return }
    if (this.terminalSettings) {
        const device = this.terminalSettings.name;
        const site = this.siteService.getAssignedSite()
        this.initMessaging()
        this.processing = true;
        const sale$ = this.dCapService.returnAmount(this.terminalSettings?.name , this.posPayment, this.manual);
        this.processing$ = sale$.pipe(switchMap(data => {
          data.Authorize = (-(+data.Authorize)).toString()
          this.result = data;
          this.processing = false;
          return this.processResults(data)
        })),catchError(data => {
          this.processing = false;
          this.siteService.notify(JSON.stringify(data), 'Close', 10000, 'red')
          return of(data)
        })
      }
    }

    preAuth() {
      if (!this.validateTransactionData()) { return }
      if (this.terminalSettings) {
        const device = this.terminalSettings?.name;
        const site = this.siteService.getAssignedSite()
        this.initMessaging()
        this.processing = true;
        const sale$ = this.dCapService.preAuth(this.terminalSettings?.name , this.posPayment, this.manual);
        this.processing$ = sale$.pipe(concatMap(data => {
          this.result = data;
          return this.processResults(data)
        })),catchError(data => {
          this.processing = false;
          this.siteService.notify(JSON.stringify(data), 'Close', 10000, 'red')
          return of(data)
        })
      }
    }

    payAmount() {

      if (!this.validateTransactionData()) { return }

      if (this.terminalSettings) {
        const device = this.terminalSettings.name;
        const site = this.siteService.getAssignedSite()
        this.initMessaging()
        this.processing = true;
        let sale$ = this.getPaymentManualChip().pipe(concatMap(data => {
          this.result = data;
          return this.processResults(data)
        }))

        this.processing$ = sale$
      }
    }

    getPaymentManualChip() {
      let sale$ = this.dCapService.payAmount(this.terminalSettings?.name , this.posPayment);
      if (this.manual) {
        sale$ = this.dCapService.payAmountManual(this.terminalSettings?.name , this.posPayment);
      }
      return sale$
    }

    processResults(response: DcapRStream): Observable<any> {
      if (!response) {
        this.processing = false;
        this.message = 'Processing failed, reason unknown.'
        return of(null)
      }
      let item = this.readResult(response)

      console.log('item?.success', item?.success)

      if (item?.success) {
        const device = this.terminalSettings?.name;

        const item$ = this.paymentMethodsService.processDCAPResponse(
                      response,
                      this.posPayment,
                      this.order,
                      device );

        return item$.pipe(concatMap( data => {
            this.processing = false;

            console.log('Process Results:', data , item?.success)

            if (data && item?.success) {
              console.log('set interval close window')
              // setTimeout(itemval => {
              //   console.log('close window')
              this.close();
              // }, 50 )
              return of(data)
            }

            return of(null)
          }
        ))

      } else {
        this.processing = false
        this.message = 'Processing failed, ' + JSON.stringify(response)
        this.response = response;
        return of(null)
      }

    }

    payAmountManual() {
      if (!this.validateTransactionData()) { return }
      if (this.terminalSettings) {
        const device = this.terminalSettings.name;
        this.initMessaging()
        this.processing = true
        this.processing$ = this.dCapService.payAmount(this.terminalSettings?.name , this.posPayment).pipe(concatMap(data => {
          this.processing = false
          this.result = data;
          return of(data)
        }))
      }
    }

    completeAuthorization() {

    }

    authorizeAmount() {

    }

    reverseAuthorization() {

    }

    reset() {
      this.processing$ = this._reset()
    }

    _reset() {
      if (this.terminalSettings) {
        const device = this.terminalSettings.name;
        this.initMessaging()
        this.processing = true;
        return  this.dCapService.resetDevice(device).pipe(switchMap(data => {
          this.processing = false
          this.result = data;
          return of(data)
        }))
      }
      return of(null)
    }

    paramDownload() {
      if (this.terminalSettings) {
        const device = this.terminalSettings.name;
        this.initMessaging()
        this.processing = true;
        this.processing$ =  this.dCapService.emvParamDownload(device).pipe(switchMap(data => {
          this.processing = false
          this.result = data;
          return of(data)
        }))
      }
      return of(null)
    }

    applyTipAmount(event) {
      this.tipValue = event;
    }

    addTipPercent(value) {
      if (value) {
        this.tipValue = ( this.posPayment.amountPaid * (value/100) ).toFixed(2);
      }
      if (value == 0) {
        this.tipValue = '0';
        return
      }
    }

    validateTransactionData() {
      let result = true;
      if (!this.posPayment) {
        this.siteService.notify('No Payment', 'Alert', 2000)
         result = false
      }
      if (!this.terminalSettings) {
        this.siteService.notify('No device settings', 'Alert', 2000)
         result = false
      }
      if (!this.ui) {
        this.siteService.notify('No system settings', 'Alert', 2000)
          result = false
      }
      return result
    }

    close() {
      this.processing$ = this._reset().pipe(switchMap(data => {
        setTimeout(() => {
          this._close()
        }, 50);
        return of(data)
      }))
    }

    _close() {   this.dialogRef.close()  }

    get _tipValue() {
      if (!this.tipValue) {  this.tipValue = '0.00' }
      return this.tipValue;
    }

    initMessaging() {
      this.processing = false;
      this.errorMessage = ''
      this.message = ''
      this.response = null;
    }

    readResult(cmdResponse: DcapRStream) {
      const item = this.dcapMethodsService.readResult(cmdResponse);

      this.message = item?.message;
      this.resultMessage = item?.resultMessage;
      this.processing = item?.processing;
      return item;
    }

    cancel() {
      this.close()
    }
}
