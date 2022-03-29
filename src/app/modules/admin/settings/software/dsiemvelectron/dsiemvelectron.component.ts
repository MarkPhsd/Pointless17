import { T } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { CmdResponse, CommandResponse, DSIEMVTransactionsService, TranResponse, Transaction,TStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { DSIEMVSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-dsiemvelectron',
  templateUrl: './dsiemvelectron.component.html',
  styleUrls: ['./dsiemvelectron.component.scss']
})
export class DSIEMVElectronComponent implements OnInit {
  amountForm : FormGroup;
  inputForm  : FormGroup;
  uiSettings : ISetting;
  uiSettings$: Observable<ISetting>;
  uiISettingJSON = {} as DSIEMVSettings;
  responseMessage: string;
  isElectron: boolean
  pathForm  : FormGroup;
  responseObject: any;
  cmdResponse: CommandResponse;
  tranResponse: TranResponse;

  pathName = 'default'
  get f() {return this.pathForm.controls}
  constructor(private uISettingsService: UISettingsService,
              private dsiEMVService: DSIEMVTransactionsService,
              private dsiProcess: DSIProcessService,
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

    this.amountForm = this.fb.group({
      amount: ['1.00']
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
    this.saveSettings();
    this.uISettingsService.saveConfig(this.inputForm, 'DSIEMVSettings').subscribe(data => {
      console.log('save', data)
    })
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
      if (response) {
        this.responseObject = response
        this.responseMessage  =  JSON.stringify(response)
      }
    } catch (error) {
      console.log('response error', error)
    }
  }

  async MercuryPinPadReset(){
    const transaction       = this.inputForm.value as Transaction;
    const response          = await this.dsiEMVService.mercuryPinPadReset(transaction);
    this.responseMessage = 'waiting'
    if (response) {
      this.responseObject = response
      this.responseMessage  =  JSON.stringify(response)
    }
  }

  async downloadParams(){
    const response         = await this.dsiEMVService.mercuryPinPadTest();
    this.responseMessage = 'waiting'
    if (response) {
      this.responseObject = response
      this.responseMessage  =  JSON.stringify(response)
    }
   }

  async  dollarSaleTest(){

    const amount = this.amountForm.controls['amount'].value;
    if (!amount) {
      return
    }

    const testAmount       = amount*100
    const response         = await this.dsiProcess.emvSale(testAmount, this.getRandomInt(1, 300), false, false );
    this.responseMessage   = 'waiting'

    if (response) {

      this.responseObject  = response
      this.responseMessage = JSON.stringify(response)
      this.cmdResponse = JSON.parse(this.responseMessage)  as CommandResponse;
      this.tranResponse =  this.cmdResponse.TranResponse
    }

  }

  clearResponse() {
    this.responseObject  = '';
    this.cmdResponse = null;
  }

  async  preAuthTest(){
     const response         = await this.dsiEMVService.testADODBConnection();
    this.responseMessage = 'waiting'
    if (response) {
      this.responseObject = response
      this.responseMessage =  JSON.stringify(response)
    }
   }

  async testActiveX() {
    const response         = await this.dsiEMVService.textActiveX(this.f.pathName.value);
    this.responseMessage = 'waiting'
    if (response) {
      this.responseObject = response
      this.responseMessage =  JSON.stringify(response)
    }
  }

  async runCreateFile() {
    const response = await this.dsiEMVService.runCreateFile();
    this.responseMessage = 'waiting'
    if (response) {
      this.responseObject = response
      this.responseMessage =  JSON.stringify(response)
    }
  }

  getRandomInt(min, max) : number{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
