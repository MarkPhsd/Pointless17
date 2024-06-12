
import { Component,EventEmitter,Inject,Input,OnDestroy,OnInit, Optional, Output } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Capacitor} from '@capacitor/core';
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Observable,switchMap,of , Subscription} from 'rxjs';
import { IPOSPayment, IPaymentResponse } from 'src/app/_interfaces';
import { TranResponse, Transaction } from './../../models/models';
import { PointlessCCDSIEMVAndroidService } from './../../services/index';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPOSOrder,} from 'src/app/_interfaces';
import { DSIEMVSettings, TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { DCAPAndroidRStream, DcapRStream } from '../../services/dcap.service';
import { DcapMethodsService } from '../../services/dcap-methods.service';
import { PrintData, RStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { AWSBucketService, AuthenticationService } from 'src/app/_services';
// import  * from '@capacitor/capacitor-android-foreground-service';
// import '@anuradev/capacitor-background-mode';
// const { BackgroundMode } = Capacitor.Plugins;
// https://www.npmjs.com/package/capacitor-plugin-permissions
// https://capacitorjs.com/docs/v2/plugins/android
// https://stackoverflow.com/questions/53065255/how-can-i-access-application-in-mainactivity-which-we-get-in-ionic-projects
// https://developer.android.com/guide/components/intents-common
// https://stackoverflow.com/questions/5944987/how-to-create-a-popup-window-popupwindow-in-android
// https://developer.android.com/training/basics/firstapp/starting-activity
// https://developer.cardpointe.com/cardconnect-api#rESTful-implementation
// https://stackoverflow.com/questions/28094523/cannot-find-mainactivity-for-intent-inside-cordova-plugin

@Component({
  selector: 'pointlesscc-dsi-emvandroid',
  templateUrl: './dsi-emvandroid.component.html',
  styleUrls: ['./dsi-emvandroid.component.scss']
})
export class DsiEMVAndroidComponent implements OnInit, OnDestroy {

  processCreditCardResponse$: Observable<any>;

  isDevMode: boolean;

  @Input() isAdmin: boolean;
  @Input() isManager: boolean;
  @Input() transaction: Transaction;
  @Output() getTranResponse = new EventEmitter();
  @Output() getCmdResponse = new EventEmitter();
  @Input() saleOnly: boolean;

  request       : string;
  cancelResponse: boolean;

  btTransactionResponse: string;
  btcmdResponse : string;
  btTextResponse: string;

  setting: any;
  title   = 'Payment Processing';
  message : any
  resultMessage: string;
  errorMessage: string;
  processing: boolean;

  transactionResponse : any;
  responseURL = 'http://localhost:8080/' ;
  selected: any;
  hideRequest = true;

  btDeviceSelected  = '';
  btDeviceConnected = false;

  dsiDeviceList : any;
  secureDevice: any;
  viewSelectDeviceList = false;

  ////////////////////////
  responseData: DCAPAndroidRStream
  response: any;
  cmdResponse  :any;
  textResponse : any;
  tranResponse : any;
  responseSuccess = ''
  transaction$ : Observable<Transaction>;
  action$      : Observable<any>;
  payment      : IPOSPayment;
  _order       : Subscription;
  order        : IPOSOrder;
  uiTransactions: TransactionUISettings
  uiHomePageSetting: UIHomePageSettings;
  uiHome$: Observable<UIHomePageSettings>;
  counter: number = 0;

  enterTip: boolean;
  dsiEMVSettings : DSIEMVSettings;
  PaxA920 : boolean;
  payApiEnabled: boolean;
  posDevice$: Observable<any>;
  saleComplete: boolean ;// disables sale buttons
  companyName: string;
  gratitude: string;

  saved: boolean;
  stream: DCAPAndroidRStream;

  type: number;
  private timer: any;
  paymentResponse: IPaymentResponse;
  instructions: string;
  initPOSDevice() {
    this.posDevice$      = this.uISettingsService.posDevice$.pipe(switchMap(data => {
      if (!data)  {
        const item = localStorage.getItem('devicename')
        return this.uISettingsService.getPOSDevice(item).pipe(switchMap(data => {
          this.setPaxInfo(data)
          this.uISettingsService.updatePOSDevice(data)
          return of(data)
        }))
      } else {
        this.setPaxInfo(data)
      }
      return of(data)
    }))
  }

  setPaxInfo(data) {
    if (data.dsiEMVSettings) {
      if (data?.dsiEMVSettings?.deviceValue == 'EMV_A920PRO_DATACAP_E2E') {
        this.PaxA920 = true
        this.dsiEMVSettings = data?.dsiEMVSettings
      }
    }
  }

  get isAndroid() {
    const platForm =   Capacitor.getPlatform();
    if (platForm === 'android') {
      return true
    }
    return false;
  }

  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.subscribe(order => {
      this.order = order;
    })
    this.initTransactionUISettings()
  }

  initTransactionUISettings() {
    this.uISettingsService.transactionUISettings$.subscribe( data => {
        this.uiTransactions = data
      }
    )
  }

  constructor(
     public  dsiAndroidService: PointlessCCDSIEMVAndroidService,
     public  paymentsMethodsProcessService: PaymentsMethodsProcessService,
     public  orderMethodsService: OrderMethodsService,
     private uISettingsService:    UISettingsService,
     private dcapMethodsService: DcapMethodsService,
     private authService : AuthenticationService,
     private uiSettingService       : UISettingsService,
     private awsBucketService       : AWSBucketService,
     public  paymentMethodsService : PaymentsMethodsProcessService,
     @Optional() private dialogRef: MatDialogRef<DsiEMVAndroidComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any
  ){

    if (data && data?.type == 3) {
      this.type = 3;
      this.payment = data?.payment;
      this.saleComplete = true;
    }

    if (data &&  data.payment ) {
      this.saleOnly = true;
      this.payment = data.payment ;
    }

    this.isAdmin = this.authService.isAdmin;
    this.initPOSDevice();

  }

  async ngOnInit() {

    const options = {}
    await dsiemvandroid.clearResponse(options)
    await this.dsiEMVReset();
    this.initLogo();
    this.gratitude = this.getRandomGratitudeStatement();

    if (this.type ==3) {
      this.saleComplete = true;
    }

    this.initSubscriptions();
    this.resetResponse();// = ''
    this.message = "...waiting for results."
    this.initTransactionObservable();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async initLogo() {
    const bucket = await this.awsBucketService.awsBucketURL()
    this.uiHome$ = this.uiSettingService.homePageSetting$.pipe(switchMap(data => {
      const image  = `${bucket}${data?.backgroundImage}`
      if (data?.displayCompanyName) {
        this.companyName = data?.displayCompanyName;
      }
      return of(data)
    }))
  }

  async close() {
    await this.emvCancel();
    if (this.processing) {
    }
    this.forceClose()
  }

  async emvCancel() {
    try {
      const options = {}
      await dsiemvandroid.clearResponse(options)
      const item = await dsiemvandroid.cancelTransaction(options);
      this.checkResponse_Transaction("EMVCANCEL")
    } catch (error) {
      this.message = error;
    }
  }

  forceClose() {
    if (this.dialogRef) {
      this.dialogRef.close()
    }
  }

  initTransactionObservable() {
    const process$ = this.dsiAndroidService.getSettings();
    if (this.payment && this.payment.id) {
      this.transaction$ = process$.pipe(
        switchMap(
          data => {
          if (data) {
              if (this.payment.completionDate) {

              } else {
                this.setPaymentInfo(this.payment,data)
              }

              return of(data)
            }
          }
      ))
    }
    if (!this.payment) {
      this.transaction$ = process$
    }
  }

  setPaymentInfo(payment: IPOSPayment, data: Transaction) {
    data.amount    = this.payment.amountPaid.toString();
    data.invoiceNo = this.payment.id.toString();
    data.userTrace = this.payment?.employeeName

    if (this.payment.amountPaid + this.payment.tipAmount > 0){
      data.tranCode = 'EMVSale'
    }
    if (this.payment.amountPaid + this.payment.tipAmount < 0){
      data.tranCode = 'EMVRefund'
    }
    this.dsiAndroidService.transaction = data;
  }

  async getDeviceInfo() {
    return  await  this.dsiAndroidService.getDeviceInfo;
  }

  resetResponse() {

    this.message = ''
    this.resultMessage = ''
    this.responseSuccess  = 'false'
    this.hideRequest    = false;
    this.cancelResponse = true;
    this.processing = false;
    this.message  = ''
    this.request  = ''
    this.tranResponse  = ''
    this.transactionResponse =  '';

    this.tranResponse = null;
    this.cmdResponse  = '';
    this.textResponse = '';
    this.message = '';
    this.errorMessage = '';
    this.resultMessage = '';
    if (this.processing) {
      this.cancelResponse = true;
    }
    const options = {value:''}
  }

  async resetbtResponse() {
    this.btTextResponse = '';
    this.btcmdResponse = '';
    if (this.processing) {
      this.cancelResponse = true;
    }
    const options = {value:''}
  }

  async paramDownload() {
    try {
      await this.resetResponse();
      this.processing = true;
      let options  =  this.initTransaction();
      if (options) {
        const item = await dsiemvandroid.emvParamDownload(options);
        const stream =  this.dcapMethodsService.convertToObject(item.value)
        this.checkResponse_Transaction('PARAMDOWNLOAD');
      }
    } catch (error) {
      this.message = error;
    }
  }

  async dsiEMVReset() {
    try {
      await this.resetResponse();
      this.processing = true;
      const item =  await this.dsiAndroidService.dsiEMVReset(this.dsiEMVSettings);
      this.resultMessage = item?.value;
      this.processing = false;
    } catch (error) {
      this.message = error;
    }
  }

  mssTextMessage() {

  }

  connect(item: any)
  { this.selected = item;  }

  checkResponse_Transaction(tranType) {
    this.processing = true;
    console.log('checkResponse_Transaction', tranType)
    this.timer = setInterval(async () => {
      //PARAMDOWNLOAD
      if (tranType === 'PARAMDOWNLOAD') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckReset(this.timer);
      }
      if (tranType === 'RESET') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckReset(this.timer);
      }
      if (tranType === 'EMVSALE') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckResponse(this.timer);
      }
      if (tranType === 'AdjustByRecordNo') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckResponse(this.timer);
      }
      if (tranType === 'EMVCANCEL') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckReset(this.timer);
      }
      if (tranType === 'PRINT' || tranType == 'print') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckPrint(this.timer);
      }
    }, 500);
  }


  async intervalCheckPrint(timer: any) {
    let responseSuccess = '';
    console.log('intervalCheckPrint')
    const options = {}
    const paymentResponse = await dsiemvandroid.getResponse(options);
    if (paymentResponse && (paymentResponse.value !== '' )) {
      this.instructions = ''
      clearInterval(timer);  // Clear the interval here when the condition is met'
      await dsiemvandroid.bringToFront(options)
      await dsiemvandroid.clearResponse(options)
    }
  }

  async intervalCheckReset(timer: any) {
    // console.log('intervaleCheckReset')
    let responseSuccess = '';
    const options = {}
    const paymentResponse = await dsiemvandroid.getResponse(options);
    if (paymentResponse && (paymentResponse.value !== '' || this.cancelResponse)) {
      this.instructions = ''
      this.cancelResponse = false;
      this.processing = false;
      responseSuccess = 'complete';
      const response = this.dcapMethodsService.convertToObject(paymentResponse.value)
      if (response) {
        clearInterval(timer);  // Clear the interval here when the condition is met'
        await dsiemvandroid.clearResponse(options)
        this.readResult(response, "EMVRESET")
      }
    }
  }

  async intervalAdjutByRecordNoResponse(timer: any) {
    let responseSuccess = '';
    const options = {}
    const paymentResponse = await dsiemvandroid.adjustByRecordNo(options);
    if (paymentResponse && (paymentResponse.value !== '' )) {
      this.cancelResponse = false;
      this.processing = false;
      responseSuccess = 'complete';
      this.instructions = ''
      const response = this.dcapMethodsService.convertToObject(paymentResponse.value)
      console.log('intervalAdjutByRecordNoResponse')
      if (response) {
        const result =   this.readResult(response, "AdjustByRecordNo");
        console.log('result', result.success, result.message)
        if (result.success) {
          clearInterval(timer);
          await dsiemvandroid.clearResponse(options)
          this.processAjustResponseStream(response)
        }
      }

      clearInterval(timer);  // Clear the interval here when the condition is met'
      await dsiemvandroid.clearResponse(options)
    }

  }

  async intervalCheckResponse(timer: any) {
    let responseSuccess = '';
    const options = {}
    const paymentResponse = await dsiemvandroid.getResponse(options);
    if (paymentResponse && (paymentResponse.value !== '' )) {
      this.cancelResponse = false;
      this.processing = false;
      responseSuccess = 'complete';
      this.instructions = ''
      const response = this.dcapMethodsService.convertToObject(paymentResponse.value)
      console.log('intervalCheckResponse')
      if (response) {
        const result =   this.readResult(response, "EMVSale");
        console.log('result', result.success, result.message)
        if (result.success) {
          clearInterval(timer);
          await dsiemvandroid.clearResponse(options)
          this.processResponse(response)
        }
      }
      clearInterval(timer);  // Clear the interval here when the condition is met'
      await dsiemvandroid.clearResponse(options)
    }

  }

  async emvSale() {
    try {
      await this.resetResponse();
      this.processing = true;
      let options  =  this.initTransaction();

      // if (this.isDevMode) {
      if (this.dsiEMVSettings?.supressedForms) {
        this.instructions = 'Please wait for reader'
      } else {
        this.instructions = 'Please tap or insert card'
      }

      if (options) {
        const item = await dsiemvandroid.processSale(options);
        const stream =  this.dcapMethodsService.convertToObject(item.value)
        this.checkResponse_Transaction('EMVSALE');
      }
    } catch (error) {
      this.message = error;
    }
  }

  async print() {
    let item         = this.initTransaction()
    item.UseForms = ""
    item.tranCode    = "PrintReceipt";
    let printData    = this.responseData?.PrintData;
    const printInfo = this.mergePrintDataToTransaction(printData, item)
    const printResult  =  dsiemvandroid.print(printInfo)
    this.checkResponse_Transaction('PRINT')
  }

  async bringToFront() {
    let item         = this.initTransaction()
    item.UseForms = ""
    item.tranCode    = "PrintReceipt";
    let printData    = this.responseData?.PrintData;
    const printInfo = this.mergePrintDataToTransaction(printData, item)
    const printResult  = await dsiemvandroid.bringToFront(printInfo)
  }

  async resetDeviceAsync() {
    await this.resetResponse();
    const item = this.dsiAndroidService.dsiEMVReset(this.dsiEMVSettings);
    this.checkResponse_Transaction('RESET');
  }

  async  checkResponse() {
    let responseSuccess = ''
    let request = ''
    while (responseSuccess === '') {
      const item = await this.getResponse();

      if (this.responseSuccess != '') {
        responseSuccess =  this.responseSuccess;
      }

      if (item) {
        if (item.value != '' || this.cancelResponse) {
          this.cancelResponse = false;
          this.processing = false;
          this.hideRequest    = true;
          responseSuccess     = 'complete'
          await  this.bringAppToFront()
          return;
        }
      }
    };
  }

  async bringAppToFront() {
    try {
      const options = {}
      const item    = await dsiemvandroid.bringToFront(options)
    } catch (error) {
      console.error('Failed to bring the app to the front:', error);
    }
  }

  async getResponse(){
    const options = {'response': '', value: ''};
    let item: any;
    this.resultMessage = item?.value;
    if (item.value) {
      if (item.value.substring(0, 5) === '<?xml' || item.value.substring(0, 5) === '<RStr') {
        this.resultMessage = ''
        const parser = new DOMParser();
        item.value =  item?.value.replace('#', '')
        const xml = parser.parseFromString(item.value, 'text/xml');
        const obj = {} as any;

        if (item.value.substring(0, 5) === '<?xml' ) {
          this.response = obj
          this.cmdResponse = (obj?.RStream?.CmdResponse);
          this.textResponse = (obj?.RStream?.CmdResponse?.TextResponse);
          this.tranResponse =  obj?.RStream?.TranResponse as TranResponse;
        }

        if (item.value.substring(0, 5) === '<RStr') {
          this.response = obj
          this.cmdResponse = (obj?.RStream?.CmdResponse);
          this.textResponse = (obj?.RStream?.CmdResponse?.TextResponse);
          this.tranResponse =  obj?.RStream?.TranResponse as TranResponse;
        }

        if (this.cmdResponse) {
          this.getCmdResponse.emit(this.cmdResponse)
        }
        if (this.tranResponse) {
          this.getTranResponse.emit(this.tranResponse)
        }

        this.cancelResponse  = false;
        this.processing  = false;
        return  item ;
      }
    }
    this.transactionResponse = item?.value;
  }

  specifiedTip(event) {
    if (this.payment) {
      this.payment.tipAmount = event;
      console.log('eventvalue', this.payment.tipAmount)
      this.processDcapTip(this.payment.tipAmount);
      this.enterTip = false;
    }
  }

  customTipAmount(event) {
    if (this.payment) {
      this.payment.tipAmount = event
      this.processDcapTip(this.payment.tipAmount);
      this.enterTip = false;
      return;
    }
  }

  async processDcapTip(amount) {

      console.log('reset')
      await this.resetResponse();

      const tran = this.initTipTransaction(amount);
      if (tran) {
        await dsiemvandroid.adjustByRecordNo(tran)
        console.log('tran await')
        this.checkResponse_Transaction('AdjustByRecordNo');
      }
  }

  processAjustResponseStream(stream: DCAPAndroidRStream) {
    // const stream = this.dcapMethodsService.convertToObject(paymentresponse)
    // return this.finalizeTransaction(data)
    let item = this.readResult(stream, "AdjustByRecordNo")

    if (item?.success) {
      //then clear things that have been running.
      this.order;
      stream.CmdResponse;
      const item = {} as RStream;
      item.CmdResponse = stream?.CmdResponse;
      item.PrintData = stream?.PrintData;
      item.TranResponse = stream?.TranResponse  as any;

      this.payment.textResponse = JSON.stringify(item)
      this.processCreditCardResponse$ = this.paymentsMethodsProcessService.adjustByRecordNoDCAP(item, this.payment,
                                                                                          this.order).pipe(switchMap(data => {

        if (data) {
          this.saved = true
          this.stream = stream
          this.payment  = data;
        }
        return of(data)
      }))
    }
  }

  processResponse(stream: DCAPAndroidRStream) {
    // const stream = this.dcapMethodsService.convertToObject(paymentresponse)
    // return this.finalizeTransaction(data)
    let item = this.readResult(stream, "EMVSALE")

    if (item?.success) {
      //then clear things that have been running.
      this.order;
      stream.CmdResponse;
      const item = {} as RStream;
      item.CmdResponse = stream?.CmdResponse;
      item.PrintData = stream?.PrintData;
      this.payment.acqRefData = stream?.TranResponse.AcqRefData;
      item.TranResponse = stream?.TranResponse  as any;
      this.processCreditCardResponse$ = this.paymentsMethodsProcessService.getCardResponse(item, this.payment,
                                                                                          this.order).pipe(switchMap(data => {

        if (data) {
          this.saved = true
          this.stream = stream
          this.payment  = data.payment;
          this.paymentResponse = data;


        }
        return of(data)
      }))
    }
  }

  completeTransaction() {
    this.action$ = this.paymentsMethodsProcessService.finalizeTransaction(this.paymentResponse).pipe(switchMap(data => {
      setTimeout(() => {
          this.close()
      }, 100)
      return of(data)
    }))
  }

  initTipTransaction(amount) {
    let tran        = this.initTransaction()
    tran.TranCode   = "AdjustByRecordNo"
    tran.TranType   = "Credit";
    tran.invoiceNo  = this.payment?.orderID;
    tran.ReturnClearExpDate = "Allow";
    tran.gratuity   = amount;
    tran.amount     = this.payment?.amountPaid;
    tran.LaneID     = "1"
    tran.Frequency  = "OneTime"
    tran.AcqRefData = this.payment?.acqRefData;
    tran.acqRefData = this.payment?.acqRefData;
    tran.authCode   = this.payment?.preAuth;
    tran.recordNo   = this.payment?.ccNumber;
    tran.RecordNo   = this.payment?.ccNumber;
    tran.procesData = this.payment?.processData
    if (!this.payment.acqRefData) {
      try {
        const rStream = JSON.parse(this.payment.transactionData) as RStream
        console.log(rStream)
        if (rStream) {
          if (rStream?.TranResponse?.AcqRefData) {
            tran.acqRefData = rStream?.TranResponse?.AcqRefData
          }
          if (rStream?.TranResponse?.RecordNo) {
            tran.RecordNo = rStream?.TranResponse?.RecordNo;
            tran.recordNo = rStream?.TranResponse?.RecordNo
          }
          if (rStream?.TranResponse.AuthCode) {
            tran.AuthCode   = rStream?.TranResponse.AuthCode
            tran.authCode   = rStream?.TranResponse.AuthCode
          }
          if (rStream?.TranResponse.ProcessData) {
            tran.ProcessData   = rStream?.TranResponse.ProcessData
            tran.processData   = rStream?.TranResponse.ProcessData
          }
          if (rStream?.TranResponse.ProcessData) {
            tran.refNo   = rStream?.TranResponse.RefNo
            tran.RefNo   = rStream?.TranResponse.RefNo
          }
        }

      } catch (error) {

      }
    }

    if (this.payment?.recordNo) {
      tran.RecordNo   = this.payment?.recordNo;
    }
    tran.ProcessData = this.payment?.processData;
    console.log('Tip Transaction', tran)
    return tran
  }

  initReset(): any {
    const device          = this.dsiEMVSettings
    const item           = {} as Transaction;
    const value          = this.dsiAndroidService.transaction;// as Transaction;
    item.amount          = value?.amount;
    item.secureDevice    = device?.deviceValue;
    item.merchantID      = device?.MerchantID;
    item.pinPadIpAddress = device?.HostOrIP;
    item.pinPadIpPort    = device?.PinPadIpPort;
    item.userTrace       = device?.OperatorID;
    item.prodCertMode    = this.certProdMode(device?.MerchantID)
    item.UseForms        = this.useSuppressForms(device.supressedForms)
    item.invoiceNo       = this.payment?.orderID.toString();
    item.pOSPackageID    = device?.POSPackageID
    item.tranCode        = value?.tranCode;
    this.transaction     = item;
    console.log('item', item)
    return item;
  }

   initTransaction(): any {
    const device          = this.dsiEMVSettings
    const item           = {} as any;
    const value          = this.dsiAndroidService.transaction;// as Transaction;
    item.secureDevice    = device?.deviceValue;
    item.amount          = value?.amount;
    item.merchantID      = device?.MerchantID;
    item.pinPadIpAddress = device?.HostOrIP;
    item.pinPadIpPort    = device?.PinPadIpPort;
    item.userTrace       = device?.OperatorID;
    item.prodCertMode    = this.certProdMode(device?.MerchantID);
    item.refNo           = this.payment?.orderID.toString();
    item.invoiceNo       = this.payment?.orderID.toString();
    item.pOSPackageID    = device?.POSPackageID
    item.tranCode        = value?.tranCode;
    item.UseForms        = this.useSuppressForms(device.supressedForms)
    this.transaction     = item;
    item.RefNo           = this.payment?.orderID.toString();
    item.refNo           = this.payment?.orderID.toString();
    return item;

  }

  certProdMode(merchantID: string) {
    if (merchantID === 'COASTSAND0GP') {return 'CERT'}
    if (merchantID === 'COASTSAND1GP') { return 'CERT'}
    return 'PROD'
  }

  useSuppressForms(suppressedForms: boolean) {
    if (this.isDevMode) { return }
    if (suppressedForms) {return 'Supressed'}
    return ''
  }

  initMessaging() {
    this.processing = false;
    this.errorMessage = ''
    this.message = ''
    this.response = null;
  }

  validateTransactionData() {
    return this.dcapMethodsService.validateAndroidTransactionData(this.payment)
  }

  readResult(cmdResponse: DCAPAndroidRStream, tranType: string) {
    const item = this.dcapMethodsService.readAndroidResult(cmdResponse);
    this.responseData = cmdResponse;
    console.log('TranType', tranType, item.success)
    if (tranType == 'EMVSALE' || tranType == 'EMVPreAuth' || tranType == 'AdjustByRecordNo') {
      this.saleComplete = item?.success;
    }

    if (!this.dsiEMVSettings?.supressedForms) {
      const options = {}
      dsiemvandroid.bringToFront(options)
    }

    this.message = item?.message;
    this.resultMessage = item?.resultMessage;
    this.processing = item?.processing;
    this.cmdResponse = cmdResponse?.CmdResponse;
    return item;
  }

  getRandomGratitudeStatement(): string {
    const gratitudeStatements: string[] = [
        "Thanks a bunch!",
        "You rock, thanks!",
        "We're grateful for you!",
        "You're the best!",
        "Thanks, you're awesome!",
        "We appreciate you!",
        "Thank you, you're a rockstar!",
        "Cheers to you!",
        "You're amazing, thanks!",
        "Thanks, you're great!",
        "You're fantastic, thanks!",
        "You're the best, thanks!"
    ];

    const randomIndex: number = Math.floor(Math.random() * gratitudeStatements.length);
    return gratitudeStatements[randomIndex];
  }

  mergePrintDataToTransaction(
    printData: PrintData,
    transaction: Transaction
  ): Transaction {
    const mergedTransaction = {
      ...transaction,
      ...printData
    };
    return mergedTransaction;
  }

  showHidePaxNavigation() {
    const options = {hide: true}
    dsiemvandroid.hideShowNav(options)
  }

  displayAdmin() {
    this.counter  = this.counter +1
    if (this.counter > 5) {
      this.counter = 0;
      this.isDevMode = true;
    }
  }

}

 // processDcapTip(amount: number) {
  //   const device = localStorage.getItem('devicename')
  //   const site = this.siteService.getAssignedSite()
  //   const process$ = this.dCapService.adustByRecordNo(device, this.payment, amount)
  //   return process$.pipe(switchMap(data => {
  //     if (data && data.TextResponse && data.TextResponse.toLowerCase() != 'Approved'.toLowerCase()) {
  //       if (data?.cmdStatus?.toLowerCase === 'error'.toLowerCase) {
  //         this.siteService.notify(data.cmdResponse + ' ' + data.textResponse, 'close',50000, 'red' )
  //         return of(null)
  //       }
  //     }
  //     return this.getOrderUpdate(this.payment.orderID.toString(), site)
  //   }))
  // }

