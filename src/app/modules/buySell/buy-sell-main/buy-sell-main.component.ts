import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription, catchError, of, switchMap } from 'rxjs';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { AWSBucketService, AuthenticationService, MenuService } from 'src/app/_services';
import { AvalibleInventoryResults, InventoryAssignmentService, InventoryFilter, InventorySearchResultsPaged } from 'src/app/_services/inventory/inventory-assignment.service';
import { IMetaTag,  MetaTagSearchModel, MetaTagsService } from 'src/app/_services/menu/meta-tags.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BrandClassSearch, BrandsResaleService } from 'src/app/_services/resale/brands-resale.service';
import { ClassesResaleService } from 'src/app/_services/resale/classes-resale.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'buy-sell-main',
  templateUrl: './buy-sell-main.component.html',
  styleUrls: ['./buy-sell-main.component.scss']
})
export class BuySellMainComponent implements OnInit {

  @ViewChild('purchaseItemSales') purchaseOrderView : TemplateRef<any>;
  @ViewChild('purchaseItemHistory') salesHistoryView : TemplateRef<any>;
  @ViewChild('inventoryList') inventoryList : TemplateRef<any>;
  buyItem$: Observable<any>;
  isApp     = false;
  itemFound$: Observable<any>;

  tagsList  = [] as string[]
  searchTagNames = [] as string[]
  metaTagSearch : string;
  metaTagListing$: Observable<any>;

  attributes$: Observable<any>;
  departments$: Observable<any>;
  departments: any;


  brands$: Observable<any>;
  genderID: number;

  inventoryItemsDeptAttribute$: Observable<AvalibleInventoryResults>;
  lastDepartment: string;
  department: string;
  departmentID: number;

  attribute: string;
  lastAttribute: string;
  genders =  [{ id:0, name: 'Male'}, { id: 1, name: 'Female'} ]

  brandID: number;
  brand: string;
  metaTagSearch$   : Observable<any>;
  mainAttributeList: any[];

  gender = {id: 1, name:'Female'}
  uiHomePage: UIHomePageSettings
  _uiHomePage: Subscription;
  menuItem: IMenuItem

  _posDevice: Subscription;
  posDevice: ITerminalSettings
  bucketName: string;

  /////inventory features.
  totalInvQuantity: number;
  totalAttributeDepartmentInventory: number = 0
  inventoryReview: boolean;
  inventoryItems$ : Observable<AvalibleInventoryResults>;
  inventoryInfo: AvalibleInventoryResults;

  searchForm: FormGroup;

  itemSales$
  itemDeptAttribSales$
  _userAuths: Subscription;
  userAuths:IUserAuth_Properties;

  subscribeUIHomePage() {
    try {
      this._uiHomePage = this.uISettingsService.homePageSetting$.subscribe(data => {
        if (data) {
          this.uiHomePage = data;
        }
      })
    } catch (error) {

    }

    try {
      this._posDevice = this.uISettingsService.posDevice$.subscribe(data => {
        this.posDevice = data;
      })
    } catch (error) {

    }

    this._userAuths = this.authenticationSerivce.userAuths$.subscribe(data => {
      if (data) {
        this.userAuths = data;

      }
    })
  }

  get inventoryListOn() {
    if (this.userAuths && this.userAuths.allowBuy){
      return this.inventoryList;
    }
    return null
  }

  get purchaseOrderViewOn() {
    if (this.userAuths && this.userAuths.allowBuy && this.menuItem && this.menuItem.barcode){
      return this.purchaseOrderView;
    }
    return null
  }

  get salesHistoryViewOn() {
    if (this.userAuths && this.userAuths.allowBuy && this.menuItem && this.menuItem.barcode){
      return this.salesHistoryView;
    }
    return null
  }

