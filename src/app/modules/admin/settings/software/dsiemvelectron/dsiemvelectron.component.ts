import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { DSIEMVTransactionsService, Transaction,TStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { DSIEMVSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-dsiemvelectron',
  templateUrl: './dsiemvelectron.component.html',
  styleUrls: ['./dsiemvelectron.component.scss']
})
export class DSIEMVElectronComponent implements OnInit {

  inputForm  : FormGroup;
  uiSettings : ISetting;
  uiSettings$: Observable<ISetting>;
  uiISettingJSON = {} as DSIEMVSettings;
  responseMessage: string;
  isElectron: boolean
  pathForm  : FormGroup;

  // "<TStream>" & vbCrLf &
  // "    <Admin>" & vbCrLf &
  // "        <HostOrIP>dsl1.dsipscs.com</HostOrIP>" & vbCrLf &
  // "        <IpPort>9000</IpPort>" & vbCrLf &
  // "        <MerchantID>700000012262</MerchantID>" & vbCrLf &
  // "        <TerminalID>001</TerminalID>" & vbCrLf &
  // "        <OperatorID>TEST</OperatorID>" & vbCrLf &
  // "        <UserTrace>Dev1</UserTrace>" & vbCrLf &
  // "        <TranCode>EMVParamDownload</TranCode>" & vbCrLf &
  // "        <SecureDevice>EMV_VX805_PAYMENTECH</SecureDevice>" & vbCrLf &
  // "        <ComPort>1</ComPort>" & vbCrLf &
  // "        <SequenceNo>0010010010</SequenceNo>" & vbCrLf &
  // "    </Admin>" & vbCrLf &
  // "</TStream

  pathName = 'default'
  get f() {return this.pathForm.controls}
  constructor(private uISettingsService: UISettingsService,
              private dsiEMVService: DSIEMVTransactionsService,
              private fb: FormBuilder,
              private electronService : ElectronService) { }

  ngOnInit(): void {
    if (this.electronService.remote) {
      this.isElectron = true;
    }
    this.inputForm = this.uISettingsService.initDSIEMVForm(this.inputForm)
    this.uISettingsService.getSetting('DSIEMVSettings').subscribe(data => {
      if (data) {
        this.uiISettingJSON = JSON.parse(data.text) as DSIEMVSettings
        this.initForm(data);
      }
    });
    this.pathForm = this.fb.group({
      pathName: ['']
    })
  }

  saveSettings() {
    console.log(this.inputForm.value)
    if (!this.inputForm) { return }
    const item = this.inputForm.value;
    console.log(item)
    const json = JSON.stringify(item);
    console.log('json',json)
    localStorage.setItem('DSIEMVSettings', json)
    console.log('save settings',json)
  }

  loadSettings() {
    console.log('load settings')
    if (!this.inputForm) { return }
    const item = localStorage.getItem('DSIEMVSettings');
    console.log('load settings',item)
    if (!item) { return }
    const obj = JSON.parse(item)
    this.inputForm.patchValue(obj)
  }

  initParamDownload_Transaction() {
    const transaction = {} as Transaction
    transaction.MerchantID    ='700000012262';
    transaction.TerminalID    ='001';
    transaction.OperatorID    ='TEST';
    transaction.IpPort        ='9000';
    transaction.UserTrace     ='Dev1';
    transaction.TranCode      ='EMVParamDownload';
    transaction.SecureDevice  ='EMV_VX805_PAYMENTECH';
    transaction.ComPort       ='6';
    return transaction;
  }

  initPinPadReset_Transaction() {
    const transaction = {} as Transaction
    transaction.MerchantID    ='700000012262';
    transaction.TerminalID    ='001';
    transaction.OperatorID    ='TEST';
    transaction.IpPort        ='9000';
    transaction.UserTrace     ='Dev1';
    transaction.TranCode      ='EMVPadReset';
    transaction.SecureDevice  ='EMV_VX805_PAYMENTECH';
    transaction.ComPort       ='6';
    transaction.SequenceNo    ='0010010010'
    return transaction;
  }

  initPinPadResetForm() {
    const transaction = this.initPinPadReset_Transaction();
    this.inputForm.patchValue(transaction);
  }

  initParamDownloadResetForm() {
    const transaction = this.initParamDownload_Transaction();
    this.inputForm.patchValue(transaction);
  }

  initForm(setting: ISetting) {
    const form = this.inputForm
    this.inputForm = this.uISettingsService.initDSIEMVForm(form)
    this.loadSettings()
    this.uISettingsService.setFormValue(form, setting,  'DSIEMVSettings').subscribe(data => {
      if (data) {
        const config = JSON.parse(data.text) as DSIEMVSettings
        this.inputForm = this.uISettingsService.initForms_Sub(form, data.name, config)
      }
    })
  }

  updateSetting(){
    this.saveSettings(); //65000004171545
    //  this.uISettingsService.saveConfig(this.inputForm, 'DSIEMVSettings').subscribe(data => {
    //  })
  }

  async pinPadReset(){
    const transactiontemp = this.inputForm.value as Transaction;
    const transaction     = {} as Transaction // {...transactiontemp, id: undefined}
    transaction.MerchantID    =transactiontemp.MerchantID;
    transaction.TerminalID    =transactiontemp.TerminalID;;
    transaction.OperatorID    =transactiontemp.OperatorID;
    transaction.IpPort        =transactiontemp.IpPort;
    transaction.UserTrace     = 'PointlessPOS';
    transaction.TranCode      =transactiontemp.TranCode;
    transaction.SecureDevice  =transactiontemp.SecureDevice;
    transaction.ComPort       =transactiontemp.ComPort;
    transaction.SequenceNo    ='0010010010'
    transaction.HostOrIP      = transactiontemp.HostOrIP;

    try {
      const response    = await this.dsiEMVService.pinPadReset(transaction);
      console.log('response', response)
      this.responseMessage = 'failed'
      if (response && response.CmdResponse && response.CmdResponse.TextResponse) {
      this.responseMessage = response.CmdResponse.TextResponse
    }
    } catch (error) {
      console.log('response error', error)
    }
  }

  async MercuryPinPadReset(){
    const transaction = this.inputForm.value as Transaction;
    const response    = await this.dsiEMVService.mercuryPinPadReset(transaction);
    this.responseMessage = 'failed'
    if (response && response.CmdResponse && response.CmdResponse.TextResponse) {
      this.responseMessage = response.CmdResponse.TextResponse
   }
  }

  async downloadParams(){
    const response = await this.dsiEMVService.mercuryPinPadTest();
    this.responseMessage = 'failed'
    if (response && response.CmdResponse && response.CmdResponse.TextResponse) {
     this.responseMessage = response.CmdResponse.TextResponse
    }
   }

  async  dollarSaleTest(){
    const response = await this.dsiEMVService.runOpenWord();
    this.responseMessage = 'failed'
    if (response) {
     this.responseMessage =  response
    }
   }

   async  preAuthTest(){
    const response = await this.dsiEMVService.testADODBConnection();
    this.responseMessage = 'failed'
    if (response) {
     this.responseMessage =  response
    }
   }

  async testActiveX() {
    const response = await this.dsiEMVService.textActiveX(this.f.pathName.value);
    this.responseMessage = 'failed'
    if (response) {
    this.responseMessage =  response
    }
  }

  async runCreateFile() {
    const response = await this.dsiEMVService.runCreateFile();
    this.responseMessage = 'failed'
    if (response) {
    this.responseMessage =  response
    }
  }
}
