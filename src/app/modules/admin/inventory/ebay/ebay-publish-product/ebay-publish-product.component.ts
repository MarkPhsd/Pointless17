import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { IClientTable, IProduct } from 'src/app/_interfaces';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AvailabilityTypeEnum, ConditionEnum, Dimensions, EbayAPIService, FulfillmentTime, PackageTypeEnum, PackageWeightAndSize, PickupAtLocationAvailability, ProductData, TimeDurationUnitEnum, Weight, WeightUnitOfMeasureEnum, Product, ConditionDescriptor } from 'src/app/_services/resale/ebay-api.service';


export interface inventoryJson {
  ebayInterface: any;
  ebayRepsonse : any;
}
@Component({
  selector: 'ebay-publish-product',
  templateUrl: './ebay-publish-product.component.html',
  styleUrls: ['./ebay-publish-product.component.scss']
})
export class EbayPublishProductComponent implements OnInit {

  action$: Observable<any>;
  uom = [{name: 'POUND', id:0}, {name: 'KILOGRAM', id:1}, {name: 'Ounce', id:3}, {name: 'Gram', id:4}];
  dimensions = [{name: 'Inch', id:0}]
  conditionDescriptors = [] as ConditionDescriptor[];
  conditions = [{name: 'New', id: 0}, {name: 'Like New', id: 1}]

  //[NEW,LIKE_NEW,NEW_OTHER,NEW_WITH_DEFECTS,MANUFACTURER_REFURBISHED,CERTIFIED_REFURBISHED,EXCELLENT_REFURBISHED,VERY_GOOD_REFURBISHED,GOOD_REFURBISHED,SELLER_REFURBISHED,USED_EXCELLENT,USED_VERY_GOOD,USED_GOOD,USED_ACCEPTABLE,FOR_PARTS_OR_NOT_WORKING]

  merchantLocationKey: string;
  inventoryItem: IInventoryAssignment;
  product: IProduct;
  inputForm: FormGroup;
  brand : IClientTable;

  metaTagForm: FormGroup;
  ebayProduct: Product;
  ebayOutPut
  product$ : Observable<IProduct>;
  brand$: Observable<IClientTable>;
  inv$: IInventoryAssignment
  awsBucketURL: string;

