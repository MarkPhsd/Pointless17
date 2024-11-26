import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { Observable, switchMap, of } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EbayAPIService } from 'src/app/_services/resale/ebay-api.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';


@Component({
  selector: 'app-ebay-fulfillment-policy',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    NgxJsonViewerModule,
  SharedPipesModule],
  templateUrl: './ebay-fulfillment-policy.component.html',
  styleUrls: ['./ebay-fulfillment-policy.component.scss']
})
export class EbayFulfillmentPolicyComponent implements OnInit {

  inventoryCheck: any;
  formValue: any;
  currencyCodeEnum = this.ebayService.currencyCodeEnum;
  exampleFufillmentPolicy  = {
    categoryTypes: [
      { default: true, name: 'ALL_EXCLUDING_MOTORS_VEHICLES' }
    ],
    description: 'Standard Shipping Policy for Electronics',
    freightShipping: false,
    globalShipping: true,
    handlingTime: {
      unit: 'DAY',
      value: 2
    },
    localPickup: true,
    marketplaceId: 'EBAY_US',
    name: 'Electronics Shipping Policy',
    pickupDropOff: false,
    shippingOptions: [
      {
        costType: 'FLAT_RATE',
        insuranceFee: {
          currency: 'USD',
          value: '5.00'
        },
        insuranceOffered: true,
        optionType: 'DOMESTIC',
        packageHandlingCost: {
          currency: 'USD',
          value: '2.00'
        },
        rateTableId: 'example-rate-table',
        shippingDiscountProfileId: 'example-discount-profile',
        shippingPromotionOffered: true,
        shippingServices: [
          {
            additionalShippingCost: {
              currency: 'USD',
              value: '1.00'
            },
            buyerResponsibleForPickup: false,
            buyerResponsibleForShipping: false,
            cashOnDeliveryFee: {
              currency: 'USD',
              value: '0.00'
            },
            freeShipping: true,
            shippingCarrierCode: 'USPS',
            shippingCost: {
              currency: 'USD',
              value: '10.00'
            },
            shippingServiceCode: 'USPSFirstClass',
            shipToLocations: {
              regionExcluded: [
                { regionName: 'Alaska', regionType: 'STATE_OR_PROVINCE' }
              ],
              regionIncluded: [
                { regionName: 'Continental United States', regionType: 'COUNTRY_REGION' }
              ]
            },
            sortOrder: 1,
            surcharge: {
              currency: 'USD',
              value: '0.00'
            }
          }
        ]
      }
    ],
    shipToLocations: {
      regionExcluded: [
        { regionName: 'Hawaii', regionType: 'STATE_OR_PROVINCE' }
      ],
      regionIncluded: [
        { regionName: 'United States', regionType: 'COUNTRY' }
      ]
    }
  };

  inputForm: FormGroup;
  formErrors: string[] = [];
  action$ : Observable<any>;

  timeDurationUnitEnum = this.ebayService.timeDurationUnitEnum

  constructor(
    private formBuilder: FormBuilder,
    public siteService: SitesService,
    public ebayService: EbayAPIService,
    private settingService: SettingsService,
  ) {}

  ngOnInit() {
    this.createForm();
    this.loadPolicy()
  }

  addCategoryType() {
    this.categoryTypes.push(this.createCategoryType());
  }

  addShippingLocaitons() {
    const locations =    this.inputForm.controls['shipToLocations']

    const item = this.formBuilder.group({
      regionExcluded: this.formBuilder.array([this.createRegion()]),
      regionIncluded: this.formBuilder.array([this.createRegion()])
    })
    // locations.push ()
  }

  createCategoryType(): FormGroup {
    if (!this.inputForm) { return }
    return this.formBuilder.group({
      name: [''],
      default: [false, Validators.required]
    });
  }

  addpackageHandlingCost(j) {
    if (!this.inputForm.get('shippingOptions')) {
      this.createShippingOption()
    }
  }


  createForm() {
    this.inputForm = this.formBuilder.group({
      categoryTypes: this.formBuilder.array([this.createCategoryType()]),
      description: ['', Validators.required],
      freightShipping: [false],
      globalShipping: [false],
      handlingTime: this.formBuilder.group({
        unit: ['', Validators.required],
        value: ['', Validators.required]
      }),
      localPickup: [false],
      marketplaceId: ['', Validators.required],
      name: ['', Validators.required],
      pickupDropOff: [false],
      shippingOptions: this.formBuilder.array([this.createShippingOption()]),
      shipToLocations: this.formBuilder.group({
        regionExcluded: this.formBuilder.array([this.createRegion()]),
        regionIncluded: this.formBuilder.array([this.createRegionIncluded()])
      })
    });
  }

  getShippingServicesControls(shippingOptionIndex: number): FormArray {
    if (!this.inputForm) { return }
    if (!(this.inputForm.get('shippingOptions') as FormArray)) { return}
    const shippingOption = (this.inputForm.get('shippingOptions') as FormArray).at(shippingOptionIndex) as FormGroup;
    return shippingOption.get('shippingServices') as FormArray;
  }

  getregionExcluded(shippingOptionIndex: number): FormArray {
    if (!this.inputForm) { return }
    if (!(this.inputForm.get('shippingOptions') as FormArray)) { return}
    const shippingOption = (this.inputForm.get('shippingOptions') as FormArray).at(shippingOptionIndex) as FormGroup;
    return shippingOption.get('shippingServices') as FormArray;
  }

