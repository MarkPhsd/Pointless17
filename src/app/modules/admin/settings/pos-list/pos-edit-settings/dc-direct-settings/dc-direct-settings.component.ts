import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { DSIEMVSettings } from 'src/app/_services/system/settings/uisettings.service';
import { PointlessCCDSIEMVAndroidService } from 'src/app/modules/payment-processing/services';
import { DcapMethodsService } from 'src/app/modules/payment-processing/services/dcap-methods.service';
import { DcapRStream, DcapService } from 'src/app/modules/payment-processing/services/dcap.service';

@Component({
  selector: 'app-dc-direct-settings',
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
  @Input() inputForm: UntypedFormGroup;
  @Input() dsiEMVSettings: FormGroup;
  @Input() terminal : ITerminalSettings;
  @Input() isDSIEnabled: boolean;
  dcapResult: any;
  transactionForm: FormGroup;

  get getPaxInfo() {
    if (!this.dsiEMVSettings) {return false}
    const dsiEMVSettings = this.dsiEMVSettings.value
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

  async getDcapAndroidDeviceList() {
    const list = await this.dSIEMVAndroidService.getDeviceInfo()
    this.dcapAndroidDeviceList = list;
  }


  async paramDownload() {
    const options = {}
    const dsiEMV = this.dsiEMVSettings.value;

    // dsi.
    await   this.dSIEMVAndroidService.downloadParam(dsiEMV)

  }



  // HostOrIP   :[],
  // IpPort          :[],
  // MerchantID       :[],
  // TerminalID      :[],
  // OperatorID      :[],
  // POSPackageID    :['PointlessPOS/3.1'],
  // TranDeviceID    :[],
  // UserTrace       :[],
  // TranCode        :[],
  // SecureDevice    :[],
  // ComPort         :[],
  // PinPadIpAddress :[],
  // PinPadIpPort    :[],
  // SequenceNo      :[],
  // DisplayTextHandle :[],
  // enabled           :[],
  // partialAuth       :[],
  // deviceValue     : [],
  // supressedForms  : [],

  dCapReset() {
    const dsi = this.dsiEMVSettings.value as DSIEMVSettings
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

  async sale() {
    return ''
  }

  async refund() {
    return ''
  }

  async downloadParam() {
    const device = this.inputForm.value as DSIEMVSettings;
    this.dcapResult = await this.dSIEMVAndroidService.downloadParam(device)
  }


}
