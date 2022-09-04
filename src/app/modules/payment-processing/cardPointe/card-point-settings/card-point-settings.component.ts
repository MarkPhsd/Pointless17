import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { BoltInfo } from './../../models/models';
import { CardPointMethodsService } from   './../../services/index';
import { DeviceInfoService } from  './../../services/index';

@Component({
  selector: 'card-point-settings',
  templateUrl: './card-point-settings.component.html',
  styleUrls: ['./card-point-settings.component.scss']
})
export class CardPointSettingsComponent implements OnInit {

  deviceName : string;
  inputForm : FormGroup;

  constructor(
    private fb: FormBuilder,
    private siteService: SitesService,
    private settingsService: SettingsService,
    private matSnackBar         : MatSnackBar,
    public methodsService: CardPointMethodsService,
    public deviceInfoService: DeviceInfoService) {
  }

  ngOnInit(): void {
    this.deviceName = this.deviceInfoService.deviceName;
    const item      = localStorage.getItem('boltInfo');
    const boltInfo  =  JSON.parse(item) as BoltInfo;
    console.log('boltInfo', boltInfo)
    this.initForm();

    if (boltInfo) {
      this.inputForm.patchValue(boltInfo);
    }
    if (!boltInfo) {
      const item = {} as BoltInfo
      this.inputForm.patchValue(item);
    }

  }

  initForm() {
    this.inputForm = this.fb.group({
      deviceName: [],
      hsn: [],
      merchID: [],
      apiURL: [],
    })
    return this.inputForm;
  }

  save() {
    const bolt = this.inputForm.value as BoltInfo;
    if (bolt) {
      const item = JSON.stringify(bolt)
      localStorage.setItem('boltInfo', item)
      this.methodsService.boltInfo = bolt;

      this.deviceInfoService.setDeviceName(this.deviceName);
      const site  = this.siteService.getAssignedSite()

      const setting  = {} as ISetting;
      setting.name = 'boltInfo';
      setting.text = item

      this.settingsService.saveSettingObservable(site, setting).subscribe(data =>{
        this.matSnackBar.open('Saved', 'Saved', {duration:2000})
      })
    }
  }

}