  getregionIncluded(shippingOptionIndex: number, locationID: number ): FormArray {
    const item = this.getShippingServicesControls(shippingOptionIndex)
    const array = item.at(locationID) as FormArray
    return array
  }

  getShippingServicesFormGroup(shippingOptionIndex: number, index: number): FormGroup {
    if (!this.inputForm) { return }
    if (!(this.inputForm.get('shippingOptions') as FormArray)) { return}
    const shippingOption = (this.inputForm.get('shippingOptions') as FormArray).at(shippingOptionIndex) as FormGroup;
    return (shippingOption.get('shippingServices') as FormArray).at(index) as FormGroup;
  }

  get categoryTypes(): FormArray {
    return this.inputForm.get('categoryTypes') as FormArray;
  }

  get shippingOptions(): FormArray {
    return this.inputForm.get('shippingOptions') as FormArray;
  }



  addShippingOption() {
    this.shippingOptions.push(this.createShippingOption());
  }

  createShippingOption(): FormGroup {
    if (!this.inputForm) { return }
    return this.formBuilder.group({
      // section 1
      costType: ['', Validators.required],
      insuranceOffered: [false],
      optionType: ['DOMESTIC', Validators.required],

      // section2
      rateTableId: [''],
      shippingDiscountProfileId: [''],
      shippingPromotionOffered: [false],

      // section2
      packageHandlingCost: this.formBuilder.group({
        currency: ['USD', Validators.required],
        value: ['0', Validators.required]
      }),

      insuranceFee: this.formBuilder.group({
        currency: ['USD', Validators.required],
        value: ['0', Validators.required]
      }),

      shippingServices: this.formBuilder.array([this.createShippingService()])
    });
  }

  getShipToLocationsRegionExcluded(i: number) {
    if (!this.inputForm) { return }
    if (!(this.inputForm.get('shipToLocations') as FormGroup)) { return}
    const shippingOption = (this.inputForm.get('shipToLocations.regionExcluded') as FormArray).at(i) as FormGroup;
    return shippingOption.get('shipToLocations.regionExcluded') as FormArray;
  }

  addShippingService(shippingOptionIndex: number) {
    const shippingOption = this.shippingOptions.at(shippingOptionIndex) as FormGroup;
    const shippingServices = shippingOption.get('shippingServices') as FormArray;
    shippingServices.push(this.createShippingService());
  }

  addShippingServices(k) {
    if (!this.inputForm.get('shippingServices')) {
      this.createShippingOption()
    }
    const item = this.inputForm.get('shippingServices') as FormArray
    item.push(this.createShippingOption())
  }

  removeShippingService(j) {
    const item = this.inputForm.get('shippingServices') as FormArray
    item.removeAt(j)
  }

  createShippingService(): FormGroup {
    return this.formBuilder.group({

      buyerResponsibleForPickup: [false],
      buyerResponsibleForShipping: [false],
      shippingServiceCode: ['', Validators.required],
      freeShipping: [false],

      cashOnDeliveryFee: this.formBuilder.group({
        currency: ['USD', Validators.required],
        value: ['0', Validators.required]
      }),


      shippingCarrierCode: ['', Validators.required],
      shippingCost: this.formBuilder.group({
        currency: ['USD', Validators.required],
        value: ['0', Validators.required]
      }),

      additionalShippingCost: this.formBuilder.group({
        currency: ['USD', Validators.required],
        value: ['0', Validators.required]
      }),

      sortOrder: ['1', Validators.required],
      surcharge: this.formBuilder.group({
        currency: ['USD', Validators.required],
        value: ['0', Validators.required]
      }),

      shipToLocations: this.formBuilder.group({
        regionExcluded: this.formBuilder.array([this.createRegion()]),
        regionIncluded: this.formBuilder.array([this.createRegionIncluded()])
      }),
    });
  }

  addRegions() {

  }

  createRegion(): FormGroup {
    return this.formBuilder.group({
      regionName: ['', Validators.required],
      regionType: ['', Validators.required]
    });
  }

  createRegionIncluded(): FormGroup {
    return this.formBuilder.group({
      regionName: ['US', Validators.required],
      regionType: ['COUNTRY', Validators.required]
    });
  }


  removeCategoryType(index: number) {
    this.categoryTypes.removeAt(index);
  }

  removeShippingOption(index: number) {
    this.shippingOptions.removeAt(index);
  }

  onSubmit() {
    if (this.inputForm.valid) {
      console.log('Form Submission', this.inputForm.value);
    }
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

  // Additional methods as needed
  loadExampleData(): void {
    this.inputForm.patchValue(this.exampleFufillmentPolicy);
  }

  loadPolicy() {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.settingService.getSettingByName(site, 'EbayFufillmentPolicy').pipe(switchMap(data => {
      this.loadFormdata(data?.text)
      return of(data)
    }))
  }

  loadFormdata(data: string ) {
    this.inputForm.patchValue(JSON.parse(data))
  }

  save() {
    const site = this.siteService.getAssignedSite()
    const setting = {} as ISetting;
    setting.name = 'EbayFufillmentPolicy';
    setting.text = JSON.stringify(this.inputForm.value)
    this.action$ =  this.settingService.saveSettingObservable(site, setting).pipe(switchMap(data => {
      this.loadFormdata(data?.text)

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
}
