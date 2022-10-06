import { Injectable } from '@angular/core';
import { Transaction } from './../models/models'
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISetting } from 'src/app/_interfaces';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PointlessCCDSIEMVAndroidService {
  public transaction: Transaction;
  public saving: boolean;

  constructor(
    private jsonService   : NgxXml2jsonService,
    private settingService: SettingsService,
    private siteService   : SitesService,
  ) { }

  saveDSIEMVSetting(transaction: Transaction) {
    const site = this.siteService.getAssignedSite();

    let setting = {} as ISetting;
    const name = 'DSIEMVAndroidSetting';

    const setting$ = this.settingService.getSettingByName(site, name)

    const value = JSON.stringify(transaction);
    this.saving = true
    return setting$.pipe(
      switchMap( data => {
        data.text = value
        this.saving  = false
        return this.settingService.saveSetting(site, data)
      }
    )).pipe(
      switchMap(data => {
        if (data) {
          this.transaction = JSON.parse(data.text)  as Transaction;
        }
        if (!data) {
          const item = this.defaultTransaction as Transaction;
          this.transaction = this.defaultTransaction  as Transaction;
        }
        return of(this.transaction)
      })
    );

  }

  get defaultTransaction() {
    return {
      merchantID: 'CROSSCHAL1GD',
      userTrace: 'User',
      pOSPackageID: 'PointlessPOS1.54.3',
      tranCode: 'EMVSale',
      secureDevice: 'EMV_VP3300_DATACAP',
      invoiceNo: '100',
      amount: '1.00',
      sequenceNo: '0010010010',
      bluetoothDeviceName: '',
      operationMode: 'cert',
      recordNo: 'RecordNumberRequested',
      refNo: '1',
      pinPadIpAddress: '',
      padPort: '1200',
    }
  }

 //   merchantID: string;
  //  userTrace: string;
  //  pOSPackageID: string;
  //  tranCode: string;
  //  secureDevice: string;
  //  invoiceNo: string;
  //  amount: string;
  //  sequenceNo: string;
  //  bluetoothDeviceName: string;
  //  operationMode: string;
  //  recordNo: string;
  //  refNo: string;
  //  pinPadIpAddress: string;
  //  padPort: string;

  getSettings():  Observable<Transaction> {
    const site = this.siteService.getAssignedSite();

    const setting = localStorage.getItem('dsiEMVAndroidSettings')
    if (setting) {
      this.transaction = JSON.parse(setting) as Transaction;
    }

    const name = 'DSIEMVAndroidSetting';
    const setting$ = this.settingService.getSettingByName(site, name)

    const result$ = setting$.pipe(
      switchMap( data => {
        if (!data) {
          const name = 'DSIEMVAndroidSetting';
          return this.settingService.saveSettingObservable(site, data)
        }
        if (data) {
          return of(data)
        }
      }
    )).pipe(
      switchMap(data => {
        if (!data.text) {
          this.transaction = {} as Transaction;
          return of(this.transaction)
        }
        this.transaction = JSON.parse(data.text) as Transaction;
        return of(this.transaction)
    }));

    return result$
  }

  async  listBTDevices() {
    const options = {value: 'test'};
    const items = await dsiemvandroid.plugInSearchForBt(options)
    // let items: any;
    const list = items.value.replace('null', '').split(';')
    return list;
  }

  async getDeviceInfo() {
    try {
      const options = this.transaction as Transaction;
      options.merchantID = options.merchantID;
      options.pinPadIpAddress = options.pinPadIpAddress;
      options.padPort = options.padPort;
      // let item: any;
      const item    = await dsiemvandroid.getDeviceInfo(options);
      const results = item as any;
      const parser = new DOMParser();
      results.value = results.value.replace('#', '')
      const xml = parser.parseFromString(results.value, 'text/xml');
      const obj = this.jsonService.xmlToJson(xml) as any;
      return obj;
    } catch (error) {
      return error
    }
  }

  async getIPAddress() {
    try {
      const options = { value: ' value.'}
      const item = await dsiemvandroid.getIPAddressPlugin(options)
      // let item: any;
      return item?.value;
    } catch (error) {
      return error;
    }
  }

  async dsiEMVReset() {
    try {
      const setting = this.transaction as Transaction;
      let options = {} as any;
      options =  { bluetoothDeviceName: setting.bluetoothDeviceName, secureDevice: setting.secureDevice, merchantID: setting.merchantID,
                   pinPadIpAddress: setting.pinPadIpAddress, padPort: setting.padPort }
      const item = await dsiemvandroid.emvPadReset(options)
      // let item: any;
      return item;
    } catch (error) {
      return error;
    }
  }


}
