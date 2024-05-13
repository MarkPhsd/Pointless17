import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { DSIEMVSettings } from 'src/app/_services/system/settings/uisettings.service';
import { PointlessCCDSIEMVAndroidService } from 'src/app/modules/payment-processing/services';
import { DcapService } from 'src/app/modules/payment-processing/services/dcap.service';

@Component({
  selector: 'app-dc-direct-settings',
  templateUrl: './dc-direct-settings.component.html',
  styleUrls: ['./dc-direct-settings.component.scss']
})
export class DcDirectSettingsComponent implements OnInit {

  action$: Observable<any>;
   dcapAndroidDeviceList: string[]
   @Input() inputForm: UntypedFormGroup;
   @Input() dsiEMVSettings: FormGroup;
   @Input() terminal : ITerminalSettings;
   @Input() isDSIEnabled: boolean;
   dcapResult: any;
   transactionForm: FormGroup;
   constructor(
    private sitesService        : SitesService,
    private dcapService         : DcapService,
    private fb                  : FormBuilder,
    public platFormService     : PlatformService,
    private dSIEMVAndroidService: PointlessCCDSIEMVAndroidService, ) {

   }

   
   initForm() { 
    this.transactionForm = this.fb.group({ 
      amount: [1.00]
    })
   }

   async ngOnInit() {   
      this.initForm()
      await this.getDcapAndroidDeviceList()
   }

  async getDcapAndroidDeviceList() {
    const list = await this.dSIEMVAndroidService.getDeviceInfo()
    this.dcapAndroidDeviceList = list;
  }

  dCapReset() {
    const dsi = this.dsiEMVSettings.value as DSIEMVSettings
    console.log('this.inputForm.value?.posDevice', this.terminal)
    if (this.terminal.name) {
      const name = this.terminal.name
      this.action$ = this.dcapService.resetDevice(name).pipe(switchMap(data => {
        // this.sitesService.notify(`Response: ${JSON.stringify(data)}`, 'Close', 100000)
        this.dcapResult = data;
        return of(data)
      }))
    }
  }

  async sale() { 
    return ''
  }

  async refund() { 
    return ''
  }
   
  async downloadParam() { 
    const device = this.inputForm.value as DSIEMVSettings;
    this.dcapResult = await this.dSIEMVAndroidService.downloadParam(device)
  }


}
