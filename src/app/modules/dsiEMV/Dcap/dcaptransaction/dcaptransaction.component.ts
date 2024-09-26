import { Component, Inject, OnInit, Optional,OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable, Subject, catchError, concatMap, of, switchMap, takeUntil, timer } from 'rxjs';
import { IPOSPayment, IPOSOrder, ISetting } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
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
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { PlatformService } from 'src/app/_services/system/platform.service';
@Component({
  selector: 'app-dcaptransaction',
  templateUrl: './dcaptransaction.component.html',
  styleUrls: ['./dcaptransaction.component.scss']
})
export class DCAPTransactionComponent implements OnInit, OnDestroy {

  resultMessage: any;
  textResponse: string;
  androidApp = this.platformService.androidApp;
  dsiEmv : DSIEMVSettings
  paxApp: boolean;
  get isDev() { return this.siteService.isDev  }
  action$: Observable<any>;
  cancelAction$: Observable<any>;
  setting$: Observable<any>;
  actionSetting$: Observable<any>;
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

  amount: number;
  jsonView: boolean;
  jsonData: any;
  autoActionData: any;

  uiSettings$: Observable<TransactionUISettings>;
  terminalSettings$: Observable<ITerminalSettings>;
  
  saleComplete: boolean;
  creditOnly: boolean;
  debitOnly : boolean;

  smallDevice: boolean;
  isAdmin : boolean;

  remainingTime: number = 0;
  private stopTimer$ = new Subject<void>(); // For stopping the timer when component is destroyed

  // Start the timer based on the passed duration
  startTimer(duration: number): void {
    this.remainingTime = duration;
    
    timer(0, 1000)  // Emit values every second
      .pipe(takeUntil(this.stopTimer$))  // Stop if component is destroyed
      .subscribe(val => {
        this.remainingTime = duration - val;  // Decrease the remaining time
        if (this.remainingTime <= 0) {
          this.stopTimer();  // Clear timer when done
        }
      });
  }
 // Stop and clean up the timer
  stopTimer(): void {
    this.stopTimer$.next(); // Notify all subscribers to stop
    this.stopTimer$.complete(); // Complete the subject to clean up
  }


  constructor(
    public   platformService      : PlatformService,
    public  userAuthService       : UserAuthorizationService,
    public  authenticationService  : AuthenticationService,
    public  paymentMethodsService : PaymentsMethodsProcessService,
    public  paymentService        : POSPaymentService,
    private siteService           : SitesService,
    public  orderMethodsService   : OrderMethodsService,
    private settingsService       : SettingsService,
    private uiSettingService      : UISettingsService,
    private fb                    : UntypedFormBuilder,
    private dCapService           : DcapService,
    private dcapMethodsService    : DcapMethodsService,
    private loggerService         : LoggerService,
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


      this.isAdmin = this.authenticationService.isAdmin;
          
      if (this.authenticationService.deviceInfo) {
        this.smallDevice = this.authenticationService.deviceInfo.phoneDevice 
        if (this.authenticationService.deviceInfo.smallDevice) { 
          this.smallDevice  = true
        }
      }
    }

    autoActions(data) {
      if (this.authenticationService.deviceInfo) {
        this.smallDevice = this.authenticationService.deviceInfo.phoneDevice 
        if (this.authenticationService.deviceInfo.smallDevice) { 
          this.smallDevice  = true
          this.autoActionData = false;
          data.autoPay = false;
        }
      }

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

      
      ngOnDestroy() { 
        this.actionSetting$ =  this.saveSetting(true).pipe(switchMap(data => { 
          this.orderMethodsService._scanner.next(true)
          this.stopTimer();
          this.bringtoFront()
          return of(data)
        }))
      }


      sendDisplayToBack(){
        this.actionSetting$ = this.saveSetting(false)
      }

      sendDisplayToFront(){ 
        this.actionSetting$ = this.saveSetting(true)
      }

      saveSetting(sendToBack: boolean) { 

        if (!this.terminalSettings) { return of(null) }

        if (!this.terminalSettings.dsiEMVSettings) { return of({})}
        this.terminalSettings.dsiEMVSettings.sendToBack = sendToBack;
        const site = this.siteService.getAssignedSite();

        const item = this.terminalSettings;
        const text = JSON.stringify(item);
        let setting = {} as ISetting;
        setting.name   = item.name;
        setting.text   = text;
        setting.filter = 421
        const id = item.id;
        
        return this.settingsService.putSetting(site, item.id, setting).pipe(
          switchMap( data => {
            return of(data)
        }));
    
      }


      initTerminalSettings() {
        this.terminalSettings$ = this.settingsService.terminalSettings$.pipe(concatMap(data => {

          this.terminalSettings = data;
          this.dsiEmv = data?.dsiEMVSettings;
          this.isPax;
          this.sendDisplayToBack()
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

      initTimer() {
        // this.timer = setInterval(async () => {

        if (this.dsiEmv.timerBringToFront === 0 ) { 
          this.dsiEmv.timerBringToFront = 45
        }
        this.startTimer(this.dsiEmv.timerBringToFront)
        // })
      }

      payAmountV2() {
        if (!this.validateTransactionData()) { return }
        if (this.terminalSettings) {
          const device = this.terminalSettings.name;
          const site = this.siteService.getAssignedSite()
          this.initMessaging()
          this.processing = true;

          this.initTimer();
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
              this.processing$ =  this.dCapService.payAmountV2Debit(this.terminalSettings?.name , this.posPayment).pipe(concatMap(data => {
                this.result = data;
                return this.processResultsV2(data)
              }))
              return;
            }

            if (this.creditOnly) {
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

      get isPax() { 
        const data = this.terminalSettings;
        if (data?.dsiEMVSettings) {
          if (data?.dsiEMVSettings?.deviceValue) {
            this.paxApp = true
            return true;
          }
        }
      }

      async bringtoFront() { 
        console.log('pax', this.isPax)
        if (!this.isPax) { return }
        const options = {}
        this.stopTimer()
        await dsiemvandroid.bringToFront(options)
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
        // this.bringtoFront()
        if (!paymentResponse) {
          this.loggerService.publishObject('Credit processResults No Response', paymentResponse)
          this.processing = false;
          this.message = 'Processing failed, reason unknown.';
          this.bringtoFront()
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
                // this.bringtoFront()
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
          this.bringtoFront()
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
            this.bringtoFront()
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

      _cancelTransaction() {
        if (this.terminalSettings) {
          const device = this.terminalSettings.name;
          this.initMessaging()
          this.processing = true;
          return  this.dCapService.transactionCancel(device).pipe(switchMap(data => {
            this.processing = false;
            this.result = data;
            this.bringtoFront()
            this._close()
            return of(data);
          }))
        }
        return of(null)
      }

      _reset() {
        if (this.terminalSettings) {
          const device = this.terminalSettings?.name;
          this.initMessaging()
          this.processing = true;
          return  this.dCapService.transactionCancel(device).pipe(switchMap(data => {
            this.processing = false;
            this.result = data;
            this.bringtoFront();
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
      }

      _close() { 
        this.orderMethodsService._scanner.next(true)
        this.dialogRef.close()  
      }

      cancel() { 
        this.cancelAction$ = this._cancelTransaction()
      }

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