// async _emvParamDownload() {
//   try {
//     await this.resetResponse();
//     const transaction       = this.dsiAndroidService.transaction
//     this.processing     = true;
//     const options           = this.dsiAndroidService.transaction as any;
//     options.BTDevice        = transaction.bluetoothDeviceName
//     options.secureDevice    = transaction.secureDevice;
//     options.merchantID      = transaction.merchantID;
//     options.pinPadIpAddress = transaction.pinPadIpAddress;
//     options.padPort         = transaction.padPort;
//     const item              = await dsiemvandroid.emvParamDownload(options)
//     await this.checkResponse();
//   } catch (error) {
//     this.message = error;
//   }
// }

// async emvParamDownload() {
//   try {
//     await this.resetResponse();
//     const transaction       = this.dsiAndroidService.transaction
//     this.processing     = true;

//     const device = this.dsiEMVSettings
//     const options           = this.dsiAndroidService.transaction as any;
//     options.BTDevice        = transaction.bluetoothDeviceName
//     options.secureDevice    = device.SecureDevice;
//     options.merchantID      = device.MerchantID;
//     options.merchantID      = device.HostOrIP;
//     options.padPort         = transaction.padPort;

//     const ip = { value: ' value.'}
//     try {
//       // const item            = await dsiemvandroid.emvParamDownload(options)
//       this.message = 'Param Download...'
//       await this.checkResponse();
//       const message = {'response': '', value: ''};
//     } catch (error) {
//       console.log('response', error)
//     }

