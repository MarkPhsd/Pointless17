import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { of, switchMap,catchError,Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { BoltInfo } from './../../models/models';
import { CardPointMethodsService } from   './../../services/index';
import { DeviceInfoService } from  './../../services/index';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyLabel } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ValueFieldsComponent } from 'src/app/modules/admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressBarModule } from '@angular/material/legacy-progress-bar';

@Component({
  selector: 'card-point-settings',
  standalone:true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatIconModule,
     MatLegacyProgressSpinnerModule,
     ValueFieldsComponent,MatLegacyProgressBarModule,MatLegacyButtonModule,
     MatLegacyInputModule,MatLegacyCardModule,MatDividerModule],
  templateUrl: './card-point-settings.component.html',
  styleUrls: ['./card-point-settings.component.scss']
})
export class CardPointSettingsComponent implements OnInit {

  boltInfo: BoltInfo;
  deviceName : string;
  inputForm : UntypedFormGroup;
  // methodType$: Observable<IPaymentMethod>;
  boltInfo$: Observable<any>;

  constructor(
    private fb: UntypedFormBuilder,
    private siteService: SitesService,
    private settingsService: SettingsService,
    public  labelingService: LabelingService,
    private matSnackBar         : MatSnackBar,
    public  methodsService: CardPointMethodsService,
    public  deviceInfoService: DeviceInfoService) {
  }

  ngOnInit(): void {
    this.deviceName = this.deviceInfoService.deviceName;
    this.boltInfo$ = this.initSetting().pipe(switchMap(data => {
      this.initForm();
      if (data) {
        let boltInfo = data as BoltInfo ;
        this.inputForm.patchValue(boltInfo);
      }
      this.inputForm.patchValue(null);
      return of(data)
    }))

  }

  initSetting() {
    const site  = this.siteService.getAssignedSite()

    const setting  = {} as ISetting;
    setting.name = 'boltInfo';

    let boltInfo = {} as BoltInfo;
    let item = JSON.stringify(boltInfo)
    setting.text = item

    const boltInfo$ = this.settingsService.getSettingByName(site, 'boltInfo');

    return boltInfo$.pipe(
      switchMap(data => {
        if (data) {
          let item = {} as BoltInfo

          if (data.text) {
             item = JSON.parse(data?.text) as BoltInfo;
             item.id = data.id;
          }

          if (!data.text || data.text == null) {
             item = {} as BoltInfo;
             item.id = data.id;
          }

          this.boltInfo = item;

          return of(data);

        } {
          return this.settingsService.postSetting(site, setting)
        }
      }
    )).pipe(
      switchMap(data => {
        if (data) {
          let item = JSON.parse(data?.text) as BoltInfo;
          this.boltInfo = item;

          // console.log('data', item)
          if (!item || item == null) {
            item = {} as BoltInfo
            this.boltInfo = item;
          }

          if (data) {
            this.boltInfo.id = data.id;
          }
          return of(this.boltInfo)
        }
        return of(null)
       }
    ))

  }

  get creditMethod(){
    const item = {} as IPaymentMethod
    item.isCreditCard = true
    item.name = 'Credit';
    item.exchangeRate = 1;
    return item
  }

  initForm() {
    this.inputForm = this.fb.group({
      deviceName: [],
      hsn: [],
      merchID: [],
      apiURL: [],
      id: []
    })
    return this.inputForm;
  }

  save() {
    let bolt = this.inputForm.value as BoltInfo;
    if (bolt) {
      localStorage.setItem('boltInfo', JSON.stringify(bolt))

      this.methodsService.boltInfo = bolt;
      this.deviceInfoService.setDeviceName(this.deviceName);
      const site  = this.siteService.getAssignedSite()

      const setting  = {} as ISetting;
      setting.name = 'boltInfo';

      const boltInfo$ = this.settingsService.getSettingByName(site, 'boltInfo');

      this.boltInfo$ = boltInfo$.pipe(switchMap(data => {
        bolt.id = data.id;
        bolt.apiURL = site.url;
        let item = JSON.stringify(bolt)
        data.text = item;
        // console.log('save setting', data)
        return  this.settingsService.putSetting(site, data.id, data)
      }))

    }
  }

}
