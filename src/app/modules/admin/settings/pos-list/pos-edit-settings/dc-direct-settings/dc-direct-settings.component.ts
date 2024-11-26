import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { from, Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { DSIEMVSettings } from 'src/app/_services/system/settings/uisettings.service';
import { SystemService } from 'src/app/_services/system/system.service';
import { PointlessCCDSIEMVAndroidService } from 'src/app/modules/payment-processing/services';
import { DcapMethodsService } from 'src/app/modules/payment-processing/services/dcap-methods.service';
import { DCAPAndroidRStream, DcapRStream, DcapService } from 'src/app/modules/payment-processing/services/dcap.service';
// import { TranResponse, Transaction } from './../../models/models';
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { Transaction } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ValueFieldsComponent } from 'src/app/modules/admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { DCAPResponseMessageComponent } from 'src/app/modules/dsiEMV/Dcap/dcaptransaction/dcapresponse-message/dcapresponse-message.component';
import { NgxJsonViewerComponent, NgxJsonViewerModule } from 'ngx-json-viewer';
import { FormSelectListComponent } from 'src/app/shared/widgets/formSelectList/form-select-list.component';
@Component({
  selector: 'app-dc-direct-settings',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
  ValueFieldsComponent,DCAPResponseMessageComponent,
  NgxJsonViewerModule,
  FormsModule,ReactiveFormsModule,
  FormSelectListComponent,
  SharedPipesModule],
  templateUrl: './dc-direct-settings.component.html',
  styleUrls: ['./dc-direct-settings.component.scss']
})
export class DcDirectSettingsComponent implements OnInit {

  message: string;
  processing: boolean;
  errorMessage: string;
  result: any;
  response: DcapRStream;
  textResponse: string;
  resultMessage: string
  processing$: Observable<any>;

  action$: Observable<any>;
  dcapAndroidDeviceList: string[]

  log$: Observable<any>;
  @Input() inputForm: UntypedFormGroup;
  @Input() dsiEMVSettings: DSIEMVSettings;
  @Input() terminal : ITerminalSettings;
  @Input() isDSIEnabled: boolean;

  dcapResult: any;
  transactionForm: FormGroup;
  responseSuccess: string;
  hideRequest: boolean;
  cancelResponse: boolean;
  request: string;
  tranResponse: string;
  transactionResponse: string;
  cmdResponse: string;
  private timer: any;
  instructions: string;
  responseData: DCAPAndroidRStream;
  saleComplete: boolean;
  transaction: Transaction;
  isDevMode: boolean;

  get getPaxInfo() {
    if (!this.dsiEMVSettings) {return false}
    const dsiEMVSettings = this.dsiEMVSettings
    if (!this.platFormService.androidApp) { return true}
    if (dsiEMVSettings) {
      if (dsiEMVSettings?.deviceValue == 'EMV_A920PRO_DATACAP_E2E') {
        // this.dsiEMVSettings = data?.dsiEMVSettings
        return true;
      }
    }
    return false
  }

  get ParamDownloadCloudEMV() {

    const terminal = this.inputForm.value;
    const terminalName = terminal?.name;

    if (terminalName) {
      this.initMessaging();
      this.processing = true;
      this.processing$ =  this.dCapService.emvParamDownload(terminalName).pipe(switchMap(data => {
        this.processing = false;
        this.result = data;
        return of(data);
      }))
    }
    return of(null)

  }

  initMessaging() {
    this.processing = false;
    this.errorMessage = ''
    this.message = ''
    this.response = null;
    this.textResponse = null;
  }

  constructor(
    private sitesService        : SitesService,
    private dcapService         : DcapService,
    private fb                  : FormBuilder,
    public platFormService     : PlatformService,
    private dCapService           : DcapService,
    private dcapMethodsService : DcapMethodsService,
    private systemService: SystemService,
    public  dsiAndroidService: PointlessCCDSIEMVAndroidService,
    private dSIEMVAndroidService: PointlessCCDSIEMVAndroidService, ) {
  }

   initForm() {
    this.transactionForm = this.fb.group({
      amount: [1.00]
    })
   }

   async ngOnInit() {
      this.initForm()
      await this.getDcapAndroidDeviceList()
   }

   ngOnDestroy() {
    // this.isComponentActive = false;
    // if (this._order) {
    //    this._order.unsubscribe();
    // }
    if (this.timer) {
       clearInterval(this.timer);
    }
 }


 clearInfo() {
  this.dcapResult === null
  this.message = null;
 }
  async getDcapAndroidDeviceList() {
    const list = await this.dSIEMVAndroidService.getDeviceInfo()
    this.dcapAndroidDeviceList = list;
  }


