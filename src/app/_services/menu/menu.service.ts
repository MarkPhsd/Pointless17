import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { BehaviorSubject, Observable, Subject, throwError  } from 'rxjs';
import { IProduct, IProductCategory, ISite }  from 'src/app/_interfaces';
import { IMenuItem } from '../../_interfaces/menu/menu-products';
import { ProductSearchModel } from '../../_interfaces/search-models/product-search';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';
import { IPagedList } from '../system/paging.service';

// import { HttpClientService } from 'src/app/_http-interceptors/http-client.service';

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
}

export interface IProductSearchResultsPaged {
  results: IProductSearchResults[]
  paging: IPagedList
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
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private _menuItemsData       = new BehaviorSubject<ProductSearchModel>(null);
  public  menuItemsData$       = this._menuItemsData.asObservable();

  site: ISite;
  constructor(
              private httpCache: HttpClientCacheService,
              private httpClient: HttpClient,
              private sitesService: SitesService,
              private auth: AuthenticationService,) {
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

  updateMeunuItemData(items: ProductSearchModel) {
    this._menuItemsData.next(items);
  }

  showSearch(value:any)
  {
    this.searchIsLoaded.next(value);
  }

  clearSearch()
  {
    this.searchIsLoaded.next();
  }

  getsearchIsLoaded(): Observable<any> {
    return this.searchIsLoaded.asObservable();
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

  deleteProduct(site: ISite, id: number): Observable<IMenuItem> {

    const controller ="/products/"

    const endPoint = `deleteProduct`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

  }


  getProductList(site: ISite): Observable<IMenuItem[]> {

    const controller = "/MenuItems/"

    const endPoint = "GetMenuItems"

    const parameters = ''

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.httpClient.get<IMenuItem[]>(uri)


  };

  getMenuItemsByPage(site: ISite, pageNumber: number, pageSize: number): Observable<IMenuItem[]> {

    const controller = '/MenuItems/'

    const endPoint = 'GetMenuItemsByPage'

    const parameters = '?pagenumber=${pageNumber}&pageSize=${pageSize}'

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

    // return  this.httpClient.get<IProductCategory[]>(url)

    // const uri = {url: url, cacheMins: 1 }

    // return  this.httpCache.get<IProductCategory[]>(uri)

  };

  getBasicLists(site: ISite, type: string):  Observable<IMenuItem[]>  {

    const controller =  '/MenuItems/'

    const endPoint = 'GetGetCategoriesList'

    const parameters = `?TypeofCategoryasName=${type}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpCache.get<any[]>(uri)

    // return  this.httpClient.get<IMenuItem[]>(uri)

    // const url = { url: uri, cacheMins: 1 }

    // return  this.httpCache.get<IMenuItem[]>(url)

  }

  getListOfCategories(site: ISite):  Observable<IMenuItem[]>  {
    return this.getBasicLists(site, `category`);
  }

  getListOfDepartments(site: ISite):  Observable<IMenuItem[]>  {
    return this.getBasicLists(site, `department`);
  }

  getListOfSubCategories(site: ISite):  Observable<IMenuItem[]>  {
    return this.getBasicLists(site, `subcategory`);
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
  getProductsBySearch(site: ISite, productSearchModel: ProductSearchModel): Observable<any> {

    const controller =  "/MenuItems/"

    const endPoint = "GetMenuItemsBySearch"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    return  this.httpClient.post<any>(url, productSearchModel )

    // return this.httpClient.post<IMenuItem[]>(uri, productSearchModel)

    // const url = { url: uri, cacheMins: 1, body: productSearchModel}

    // return this.httpCache.post<IMenuItem[]>(url)

  }

   //for customer menu
   getMenuItemsBySearchPaged(site: ISite, productSearchModel: ProductSearchModel): Observable<IMenuItemsResultsPaged> {

    const controller =  "/MenuItems/"

    const endPoint = "GetMenuItemsBySearchPaged"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const uri =  this.sitesService.getCacheURI(url)

    const cacheTime = this.sitesService.getCurrentCache()
    if ( cacheTime  == 0 ) {
      return  this.httpClient.post<any>(url, productSearchModel )
    }
    return this.httpCache.post<any>(uri, productSearchModel)

  }

  getProductsBySearchForLists(site: ISite, productSearchModel: ProductSearchModel): Observable<IProductSearchResultsPaged> {

    const controller =  "/MenuItems/"

    const endPoint = "GetMenuBySearchForLists"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    // console.log(url)

    return this.httpClient.post<IProductSearchResultsPaged>(url, productSearchModel)

    // const uri = { url: url, cacheMins: 10, body: productSearchModel}

    // return this.httpCache.post<IProductSearchResults[]>(uri)

  }

  getProductsBySearchForListsPaging(site: ISite, productSearchModel: ProductSearchModel): Observable<IProductSearchResultsPaged> {

    const controller =  "/MenuItems/"

    const endPoint = "GetMenuBySearchForLists"

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, productSearchModel)

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

    // const uri =  this.sitesService.getCacheURI(url)

    // return  this.httpCache.get<any[]>(uri)

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

  getMenuItemByID(site: ISite, id: any): Observable<any> {

    const controller =  '/MenuItems/'

    const endPoint = 'GetMenuItemByID'

    const parameters = `?id=${id}&quantity=1`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpClient.get<any>(url)

    // const uri =  this.sitesService.getCacheURI(url)

    // return  this.httpCache.get<any>(uri)

    // const url = { url: uri, cacheMins: 0}

    // return  this.httpClient.get<IMenuItem>(uri  )

  };

  getMenuItemByBarcode(site: ISite, barcode:any): Observable<IMenuItem[]> {

    const controller ="/MenuItems/"

    const endPoint = `GetMenuItemByBarcode`

    const parameters = `?barcode=${barcode}&quantity=1`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.httpClient.get<IMenuItem[]>(uri)

  };

   saveProduct(site: ISite, product:IProduct): Observable<IProduct> {

    if (product.id) {
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


  private handleError(error: any) {
    return throwError(error);
  }
}


