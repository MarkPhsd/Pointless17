import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, catchError, of, switchMap } from 'rxjs';
import { IClientTable, IProduct, IUser } from 'src/app/_interfaces';
import { AWSBucketService, AuthenticationService, MenuService, ThemesService } from 'src/app/_services';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AvailabilityTypeEnum, ConditionEnum, Dimensions, EbayAPIService, FulfillmentTime, PackageTypeEnum, PackageWeightAndSize, PickupAtLocationAvailability, ProductData, TimeDurationUnitEnum, Weight, WeightUnitOfMeasureEnum, Product, ConditionDescriptor, EbayOfferRequest, EbayOfferresponse, EbayInventoryJson, ShipToLocationAvailability, condition, CategorySuggestionsResponse, CategorySuggestion } from 'src/app/_services/resale/ebay-api.service';
import { EbayConditions } from 'src/app/_services/resale/ebayConditions';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'ebay-publish-product',
  templateUrl: './ebay-publish-product.component.html',
  styleUrls: ['./ebay-publish-product.component.scss']
})
export class EbayPublishProductComponent implements OnInit {

  @ViewChild('conditionSelector') conditionSelector : MatSelect;
  @ViewChild('menuButtonContainer') menuButtonContainer: TemplateRef<any>;
  flattenedCategories: any[] = []; // Replace with your actual data type
  ebayAspectArray: any[]
  action$: Observable<any>;
  conditions$  : Observable<any>;
  aspectValues: any;
  ebayAspects$: Observable<any>;
  uom = [{name: 'POUND', id:0}, {name: 'KILOGRAM', id:1}, {name: 'OUNCE', id:3}, {name: 'GRAM', id:4}];
  dimensions = [{name: 'INCH', id:0}]
  conditionDescriptors = [] //as ConditionDescriptor[];

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
  packageForm: FormGroup;

  dimensionsForm: FormGroup;
  aspectForm: FormGroup;
  packageWeightAndSizeForm: FormGroup;

  ebayCategoryForm;
  ebayCategories$: Observable<any>;
  ebayOutPut
  product$      : Observable<IProduct>;
  brand$        : Observable<IClientTable>;
  inv$          : IInventoryAssignment
  awsBucketURL  : string;
  id            : number;

  shippingPackageDefault = 'MAILING_BOX'
  inventoryCheck: any;
  ebayItemJSONVisible: boolean;
  metaTagsList  : string[]

  user          : IUser;
  _user         : Subscription;
  userSave$     : Observable<any>;

  shippingPackages = this.ebayService.shippingTypes;

  accordionStep

  constructor(
    private authenticationService : AuthenticationService,
    private userAuthService       : UserAuthorizationService,
    private formBuilder           : FormBuilder,
    private clientService         : ClientTableService,
    private menuService           : MenuService,
    private siteSerivce           : SitesService,
    private inventoryService      : InventoryAssignmentService,
    private awsBucket             : AWSBucketService,
    public ebayService            : EbayAPIService,
    public route                  : ActivatedRoute,
    ) {

      if ( this.route.snapshot.paramMap.get('id') ) {
        this.id = +this.route.snapshot.paramMap.get('id');
      }
      console.log('id', this.id)
  }

  async ngOnInit() {
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    if (this.id) { 
      this.product$ =  this._refresh(this.id)
    }
    this.getUserInfo()
    this.initUserSubscriber()
    this.setStep(0)
  }

  setStep(index) { 
    this.accordionStep = index;
  }

  nextStep() {
    this.accordionStep += 1;
  }

  prevStep() {
    this.accordionStep += -1;
  }


