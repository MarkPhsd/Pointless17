import { Component, Inject, OnInit, Optional } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
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
import { DcapService,DcapRStream, DCAPPaymentResponse } from 'src/app/modules/payment-processing/services/dcap.service';
import { LoggerService } from 'src/app/modules/payment-processing/services/logger.service';

@Component({
  selector: 'app-dcaptransaction',
  templateUrl: './dcaptransaction.component.html',
  styleUrls: ['./dcaptransaction.component.scss']
})
export class DCAPTransactionComponent implements OnInit {
  resultMessage: any;
  textResponse: string;
  get isDev() { return this.siteService.isDev  }
  action$: Observable<any>;
  processing$: Observable<any>;
  manual: boolean = false;
  posPayment: IPOSPayment;
  laneID: string;
  terminalSettings: ITerminalSettings;
  order: IPOSOrder;
  dataPass: any;
  transactionType: string;
  tipValue: string;
  message: string;
  processing: boolean;
  errorMessage: string;
  inputForm: UntypedFormGroup;
  result: any;
  response: DcapRStream;
  ui: TransactionUISettings
  dsiEmv : DSIEMVSettings
  amount: number;
  jsonView: boolean;
  jsonData: any;
  uiSettings$: Observable<TransactionUISettings>;
  autoActionData: any;
  terminalSettings$: Observable<ITerminalSettings>;
  saleComplete: boolean;
  creditOnly: boolean;
  debitOnly : boolean;
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
    private loggerService       : LoggerService,
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
      this.manual = data?.manualPrompt;
      this.creditOnly = data?.creditOnly;
      this.debitOnly  = data?.debitOnly;
      if (!data?.manualPrompt) {
        this.manual = false;
      }

    }

      autoActions(data) {
        // console.log('auto pay', data?.autoPay, data?.value)
        if (data?.autoPay) {
          if (data?.value> 0 ) {
            this.payAmount();
            return;
          }
          if (data?.value<0) {
            this.refundAmount();
            return;
          }
        }

        if (data?.autoAuth) {
          if (data?.value>0) {
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
            if (!this.manual) { this.manual = false}

            if (this.dsiEmv.v2) {
              const sale$ = this.dCapService.returnAmountV2(this.terminalSettings?.name , this.posPayment, this.manual);
              this.processing$ = sale$.pipe(concatMap(data => {
                this.result = data;
                return this.processResultsV2(data)
              }))
              return
            }

            const sale$ = this.dCapService.returnAmount(this.terminalSettings?.name , this.posPayment, this.manual);
            this.processing$ = sale$.pipe(switchMap(data => {
              data.authorize = (-(+data.authorize)).toString()
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

      payAmountV2() {
        if (!this.validateTransactionData()) { return }
        if (this.terminalSettings) {
          const device = this.terminalSettings.name;
          const site = this.siteService.getAssignedSite()
          this.initMessaging()
          this.processing = true;
          let sale$ = this.getPaymentManualChipv2().pipe(concatMap(data => {
            this.posPayment = data?.payment;
            this.result = data?.response;
            if (!data?.success) {
              this.response = data?.response;
            }

            return this.processResultsV2(data)
          }))
          this.processing$ = sale$
        }
      }

      payAmount() {
        if (!this.validateTransactionData()) { return }
        if (this.terminalSettings) {
          const device = this.terminalSettings.name;
          const site = this.siteService.getAssignedSite()
          this.initMessaging()
          this.processing = true;

          if (this.dsiEmv.v2) {

            if (this.debitOnly) {
              console.log('debitOnly')
              this.processing$ =  this.dCapService.payAmountV2Debit(this.terminalSettings?.name , this.posPayment).pipe(concatMap(data => {
                this.result = data;
                return this.processResultsV2(data)
              }))
              return;
            }

            if (this.creditOnly) {
              console.log('creditOnly')
              this.processing$ =  this.dCapService.payAmountV2Credit(this.terminalSettings?.name , this.posPayment).pipe(concatMap(data => {
                this.result = data;
                return this.processResultsV2(data)
              }))
              return;
            }

            this.processing$ = this.getPaymentManualChipv2().pipe(concatMap(data => {
              this.result = data;
              return this.processResultsV2(data)
            }))
            return
          }


          this.processing$ = this.getPaymentManualChip().pipe(concatMap(data => {
            this.result = data;
            return this.processResults(data)
          }))

        }
      }

      getPaymentManualChipv2() {
        if (this.creditOnly) {
          return this.dCapService.payAmountV2Credit(this.terminalSettings?.name , this.posPayment);
          return;
        }
        let sale$ = this.dCapService.payAmountV2(this.terminalSettings?.name , this.posPayment);
        if (this.manual) {
          sale$ = this.dCapService.payAmountManualV2(this.terminalSettings?.name , this.posPayment);
        }
        return sale$
      }

      getPaymentManualChip() {
        let sale$ = this.dCapService.payAmount(this.terminalSettings?.name , this.posPayment);
        if (this.manual) {
          sale$ = this.dCapService.payAmountManual(this.terminalSettings?.name , this.posPayment);
        }
        return sale$
      }

      processResultsV2(paymentResponse: DCAPPaymentResponse): Observable<any> {
        if (!paymentResponse) {
          this.loggerService.publishObject('Credit processResults No Response', paymentResponse)
          this.processing = false;
          this.message = 'Processing failed, reason unknown.';
          return of(null);
        }

        if (paymentResponse?.success) {
          const device = this.terminalSettings?.name;
          this.order  = paymentResponse?.order;
          this.posPayment = paymentResponse?.payment;

          const item$ = this.paymentMethodsService.processDCAPResponseV2(
                        this.posPayment,
                        this.order);

          return item$.pipe(concatMap( data => {
              this.processing = false;
              if (paymentResponse?.success) {
                this.close();
                return of(data);
              }
              if (!paymentResponse?.success) {
                this.response = paymentResponse?.response;
              }
              return of(null);
            }
          ))
        } else {
          console.log(paymentResponse?.response)
          this.processing = false;
          let message = paymentResponse?.errorMessage
          message = `Result failed: reason: ${message} - ${paymentResponse?.response?.TextResponse} - ${paymentResponse?.response?.CaptureStatus}`
          this.message = 'Processing failed, ' + message;
          this.response = paymentResponse?.response;
          return of(null)
        }

      }

      processResults(response: DcapRStream): Observable<any> {
        if (!response) {
          this.loggerService.publishObject('Credit processResults No Response', response)
          this.processing = false;
          this.message = 'Processing failed, reason unknown.';
          return of(null);
        }
        let item = this.readResult(response)
        if (item?.success) {
          const device = this.terminalSettings?.name;
          const item$ = this.paymentMethodsService.processDCAPResponse(
                        response,
                        this.posPayment,
                        this.order,
                        device );

          return item$.pipe(concatMap( data => {
              this.processing = false;
              if (data && item?.success) {
                this.close();
                return of(data);
              }

              return of(null);
            }
          ))
        } else {
          this.processing = false;
          this.message = 'Processing failed, ' + JSON.stringify(response);
          this.response = response;
          return of(null)
        }

      }

      payAmountManual() {
        if (!this.validateTransactionData()) { return };
        if (this.terminalSettings) {
          const device = this.terminalSettings.name;
          this.initMessaging()
          this.processing = true;
          this.processing$ = this.dCapService.payAmount(this.terminalSettings?.name , this.posPayment).pipe(concatMap(data => {
            this.processing = false;
            this.result = data;
            return of(data);
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
        this.processing$ = this._reset();
      }

      _reset() {
        if (this.terminalSettings) {
          const device = this.terminalSettings.name;
          this.initMessaging()
          this.processing = true;
          return  this.dCapService.resetDevice(device).pipe(switchMap(data => {
            this.processing = false;
            this.result = data;
            return of(data);
          }))
        }
        return of(null)
      }

      paramDownload() {
        if (this.terminalSettings) {
          const device = this.terminalSettings.name;
          this.initMessaging();
          this.processing = true;
          this.processing$ =  this.dCapService.emvParamDownload(device).pipe(switchMap(data => {
            this.processing = false;
            this.result = data;
            return of(data);
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

      close() {

        this._close()
        // this.processing$ = this._reset().pipe(switchMap(data => {
        //   setTimeout(() => {

        //   }, 50);
        //   return of(data)
        // }))
      }

      _close() {   this.dialogRef.close()  }
      cancel() {  this.close()  }

      get _tipValue() {
        if (!this.tipValue) {  this.tipValue = '0.00' }
        return this.tipValue;
      }

      initMessaging() {
        this.processing = false;
        this.errorMessage = ''
        this.message = ''
        this.response = null;
        this.textResponse = null;
      }

      validateTransactionData() {
        return this.dcapMethodsService.validateTransactionData(this.posPayment,this.terminalSettings,this.ui)
      }

      readResult(cmdResponse: DcapRStream) {
        this.loggerService.publishObject('Credit', cmdResponse)
        const item = this.dcapMethodsService.readResult(cmdResponse);
        this.message = item?.message;
        this.resultMessage = item?.resultMessage;
        this.processing = item?.processing;
        this.saleComplete = item?.success;
        this.textResponse = item?.textResponse;
        return item;
      }


}
