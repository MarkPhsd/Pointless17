import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
// import { dsiemvandroid } from 'dsiemvandroidplugin';
import { Observable, of , switchMap} from 'rxjs';
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
  // @Input() setDSISettings: Transaction;

  transaction$: Observable<Transaction>;
  deviceName : string;
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
              public  dsiAndroidService: PointlessCCDSIEMVAndroidService) { }

  async ngOnInit() {
    this.deviceName = localStorage.getItem('devicename')
    await this.checkBTPermission();
    this.dsiDeviceList = await this.dsiAndroidService.getDeviceInfo();
    await this.listBTDevices();


    const options = { value: ' value.'}
    // const ipValue = await dsiemvandroid.getIPAddressPlugin(options)
    // const ipAddress = ipValue?.value;
    // this.initForm(ipAddress);
  }


  async listBTDevices() {
    this.blueToothDeviceList = await this.dsiAndroidService.listBTDevices();
  }

  initForm(ipAddress) {
    this.inputForm = this.fb.group({
      merchantID: ['CROSSCHAL1GD'],
      userTrace: ['User'],
      pOSPackageID: ['PointlessPOS1.54.3'],
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

    this.transaction$ = this.getSettings();

  }

  getSettings() {
    const result$ =  this.dsiAndroidService.getSettings();

    result$.pipe(
      switchMap(data => {
        this.inputForm.patchValue(data)
        return of(data)
      })
    )
    return result$

  }

  // subscribeChanges() {
  //   this.inputForm.valueChanges.subscribe( data => {
  //     this.saveSettings();
  //   })
  // }

  saveSettings() {
    if (this.inputForm && this.inputForm.value) {
      const item = this.inputForm.value as Transaction;
      const setting = JSON.stringify(item);
      localStorage.setItem('DSIEMVAndroidSetting', setting);
      this.dsiSettings$ = this.dsiAndroidService.saveDSIEMVSetting(item)
    }
  }

  async setSecureDevice(event: any) {
    if (this.dsiAndroidService.transaction) {
      this.dsiAndroidService.transaction = event[0];
    }
  }

  async checkBTPermission() {
    await this.dsiAndroidService.listBTDevices()
    const options = {value: 'test'};
    // const value = dsiemvandroid.getHasPermission(options);
    // console.log('has permissions', value)
  }

  //deviceName
  getDeviceInfo() {
    const deviceName = localStorage.getItem('devicename')
    const site = this.siteService.getAssignedSite();
    this.settingsService.getSettingByName(site,deviceName).subscribe(data => {
      this.terminalSetting = data;
      this.terminalSettingInfo = JSON.parse(data.text)  as ITerminalSettings;
    })
  }

}
