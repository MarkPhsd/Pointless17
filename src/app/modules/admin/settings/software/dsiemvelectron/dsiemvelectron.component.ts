import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { DSIEMVTransactionsService } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
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
  constructor(private uISettingsService: UISettingsService,
              private dsiEMVService: DSIEMVTransactionsService,
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
  }

  async initForm(setting: ISetting) {
    const form = this.inputForm
    this.inputForm = this.uISettingsService.initDSIEMVForm(form)
    this.inputForm = await this.uISettingsService.setFormValue(form, setting, setting.text, 'DSIEMVSettings')
  }

  async updateSetting(){
    const result =  await this.uISettingsService.saveConfig(this.inputForm, 'DSIEMVSettings')
  }

  async pinPadReset(){
   const response = await this.dsiEMVService.testEMVReset();
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

  dollarSaleTest(){

   }

  preAuthTest(){

  }


}
