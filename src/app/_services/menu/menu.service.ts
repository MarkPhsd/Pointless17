import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { BehaviorSubject, EMPTY, Observable, Subject, of, throwError  } from 'rxjs';
import { IProduct, IProductCategory, ISite }  from 'src/app/_interfaces';
import { IMenuItem } from '../../_interfaces/menu/menu-products';
import { ProductSearchModel } from '../../_interfaces/search-models/product-search';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';
import { IPagedList } from '../system/paging.service';
import { DiscountInfo } from 'src/app/_interfaces/menu/price-schedule';
import { FlowPrice, FlowProducts, FlowStrain, ImportFlowPriceResults, ImportFlowProductResults, ImportFlowStainsResults } from 'src/app/_interfaces/import_interfaces/productflow';
import { FlowInventory, ImportFlowInventoryResults } from 'src/app/_interfaces/import_interfaces/inventory-flow';
import { IInventoryAssignment } from '../inventory/inventory-assignment.service';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { PlatformService } from '../system/platform.service';
import { FormBuilder, UntypedFormArray, UntypedFormGroup } from '@angular/forms';

// import { HttpClientService } from 'src/app/_http-interceptors/http-client.service';
// Generated by https://quicktype.io
export interface ImportProductResults {
  listNotAdded: IProduct[];
  listAdded   : IProduct[]
}
export interface IDepartmentList {
  categories:             Category[];
  id:                     number;
  name:                   string;
  metaTags:               string | string;
  description:            string | string;
  onlineDescription:      string | string;
  onlineShortDescription: string | string;
  urlImageOther:          string | string;
  urlImageMain:           string;
  prodModifierType:       number;
  icon:                   string | string;
  slug                :   string;
  active              : boolean;
  webProduct          : boolean;
  webEnabled: boolean;
}
export interface Category {
  menuItem:               any[];
  itemCount:              null;
  id:                     number;
  name:                   string;
  metaTags:               string;
  metaDescription:        string;
  onlineDescription:      string;
  onlineShortDescription: string;
  urlImageOther:          string;
  urlImageMain:           string;
  prodModifierType:       number;
  departmentID:           number;
  icon:                   string;
}
export interface IProductSearchResults {
   id          : number;
   name        : string
   category    : string
   retail      : number;
   msrp        : number;
   cost        : number;
   urlImageMain: string;
   productCount: number;
   barcode     : string;
   type        : string;
   active      : boolean;
   department: string;
   subCategory: string;
}

export interface IComponentUsageResults {
  results: IComponentUsage[];
  errorMessage: string;
}
export interface IComponentUsage {
  total: any;
  cost: any;
  productID: number;
  name: string;
  month: number;
  year: number;
  totalComponentQuantity : number
}