  setMetaTagSearch(event) {
    this.searchTagNames = []
    if (event) {
      if (event.length>0)
        event.forEach(data => {
        if (data && data.name) {
          this.searchTagNames.push(data.name)
        }
      });
    }

    if (!this.departmentID && !this.attribute) {return}

      const site     = this.siteService.getAssignedSite()
      let search = {} as InventoryFilter
      search.departmentID = this.departmentID;
      search.attribute = this.attribute;
      search.metaTagsList = this.searchTagNames;
      this.inventoryReview = true;

      this.inventoryItems$ = this.inventoryService.getAvalibleInventorySearch(site, search).pipe(switchMap(data => {
        this.totalAttributeDepartmentInventory = this.getInventoryCount(data);
        this.inventoryInfo = data;
        return of(data)
      }))
    // }
  }

  resetMetaTagSearch() {
    this.searchTagNames = [];
  }

  constructor(
    private uISettingsService : UISettingsService,
    private classesResaleService: ClassesResaleService,
    private menuService: MenuService,
    private inventoryService   : InventoryAssignmentService,
    private metaTagsService : MetaTagsService,
    private fb: FormBuilder,
    private siteService: SitesService,
    public  platFormService   : PlatformService,
    private awsBucket         : AWSBucketService,
    private productEditButtonService: ProductEditButtonService,
    private orderMethodsService: OrderMethodsService,
    private authenticationSerivce: AuthenticationService,
    private brandsResaleService: BrandsResaleService) { }

  async ngOnInit() {
    this.isApp    = this.platFormService.isApp()
    this.subscribeUIHomePage()
    this.bucketName =   await this.awsBucket.awsBucket();
    this.reset();
    this.initSearchForm()
  }