//   } catch (error) {
//     this.message = error;
//   }
// }
  // async  checkbtResponse() {
  //   let responseSuccess = ''
  //   while (responseSuccess === '') {
  //     const value = {value: 'get'}
  //     const item = await this.getbtResponse();

  //     if ((item && item.value != '') || this.cancelResponse) {
  //       this.cancelResponse = false;
  //       this.processing = false;
  //       this.resultMessage = ''
  //       responseSuccess = 'complete'
  //       this.message = '';
  //       this.request = '';
  //       return;
  //     }
  //   };
  // }

  // async getbtResponse(){
  //   const options = {'response': '', value: ''};
  //   let item: any;
  //   // const item = await dsiemvandroid.getbtResponse(options);
  //   console.log('getbtResponse 1', item)
  //   try {
  //     if (item.value) {
  //       if (item.value.substring(0, 5) === '<?xml' ||  item.value.substring(0, 5) === '<TStr' || item.value.substring(0, 5) === '<RStr') {
  //         this.cancelResponse = true;
  //         const parser = new DOMParser();
  //         item.value =  item?.value.replace('#', '')
  //         const xml = parser.parseFromString(item.value, 'text/xml');
  //         const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
  //         // const obj = {} as any;
  //         console.log('cmdResponse', obj?.RStream?.CmdResponse)
  //         console.log('cmdResponse', obj?.RStream?.CmdResponse.TextResponse)
  //         this.tranResponse  = obj?.TranResponse;

  //         if (item.value.substring(0, 5) === '<RStr') {
  //           this.cmdResponse = obj?.RStream?.CmdResponse.CmdStatus;
  //           this.textResponse = obj?.RStream?.CmdResponse.TextResponse;
  //         }
  //         if (item.value.substring(0, 5) === '<?xml') {
  //           this.cmdResponse = obj?.CmdResponse.CmdStatus;
  //           this.textResponse = obj?.CmdResponse.TextResponse;
  //         }

  //         this.cancelResponse = false;
  //         this.processing = false;
  //         return item;
  //       }
  //     }
  //   } catch (error) {
  //     this.cancelResponse = false;
  //     this.processing = false;
  //   }
  //   this.message = item;
  //   this.transactionResponse = item?.value;
  // }
  // async getRequest() {
  //   const options = {'response': '', value: ''};
  //   let item: any;

  //   if (item && item.value) {
  //     try {
  //       if (item.value.substring(0, 5) === '<?xml' || item.value.substring(0, 5) === '<RStr') {
  //         item.value =  item?.value.replace('#', '')
  //         item.value =  item?.value.replace('\n', '')
  //         const parser = new DOMParser();
  //         const xml = parser.parseFromString(item.value, 'text/xml');
  //         const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
  //         return  obj
  //       }
  //     } catch (error) {
  //       console.log('item', item)
  //       return   JSON.parse(item.value)
  //     }
  //   }
  //   return  item
  // }

  // processResults(response: DCAPAndroidRStream): Observable<any> {
  //   if (!response) {
  //     this.processing = false;
  //     this.message = 'Processing failed, reason unknown.'
  //     return of(null)
  //   }
  //   let item = this.readResult(response, "EMVSALE")
  //   if (item?.success) {
  //     const device = this.dsiEMVSettings.deviceValue
  //     const item$ = this.paymentMethodsService.processDCAPResponse(
  //                   response,
  //                   this.payment,
  //                   this.order,
  //                   device );

  //     return item$.pipe(concatMap( data => {
  //         this.processing = false;
  //         if (data && item?.success) {
  //           this.close();
  //           return of(data)
  //         }
  //         return of(null)
  //       }
  //     ))
  //   } else {
  //     this.processing = false
  //     this.message = 'Processing failed, ' + JSON.stringify(response)
  //     this.response = response;
  //     return of(null)
  //   }

  // }