  async dsiEMVReset() {
    try {
      this.resetResponse();
      this.processing = true;
      const dsiEMV = this.dsiEMVSettings;

      let options = this.dSIEMVAndroidService.getResetInfo(dsiEMV)
      const item =  await this.dSIEMVAndroidService.dsiEMVReset(dsiEMV);

      this.log$ = this.logTransaction(options).pipe(switchMap(data => {
        console.log('transaction reset')
        return of(data)
      }))

      this.checkResponse_Transaction("RESET")
      this.resultMessage = item?.value;
      this.processing = false;
    } catch (error) {
      this.message = JSON.stringify(error);
    }
  }

  async paramDownload() {
    try {
      this.resetResponse();
      this.processing = true;
      let options  =  this.initTransaction();
      // console.log('paramDownload proceess options', options)
      if (options) {
        this.log$ = this.logTransaction(options)
        const item = await dsiemvandroid.emvParamDownload(options);
        const stream =  this.dcapMethodsService.convertToObject(item.value)
        this.checkResponse_Transaction('PARAMDOWNLOAD');
      }
    } catch (error) {
      this.message = error;
    }
  }

  emvParamDownload() {
    if (this.terminal) {
      const device = this.terminal.name;
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

  dCapReset() {
    const dsi = this.dsiEMVSettings as DSIEMVSettings
    // console.log('this.inputForm.value?.posDevice', this.terminal)
    if (this.terminal.name) {
      const name = this.terminal.name
      this.action$ = this.dcapService.resetDevice(name).pipe(switchMap(data => {
        this.sitesService.notify(`Response: ${JSON.stringify(data)}`, 'Close', 100000)
        this.dcapResult = data;
        return of(data)
      }))
    } else {
      this.sitesService.notify(`Response: No Terminal assigned.`, 'Close', 100000)
    }
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

    item.pOSPackageID    = device?.POSPackageID
    item.tranCode        = value?.tranCode;
    item.UseForms        = this.useSuppressForms(device?.supressedForms)
    this.transaction     = item;
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

  async sale() {
    return ''
  }

  async refund() {
    return ''
  }

  checkResponse_Transaction(tranType) {
    this.processing = true;
    // console.log('checkResponse_Transaction', tranType)
    this.timer = setInterval(async () => {
      //PARAMDOWNLOAD
      if (tranType === 'PARAMDOWNLOAD') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckReset(this.timer, tranType)
      }
      if (tranType === 'RESET') {
        // Use an arrow function to maintain the 'this' context
        await this.intervalCheckReset(this.timer, tranType);
      }
      // if (tranType === 'EMVSALE') {
      //   // Use an arrow function to maintain the 'this' context
      //   await this.intervalCheckResponse(this.timer, tranType);
      // }
      // if (tranType === 'AdjustByRecordNo') {
      //   // Use an arrow function to maintain the 'this' context
      //   await this.intervalCheckResponse(this.timer, tranType);
      // }
      // if (tranType === 'EMVCANCEL') {
      //   // Use an arrow function to maintain the 'this' context
      //   await this.intervalCheckReset(this.timer);
      // }
      // if (tranType === 'PRINT' || tranType == 'print') {
      //   // Use an arrow function to maintain the 'this' context
      //   await this.intervalCheckPrint(this.timer);
      // }
    }, 500);
  }

  async intervalCheckReset(timer: any, tranType?: string) {
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
        this.log$ = this.logTransaction(response).pipe(switchMap(data => {
          console.log('transaction logged')
          return of(data)
        }))
        clearInterval(timer);  // Clear the interval here when the condition is met'
        await dsiemvandroid.clearResponse(options)
        this.readResult(response, tranType)
        await this.bringToFront()
      }
    }
  }

  async bringToFront() {
    let item         = this.initTransaction()
    item.UseForms = ""
    const printResult  = await dsiemvandroid.bringToFront(this.transaction)
  }

  readResult(cmdResponse: DCAPAndroidRStream, tranType: string) {
    const item = this.dcapMethodsService.readAndroidResult(cmdResponse, tranType);
    this.responseData = cmdResponse;

    if (item?.message === 'continue') {
      return item
    }

    console.log('TranType', tranType, item.success)

    if (tranType == 'EMVSALE' || tranType == 'EMVPreAuth' || tranType == 'AdjustByRecordNo' || tranType == 'Adjust') {
      this.saleComplete = item?.success;
    }

    if (!this.dsiEMVSettings?.supressedForms) {
      const options = {}
      dsiemvandroid.bringToFront(options)
    }

    this.message = item?.message;
    this.resultMessage = item?.resultMessage;
    this.processing = item?.processing;

    return item;
  }

  logTransaction(tran) {
    let log = {} as any;
    log.messageString = JSON.stringify(tran);
    log.type = 'DCAPPaxAndroid';
    log.subType = tran?.tranCode ?? tran?.trancode;
    return this.systemService.secureLogger( log )
  }

}
