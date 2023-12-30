import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Observable, switchMap, of } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EbayAPIService } from 'src/app/_services/resale/ebay-api.service';
import { SettingsService } from 'src/app/_services/system/settings.service';


@Component({
  selector: 'app-ebay-fulfillment-policy',
  templateUrl: './ebay-fulfillment-policy.component.html',
  styleUrls: ['./ebay-fulfillment-policy.component.scss']
})
export class EbayFulfillmentPolicyComponent implements OnInit {

  inventoryCheck: any;

  CurrencyCodeEnum = this.ebayService.CurrencyCodeEnum;
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

    // const option = this.formBuilder.group({
    //   currency: [false],
    //   value: ['', Validators.required]
    // });

    // const item = this.inputForm.get('shippingOptions') as FormArray
    // item.push(option)
   
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
      optionType: ['', Validators.required],

      insuranceFee: this.formBuilder.group({
        currency: ['USD', Validators.required],
        value: ['1', Validators.required]
      }),

      // section2
      packageHandlingCost: this.formBuilder.group({
        currency: ['USD', Validators.required],
        value: ['1', Validators.required]
      }),

      rateTableId: [''],
      shippingDiscountProfileId: [''],
      shippingPromotionOffered: [false],

      shippingServices: this.formBuilder.array([this.createShippingService()])
    });
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
        regionIncluded: this.formBuilder.array([this.createRegion()])
      })
    });
  }

  get shippingServicesControls() {
    return (this.inputForm.get('shippingServices') as FormArray).controls;
  }

  get categoryTypes(): FormArray {
    return this.inputForm.get('categoryTypes') as FormArray;
  }
  
  get shippingOptions(): FormArray {
    return this.inputForm.get('shippingOptions') as FormArray;
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

      additionalShippingCost: this.formBuilder.group({
        currency: ['', Validators.required],
        value: ['', Validators.required]
      }),

      buyerResponsibleForPickup: [false],
      buyerResponsibleForShipping: [false],
      cashOnDeliveryFee: this.formBuilder.group({
        currency: ['', Validators.required],
        value: ['', Validators.required]
      }),

      freeShipping: [false],
      shippingCarrierCode: ['', Validators.required],
      shippingCost: this.formBuilder.group({
        currency: ['', Validators.required],
        value: ['', Validators.required]
      }),

      shippingServiceCode: ['', Validators.required],
      shipToLocations: this.formBuilder.group({
        regionExcluded: this.formBuilder.array([this.createRegion()]),
        regionIncluded: this.formBuilder.array([this.createRegion()])
      }),

      sortOrder: ['', Validators.required],
      surcharge: this.formBuilder.group({
        currency: ['', Validators.required],
        value: ['', Validators.required]
      })
    });
  }

  createRegion(): FormGroup {
    return this.formBuilder.group({
      regionName: ['', Validators.required],
      regionType: ['', Validators.required]
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
      // Handle form submission logic
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
