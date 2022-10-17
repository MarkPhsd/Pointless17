import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentMethod } from '@stripe/stripe-js';
import { of, switchMap,catchError,Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
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
  methodType$: Observable<IPaymentMethod>;

  constructor(
    private fb: FormBuilder,
    private siteService: SitesService,
    private settingsService: SettingsService,
    private matSnackBar         : MatSnackBar,
    public methodsService: CardPointMethodsService,
    private paymentMethodsService: PaymentMethodsService,
    public deviceInfoService: DeviceInfoService) {
  }

  ngOnInit(): void {
    this.deviceName = this.deviceInfoService.deviceName;
    const item      = localStorage.getItem('boltInfo');
    const boltInfo  =  JSON.parse(item) as BoltInfo;

    this.initForm();

    if (boltInfo) {
      this.inputForm.patchValue(boltInfo);
    }
    if (!boltInfo) {
      const item = {} as BoltInfo
      this.inputForm.patchValue(item);
    }
    // this.initCreditMethodType();
  }

  get creditMethod(){
    const item = {} as IPaymentMethod
    item.isCreditCard = true
    item.name = 'Credit';
    item.exchangeRate = 1;
    return item
  }

  // initCreditMethodType(){
  //   const site = this.siteService.getAssignedSite()
  //   this.methodType$ = this.paymentMethodsService.getPaymentMethodByName(site, 'credit').pipe(
  //     switchMap(data => {
  //         return  this.paymentMethodsService.saveItem(site, data)
  //       }),
  //       catchError((e) => {
  //         return of(this.creditMethod)
  //         //  return this.paymentMethodsService.saveItem(site, this.creditMethod)
  //     }));
  // }

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
