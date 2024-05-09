import { Injectable } from '@angular/core';
import { Transaction } from './../models/models'
import { dsiemvandroid } from 'dsiemvandroidplugin';
//https://npm.io/package/ngx-xml-to-json update forupgrade.

import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISetting } from 'src/app/_interfaces';
import { Observable, of, switchMap } from 'rxjs';
import { NgxXml2jsonService } from 'ngx-xml2json';
// import { parseStringPromise } from 'xml2js';
export interface SecureDevice {
  description: string;
  interfaceType: string;
  secureDeviceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PointlessCCDSIEMVAndroidService {

  terminals = [
    { name: "IDTech VP3300 - Datacap E2E", id: "EMV_VP3300_DATACAP" },
    { name: "IDTech VP3300 - Datacap E2E via RS-232", id: "EMV_VP3300_DATACAP_RS232" },
    { name: "IDTech VP3300 - Mercury", id: "EMV_VP3300_MERCURY" },
    { name: "IDTech VP3300 - Monetary", id: "EMV_VP3300_MONETARY" },
    { name: "Ingenico Lane/3000", id: "EMV_LANE3000_DATACAP_E2E" },
    { name: "Ingenico Lane/7000", id: "EMV_LANE7000_DATACAP_E2E" },
    { name: "PAX A920Pro - Datacap E2E", id: "EMV_A920PRO_DATACAP_E2E" },
    { name: "PAX A920MAX - Datacap E2E", id: "EMV_A920PRO_DATACAP_E2E" },
    { name: "PAX A30 - Datacap E2E", id: "EMV_A30_DATACAP_E2E" },
    { name: "PAX A35 - Datacap E2E", id: "EMV_A35_DATACAP_E2E" },
    { name: "PAX A60 - Datacap E2E", id: "EMV_A60_DATACAP_E2E" },
    { name: "PAX A77 - Datacap E2E", id: "EMV_A77_DATACAP_E2E" },
    { name: "PAX A800 - Datacap E2E", id: "EMV_A800_DATACAP_E2E" },
    { name: "PAX A800 - Bluefin E2E", id: "EMV_A800_DATACAP_BLUEFIN" },
    { name: "PAX A3700 - Datacap E2E", id: "EMV_A3700_DATACAP" },
    { name: "PAX A3700 - Bluefin E2E", id: "EMV_A3700_DATACAP_BLUEFIN" },
    { name: "PAX Aries6 - Datacap E2E", id: "EMV_ARIES6_DATACAP_E2E" },
    { name: "PAX Aries8 - Datacap E2E", id: "EMV_ARIES8_DATACAP_E2E" },
    { name: "PAX IM30 - Datacap E2E", id: "EMV_IM30_DATACAP_E2E" }
  ];


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
      pOSPackageID: 'PointlessPOS/3.1',
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
    // const items = await dsiemvandroid.plugInSearchForBt(options)
    // let items: any;
    // const list = items.value.replace('null', '').split(';')
    return [];
  }

  async getDevicesInfo () {
    if (!this.siteService.isApp) {
      return this.getDeviceIdList()
    }
    const item    = await this.getAndroidDevices()
    if (item) {
      return item
    }
    let devices :  SecureDevice[] = [];
    return devices
  }

  async getDeviceInfo() {
    if (!this.siteService.isAndroid) {
      return this.getDeviceIdList()
    }
    return await this.getAndroidDevices()
  }

 async getAndroidDevices() {
    const options = this.transaction as Transaction;
    // let item: any;
    const item    = await dsiemvandroid.getDeviceInfo(options);
    const results = item as any;
    const parser = new DOMParser();
    results.value = results.value.replace('#', '')


    const xml = parser.parseFromString(results.value, 'text/xml');
    // const obj = this.jsonService.xmlToJson(xml) as any;

    console.log(xml)
    const objs=  this.convertXMLToObjects( results.value)

    const listValues =  objs.map(terminal => terminal.secureDeviceId);
    console.log('listvalues', listValues)
    return listValues;
  }

   convertXMLToObjects(xml: string): SecureDevice[] {
    // const result = await parseStringPromise(xml);
    const result = this.jsonService.xmlToJson(xml) as any;
    console.log('convertXMLToObjects', result)
    const numDevices = parseInt(result.Devices.NumSecureDevices[0]);
    const devices: SecureDevice[] = [];

    for (let i = 1; i <= numDevices; i++) {
      const deviceKey = `SecureDevice${i}`;
      const device = result.Devices[deviceKey][0];
      devices.push({
        description: device[`Description${i}`][0],
        interfaceType: device[`Interface${i}`][0],
        secureDeviceId: device[`SecureDeviceID${i}`][0]
      });
    }

    return devices;

  }

  //gets hard coded list
  getDeviceIdList(): string[] {
    return this.terminals.map(terminal => terminal.id);
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
