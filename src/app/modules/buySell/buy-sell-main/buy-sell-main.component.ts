import { P } from '@angular/cdk/keycodes';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { AWSBucketService, AuthenticationService, MenuService } from 'src/app/_services';
import { IMetaTag, MetaTagSearchModel, MetaTagsService } from 'src/app/_services/menu/meta-tags.service';
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

  @ViewChild('inventoryList') inventoryList : TemplateRef<any>;
  buyItem$: Observable<any>;
  isApp     = false;
  itemFound$: Observable<any>;

  attributes$: Observable<any>;
  departments$: Observable<any>;
  brands$: Observable<any>;
  genderID: number;

  lastDepartment: string;
  department: string;
  departmentID: number;

  attribute: string;
  lastAttribute: string;
  genders =  [{ id:0, name: 'Male'}, { id: 1, name: 'Female'}]

  brandID: number;
  brand: string;

  gender = {id: 1, name:'Female'}
  uiHomePage: UIHomePageSettings
  _uiHomePage: Subscription;
  menuItem: IMenuItem

  _posDevice: Subscription;
  posDevice: ITerminalSettings
  bucketName: string;

  searchForm: FormGroup;

  mainAttributeList: any[];

  itemSales$
  itemDeptAttribSales$
  _userAuths: Subscription;
  userAuths:IUserAuth_Properties;
  metaTagSearch$   : Observable<any>;

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

  constructor(
    private uISettingsService : UISettingsService,
    private classesResaleService: ClassesResaleService,
    private menuService: MenuService,
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

  reset(overRide?: boolean) {
    if (overRide) {
    } else {
      this.genderID = 0;
      this.gender = {id: 1, name:'Female'}
    }

    this.lastAttribute = null;
    this.lastDepartment = null;

    const site = this.siteService.getAssignedSite()
    this.departments$ = this.menuService.getListOfDepartmentsAll(site);
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
    const item$ = this.menuService.findItemForBuyBack(site, this.departmentID, this.attribute, this.gender.id, this.brandID, this.gender.id)
    this.itemFound$ = item$.pipe(switchMap(data => {
      if (data && data.errorMessage) {
        this.siteService.notify(`Error ${data.errorMessage}`, 'Close', 5000, 'red')
      }
      this.menuItem = data;
      return of(data)
    }))
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
    this.departments$ = this.menuService.getProductsBySearchForLists(site, search).pipe(switchMap(data => {

      if (data.results.length>1) {
        this.department = null;
        this.departmentID = null;
        this.refreshAttributes()
      }
      if (data.results.length == 1) {
        this.department = data.results[0].name
        this.departmentID = data.results[0].id;
        this.refreshAttributes()
      }
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
    this.attributes$ = this.classesResaleService.getAttributeListByDepartment(site,  this.departmentID, this.gender?.id)
  }

  setAttribute(event) {
    const site     = this.siteService.getAssignedSite()
    this.brand     = null;
    this.brandID   = null;
    this.menuItem  = null;
    this.attribute = event;
    this.itemFound$ = null;
    this.menuItem   = null;
    // this.attributes$ = this.classesResaleService.getAttributeListByDepartment(site,  this.departmentID, this.gender?.id)
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
    console.log('event', event)
    this.attributes$ = this.classesResaleService.getAttributeListByDepartment(site,  this.departmentID, this.gender?.id, this.attribute).pipe(switchMap(data => {
      if (data && data.length == 1) {
        this.attribute = data[0].name;
        this.refreshBrands()
      }
      if (data && data.length > 1) {
        this.attribute = null;
        this.refreshBrands()
      }
      return of (data)
    }))

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
      this.metaTagSearch$ = this.metaTagsService.metaTagSearchByModel(site, search).pipe(switchMap(data => {
        return of(data)
      }))
    } else {
      this.metaTagSearch$  = null;
    }
  }
}