export interface IProductSearchResultsPaged {
  results: IProductSearchResults[]
  paging: IPagedList
  errorMessage: string;
}
export interface IMenuItemsResultsPaged {
  results: IMenuItem[]
  paging: IPagedList
}
export interface IItemBasic{
  name: string;
  id  : number;
}
export interface IItemBasicB{
  name: string;
  id  : number;
  type: string;
  icon: string
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {


  public searchModel: ProductSearchModel
  private _searchModel       = new BehaviorSubject<ProductSearchModel>(null);
  public  searchModel$       = this._searchModel.asObservable();

  public infiniteModel: ProductSearchModel
  private _infiniteModel       = new BehaviorSubject<ProductSearchModel>(null);
  public  infiniteModel$       = this._infiniteModel.asObservable();

  public searchFilter: ProductSearchModel
  // private _searchFilter       = new BehaviorSubject<ProductSearchModel>(null);
  public  searchFilter$       = this._searchModel.asObservable();

  private _currentMeuItem      = new BehaviorSubject<IMenuItem>(null);
  public currentMeuItem$       = this._currentMeuItem.asObservable();

  site: ISite;
  isStaff           = false;
  constructor(
              private httpCache               : HttpClientCacheService,
              private httpClient              : HttpClient,
              private sitesService            : SitesService,
              private userAuthorizationService: UserAuthorizationService,
              private platFormService         : PlatformService,
              private auth                    : AuthenticationService,
              private fb: FormBuilder,) {
  }

  httpOptions: { headers; observe; } = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    }),
    observe: 'response'
  };

  @Input() currentPage   = 1;
  @Input() lastPage:     number;
  @Input() pageCount:    number;
  @Input() pageSize      = 25;
  @Input() pageNumber    = 1;

  menuItems$: Observable<IMenuItem[]>

  endpoint =  ""
  public searchIsLoaded = new Subject<any>();

  get isWebModeMenu(){
    if (!this.platFormService.isApp() && !this.userAuthorizationService.isStaff) {
      return true ;
    }
    return false
  }

  updateSearchFilter(search: ProductSearchModel) {
    this.searchModel = search;
    this.searchFilter = search;
    this._searchModel.next(search)
  }

  // updateInfiniteModel(item: ProductSearchModel) {
  //   if (!item) {
  //     item = this.initSearchModel();
  //     this._searchModel.next(item);
  //     return;
  //   }
  //   this._searchModel.next(item);
  // }


  updateSearchModel(item: ProductSearchModel) {
    console.log('updating searchmodel')
    if (!item) {
      item = this.initSearchModel();
      this._searchModel.next(item);
      return;
    }
    this._searchModel.next(item);
  }

  initSearchModel() {
    const item = {} as ProductSearchModel;
    item.listTypeID = [] as number[];
    item.listPublisherID  = [] as number[];;
    item.listArtistID  = [] as number[];
    item.listBrandID  = [] as number[];
    item.listDepartmentID  = [] as number[];
    item.listCategoryID = [] as number[];
    item.listSubCategoryID  = [] as number[];
    item.listSpecies  = [] as number[];
    item.listSize = [] as number[];
    item.categoryID = 0;
    item.departmentID = 0;
    item.subCategoryID = 0;
    item.itemTypeID  = 0;
    item.hideSubCategoryItems = false;
    item.pageNumber = 1;
    item.pageSize = 50;
    if (this.userAuthorizationService.isStaff) {
      item.webMode = true;
    }
    return item ;
  }

  updateCurrentMenuItem(menuItem: IMenuItem) {
    this._currentMeuItem.next(menuItem);
  }

  showSearch(value:any)
  {
    this.searchIsLoaded.next(value);
  }

  clearSearch()
  {
    this.searchIsLoaded.next(null);
  }

  getsearchIsLoaded(): Observable<any> {
    return this.searchIsLoaded.asObservable();
  }

  setAllItemsActive(site: ISite): Observable<unknown> {

    const controller ="/MenuItems/"

    const endPoint = `setAllItemsActive`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  }

  // this.menuService.updateField('DepartmentID', id, listOfItems)
  updateField(site: ISite, fieldName: string,value: any, listofItems: any[] ) {
    const controller =  "/Products/"
    const endPoint = "UpdateFieldValue"
    const parameters = `?fieldName=${fieldName}&value=${value}`
    const url = `${site.url}${controller}${endPoint}${parameters}`
    const uri =  this.sitesService.getCacheURI(url)
    return  this.httpClient.put<any[]>(url, listofItems)

  }

  saveProductField(site: ISite, id: number, itemValue: string, fieldName: string): Observable<IProduct> {
    const controller ="/products/"

    const endPoint = `UpdateFieldValueProduct`

    const parameters = `?id=${id}&fieldName=${fieldName}&value=${itemValue}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  }

  sortCategoriesSubCategoriesFirst(site: ISite): Observable<any> {
    const controller ="/products/"

    const endPoint = `sortCategoriesSubCategoriesFirst`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  }

  // this.menuService.updateField('DepartmentID', id, listOfItems)
  deleteProducts(site: ISite,  listofItems: any[] ) {

    const controller ="/products/"

    const endPoint = `deleteProducts`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, listofItems)

  }

  deleteProduct(site: ISite, id: number): Observable<IMenuItem> {

    const controller ="/products/"

    const endPoint = `deleteProduct`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

  }

  getComponentUsageByMonth(site, startDate, endDate, productID): Observable<IComponentUsageResults> {

    const controller = "/MenuItems/"

    const endPoint = "GetComponentUsageByMonth"

    const parameters = `?startDate=${startDate}&endDate=${endDate}&productID=${productID}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    // const url = { url: uri, cacheMins: 0}

    return  this.httpClient.get<IComponentUsageResults>(uri)
  }

  getProductList(site: ISite): Observable<IMenuItem[]> {

    const controller = "/MenuItems/"

    const endPoint = "GetMenuItems"

    const parameters = ''

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.httpClient.get<IMenuItem[]>(uri)

  };

  getMenuItemsBySchedule(site: ISite, id: number): Observable<DiscountInfo[]> {

    const controller = '/MenuItems/'

    const endPoint = 'GetMenuItemsBySchedule'

    const parameters =`?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const cache =  this.sitesService.getCacheURI(uri)

    return  this.httpCache.get<DiscountInfo[]>(cache)

  };


  getMenuItemsByPage(site: ISite, pageNumber: number, pageSize: number): Observable<IMenuItem[]> {

    const controller = '/MenuItems/'

    const endPoint = 'GetMenuItemsByPage'

    const parameters = `?pagenumber=${pageNumber}&pageSize=${pageSize}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.httpCache.get<IMenuItem[]>(url)

  };

  getProductListByCategory(site: ISite, categoryId:string): Observable<IMenuItem[]> {

    this.pageNumber = 1

    this.pageSize = 100

    const controller = '/MenuItems/'

    const endPoint = 'GetProductsByCategoryID'

    const parameters = `?ID=${categoryId}&pagenumber=${this.pageNumber}&pageSize=${this.pageSize}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // return  this.httpClient.get<IMenuItem[]>(uri);

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

    // const url = { url: uri, cacheMins: 1}

    // return  this.httpCache.get<IMenuItem[]>(url)

  };


  getProductListByBrand(site: ISite, BrandID:number): Observable< IMenuItem[]> {

    this.pageNumber = 1

    this.pageSize = 100

    const controller = "/MenuItems/"

    const endPoint = 'GetProductsByBrand'

    const parameters = `?ID=${BrandID}&pagenumber=${this.pageNumber}&pageSize=${this.pageSize}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

  };


  getInventoryValues(site: ISite): Observable<any> {

    const post = {count: '0'};

    const controller =  "/Products/"

    const endPoint   = "GetInventoryValues"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.post<any>(url, post);

  };

  getDepartmentValues(site: ISite): Observable<any> {

    const post = {count: '0'};

    const controller =  "/Products/"

    const endPoint   = "GetDepartmentValues"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.post<any>(url, post);

  };

  getCategoryValues(site: ISite): Observable<any> {

    const post = {count: '0'};

    const controller =  "/Products/"

    const endPoint   = "GetCategoryValues"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.post<any>(url, post);

  };

  getCategoryList(site: ISite): Observable<IProductCategory[]> {

    const controller =  "/MenuCategories/"

    const endPoint = "GetCategoriesNoChildren"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

    // return  this.httpClient.get<IProductCategory[]>(uri);

    // const url = { url: uri, cacheMins: 1}

    // return  this.httpCache.get<IProductCategory[]>(url)

  };

  getCategoryListNoChildren(site: ISite): Observable<IProductCategory[]> {

    const controller =  "/MenuCategories/"

    const endPoint = "GetCategoriesNoChildren"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

    // return  this.httpClient.get<IProductCategory[]>(url)

    // const uri = {url: url, cacheMins: 1 }

    // return  this.httpCache.get<IProductCategory[]>(uri)

  };

  getCategoryListNoChildrenPaging(site: ISite, pageNumber: number, pageSize: number): Observable<any> {

    const controller =  "/MenuCategories/"

    const endPoint = "getCategoryListNoChildrenPaging"

    const parameters = `?pagenumber=${pageNumber}&pagesize=${pageSize}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri )

  };

  //active only
  getGetCategoriesList(site: ISite, type: string):  Observable<IMenuItem[]>  {

    const controller =  '/MenuItems/'

    const endPoint = 'GetGetCategoriesList'

    const parameters = `?TypeofCategoryasName=${type}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

  }


  getGetCategoriesListActive(site: ISite, type: string, option: number):  Observable<IMenuItem[]>  {
    const controller =  '/MenuItems/'

    const endPoint = 'getGetCategoriesListActive'

    const parameters = `?TypeofCategoryasName=${type}&activeOption=${option}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // const uri =  this.sitesService.getCacheURI(url)

    const uri =  this.sitesService.getCacheURI(url)

    // console.log('getGetCategoriesListActive', uri)

    // return this.httpClient.get<IMenuItem[]>(url)
    return  this.httpCache.get<any[]>(uri)

  }

  getGetCategoriesListByID(site: ISite, type: string, id: number):  Observable<IMenuItem[]>  {

    const controller =  '/MenuItems/'

    const endPoint = 'getGetCategoriesListByID'

    const parameters = `?TypeofCategoryasName=${type}&id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

  }

  getGetCategoriesListAll(site: ISite, type: string):  Observable<IMenuItem[]>  {

    const controller =  '/MenuItems/'

    const endPoint = 'GetGetCategoriesListAll'

    const parameters = `?TypeofCategoryasName=${type}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // const uri =  this.sitesService.getCacheURI(url)

    return  this.httpClient.get<any[]>(url)

  }

  getGetDepartmentList(site: ISite):  Observable<IDepartmentList[]>  {
    // https://localhost:44309/api/MenuCategories/GetDepartment?id=1488
    const controller =  '/MenuCategories/'

    const endPoint = 'GetDepartments'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<IDepartmentList[]>(uri)

  }

  getGetDepartment(site: ISite,id: any):  Observable<IDepartmentList[]>  {

    const controller =  '/MenuCategories/'

    const endPoint = 'GetDepartment'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<IDepartmentList[]>(uri)

  }

  getListOfCategories(site: ISite):  Observable<IMenuItem[]>  {
    return this.getGetCategoriesListActive(site, `category`, 0);
  }

  getListOfDepartments(site: ISite):  Observable<IMenuItem[]>  {
    return this.getGetCategoriesListActive(site, `department`, 0);
  }

  getListOfSubCategories(site: ISite):  Observable<IMenuItem[]>  {
    return this.getGetCategoriesListActive(site, `subcategory`, 0);
  }

  getListOfSubCategoriesByCategory(site: ISite, id: number):  Observable<IMenuItem[]>  {
    return this.getGetCategoriesListByID(site, `subcategory`, id);
  }

  getListOfCategoriesAll(site: ISite):  Observable<IMenuItem[]>  {
    return this.getGetCategoriesListAll(site, `category`);
  }

  getListOfDepartmentsAll(site: ISite):  Observable<IMenuItem[]>  {
    return this.getGetCategoriesListAll(site, `department`);
  }

  getListOfSubCategoriesAll(site: ISite):  Observable<IMenuItem[]>  {
    return this.getGetCategoriesListAll(site, `subcategory`);
  }

  getCategoryAsyncList(site: ISite): Observable<IProductCategory[]> {

    const controller =  '/MenuCategories/'

    const endPoint = 'GetCategoriesNoChildren'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri);

    // const url = { url: uri, cacheMins: 0}

    // return  this.httpClient.get<IProductCategory[]>(uri)

  };


  //for customer menu
  getProductsBySearch(site: ISite, productSearchModel: ProductSearchModel): Observable<IMenuItem[]> {

    const controller =  "/MenuItems/"

    const endPoint = "GetMenuItemsBySearch"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return this.httpCache.post<IMenuItem[]>(uri, productSearchModel)
  }

   //for customer menu
   getMenuItemsBySearchPaged(site: ISite, productSearchModel: ProductSearchModel): Observable<IMenuItemsResultsPaged> {

    const controller =  "/MenuItems/"

    const endPoint = "GetMenuItemsBySearchPaged"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    const cacheTime = this.sitesService.getCurrentCache();

    let appCache =  JSON.parse(localStorage.getItem('appCache')) as any;

    if (appCache) {
      if (appCache?.value && appCache?.boolean) {
        const uri = { url: url, cacheMins: appCache.value}
        return this.httpCache.post<any>(uri, productSearchModel)
      }
    }

    return  this.httpClient.post<any>(url, productSearchModel )

  }

  getProductsBySearchForLists(site: ISite, productSearchModel: ProductSearchModel): Observable<IProductSearchResultsPaged> {

    const controller =  "/MenuItems/"

    const endPoint = "GetMenuBySearchForLists"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // console.log(url)

    return this.httpClient.post<IProductSearchResultsPaged>(url, productSearchModel)

  }

  getRecipeUsageListFiltered(site: ISite, productSearchModel: ProductSearchModel): Observable<IProductSearchResultsPaged> {

    const controller =  "/MenuItems/"

    const endPoint = "getRecipeUsageListFiltered"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, productSearchModel)

  }

  getRecipeUsageList(site: ISite, productSearchModel: ProductSearchModel): Observable<IProductSearchResultsPaged> {

    const controller =  "/MenuItems/"

    const endPoint = "GetRecipeUsageList"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, productSearchModel)

  }

  getRecipeCategories(site: ISite): Observable<IMenuItem[]> {

    const controller =  "/MenuItems/"

    const endPoint = "GetRecipeCategories"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  }

  getProductsBySearchForListsPaging(site: ISite, productSearchModel: ProductSearchModel): Observable<IProductSearchResultsPaged> {

    const controller =  "/MenuItems/"

    const endPoint = "GetMenuBySearchForLists"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, productSearchModel)

  }

  getItemBasicBySearch(site: ISite, productSearchModel: ProductSearchModel): Observable<IItemBasic[]> {

    const controller =  "/MenuItems/"

    const endPoint = "GetItemBasicBySearch"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<IItemBasic[]>(url, productSearchModel)

  }


  getItemBasicImage(site: ISite, id: number ): Observable<IItemBasicB> {

    const controller =  "/MenuItems/"

    const endPoint = "GetItemBasicImage"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri = { url: url, cacheMins: 480}

    const cacheTime = this.sitesService.getCurrentCache()
    if ( cacheTime  == 0 ) {
      return  this.httpCache.get<IItemBasicB>(uri)
    }

    return this.httpClient.get<IItemBasicB>(url)


  }

  getItemsNameBySearch(site: ISite, name: string, type: number): Observable<IItemBasic[]> {

    const controller =  "/MenuItems/"

    const endPoint = "GetItemNamesList"

    const parameters = `?name=${name}&type=${type}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<IItemBasic[]>(uri)

    // const url = { url: uri, cacheMins: 0}

    // return this.httpCache.get<IItemBasic[]>(url)

  }

  getProductListSearch(site: ISite, search:string): Observable<IMenuItem[]> {

    const controller =  "/menuitems/"

    const endPoint = "GetMenuItemsBySearch"

    const parameters = ''

    let productSearchModel = {}  as ProductSearchModel ;

    productSearchModel.name = search;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<IMenuItem[]>(url, productSearchModel)

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

  }

  getProductsByBrandID(site: ISite, categoryId : number): Observable<IMenuItem[]> {

    const controller =   '/MenuItems/'

    const endPoint = 'GetProductsByBrandID'

    const parameters = `?ID${categoryId}?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

    // const url = { url: uri, cacheMins: 1}

    // return this.httpClient.get<IMenuItem[]>(uri)

  };

  getMenuProduct(site: ISite, id:any): Observable<IMenuItem> {

    const controller = '/MenuItems/'

    const endPoint = `GetMenuItemByID`

    const parameters = `?ID=${id}&quantity=${1}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<IMenuItem>(uri)
    // //
    //     const url = { url: uri, cacheMins: 0}
    //     return this.httpCache.get<IMenuItem>(url)

  };

  getProduct(site: ISite, id: any): Observable<IProduct> {

    const controller = '/Products/'

    const endPoint = 'GetProduct'

    const parameters =  `?ID=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<IProduct>(url)

  };

  getMenuItemByID(site: ISite, id: any): Observable<IMenuItem> {

    if (!id)  { return EMPTY };

    const controller =  '/MenuItems/'

    const endPoint = 'GetMenuItemByID'

    const parameters = `?id=${id}&quantity=1`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<IMenuItem>(url)
  };


  getMenuItemByIDLinked(site: ISite, id: any, priceLink : number): Observable<IMenuItem> {

    if (!priceLink || priceLink == null) { priceLink = 0}
    if (!id)  { return of(null) };

    const controller =  '/MenuItems/'

    const endPoint = 'getMenuItemByIDLinked'

    const parameters = `?id=${id}&quantity=1&priceLink=${priceLink}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<IMenuItem>(url)
  };


  getMenuItemByBarcode(site: ISite, barcode:any, clientID: number): Observable<IMenuItem[]> {

    if (!clientID || clientID == null || clientID == undefined) {
      clientID = 0;
    }

    const controller ="/MenuItems/"

    const endPoint = `GetMenuItemByBarcode`

    const parameters = `?barcode=${barcode}&quantity=1&clientID=${clientID}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.httpClient.get<IMenuItem[]>(uri)

  };

   saveProduct(site: ISite, product:IProduct): Observable<IProduct> {

    if (product.id && product.id != 0) {
      return  this.putProduct(site, product.id, product);

    } else {
      return this.postProduct(site, product);
    }

  }

   postProduct(site: ISite, product: IProduct): Observable<IProduct> {

    const controller ="/products/"

    const endPoint = `postProduct`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, product)

  };

   putProduct(site: ISite, id: number, product: IProduct): Observable<IProduct> {

    if (id && product) {

      const controller = '/products/'

      const endPoint = 'PutProduct'

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.httpClient.put<any>(url, product)

    }
  };

  getSpeciesType(): IItemBasic[] {
    let itemBasic = {} as IItemBasic[]
    {
      itemBasic =
      [
        {id: 1, name: "Indica"},
        {id: 2,  name : "Sativa"},
        {id: 3,  name : "Hybrid"},
      ]
      return itemBasic
    }
  }

  getPackagingMaterialArray(menuItem: IMenuItem): string[] {
    if (menuItem.itemType && menuItem.itemType.packagingMaterial) {
      return menuItem.itemType.packagingMaterial.split(',')
    }
    return null
  }

  getModiferPrices(menuItem: IMenuItem) {
    if (menuItem && menuItem.priceCategories && menuItem.priceCategories.productPrices && menuItem.priceCategories.productPrices) {
      const items = menuItem.priceCategories.productPrices;
      if ( items.length>0 ) {

         items.filter(prices => { return prices.priceType == 2})
         let list =  items.filter( prices =>{ return prices.priceType == 2;})
         if (list.length>0){
           menuItem.retail = list[0].retail;
           menuItem.unitTypeID = list[0].unitTypeID;
           menuItem.productPrice = list[0];
           return menuItem
        }
      }
    }
    return menuItem;
  }

  getPricesFromProductPrices(menuItem: IMenuItem) {
    if (menuItem.priceCategories && menuItem.priceCategories.productPrices && menuItem.priceCategories.productPrices) {
      const items = menuItem.priceCategories.productPrices;
      if ( items.length>0 ) {
         items.filter(prices => { return prices.priceType == 2})
         let list =  items.filter( prices =>{ return prices.priceType == 2;})
         if (list.length>0){
           menuItem.retail = list[0].retail;
           menuItem.unitTypeID = list[0].unitTypeID;
           menuItem.productPrice = list[0];
           menuItem.priceCategories.productPrices = list;
           return menuItem
        }
      }
    }
    return menuItem;
  }

  private handleError(error: any) {
    return throwError(error);
  }

  importFlowProducts(site: ISite, list: FlowProducts[]): Observable<ImportFlowProductResults> {

    const controller ="/products/"

    const endPoint = `ImportFlowProducts`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  };


  getImportCountProgress(site: ISite): Observable<any> {

    const controller ="/products/"

    const endPoint = `GetImportCountProgress`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  };

  importProducts(site: ISite, list: IProduct[]): Observable<ImportProductResults> {

    const controller ="/products/"

    const endPoint = `ImportProducts`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  };

  importFlowStrains(site: ISite, list: FlowStrain[]): Observable<ImportFlowStainsResults> {

    const controller ="/products/"

    const endPoint = `ImportFlowStrains`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  };


  importFlowPrices(site: ISite, list: FlowPrice[]): Observable<ImportFlowPriceResults> {

    const controller ="/priceCategories/"

    const endPoint = `ImportFlowPrices`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  };


  importFlowInventory(site: ISite, list: FlowInventory[]): Observable<ImportFlowInventoryResults> {

    const controller ="/InventoryAssignments/"

    const endPoint = `ImportFlowInventory`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  };

  importInventory(site: ISite, list: IInventoryAssignment[]): Observable<any> {

    const controller ="/InventoryAssignments/"

    const endPoint = `ImportFlowInventory`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  };

  resetProgressIndicator(site: ISite): Observable<any> {

    const controller ="/products/"

    const endPoint = `ResetProgressImport`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  };

  addSearchFilter(inputForm: UntypedFormGroup, items: any[],
                  types: string) {
    if (!inputForm) { return }
    const control = inputForm.get(types) as UntypedFormArray;
    if (!control)  { return }
    if (control) { control.clear(); }
    if (items) {
      items.forEach( item =>  {
          control.push(this.fb.group({
            id:   [item.id], //    number;
            name: [item.name]
          }))
        }
      )
      return
    }
    // this.updatePriceSchedule(inputForm.value)
  }
}


