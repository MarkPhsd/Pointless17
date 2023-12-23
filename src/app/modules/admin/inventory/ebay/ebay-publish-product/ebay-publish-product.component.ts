import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { IClientTable, IProduct } from 'src/app/_interfaces';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AvailabilityTypeEnum, ConditionEnum, Dimensions, EbayAPIService, FulfillmentTime, PackageTypeEnum, PackageWeightAndSize, PickupAtLocationAvailability, ProductData, TimeDurationUnitEnum, Weight, WeightUnitOfMeasureEnum, Product, ConditionDescriptor, EbayOfferRequest, EbayOfferresponse, EbayInventoryJson, ShipToLocationAvailability } from 'src/app/_services/resale/ebay-api.service';

@Component({
  selector: 'ebay-publish-product',
  templateUrl: './ebay-publish-product.component.html',
  styleUrls: ['./ebay-publish-product.component.scss']
})
export class EbayPublishProductComponent implements OnInit {
  @ViewChild('menuButtonContainer') menuButtonContainer: TemplateRef<any>;

  action$: Observable<any>;
  uom = [{name: 'POUND', id:0}, {name: 'KILOGRAM', id:1}, {name: 'OUNCE', id:3}, {name: 'GRAM', id:4}];
  dimensions = [{name: 'INCH', id:0}]
  conditionDescriptors = [] as ConditionDescriptor[];
  conditions = [{name: 'NEW', id: 0}, {name: 'LIKE NEW', id: 1}]

  //[NEW,LIKE_NEW,NEW_OTHER,NEW_WITH_DEFECTS,MANUFACTURER_REFURBISHED,CERTIFIED_REFURBISHED,EXCELLENT_REFURBISHED,VERY_GOOD_REFURBISHED,GOOD_REFURBISHED,SELLER_REFURBISHED,USED_EXCELLENT,USED_VERY_GOOD,USED_GOOD,USED_ACCEPTABLE,FOR_PARTS_OR_NOT_WORKING]
  itemJSON : EbayInventoryJson;
  merchantLocationKey: string;
  inventoryItem: IInventoryAssignment;
  product: IProduct;
  inputForm: FormGroup;
  productForm: FormGroup;
  brand : IClientTable;

  ebayOfferForm: FormGroup;
  metaTagForm: FormGroup;
  ebayProduct: Product;

  dimensionsForm: FormGroup;
  packageWeightAndSizeForm: FormGroup;

  ebayOutPut
  product$ : Observable<IProduct>;
  brand$: Observable<IClientTable>;
  inv$: IInventoryAssignment
  awsBucketURL: string;
  id: number;

  inventoryCheck: string;

