import { T } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { RStream, DSIEMVTransactionsService, TranResponse, Transaction,TStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
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
  cmdResponse: RStream;
  tranResponse: TranResponse;

  pathName = 'default'
  get f() {return this.pathForm.controls}

  constructor(private uISettingsService: UISettingsService,
              private dsiEMVService:     DSIEMVTransactionsService,
              private dsiProcess        : DSIProcessService,
              private fb                : FormBuilder,
              private matSnack          : MatSnackBar,
              private settingsService   : SettingsService,
              private siteService       : SitesService,
              private electronService   : ElectronService) { }

  ngOnInit(): void {
    if (this.electronService.remote) {this.isElectron = true  }

    this.initializeDeviceSettings()
    this.pathForm = this.fb.group({
      pathName: ['']
    })

    this.amountForm = this.fb.group({
      amount: ['1.00']
    })
  }

  initializeDeviceSettings() {
    this.initForm();
  }

  initForm() {
    this.inputForm = this.uISettingsService.initDSIEMVForm(this.inputForm)
    this.loadSettings()
  }

  loadSettings() {
    if (!this.inputForm) { return }
    const dsiDevice = `DSIEMVSettings/${this.settingsService.deviceName}`
    const dsiSettings$ =  this.settingsService.getDSIEMVSettings()
    dsiSettings$.subscribe(data =>
       {
        if (data) {
          this.inputForm.patchValue(data)
          const json = JSON.stringify(data);
          localStorage.setItem('DSIEMVSettings', json)

        }
      }
    )

  }

  saveSettings() {

    if (!this.settingsService.deviceName) {
      this.siteService.notify('Device name must be set in the device info tab.', 'Alert', 2000)
      return
    }
    if (!this.inputForm) {
      this.siteService.notify('Information not filled out.', 'Alert', 2000)
      return
    }
    const site    = this.siteService.getAssignedSite();
    const item = this.inputForm.value as DSIEMVSettings;
    const json = JSON.stringify(item);
    localStorage.setItem('DSIEMVSettings', json)

    const setting = {} as ISetting;

    setting.text = json;
    setting.name = `dSIEMVSettings/${this.settingsService.deviceName}`;
    setting.id   = item.id;

    this.settingsService.saveSettingObservable(site, setting).subscribe(
      {next: data => {
        this.siteService.notify('Saved', 'Success', 2000)
      },
      error : err => {
        this.siteService.notify('Error ' + err.toString(), 'Alert', 2000)
      }
    })

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

  deleteSettings() {
    const device = `DSIEMVSettings/${this.settingsService.deviceName}`
    localStorage.removeItem(device) //, json)
    this.initForm();
  }

  updateSetting(){
    this.saveSettings();
    const device = `DSIEMVSettings/${this.settingsService.deviceName}`
    this.uISettingsService.saveConfig(this.inputForm, device).subscribe(data => {
      this.matSnack.open('Saved', 'success', {duration: 2000})
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
      this.cmdResponse = JSON.parse(this.responseMessage)  as RStream;
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