  initUserSubscriber() {
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
      this.getUserInfo()
    })
  }

  getUserInfo() {
    let user: IUser;
    if (!this.user) {
      user = JSON.parse(localStorage.getItem('user')) as IUser;
    }
    return user
  }

    refresh(id) { 
      this.action$ = this._refresh(id)
    }

   _refresh(id: number) {
    console.log(id)
    if (!id || id == 0) {
      this.siteSerivce.notify('No inventory item assigned', 'Close', 5000, 'red')
      return of(null)
    }
    const site = this.siteSerivce.getAssignedSite()
    const inv$ = this.inventoryService.getInventoryAssignment(site,id);

    return inv$.pipe(switchMap(data => {
      this.inventoryItem = data;
      // console.log('inventor', data)
      return this.menuService.getProduct(site, this.inventoryItem.productID)
    })) .pipe(
      switchMap(data => {
        this.product = data;
        // console.log('product', data)
        if (data && data.brandID) {
          return this.getClient(site, this.product.brandID)
        }
        return of(null)
    })).pipe(switchMap(data => {
      // console.log('getClient', data)
      if (data) {
        this.brand = data;
      }
      if (this.inventoryItem.json) {
        this.itemJSON = JSON.parse(this.inventoryItem.json)
        this.aspectValues = this.itemJSON.inventory?.product?.aspects;
      }
      this.initForm();
      this.initializeData()
      return of(null)
    }))
  }

  save() {
    this.action$ = this._save()
  }

  getConditions(){
    if ( this.ebayCategoryForm.controls['categoryId'].value) { 
      const id = this.ebayCategoryForm.controls['categoryId'].value
      const value = id //required format for ebay
      const url = `/sell/metadata/v1/marketplace/EBAY_US/get_item_condition_policies?filterr=categoryIds`
      const site = this.siteSerivce.getAssignedSite()
      this.conditionDescriptors = []

      let condition = {conditionDescription: 'NEW' , conditionId: 1000}
      this.conditionDescriptors.push(condition)

      condition = {conditionDescription: 'LIKE_NEW' , conditionId: 10}
      this.conditionDescriptors.push(condition)

      let condDescription = this.itemJSON?.inventory?.condition;
      if (condDescription != 'LIKE_NEW' && condDescription != 'NEW') { 
        condition = {conditionDescription: this.itemJSON?.inventory?.condition, conditionId: 10}
        this.conditionDescriptors.push(condition)
      }

      this.conditions$ = this.ebayService.getConditions(site, url, id).pipe(switchMap(data => { 

        if (!data) { 
          this.siteSerivce.notify('No data returned', 'Close', 6000)
          return of(data) 
        }
        if (data.errorMessage) { 
          this.siteSerivce.notify('Error ' + data.errorMessage.toString() + ' ' + data.errorCode.toString(), 'Close', 60000, 'red')
          return of(data)
        }
        if (data.success) { 
          try {
            const item = JSON.parse(data.responseMessage) as EbayConditions;
           
            item.itemConditionPolicies.forEach(category => { 
              if (category && category.itemConditions) { 
                category.itemConditions.forEach(value => { 
                  if (value && value.conditionDescription) { 
                    value.conditionDescription = value.conditionDescription.toUpperCase().replace(" ", "_").replace("-", "_").replace(" ", "_")
                    this.conditionDescriptors.push(value)
                  }
                })
              }
            })
          
            this.conditionSelector.open();
          } catch (error) {
            console.log('Error', error)
          }
        }
  
    
        return of(data)
      }))
    }

  }

  _save() {
    let  productValue = this.inputForm.value  as ProductData;
    let product =  this.productForm.value as Product;

    if (!this.ebayProduct) { this.ebayProduct = {}  as Product}
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

    this.itemJSON.ebayCategory = this.ebayCategoryForm.value;
    productValue.product = product;
    productValue.product.aspects = this.aspectValues;

    this.itemJSON.inventory = productValue // JSON.stringify(productValue)

    this.ebayOutPut = productValue
    this.itemJSON.offerRequest =  this.ebayOfferRequest  // this.ebayOfferForm.value;

    const shippingPackage = this.packageForm.value //.controls['packageType'].value;
    this.itemJSON.inventory.packageType = this.packageForm.controls['packageType'].value;

    this.inventoryItem.json= JSON.stringify(this.itemJSON)

    return this.inventoryService.putInventoryAssignment(site, this.inventoryItem).pipe(switchMap(data => {
      this.siteSerivce.notify('Saved', 'close', 2000, 'green')
      return of(data)
    }))

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
    ebayOffer.categoryId = this.ebayCategoryForm.controls['categoryId'].value;
    return ebayOffer;
  }

  publishInventory() {
    if (this.itemJSON.inventory) {
      const sku = this.inventoryItem.sku
      if (sku) {
        const site = this.siteSerivce.getAssignedSite()
        this.action$ = this.ebayService.createOrReplaceInventoryItem(site, sku , this.itemJSON.inventory).pipe(switchMap(data => {
          this.inventoryCheck = data;
          this.siteSerivce.notify(`Data :  ${data.success} ${data?.errorMessage}`, 'Close', 600000, 'green')
          if (data === 'Success') {
          }
          return this._refresh(this.id)
        }))
      }
    }
  }

  checkOfferStatus() {
    if (this.itemJSON.inventory) {
      if (this.itemJSON?.offerResponse?.offerId) {
        const site = this.siteSerivce.getAssignedSite()
        this.action$ = this.ebayService.checkOfferStatus(site,  this.inventoryItem.id, this.itemJSON?.offerResponse?.offerId,).pipe(switchMap(data => {
          this.inventoryCheck = data;

          if (data.success) {
          }
          if (!data?.success) {
            this.siteSerivce.notify(`Result : ${data.success} ${data?.errorMessage}`, 'Close', 600000, 'red')
          }
          return this._refresh(this.id)
        }))
      }
    }
  }

  deleteOffer() {
    console.log(this.itemJSON?.offerResponse?.offerId)
    if (this.itemJSON?.offerResponse?.offerId || this.itemJSON?.offerRequest) {
      const site = this.siteSerivce.getAssignedSite()
      this.action$ = this.ebayService.deleteOfferByID(site, this.inventoryItem.id).pipe(switchMap(data => {
        this.inventoryCheck = data;
        this.itemJSON.offerRequest = null;
        if (data != 'Success') {
          this.siteSerivce.notify(`Result : ${data?.success} ${data?.errorMessage}`, 'Close', 600000, 'green')
        }
        if (data === 'Success') {
          this.siteSerivce.notify(`Result : ${data} `, 'Close', 3000, 'green')
        }
        this.inventoryItem.json = JSON.stringify(this.itemJSON)
        return this.inventoryService.putInventoryAssignment(site,this.inventoryItem)
      })).pipe(switchMap(data => {
        return this._refresh(this.id)
      }))
      return;
    }
  }

  deleteInventory() {
    if (this.itemJSON.inventory) {
      const sku = this.inventoryItem.sku
      if (sku) {
        const site = this.siteSerivce.getAssignedSite()
        this.action$ = this.ebayService.deleteInventoryItem(site, this.inventoryItem.id).pipe(switchMap(data => {
          this.inventoryCheck = data;
          this.siteSerivce.notify(`Result : ${data?.success} ${data?.errorMessage}`, 'Close', 600000, 'green')
          if (data === 'Success') {
          }
          return this._refresh(this.id)
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
          return this._refresh(this.id)
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

  createOffer() {
    // console.log('data', this.itemJSON.inventory)
    if (this.itemJSON.inventory) {
      const site = this.siteSerivce.getAssignedSite()

      const save$ = this._save()
      this.action$ =  save$.pipe(switchMap(data => {

        return this.ebayService.createOffer(site, this.id)
      }
      )).pipe(switchMap(data => {
        this.inventoryCheck = data;
        return this._refresh(this.id)
       }
      ));
    }
  }

  publishOffer() {
    if (this.itemJSON.inventory) {
      if (this.itemJSON?.offerResponse?.offerId) {
          const offerID = this.itemJSON?.offerResponse?.offerId
          const site = this.siteSerivce.getAssignedSite()
          if (this.inventoryItem.sku) {
            this.action$ = this.ebayService.publishOfferBy(site, offerID, this.id).pipe(switchMap(data => {
              this.inventoryCheck = data;
              return this._refresh(this.id)
            }))
            return;
          }
          this.siteSerivce.notify("No Sku assigned", 'Close', 3000, 'red')
        }
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

  //if no data is set, this will establish the base features.
  initializeData() {
    if (!this.inventoryItem || !this.product) { return }
    let item = {} as ProductData;
    let dimensions        = {} as Dimensions;
    let weight            = {}  as Weight
    let pckWeightSize     = {} as PackageWeightAndSize;
    if (this.itemJSON) {

      if (!this.itemJSON.inventory) { this.itemJSON.inventory = {} as ProductData};
      if (!this.itemJSON.inventory.packageWeightAndSize) { this.itemJSON.inventory.packageWeightAndSize = pckWeightSize }
      if (!this.itemJSON.inventory.packageWeightAndSize.dimensions) { this.itemJSON.inventory.packageWeightAndSize.dimensions = dimensions }
      if (!this.itemJSON.inventory.packageWeightAndSize.weight) { this.itemJSON.inventory.packageWeightAndSize.weight = weight }
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
    
      item.condition = this.itemJSON?.inventory?.condition;
      if (!item.packageWeightAndSize) {
        item.packageWeightAndSize = pckWeightSize;
      }
      if (!this.itemJSON?.inventory?.packageType) {
        this.itemJSON.inventory.packageType = 'MAILING_BOX'
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
      if (this.inventoryItem.used) {   item.condition = "Like_New"   }
      if (item.product) {    item.product.description = this.inventoryItem?.description;  }
      pckWeightSize.dimensions  = dimensions;
      pckWeightSize.weight      = weight;
      item.packageType = 'MAILING_BOX'
      item.packageWeightAndSize.weight = weight;
      item.packageWeightAndSize.dimensions = dimensions
      this.itemJSON.inventory = item;
    }

    this.getProduct();
  }


  getProduct() {
    let product = {} as Product;
    product.description = this.product?.description;
    product.title = this.product?.name;
    const images = this.inventoryItem?.images;
    product.imageUrls = this.awsBucket.convertToArrayWithUrl(images, this.awsBucketURL);
    this.ebayProduct = product;
    return product;
  }

  setCategoryName(event) { 
    const item = event.value;
    const catID = this.ebayCategoryForm.controls['categoryId'].value;
    this.ebayOfferForm.patchValue({categoryId: catID})
    const cat = this.flattenedCategories.filter(data => {  return data.categoryId == catID   })
    if (cat) {   this.ebayCategoryForm.patchValue({categoryId: cat[0].categoryId, categoryName:  cat[0].categoryName })  }
  }

  initForm() {
    const prod = this.product;
    const inv = this.inventoryItem;

    this.ebayCategoryForm = this.formBuilder.group ( { 
      categoryId: [],
      categoryName: [],
    })

    if (this.itemJSON?.ebayCategory) {
      this.flattenedCategories.push(this.itemJSON?.ebayCategory)
      this.ebayCategoryForm.patchValue(this.itemJSON?.ebayCategory)
    }

    this.productForm = this.formBuilder.group({
      description: [],
      title: [],
      imageUrls: [],
    })

    if (this.itemJSON  && this.productForm) {
      this.productForm.patchValue(this.itemJSON?.inventory?.product)
    }

 
    this.ebayOfferForm = this.formBuilder.group({
      sku                   : [this.inventoryItem.sku,  ],
      listingDescription    : [this.product.name, , ],
      availableQuantity     : [1],
      quantityLimitPerBuyer : [1],
      categoryId            : ['', , ],
      price                 : [this.product.retail, ],
    })

    this.ebayOfferForm.patchValue(this.itemJSON?.offerRequest)
    if (this.itemJSON?.offerRequest?.categoryId) { 
      this.ebayCategoryForm.patchValue({categoryId: this.itemJSON?.offerRequest?.categoryId})
    } else { 
      if (this.itemJSON?.ebayCategory?.category?.categoryId) { 
        this.ebayCategoryForm.patchValue({categoryId: this.itemJSON?.ebayCategory?.category?.categoryId})
      }
    }
    

    if (this.itemJSON?.offerRequest?.pricingSummary?.price?.value != '0') {
      let price = this.itemJSON?.offerRequest?.pricingSummary?.price?.value;
      price = parseFloat(price).toFixed(2);
      this.ebayOfferForm.patchValue( { price: price } )
    }

    this.packageForm = this.formBuilder.group({
      packageType: [this.shippingPackageDefault]
    })

    if (this.itemJSON?.inventory?.packageType) {
      const item = this.itemJSON.inventory?.packageType;
      this.packageForm.patchValue({packageType : item})
    }

    this.dimensionsForm = this.formBuilder.group({
        height: [prod?.height],
        length: [prod?.depth],
        width:  [prod?.width],
        unit:    [0],
    })

    if (this.itemJSON?.inventory?.packageWeightAndSize?.dimensions) {
      this.dimensionsForm.patchValue(this.itemJSON?.inventory?.packageWeightAndSize?.dimensions)
    }

    this.packageWeightAndSizeForm = this.formBuilder.group( {
      unit:  [0],
      value: [prod?.weight]
    })
    if (this.itemJSON?.inventory?.packageWeightAndSize?.weight) {
      this.packageWeightAndSizeForm.patchValue(this.itemJSON?.inventory?.packageWeightAndSize?.weight)
    }

    this.inputForm =  this.formBuilder.group({  condition: [''] });
    this.inputForm.patchValue({condition: this.itemJSON?.inventory?.condition })

    this.populateForm();
    this.getConditions();
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
    let fulfillmentTime = {} as FulfillmentTime;
    fulfillmentTime.unit = TimeDurationUnitEnum.BUSINESS_DAY;
    fulfillmentTime.value = 1;
    const item = { } as PickupAtLocationAvailability;
    item.availabilityType = AvailabilityTypeEnum.IN_STOCK;
    item.fulfillmentTime = fulfillmentTime;
    item.merchantLocationKey = '';
    item.quantity = this.inventoryItem?.packageCountRemaining;
    this.addPickupAtLocation(item)
  }

  get isOfferCreated() {
    if (this.itemJSON?.offerResponse?.offerId && this.itemJSON?.offerResponse?.offerId.trim() != '') {
      return true
    }
    return false
  }

  get isActiveOffer() {
    if (this.itemJSON?.listingid) {
      return true
    }
    return false
  }

  get isInventoryCreated() {
    if ( this.itemJSON?.inventory) {
      return true;
    }
    return false
  }

  get publishOfferDisabled() {
    if (!this.itemJSON?.offerResponse?.offerId) { 
      return true 
    }
    if (!this.itemJSON?.inventoryPublished) { 
      return true 
    }
    // if (!this.isOfferCreated) {
    //   return true
    // }
    // if (this.isOfferCreated && this.isListed){
    //   return true
    // }
    // if (this.isOfferCreated && !this.isListed){
    //   return false
    // }
    // if (!this.inventoryCheck)  {
    //   return true
    // }
  }


  get isListed() {
    if (this.itemJSON?.listingid) {
      return true;
    }
    return false
  }


  toggleEbayItemJSON() {
    if (!this.user) {
      this.getUserInfo()
    }
    // console.log('user', this.user )
    if (this.user && this.user?.userPreferences ) {
      if (this.user?.userPreferences?.ebayItemJSONHidden) {
        this.user.userPreferences.ebayItemJSONHidden = false;
      } else {
        this.user.userPreferences.ebayItemJSONHidden = true;
      }
      this.userSave$ = this.userAuthService.setUserObs(this.user)
    }
  }
  // EbayResponse
  getCategories() { 
    const site = this.siteSerivce.getAssignedSite()
    if (!this.ebayOfferForm) { return }
    const productDescription = this.ebayOfferForm.controls['listingDescription'].value;
    if (productDescription) { 
      this.ebayCategories$  = this.ebayService.getCateogries(site, 'EBAY_US', productDescription ).pipe(switchMap(data => {
        return of(this.getflattenCategories(data.categorySuggestions))
        }
      ))
    }
  }

  getItemAspects() { 
    const id = this.ebayOfferForm.controls['categoryId'].value;
    //https://api.ebay.com/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category?category_id=260988
    const url = `/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category?category_id=${id}`
    const site = this.siteSerivce.getAssignedSite()
    this.ebayAspects$ = this.ebayService.getAsync(site, url).pipe(switchMap(data => { 
      // this.inventoryCheck = data;
      this.ebayAspectArray = JSON.parse(data.responseMessage);
      return of(data)
    }))
  }

  setAspects(event) { 
    console.log('aspects', event)
    this.aspectValues = event;
    this.save()
  }

  getflattenCategories(data: CategorySuggestion[]) {
    if (!data) { null }
    console.log('data', data)
    data.forEach(suggestion => {
      console.log('suggestion', suggestion)
      // Add the main category
      this.flattenedCategories.push({
        categoryId: suggestion.category.categoryId,
        categoryName: suggestion.category.categoryName
      });
   
      suggestion.categoryTreeNodeAncestors.forEach(ancestor => {
        console.log('ancestor', ancestor)
        this.flattenedCategories.push({
          categoryId: ancestor.categoryId,
          categoryName: ancestor.categoryName + ' ' + ancestor.categoryId
        });

      });
    });

    return this.flattenedCategories
  }

}
