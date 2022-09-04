import { Injectable } from '@angular/core';
import { Transaction } from './../models/models'
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISetting } from 'src/app/_interfaces';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PointlessCCDSIEMVAndroidService {

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

    return setting$.pipe(
      switchMap( data => {
        data.text = value
        return this.settingService.saveSetting(site, data)
      }
    ));

  }



  get savedSettings(): Transaction | undefined {
    const setting = localStorage.getItem('DSIEMVSetting')
    if (setting) {
      const item = JSON.parse(setting) as Transaction;
      return item
    }
  }

  async  listBTDevices() {
    const options = {value: 'test'};
    const items = await dsiemvandroid.plugInSearchForBt(options)
    const list = items.value.replace('null', '').split(';')
    return list;
  }

  async getDeviceInfo() {
    try {
      const options = this.savedSettings as Transaction;
      options.merchantID = options.merchantID;
      options.pinPadIpAddress = options.pinPadIpAddress;
      options.padPort = options.padPort;
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
      return item?.value;
    } catch (error) {
      return error;
    }
  }

  async dsiEMVReset() {
    try {
      const setting = this.savedSettings as Transaction;
      let options = {} as any;
      options =  { bluetoothDeviceName: setting.bluetoothDeviceName, secureDevice: setting.secureDevice, merchantID: setting.merchantID,
                   pinPadIpAddress: setting.pinPadIpAddress, padPort: setting.padPort }
      const item = await dsiemvandroid.emvPadReset(options)
      return item;
    } catch (error) {
      return error;
    }
  }


}
