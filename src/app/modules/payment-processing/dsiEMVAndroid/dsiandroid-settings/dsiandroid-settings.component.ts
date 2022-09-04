import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { Transaction } from './../../models/models';
import { PointlessCCDSIEMVAndroidService } from './../../services/index';

@Component({  
  selector: 'pointlesscc-dsiandroid-settings',
  templateUrl: './dsiandroid-settings.component.html',
  styleUrls: ['./dsiandroid-settings.component.scss']
})
export class DSIAndroidSettingsComponent implements OnInit {

  @Output() getDSISettings = new EventEmitter();
  @Input() setDSISettings: Transaction;

  inputForm: FormGroup;
  blueToothDeviceList: any;
  dsiDeviceList: any;
  viewSelectDeviceList: boolean;
  dsiSettings$ : Observable<any>;
  secureDevice: any;
  terminalSetting: ISetting;
  terminalSettingInfo: ITerminalSettings;
  constructor(private fb                  : FormBuilder,
              private settingsService     : SettingsService,
              private siteService         : SitesService,  
              private dSIEMVAndroidService: PointlessCCDSIEMVAndroidService) { }

  async ngOnInit() {
    await this.listBTDevices();
    this.dsiDeviceList = await this.dSIEMVAndroidService.getDeviceInfo();
    this.initForm();
    
  }

  //deviceName
  getDeviceInfo() { 
    const deviceName = localStorage.getItem('devicename')
    const site = this.siteService.getAssignedSite();
    this.settingsService.getSettingByName(site,deviceName).subscribe(data => { 
      this.terminalSetting = data;
      //ITerminalSettings
      this.terminalSettingInfo = JSON.parse(data.text)  as ITerminalSettings;
    })
  }

  async listBTDevices() { 
    this.blueToothDeviceList = await this.dSIEMVAndroidService.listBTDevices();
  }

  async initForm() {
    const options = { value: ' value.'}
    const ipValue = await dsiemvandroid.getIPAddressPlugin(options)
    const ipAddress = ipValue?.value;
    this.inputForm = this.fb.group({
      merchantID: ['CROSSCHAL1GD'],
      userTrace: ['User'],
      pOSPackageID: ['PointlessPOS1.0'],
      tranCode: ['EMVSale'],
      secureDevice: ['EMV_VP3300_DATACAP'],
      invoiceNo: ['100'],
      sequenceNo: ['0010010010'],
      bluetoothDeviceName: [''],
      operationMode: ['cert'],
      amount: ['1.00'],
      recordNo: ['RecordNumberRequested'],
      refNo: ['1'],
      pinPadIpAddress: [ipAddress],
      padPort: ['1200'],
    })

    let item = this.dSIEMVAndroidService.savedSettings;
    if (this.setDSISettings) {
      item = this.setDSISettings;
    }

    if (item) {
      this.inputForm.patchValue(item)
      this.saveSettings();
    }

    this.subscribeChanges();

  }

  subscribeChanges() {
    this.inputForm.valueChanges.subscribe( data => {
      this.saveSettings();
    })
  }

  saveSettings() {
    if (this.inputForm && this.inputForm.value) {
      const item = this.inputForm.value as Transaction;
      const setting = JSON.stringify(item);
      localStorage.setItem('DSIEMVSetting', setting);
      this.dsiSettings$ = this.dSIEMVAndroidService.saveDSIEMVSetting(item)

 
      // this.getDSISettings.emit(setting)
    }
  }

  async setSecureDevice(event: any) {
    let setting =  this.dSIEMVAndroidService.savedSettings as Transaction;
    setting.secureDevice = event[0];
  }

}