  metaTagsList : string[]

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientTableService,
    private menuService: MenuService,
    private siteSerivce: SitesService,
    private ebayAPIService: EbayAPIService,
    private inventoryService: InventoryAssignmentService,
    private awsBucket: AWSBucketService,
    ) { }

 async ngOnInit() {
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    const site = this.siteSerivce.getAssignedSite()
    const inv$ = this.inventoryService.getInventoryAssignment(site, 103)
    this.product$ = inv$.pipe(switchMap(data => {
      this.inventoryItem = data;
      return this.menuService.getProduct(site, this.inventoryItem.productID)
    })) .pipe(
      switchMap(data => {
        this.product = data;
        if (data && data.brandID) {
          return this.getClient(site, this.product.brandID)
        }
        return of(null)
    })).pipe(switchMap(data => {
      if (data) {
        this.brand = data;
      }
      this.initForm();
      this.initFormData()
      return of(null)
    }))

    this.metaTagForm = this.formBuilder.group({
      metaTags: []
    })

  }


  save() {
    let  productValue = this.inputForm.value  as ProductData;
    productValue.conditionDescriptors = this.conditionDescriptors;

    console.log(productValue)
    // we have to get the title
    // the description
    // the weight, width, depth, weight
    // the images
    // the descriptors.

    // then convert to a variable as string
    // save that string to the inventorItem.
    // results.ebayPublishedItem
    // results.ebayPublishResponse
    //
    // then publish the original json to ebay.
    // then
    // then save to the inventory item
    // productValue
    const site = this.siteSerivce.getAssignedSite();
    const itemJSON = {} as inventoryJson;

    itemJSON.ebayInterface = productValue // JSON.stringify(productValue)
    this.ebayOutPut = productValue
    this.inventoryItem.json= JSON.stringify(itemJSON)
    this.action$ =  this.inventoryService.putInventoryAssignment(site, this.inventoryItem).pipe(switchMap(data => {


      this.siteSerivce.notify('Saved', 'close', 2000, 'green')
      return of(data)
    }))

  }

  getClient(site, id: number) {
    return this.clientService.getClient(site, this.product.brandID).pipe(switchMap(data => {
      return of(data)
    }), catchError(data => {
      console.log(data.toString())
      return of({} as IClientTable)
    }))

  }

  initFormData() {

    if (!this.inventoryItem || !this.product) { return }

    let item = {} as ProductData;

    if (this.inventoryItem.used) {
      item.condition = ConditionEnum.LIKE_NEW
    }
    if (!this.inventoryItem.used) {
      item.condition = ConditionEnum.NEW
    }

    item.conditionDescription = this.inventoryItem?.description;

    let dimensions = {} as Dimensions;
    dimensions.height = +this.product?.height;
    dimensions.length = +this.product.depth;
    dimensions.width = +this.product.width;

    let weight = {}  as Weight
    weight.unit = WeightUnitOfMeasureEnum.POUND;
    weight.unit = +this.product.weight;

    let pckWeightSize = {} as PackageWeightAndSize;
    pckWeightSize.dimensions = dimensions;
    pckWeightSize.packageType = PackageTypeEnum.BULKY_GOODS
    pckWeightSize.weight = weight

    item.product = this.getProduct();
    this.setTagsAsDescriptors(this.inventoryItem, this.product)
    this.inputForm.patchValue(item);
  }

  setTagsAsDescriptors(inv: IInventoryAssignment, product: IProduct ) {
    let tags  = []
    let prodTags = []

    if (inv.metaTags) { tags = inv.metaTags.split(',')}
    if (product.metaTags) { prodTags = product.metaTags.split(',')}

    let combinedArray = [...tags, ...prodTags];
    this.metaTagsList = combinedArray;
    this.setItemTags(this.metaTagsList)
  }

  // "conditionDescriptors" : [
  //   { /* ConditionDescriptor */
  //   "additionalInfo" : "string",
  //   "name" : "string",
  //   "values" : [
  //   "string"
  //   ]}
  //   ],

  setItemTags(event) {
    let conditionDescriptors = [] as ConditionDescriptor[];
    event.forEach(data => {
      let conditionDescriptor = {} as ConditionDescriptor
      conditionDescriptor.additionalInfo = event.toString();
      conditionDescriptors.push(conditionDescriptor)
    })
    this.conditionDescriptors = conditionDescriptors
  }


  getProduct() {

    let product = {} as Product;

    if (this.brand) {
      product.brand = this.brand?.companyName;
    }
    product.description = this.product.description;
    product.title = this.product.name;

    const images = this.inventoryItem.images;
    product.imageUrls = this.awsBucket.convertToArrayWithUrl(images, this.awsBucketURL);

    this.ebayProduct = product;

    this.setTagsAsDescriptors(this.inventoryItem, this.product);
    return product;

  }

  initForm() {
    const prod = this.product;
    const inv = this.inventoryItem;

    this.inputForm =  this.formBuilder.group({
      condition: [''],
      conditionDescription: [''],
      pickupAtLocationAvailability: this.formBuilder.array([]),
      shipToLocationAvailability: this.formBuilder.group({
        quantity: [0],
        availabilityDistributions: this.formBuilder.array([])
      }),
      conditionDescriptors: this.conditionDescriptors,
      packageWeightAndSize: this.formBuilder.group({
        dimensions: this.formBuilder.group({
          height: [prod.height],
          length: [prod.depth],
          width:  [prod.width],
          unit: [0],
        }),
        packageType: [''],
        weight: this.formBuilder.group({
          unit:  [0],
          value: [prod.weight]
        })
      }),
      product: this.formBuilder.group({
        aspects: [''],
        brand: [''],
        description: [inv.description],
        ean: this.formBuilder.array([]),
        epid: [''],
        imageUrls: this.formBuilder.array([]),
        isbn: this.formBuilder.array([]),
        mpn: [''],
        subtitle: [''],
        title: [prod.name],
        upc: this.formBuilder.array([]),
        videoIds: this.formBuilder.array([])
      })
      // ... other form controls
    });

    // Populate the form (adjust based on actual data)
    this.populateForm();
  }

  get availabilityDistributions(): FormArray {
    return this.inputForm.get('shipToLocationAvailability.availabilityDistributions') as FormArray;
  }

  get pickupAtLocationFormArray() {
    return this.inputForm.get('pickupAtLocationAvailability') as FormArray;
  }

  private addPickupAtLocation(availability?: PickupAtLocationAvailability) {
    const availabilityGroup = this.formBuilder.group({
      availabilityType: [availability?.availabilityType || ''],
      fulfillmentTime: this.formBuilder.group({
        unit: [availability?.fulfillmentTime.unit || ''],
        value: [availability?.fulfillmentTime.value || 0]
      }),
      merchantLocationKey: [availability?.merchantLocationKey || ''],
      quantity: [availability?.quantity || 0]
    });

    this.pickupAtLocationFormArray.push(availabilityGroup);
  }

  private addShipToLocationAvailabilityDistribution(distribution?: any) {
    const distributionGroup = this.formBuilder.group({
      fulfillmentTime: this.formBuilder.group({
        unit: [distribution?.fulfillmentTime.unit || ''],
        value: [distribution?.fulfillmentTime.value || 0]
      }),
      merchantLocationKey: [distribution?.merchantLocationKey || ''],
      quantity: [distribution?.quantity || 0]
    });

    (this.inputForm.get('shipToLocationAvailability.availabilityDistributions') as FormArray).push(distributionGroup);
  }

  private addConditionDescriptor(descriptor?: any) {
    const descriptorGroup = this.formBuilder.group({
      additionalInfo: [descriptor?.additionalInfo || ''],
      name: [descriptor?.name || ''],
      values: this.formBuilder.array(descriptor?.values || [])
    });

    (this.inputForm.get('conditionDescriptors') as FormArray).push(descriptorGroup);
  }

  populateForm() {
    // Example of populating the form with an item
    let pickupLocation = {} as PickupAtLocationAvailability

    let fulfillmentTime = {} as FulfillmentTime;

    fulfillmentTime.unit = TimeDurationUnitEnum.BUSINESS_DAY;
    fulfillmentTime.value = 1;

    const item = { } as PickupAtLocationAvailability;

    item.availabilityType = AvailabilityTypeEnum.IN_STOCK;
    item.fulfillmentTime = fulfillmentTime;
    item.merchantLocationKey = '';
    item.quantity = this.inventoryItem.packageCountRemaining;

    this.addPickupAtLocation(item)

  }


}