  getImageUrl(imageUrl) {
    if (!imageUrl) {
      const image = this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.png")
      return image
    } else {
      const imageName =  imageUrl.split(",")
      const image = this.awsBucket.getImageURLPath(this.bucketName, imageName[0])
      return image
    }
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      department: [],
      attribute: [],
      brand: [],
    })

    this.searchForm.valueChanges.subscribe(data => {

      const department = this.getItemSearch('department')

      if (department) {
        if (!this.lastDepartment || (this.lastDepartment != this.department)) {
          this.lastDepartment = this.department
          this.refreshDepartmentsByName(department)
        }
      }

      const attribute = this.getItemSearch('attribute')
      if (attribute) {
        this.setAttributeByName(attribute);
        if (!this.lastAttribute || (this.lastAttribute != this.attribute) || !this.attribute || this.attribute == '') {
          this.lastAttribute = this.attribute;
          // this.setAttributeByName(attribute);
        }
      }

      const brand = this.getItemSearch('brand')
      if (brand) {
        this.setBrandByName(brand)
      }

    })
  }

  toggleInventoryReview() {
    this.inventoryReview = !this.inventoryReview;
  }

  setInventoryInfo(event) {
    this.inventoryInfo = event
  }

  reset(overRide?: boolean) {
    if (overRide) {
    } else {
      this.genderID = 0;
      this.gender = {id: 1, name:'Female'}
    }
    this.inventoryReview = false;
    this.lastAttribute = null;
    this.lastDepartment = null;
    this.departments = null;

    const site = this.siteService.getAssignedSite()
    this.refreshDepartmentsByName(null)

    this.metaTagListing$ = null;
    this.tagsList = []
    this.brand = null;
    this.department = null;
    this.departmentID = 0
    this.attribute = null;
    this.attributes$ = null;
    this.itemFound$ = null;
    this.brands$ = null;
    this.menuItem = null;
    this.initSearchForm()
    this.searchBrands()
  }

  searchBrands() {
    const site  = this.siteService.getAssignedSite()
    let search = {} as BrandClassSearch
    search.pageSize = 600;
    search.pageNumber = 1;
    search.name = this.getItemSearch('brand')
    search.gender = this.genderID;

    this.brandsResaleService.getBrands(site, search)
  }

  getItemSearch(name){
    if (this.searchForm) {
      const brand = this.searchForm.controls[name].value;
      return brand
    }
    return null;
  }

  setGender(item){
    this.gender = item;
    this.genderID = item.id;
    this.reset(true)
  }

  setBrandID(item) {
    this.brandID = item.id;
    this.brand = item.name;
    this.findItem()
  }

  setBrandByName(name){
    this.brand = name
    const site  = this.siteService.getAssignedSite()
    this.brands$ = this.brandsResaleService.getBrandsByAttributeDepartment_sub(site, this.departmentID, this.attribute, this.gender?.id, name)
    this.findItem();
  }

  cancelSearchDept(event) {
    this.department = null;
    this.departmentID = null;
    this.reset(true);
  }

  cancelSearchAttribute(event) {
    this.attribute = null;
    this.searchForm.patchValue({brand: null, attribute: null});
    this.refreshAttributes();
  }

  cancelSearchBrands(event) {
    this.brand = null;
    this.brandID = null;
    this.searchForm.patchValue({brand: null});

    this.refreshBrands();
  }

  searchAllBrands() {
    this.brand = null;
    this.searchForm.patchValue({brand: null});
    const site  = this.siteService.getAssignedSite();
    this.brands$ = this.brandsResaleService.getBrandsByAttributeDepartment_sub(site, this.departmentID, this.attribute, this.gender?.id, this.brand)
  }

  findItem() {
    const site  = this.siteService.getAssignedSite()
    this.totalInvQuantity  = 0
    if (!this.attribute || !this.departmentID || !this.gender || !this.brandID) { return }
    const item$ = this.menuService.findItemForBuyBack(site, this.departmentID, this.attribute, this.gender.id, this.brandID, this.gender.id)
    this.itemFound$ = item$.pipe(switchMap(data => {
      if (data && data.errorMessage) {
        this.siteService.notify(`Error ${data.errorMessage}`, 'Close', 5000, 'red')
      }
      this.menuItem = data;
      this.getInventoryInfo(data.id)
      return of(data)
    }))
  }

  findItemsByTags() {
    if (this.tagsList) {
      //inventoryReview
    }
  }

  getInventoryInfo(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite()
      this.inventoryItems$ = this.inventoryService.getAvalibleInventory(site, id, true).pipe(switchMap(data => {
        this.inventoryInfo = data;
        // console.log(' getInventoryInfo', data)
        this.totalInvQuantity = this.getInventoryCount(data);
        return of(data)
      }),catchError(data => {
        this.siteService.notify(`Error: ${data.toString()}`, 'close', 6000, 'red')
        return of(data)
      }));
    }
  }

  getInventoryCount(data) {
    //then summarize the inventory
    //getTotalQuantity
    let totalCount : number = 0 ;
    if (data && data.results) {
      data.results.forEach(item => {
        // console.log('Counts', item.packageCountRemaining, totalCount)
        totalCount += +item.packageCountRemaining
      })
      return totalCount
    }
    return 0
  }

  setDepartmentID(item) {
    this.department = item.name;
    this.departmentID = item.id;

    this.searchForm.patchValue({brand: item.name})
    this.setDepartmentByName(item.name);
  }

  setDepartmentByName(name:string) {
    this.department = name;
    this.attribute = null;
    this.brands$ = null;

    this.brand = null;
    this.brandID = null;

    this.itemFound$ = null;
    this.menuItem = null;

    this.lastAttribute = null;
    this.lastDepartment = null;

    this.refreshAttributes();
  }

  refreshDepartmentsByName(name) {
    const site = this.siteService.getAssignedSite()

    let search = {} as ProductSearchModel;
    search.name = name;
    search.pageSize = 10000;

    // this.departments$ = this.menuService.getListOfDepartmentsAll(site);
    search.itemTypeID = 6;
    search.gender = this.gender.id;
    search.genderAny = true;
    this.departments$ = this.menuService.getProductsBySearchForLists(site, search).pipe(switchMap(data => {

      if (data && data.results.length>1) {
        this.department = null;
        this.departmentID = null;
        this.refreshAttributes();
      }
      if (data && data.results.length == 1) {
        this.department = data.results[0].name
        this.departmentID = data.results[0].id;
        this.refreshAttributes();
      }

      this.departments = data.results;
      return of(data.results)
    }));

    this.attributes$ = null;
    this.brands$ = null;
  }

  refreshBrands() {
    const site  = this.siteService.getAssignedSite()
    this.brands$ = this.brandsResaleService.getBrandsByAttributeDepartment_sub(site, this.departmentID, this.attribute, this.gender?.id)
  }

  refreshAttributes()  {
    const site  = this.siteService.getAssignedSite()
    if (!this.departmentID) {return}
    this.attributes$ = this.classesResaleService.getAttributeListByDepartment(site,  this.departmentID, this.gender?.id)
    this.searchMetaTags()
  }

  searchMetaTags() {

    if (!this.departmentID || !this.attribute) { return}
    const site     = this.siteService.getAssignedSite()
    let search = {} as MetaTagSearchModel;
    let meta = {} as IMetaTag
    meta.departmentID = this.departmentID
    meta.attribute = this.attribute
    search.metaTag = meta;
    this.searchTagNames = [];
    this.metaTagListing$ = this.metaTagsService.metaTagSearch(site, search).pipe(switchMap(data => {
      if (data) {
        let list = ''
        if (data.results && data.results.length > 0){
          data.results.forEach(item => {
            if (item && (item.name && item.name!= '')) {
              list = list.concat(`${item.name},`)
            }
          })
          if (list.endsWith(',')) {
            list = list.substring(0, list.length - 1);
          }
        }
        return of(list)
      }
      return of('')
    }))
  }

  setAttribute(event) {
    const site     = this.siteService.getAssignedSite()
    this.brand     = null;
    this.brandID   = null;
    this.menuItem  = null;
    this.attribute = event;
    this.itemFound$ = null;
    this.menuItem   = null;
    if (!this.departmentID ) {return}
    this.setInventoryByAttributeDepartment(this.departmentID, this.attribute)
    this.refreshBrands()
  }



  setAttributeByName(event) {
    const site     = this.siteService.getAssignedSite()
    this.brand     = null;
    this.brandID   = null;
    this.menuItem  = null;
    this.attribute = event;
    this.itemFound$ = null;
    this.menuItem   = null;

    this.attributes$ = this.classesResaleService.getAttributeListByDepartment(site,  this.departmentID, this.gender?.id, this.attribute).pipe(switchMap(data => {
      if (data && data.length == 1) {
        this.attribute = data[0].name;

        this.setInventoryByAttributeDepartment(this.departmentID, this.attribute)
        this.refreshBrands();
        this.searchMetaTags()
      }
      if (data && data.length > 1) {
        this.attribute = null;
        this.refreshBrands()
      }
      return of (data)
    }))

  }

  setInventoryByAttributeDepartment(departmentID: number, attribute: string) {
    const site     = this.siteService.getAssignedSite()
    let search = {} as InventoryFilter
    search.departmentID = this.departmentID;
    search.attribute = this.attribute
    this.inventoryItemsDeptAttribute$ = this.inventoryService.getAvalibleInventorySearch(site, search).pipe(switchMap(data => {
      this.totalAttributeDepartmentInventory = this.getInventoryCount(data);
      console.log('inventoryItemsDeptAttribute', data)
      this.inventoryInfo = data;
      return of(data)
    }))
    this.searchMetaTags()
  }

  buyItem() {
    if (!this.menuItem) {
      return
    }
    const site = this.siteService.getAssignedSite()
    const item$ = this.menuService.getMenuItemByID(site, this.menuItem.id)

    this.buyItem$ = item$.pipe(switchMap(data => {
        if (!data) {
          return of(null)
        }
        const buyFeatures = {departmentID: this.departmentID, brandID: this.brandID, attribute: this.attribute}
        return   this.productEditButtonService.openBuyInventoryItemDialogObs(data, this.orderMethodsService.order, null, buyFeatures)

      }
    ))
  }

  //#metaTagSearch
  metaTagRefresh(event) {
    let items = []
    if (event && event.length>0) {
      event.forEach(data => {   items.push(data.name)  })
      const site = this.siteService.getAssignedSite()
      let search = {} as MetaTagSearchModel;
      search.metaTag = {} as IMetaTag;
      if (this.departmentID) {search.metaTag.departmentID = this.departmentID}
      if (this.attribute) {search.metaTag.attribute = this.attribute}
      this.metaTagSearch$ = this.metaTagsService.metaTagSearch(site, search).pipe(switchMap(data => {
        return of(data)
      }))
    } else {
      this.metaTagSearch$  = null;
    }
  }
}