  metaTagsList : string[]

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientTableService,
    private menuService: MenuService,
    private siteSerivce: SitesService,
    private inventoryService: InventoryAssignmentService,
    private awsBucket: AWSBucketService,
    private ebayService: EbayAPIService,
    public route      : ActivatedRoute,
    ) {

      if ( this.route.snapshot.paramMap.get('id') ) {
        this.id = +this.route.snapshot.paramMap.get('id');
      }
      // this.id = router.get
      // ebay-publish-product
  }

  async ngOnInit() {
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.product$ =  this.refresh(this.id)
  }

   refresh(id: number) {
    if (!id || id == 0) {
      this.siteSerivce.notify('No inventory item assigned', 'Close', 5000, 'red')
      return of(null)
    }

    const site = this.siteSerivce.getAssignedSite()
    const inv$ = this.inventoryService.getInventoryAssignment(site,id);

    return inv$.pipe(switchMap(data => {
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
      if (this.inventoryItem.json) {
        this.itemJSON = JSON.parse(this.inventoryItem.json)
      }
      this.initForm();
      this.initFormData()
      return of(null)
    }))


  }
  save() {
    let  productValue = this.inputForm.value  as ProductData;
    let product =  this.productForm.value as Product;
    if (this.ebayProduct.imageUrls) {
      product.imageUrls = this.ebayProduct.imageUrls;
    }
    //then get the values of dimensions and weight
    let weight = this.packageWeightAndSizeForm.value;
    let dimensions = this.dimensionsForm.value;

    if (!productValue.packageWeightAndSize) {
      productValue.packageWeightAndSize = {} as PackageWeightAndSize
    }
    if (!productValue.packageWeightAndSize) {
      productValue.packageWeightAndSize.dimensions = {} as Dimensions
    }
    if (!productValue.packageWeightAndSize) {
      productValue.packageWeightAndSize.weight = {} as Weight
    }

    productValue.packageWeightAndSize.dimensions = dimensions;
    productValue.packageWeightAndSize.weight = weight;

    const site = this.siteSerivce.getAssignedSite();
    this.itemJSON = {} as EbayInventoryJson;
    this.itemJSON.inventory = productValue // JSON.stringify(productValue)

    productValue.product = product;

    this.itemJSON.inventory = productValue // JSON.stringify(productValue)

    this.ebayOutPut = productValue
    this.itemJSON.offerRequest =  this.ebayOfferRequest  // this.ebayOfferForm.value;

    this.inventoryItem.json= JSON.stringify(this.itemJSON)

    this.action$ =  this.inventoryService.putInventoryAssignment(site, this.inventoryItem).pipe(switchMap(data => {
      this.siteSerivce.notify('Saved', 'close', 2000, 'green')
      return of(data)
    }))

    // this.ebayOfferForm = this.formBuilder.group({
    //   sku: [this.inventoryItem.sku],
    //   listingDescription: [this.product.name],
    //   availableQuantity: [1],
    //   quantityLimitPerBuyer: [1],
    //   price: [this.product.retail],
    // })

  }

  get ebayOfferRequest() {
    const ebayOfferForm = this.ebayOfferForm.value;
    let ebayOffer = {} as EbayOfferRequest;
    ebayOffer.availableQuantity = ebayOfferForm.availableQuantity;
    ebayOffer.quantityLimitPerBuyer = ebayOfferForm.quantityLimitPerBuyer;
    ebayOffer.listingDescription = ebayOfferForm.listingDescription;
    ebayOffer.sku = this.inventoryItem.sku;
    ebayOffer.pricingSummary = {} as any;
    ebayOffer.pricingSummary.price = {} as any;
    ebayOffer.pricingSummary.price.value = ebayOfferForm.price;
    ebayOffer.pricingSummary.price.currency = 'USD'// = ebayOfferForm.offerPrice;
    return ebayOffer
  }

  publishInventory() {
    if (this.itemJSON.inventory) {
      const sku = this.inventoryItem.sku
      if (sku) {
        const site = this.siteSerivce.getAssignedSite()
        this.action$ = this.ebayService.createOrReplaceInventoryItem(site, sku , this.itemJSON.inventory).pipe(switchMap(data => {
          this.siteSerivce.notify(`Data :  ${data.success} ${data?.errorMessage}`, 'Close', 600000, 'green')
          if (data === 'Success') {
          }
          return this.refresh(this.id)
        })).pipe(switchMap(data => {
          return of(null)
        }))
        return;
      }
    }
  }


  deleteOffer() {
    if (this.itemJSON.inventory) {
      const sku = this.inventoryItem.sku
      if (sku) {
        const site = this.siteSerivce.getAssignedSite()
        this.action$ = this.ebayService.deleteOfferByID(site, this.inventoryItem.id).pipe(switchMap(data => {
          this.siteSerivce.notify(`Result : ${data.success} ${data?.errorMessage}`, 'Close', 600000, 'green')
          if (data === 'Success') {
          }
          return this.refresh(this.id)
        })).pipe(switchMap(data => {
          ////then get refresh
          return of(null)
        }))
        return;
      }
    }
  }

  deleteInventory() {
    if (this.itemJSON.inventory) {
      const sku = this.inventoryItem.sku
      if (sku) {
        const site = this.siteSerivce.getAssignedSite()
        this.action$ = this.ebayService.deleteInventoryItem(site, this.inventoryItem.id).pipe(switchMap(data => {
          this.siteSerivce.notify(`Result : ${data?.success} ${data?.errorMessage}`, 'Close', 600000, 'green')
          if (data === 'Success') {
          }
          return this.refresh(this.id)
        })).pipe(switchMap(data => {
          ////then get refresh
          return this.refresh(this.id)
        }))
        return;
      }
    }
  }

  checkInventory() {
    if (this.itemJSON.inventory) {
      const site = this.siteSerivce.getAssignedSite()
      const sku = this.inventoryItem.sku
      if (sku) {
        this.action$ = this.ebayService.checkInventory(site, sku).pipe(switchMap(data => {
          this.inventoryCheck = data;
          // this.siteSerivce.notify(`Data : ${data}`, 'Close', 6000, 'green')
          return this.refresh(this.id)
        }))
        return;
      }
      this.siteSerivce.notify("No Sku assigned", 'Close', 3000, 'red')
    }
  }

  getInventory() {
    if (this.itemJSON.inventory) {
      // this.action$ = this.ebayService.
    }
  }

  publishOffer() {

    if (this.itemJSON.inventory) {
      const site = this.siteSerivce.getAssignedSite()
      const sku = this.inventoryItem.sku
      if (sku) {
        this.action$ = this.ebayService.publishOffer(site, this.id).pipe(switchMap(data => {
          this.inventoryCheck = data;
          return this.refresh(this.id)
        }))
        return;
      }
      this.siteSerivce.notify("No Sku assigned", 'Close', 3000, 'red')
    }

  }

  getOffer() {
    if (this.itemJSON.inventory) {
      // this.action$ = this.ebayService.
    }
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

    if (this.inventoryItem.used) {   item.condition = "Like New"  }
    if (!this.inventoryItem.used) {  item.condition = "New"   }

    let dimensions = {} as Dimensions;
    let weight     = {}  as Weight
    let pckWeightSize         = {} as PackageWeightAndSize;
    if (this.itemJSON) {

      if (!this.itemJSON.inventory.product) {  this.itemJSON.inventory.product = {} as Product;  }
      dimensions.height = +this.itemJSON?.inventory?.packageWeightAndSize?.dimensions?.height;
      dimensions.length = +this.itemJSON?.inventory?.packageWeightAndSize?.dimensions?.length;
      dimensions.width  = +this.itemJSON?.inventory?.packageWeightAndSize?.dimensions?.width;
      weight.unit =  this.itemJSON?.inventory?.packageWeightAndSize?.weight.unit
      weight.value = +this.itemJSON?.inventory?.packageWeightAndSize?.weight.value

      if (!this.itemJSON.inventory.product.description) {
        this.itemJSON.inventory.product.description = this.inventoryItem?.description;
      }
      if (!this.itemJSON.inventory.product.title) {
        this.itemJSON.inventory.product.description = this.inventoryItem?.product?.name;
      }

      // console.log('initForm, itemjson', this.itemJSON)
      if (this.itemJSON  && this.inputForm) {

        this.productForm.patchValue(this.itemJSON?.inventory?.product)
      }


      item.condition = this.itemJSON.inventory.condition;

      if (!item.packageWeightAndSize) {
        item.packageWeightAndSize = pckWeightSize;
      }

      if (!this.itemJSON?.inventory?.packageWeightAndSize?.packageType) {
        this.itemJSON.inventory.packageWeightAndSize.packageType = 'MAILING_BOX'
      }

      item.packageWeightAndSize.weight = weight;
      item.packageWeightAndSize.dimensions = dimensions

    } else {
      dimensions.height = +this.product?.height;
      dimensions.length = +this.product.depth;
      dimensions.width  = +this.product.width;
      weight.unit = 'POUND';
      weight.unit =  this.product.weight;
      item.condition = "New";
      if (this.inventoryItem.used) {
        item.condition = "Like New"
      }

      item.product.description = this.inventoryItem?.description;
      pckWeightSize.dimensions  = dimensions;
      pckWeightSize.packageType = 'BULKY_GOODS'
      pckWeightSize.weight      = weight
      item.packageWeightAndSize.packageType = pckWeightSize.packageType
      item.packageWeightAndSize.weight = weight;
      item.packageWeightAndSize.dimensions = dimensions
    }

    this.dimensionsForm.patchValue(item.packageWeightAndSize.dimensions)
    this.packageWeightAndSizeForm.patchValue(item.packageWeightAndSize.weight)
    item.product = this.getProduct();
    this.setTagsAsDescriptors(this.inventoryItem, this.product)
    this.inputForm.patchValue(item)
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

    this.productForm = this.formBuilder.group({
      description: [],
      title: [],
      imageUrls: [],
    })

    this.metaTagForm = this.formBuilder.group({
      metaTags: []
    })


    this.ebayOfferForm = this.formBuilder.group({
      sku: [this.inventoryItem.sku],
      listingDescription: [this.product.name],
      availableQuantity: [1],
      quantityLimitPerBuyer: [1],
      price: [this.product.retail],
    })

    if (this.itemJSON) {
      if (this.itemJSON.ebayPublishResponse) {

      }
    }

    if (this.itemJSON?.offerRequest?.pricingSummary?.price?.value > 0) {
      this.ebayOfferForm.patchValue({price: this.itemJSON?.offerRequest?.pricingSummary?.price?.value })
    }

    // this.itemJSON.inventory.packageWeightAndSize
    // this.itemJSON.inventory.product
    // this.itemJSON.inventory.packageWeightAndSize.dimensions;
    // this.itemJSON.inventory.packageWeightAndSize.packageType;
    // this.itemJSON.inventory.packageWeightAndSize.weight

    this.dimensionsForm = this.formBuilder.group({
        height: [prod?.height],
        length: [prod?.depth],
        width:  [prod?.width],
        unit: [0],
    })

    this.packageWeightAndSizeForm = this.formBuilder.group( {
      unit:  [0],
      value: [prod?.weight]
    })

    this.inputForm =  this.formBuilder.group({
      condition: [''],
    });

    // Populate the form (adjust based on actual data)
    this.populateForm();
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

    // this.pickupAtLocationFormArray.push(availabilityGroup);
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
