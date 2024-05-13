
import { Component,EventEmitter,Inject,Input,OnInit, Optional, Output } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Capacitor} from '@capacitor/core';
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Observable,switchMap,of , Subscription} from 'rxjs';
import { IPOSPayment } from 'src/app/_interfaces';
import { TranResponse, Transaction } from './../../models/models';
import { PointlessCCDSIEMVAndroidService } from './../../services/index';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPOSOrder,} from 'src/app/_interfaces';
import { DSIEMVSettings, TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
// import  * from '@capacitor/capacitor-android-foreground-service';

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
export class DsiEMVAndroidComponent implements OnInit {

  @Input() isAdmin: boolean;
  @Input() isManager: boolean;
  @Input() transaction: Transaction;
  @Output() getTranResponse = new EventEmitter();
  @Output() getCmdResponse = new EventEmitter();
  @Input() saleOnly: boolean;

  request       : string;
  cancelResponse: boolean;
  processRunning: boolean;
  messageResponse: string;

  btTransactionResponse: string;
  btcmdResponse: string;
  btTextResponse: string;

  setting: any;
  title   = 'DSIEMVAngular';
  message : any
  transactionResponse : any;
  responseURL = 'http://localhost:8080/' ;
  selected: any;
  hideRequest = true;
  // blueToothDeviceList: any;
  btDeviceSelected  = '';
  btDeviceConnected = false;

  dsiDeviceList : any;
  secureDevice: any;
  viewSelectDeviceList = false;

  ////////////////////////
  response: any;
  cmdResponse  :any;
  textResponse : any;
  tranResponse : any;
  responseSuccess = ''
  transaction$ : Observable<Transaction>;
  payment      : IPOSPayment;
  _order       : Subscription;
  order        : IPOSOrder;
  uiTransactions: TransactionUISettings

  enterTip: boolean;
  dsiEMVSettings : DSIEMVSettings;
  PaxA920 : boolean;
  payApiEnabled: boolean;
  posDevice$: Observable<any>;

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
     private ngxXml2jsonService: NgxXml2jsonService,
     public  dsiAndroidService: PointlessCCDSIEMVAndroidService,
     public  paymentsMethodsProcessService: PaymentsMethodsProcessService,
     public  orderMethodsService: OrderMethodsService,
     private uISettingsService:    UISettingsService,
     @Optional() private dialogRef: MatDialogRef<DsiEMVAndroidComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any
  ){

    //data would be the payment
    // console.log('injected payment', data.payment)
    if (data &&  data.payment ) {
      this.saleOnly = true;
      this.payment = data.payment ;
    }
    this.initPOSDevice();
  }

  ngOnInit() {

    this.initSubscriptions()
    this.resetResponse();// = ''
    this.message = "...waiting for results."
    // this.getMessageResponse();
    this.initTransactionObservable()
  }

  close() {
    if (this.processRunning) { 
      this.emvCancel();
    }
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

              data.amount = this.payment.amountPaid.toString();
              data.invoiceNo = this.payment.id.toString();
              data.userTrace = this.payment?.employeeName

              if (this.payment.amountPaid + this.payment.tipAmount > 0){
                data.tranCode = 'EMVSale'
              }
              if (this.payment.amountPaid + this.payment.tipAmount < 0){
                data.tranCode = 'EMVRefund'
              }
              this.dsiAndroidService.transaction = data;
              return of(data)
            }
          }
      ))
    }
    if (!this.payment) {
      this.transaction$ = process$
    }
  }

  async checkBTPermission() {
    const options = {value: 'test'};
    // dsiemvandroid.getHasPermission(options)
  }

  async getDeviceInfo() {
    return  await  this.dsiAndroidService.getDeviceInfo;
  }

  async resetResponse() {
    this.tranResponse = null;
    this.cmdResponse  = '';
    this.textResponse = '';
    this.message = ''
    if (this.processRunning) {
      this.cancelResponse = true;
    }
    const options = {value:''}
    // const result = await dsiemvandroid.setResponse(options);
  }

  async resetbtResponse() {
    this.btTextResponse = '';
    this.btcmdResponse = '';
    if (this.processRunning) {
      this.cancelResponse = true;
    }
    const options = {value:''}
    // const result =  await dsiemvandroid.setbtResponse(options);
  }

  async refreshInfo() {
    await this.resetResponse();
  }

  async connectToBTDevice() {
    await this.resetbtResponse();
    this.processRunning = true;
    const btItem = this.dsiAndroidService.transaction;
    if (!btItem.bluetoothDeviceName) {
      this.message = 'No Bluetooth Device is selected';
      return;
    }
    this.message = 'Connecting to device. ' + btItem.bluetoothDeviceName

    try {
      const options = {'value': btItem.bluetoothDeviceName};
      // const item = await dsiemvandroid.connectToBT(options);
      await this.checkResponse();
      const message = {'response': '', value: ''};
      // let value = await dsiemvandroid.getMessageResponse(message);
      this.message = ''
      // this.messageResponse = value.value;
    } catch (error) {
      console.log('response', error)
    }
  }

  async disConnectToBTDevice() {
    if (this.btDeviceConnected && this.btDeviceSelected) {
      await this.resetResponse();
      const options = {'value': this.btDeviceSelected};
      // const item = await dsiemvandroid.disconnectFromBt(options);
      await this.checkbtResponse();
    }
  }

  async dsiEMVReset() {
    try {
      await this.resetResponse();
      this.processRunning = true;
      const item =  await this.dsiAndroidService.dsiEMVReset(this.dsiEMVSettings);
      this.messageResponse = item?.value;
      this.processRunning = false;
    } catch (error) {
      this.message = error;
    }
  }

  connect(item: any)
  {
    //This will connect to bluetooth printer via the mac address provided
    this.selected = item;
  }

  async btDisconnect() {
    try {
      await this.resetResponse();
      this.processRunning = true;
      const options =  this.dsiAndroidService.transaction as any;
      options.merchantID      = options.merchantID;
      options.pinPadIpAddress = options.pinPadIpAddress;

      const ip = { value: ' value.'}
      // options.pinPadIpAddress = await dsiemvandroid.getIPAddressPlugin(ip);

      options.padPort         = options.padPort;
      // const item    = await dsiemvandroid.disconnectFromBt(options)
      // this.message  = item;
      await this.checkResponse();
    } catch (error) {
      this.message = error;
    }
  }

  async emvParamDownload() {
    try {
      await this.resetResponse();
      const transaction       = this.dsiAndroidService.transaction
      this.processRunning     = true;
      const options           = this.dsiAndroidService.transaction as any;
      options.BTDevice        = transaction.bluetoothDeviceName
      options.secureDevice    = transaction.secureDevice;
      options.merchantID      = transaction.merchantID;
      // options.pinPadIpAddress = transaction.pinPadIpAddress;

       const ip = { value: ' value.'}
      // options.pinPadIpAddress = await dsiemvandroid.getIPAddressPlugin(ip);

      options.padPort         = transaction.padPort;
      try {
        // const item            = await dsiemvandroid.emvParamDownload(options)
        this.message = 'Param Download...'
        await this.checkResponse();
        const message = {'response': '', value: ''};
        // let value = await dsiemvandroid.getMessageResponse(message);
        // this.message = ''
        // this.messageResponse = value.value;
      } catch (error) {
        console.log('response', error)
      }

    } catch (error) {
      this.message = error;
    }
  }

  async _emvParamDownload() {
    try {
      await this.resetResponse();
      const transaction       = this.dsiAndroidService.transaction
      this.processRunning     = true;
      const options           = this.dsiAndroidService.transaction as any;
      options.BTDevice        = transaction.bluetoothDeviceName
      options.secureDevice    = transaction.secureDevice;
      options.merchantID      = transaction.merchantID;
      options.pinPadIpAddress = transaction.pinPadIpAddress;
      options.padPort         = transaction.padPort;
      const item              = await dsiemvandroid.emvParamDownload(options)
      // this.message            = item;
      await this.checkResponse();
    } catch (error) {
      this.message = error;
    }
  }

  async checkResponse_Transaction() {
    var timer = setInterval(
                await this.intervalCheckResponse,
      500);
    if(timer){
        clearInterval(timer)
    }
  }

  async intervalCheckResponse() {
    let responseSuccess = ''
    let request = ''
    request = await this.getRequest();
    this.request = request;
    responseSuccess =  this.responseSuccess;
    const item = await this.getResponse();
    if (item) {
      if (item.value != '' || this.cancelResponse) {
        this.cancelResponse = false;
        this.processRunning = false;
        responseSuccess     = 'complete'
        return true;
      }
    }
  }

  async  checkResponse() {
    let responseSuccess = ''
    let request = ''

    while (request === '') {
      request = await this.getRequest();
      console.log('checkResponse', request)
      this.request = request;
    }

    while (responseSuccess === '') {

      console.log('responseSuccess', responseSuccess);

      if (this.responseSuccess != '') {
        responseSuccess =  this.responseSuccess;
      }

      this.bringAppToFront()

      if (responseSuccess) { 
      }

      const item = await this.getResponse();

      console.log('response Item', item)

      if (item) {
        if (item.value != '' || this.cancelResponse) {
          this.cancelResponse = false;
          this.processRunning = false;
          this.hideRequest    = true;
          responseSuccess     = 'complete'
          this.bringAppToFront()
          return;
        }
      }

    };

  }

  async bringAppToFront() {
    try {
     
      console.log('App brought to the front successfully!');
    } catch (error) {
      console.error('Failed to bring the app to the front:', error);
    }
  }

  async getResponse(){
    const options = {'response': '', value: ''};
    let item: any;
    this.messageResponse = item.value;
    if (item.value) {
      if (item.value.substring(0, 5) === '<?xml' || item.value.substring(0, 5) === '<RStr') {
        this.messageResponse = ''
        const parser = new DOMParser();
        item.value =  item?.value.replace('#', '')
        const xml = parser.parseFromString(item.value, 'text/xml');
        const obj = {} as any; // this.ngxXml2jsonService.xmlToJson(xml) as any;
        console.log( 'getResponseobj', obj )

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
        this.processRunning  = false;
        return  item ;
      }
    }
    this.transactionResponse = item?.value;
  }

  async getRequest() {
    const options = {'response': '', value: ''};
    let item: any;
    if (item && item.value) {
      try {
        if (item.value.substring(0, 5) === '<?xml' || item.value.substring(0, 5) === '<RStr') {
          item.value =  item?.value.replace('#', '')
          item.value =  item?.value.replace('\n', '')
          const parser = new DOMParser();
          const xml = parser.parseFromString(item.value, 'text/xml');
          const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
          return  obj
        }
      } catch (error) {
        console.log('item', item)
        return   JSON.parse(item.value)
      }
    }
    return  item
  }

  async  checkbtResponse() {
    let responseSuccess = ''
    while (responseSuccess === '') {
      const value = {value: 'get'}
      const item = await this.getbtResponse();

      if ((item && item.value != '') || this.cancelResponse) {
        this.cancelResponse = false;
        this.processRunning = false;
        this.messageResponse = ''
        responseSuccess = 'complete'
        this.message = '';
        this.request = '';
        return;
      }
    };
  }

  async getbtResponse(){
    const options = {'response': '', value: ''};
    let item: any;
    // const item = await dsiemvandroid.getbtResponse(options);
    console.log('getbtResponse 1', item)
    try {
      if (item.value) {
        if (item.value.substring(0, 5) === '<?xml' ||  item.value.substring(0, 5) === '<TStr' || item.value.substring(0, 5) === '<RStr') {
          this.cancelResponse = true;
          const parser = new DOMParser();
          item.value =  item?.value.replace('#', '')
          const xml = parser.parseFromString(item.value, 'text/xml');
          const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
          // const obj = {} as any;
          console.log('cmdResponse', obj?.RStream?.CmdResponse)
          console.log('cmdResponse', obj?.RStream?.CmdResponse.TextResponse)
          this.tranResponse  = obj?.TranResponse;

          if (item.value.substring(0, 5) === '<RStr') {
            this.cmdResponse = obj?.RStream?.CmdResponse.CmdStatus;
            this.textResponse = obj?.RStream?.CmdResponse.TextResponse;
          }
          if (item.value.substring(0, 5) === '<?xml') {
            this.cmdResponse = obj?.CmdResponse.CmdStatus;
            this.textResponse = obj?.CmdResponse.TextResponse;
          }

          this.cancelResponse = false;
          this.processRunning = false;
          return item;
        }
      }
    } catch (error) {
      this.cancelResponse = false;
      this.processRunning = false;
    }
    this.message = item;
    this.transactionResponse = item?.value;
  }

  async emvCancel() {
    try {
      this.message = ''
      this.messageResponse = ''
      this.responseSuccess  = 'false'
      this.hideRequest    = false;
      await this.resetResponse();
      this.cancelResponse = true;
      this.processRunning = false;
      const options = { value: ' value.'}
      // let item: any;
      const item    = await dsiemvandroid.cancelTransaction(options)
      console.log('emvCancel', item)
      this.message  = ''
      this.request  = ''
      this.tranResponse  = ''
      this.transactionResponse =  '';
      this.close()
    } catch (error) {
      this.message = error;
    }
  }

  specifiedTip(event) {
    if (this.payment) {
      this.payment.tipAmount = event
    }
  }

  customTipAmount(event) {
    if (this.payment) {
      this.payment.tipAmount = event
    }
  }

  async emvSale() {
    try {
      await this.resetResponse();
      this.processRunning = true;
      let options  = await this.initTransaction();
      if (options) {

        const item = await dsiemvandroid.processSale(options);
        await  this.checkResponse();
        if (this.textResponse.toLowerCase() === 'approved') {
          await this.paymentsMethodsProcessService.processCreditCardResponse(this.response, this.payment,
                                                this.orderMethodsService.currentOrder);
          if (this.dialogRef) {
            this.dialogRef.close()
          }
          return;
        }

      }
    } catch (error) {
      this.message = error;
    }
  }

   initTransaction(): any {

    const device          = this.dsiEMVSettings
    const item           = {} as Transaction;
    const value          = this.dsiAndroidService.transaction;// as Transaction;
    
    console.log('device', device)
    console.log('invoiceID', this.payment?.orderID)

    item.secureDevice    = device?.deviceValue;
    item.amount          = value?.amount;
    item.merchantID      = device?.MerchantID;
    item.pinPadIpAddress = device?.HostOrIP;
    item.padPort         = device?.PinPadIpPort;  
    item.userTrace       = device.OperatorID;
    item.prodCertMode    = "CERT"
    item.invoiceNo       = this.payment?.orderID.toString();
    item.pOSPackageID    = device?.POSPackageID

    item.tranCode        = value?.tranCode;

    console.log(item)
    this.transaction = item;
    // if (value?.bluetoothDeviceName) { 
    //   item.bluetoothDeviceName  = value?.bluetoothDeviceName;
    //   const ip = { value: ' value.'}
    //   item.pinPadIpAddress =  dsiemvandroid.getIPAddressPlugin(ip);
    // } 

    return item;
  }


}
