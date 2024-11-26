import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxXml2jsonModule } from 'ngx-xml2json';
import { Observable, switchMap, of } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EbayAPIService } from 'src/app/_services/resale/ebay-api.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ValueFieldsComponent } from '../../../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-ebay-return-policy',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
           ValueFieldsComponent,NgxJsonViewerModule,
            SharedPipesModule],
  templateUrl: './ebay-return-policy.component.html',
  styleUrls: ['./ebay-return-policy.component.scss']
})
export class EbayReturnPolicyComponent implements OnInit {

  inventoryCheck: any;
  formValue: any;
  inputForm: FormGroup;
  formInternationalOverride: FormGroup;
  formReturnPeriod: FormGroup;
  returnMethodEnum = this.ebayService.returnMethodEnum
  timeDurationUnitEnum = this.ebayService.timeDurationUnitEnum
  formErrors: string[] = [];
  action$ : Observable<any>;

  exampleEbayReturnPolicy = {
    categoryTypes: [
      { default: true, name: 'ALL_EXCLUDING_MOTORS_VEHICLES' }
    ],
    description: 'Standard Return Policy',
    extendedHolidayReturnsOffered: true,
    internationalOverride: {
      returnMethod: 'REPLACEMENT',
      returnPeriod: { unit: 'DAY', value: 30 },
      returnsAccepted: true,
      returnShippingCostPayer: 'BUYER'
    },
    marketplaceId: 'EBAY_US',
    name: 'Return Policy',
    refundMethod: 'MONEY_BACK',
    restockingFeePercentage: '10%',
    returnInstructions: 'Return with original packaging',
    returnMethod: 'EXCHANGE',
    returnPeriod: { unit: 'DAY', value: 30 },
    returnsAccepted: true,
    returnShippingCostPayer: 'BUYER'
  };


// ... [rest of your component class]

  getCategoryTypesControls(): AbstractControl[] {
    return (this.inputForm.get('categoryTypes') as FormArray).controls;
  }

// ... [rest of your component class]

  constructor(
    private formBuilder: FormBuilder,
    public siteService: SitesService,
    public ebayService: EbayAPIService,
    private settingService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.formInit();
    this.loadPolicy();
  }

  formInit(): void {
    this.inputForm = this.formBuilder.group({

      categoryTypes: this.formBuilder.array([
        this.formBuilder.group({
          default: [false, Validators.required],
          name: ['', Validators.required]
        })
      ]),

      description: ['', Validators.required],

      extendedHolidayReturnsOffered: [false, Validators.required],

      internationalOverride: this.formBuilder.group({
        returnMethod: [''],
        returnPeriod: this.formBuilder.group({
          unit:  ['', Validators.required],
          value: ['', [Validators.required, Validators.min(1)]]
        }),
        returnsAccepted: [false],
        returnShippingCostPayer: ['']
      }),

      marketplaceId: ['', Validators.required],
      name: ['', Validators.required],
      refundMethod: ['', Validators.required],
      restockingFeePercentage: ['', Validators.required],
      returnInstructions: ['', Validators.required],
      returnMethod: ['', Validators.required],
      returnPeriod: this.formBuilder.group({
        unit:  ['', Validators.required],
        value: ['', [Validators.required, Validators.min(1)]]
      }),
      returnsAccepted: [false, Validators.required],
      returnShippingCostPayer: ['', Validators.required]
    });


    this.formInternationalOverride = this.formBuilder.group({
      returnMethod: ['', Validators.required],
      returnPeriod: this.formBuilder.group({
        unit: ['', Validators.required],
        value: [null, [Validators.required, Validators.min(1)]]
      }),
      returnsAccepted: [false, Validators.required],
      returnShippingCostPayer: ['', Validators.required]
    })

    this.inputForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  updateFormErrors(): void {
    this.formErrors = [];
    for (const field in this.inputForm.controls) {
      const control = this.inputForm.get(field);
      if (control && control.invalid) {
        this.formErrors.push(`Error in field ${field}: ${Object.keys(control.errors || {}).join(', ')}`);
      }
    }
  }

  loadExampleData(): void {
    this.inputForm.patchValue(this.exampleEbayReturnPolicy);
  }

  loadPolicy() {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.settingService.getSettingByName(site, 'EbayReturnPolicy').pipe(switchMap(data => {
      if (data && data.text) {
        const item = JSON.parse(data.text);
        console.log(item)
        this.inputForm.patchValue(item)
      }
      return of(data)
    }))
  }

  save() {
    const site = this.siteService.getAssignedSite()
    const setting = {} as ISetting;

    setting.name = 'EbayReturnPolicy';
    setting.text = JSON.stringify(this.inputForm.value)
    this.action$ =  this.settingService.saveSettingObservable(site, setting).pipe(switchMap(data => {
      this.siteService.notify('saved', 'Close', 3000, 'green')
      return of(data)
    }))

  }

  publish() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.ebayService.publishPolicy(site, 'EbayReturnPolicy').pipe(switchMap(data => {
      this.inventoryCheck = data;
      return of(data)
    }))
  }

  // <button mat-button (click)="loadExampleData()">Load Example Data</button>
  // <button mat-button (click)="save()"><mat-icon>save</mat-icon>Save</button>
  // <button mat-button (click)="publish()"><mat-icon>upload</mat-icon>Publish</button>

  // Additional methods as needed
}
