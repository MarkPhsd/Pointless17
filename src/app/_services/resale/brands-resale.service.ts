import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { SitesService } from '../reporting/sites.service';
import { PlatformService } from '../system/platform.service';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { IPagedList } from '../system/paging.service';
import { error } from 'console';
import { ItemBasic } from 'src/app/modules/admin/report-designer/interfaces/reports';
export interface BrandClassSearch {
  name: string;
  gender?: number | null;
  classValue?: number | null;
  brandTypeID?: number | null;

  pageSize: number;
  pageNumber: number;
  pageCount: number;
  currentPage: number;
  lastPage: number;
}

export  interface Brands_Resale {
  id: number;
  name: string;
  brand: string;
  brandID_Barcode?: number | null;
  gender?: number | null;
  jeans?: number | null;
  pants?: number | null;
  crops?: number | null;
  shorts?: number | null;
  skirts?: number | null;
  shirts?: number | null;
  tops?: number | null;
  polos?: number | null;
  tees?: number | null;
  tanks?: number | null;
  sweaters?: number | null;
  fleece?: number | null;
  outerwear?: number | null;
  seasonal?: number | null;
  dresses?: number | null;
  bags?: number | null;
  flips?: number | null;
  shoes?: number | null;
  belts?: number | null;
  jewelry?: number | null;
  watch?: number | null;
  sunglasses?: number | null;
  hats?: number | null;
  misc?: number | null;
  images: string;
  thumbnail: string;
  brandID: number;
}

export interface BrandClassSearchResults {
  results: Brands_Resale[]
  paging: IPagedList
  errorMessage: string;
}


export interface ItemBasicResults {
  results: ItemBasic[]
  paging: IPagedList
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandsResaleService {



  lClassFieldData = [
    { id: 1, name: 'Jeans' },
    { id: 2, name: 'Pants' },
    { id: 3, name: 'Crops' },
    { id: 4, name: 'Shorts' },
    { id: 5, name: 'Skirts' },
    { id: 6, name: 'Shirts' },
    { id: 7, name: 'Tops' },
    { id: 8, name: 'Polos' },
    { id: 9, name: 'Tees' },
    { id: 10, name: 'Tanks' },
    { id: 11, name: 'Sweaters' },
    { id: 12, name: 'Fleece' },
    { id: 13, name: 'Outerwear' },
    { id: 14, name: 'Seasonal' },
    { id: 15, name: 'Dresses' },
    { id: 16, name: 'Bags' },
    { id: 17, name: 'Flips' },
    { id: 18, name: 'Shoes' },
    { id: 19, name: 'Belts' },
    { id: 20, name: 'Jewelry' },
    { id: 21, name: 'Watch' },
    { id: 22, name: 'Sunglasses' },
    { id: 23, name: 'Hats' },
    { id: 24, name: 'Misc' },
  ];

  private _Search       = new BehaviorSubject<BrandClassSearch>(null);
  public search$        = this._Search.asObservable();

  constructor(
    private httpCache               : HttpClientCacheService,
    private httpClient              : HttpClient,
    private sitesService            : SitesService,
    private userAuthorizationService: UserAuthorizationService,
    private auth                    : AuthenticationService,
    private fb: FormBuilder,) {
  }


  updateSearchModel(searc: BrandClassSearch) {
    this._Search.next(searc)
  }


  getBrands(site: ISite, search :BrandClassSearch): Observable<BrandClassSearchResults> {
    const controller = "/Brands_Clothing/"

    const endPoint   = `SearchBrands`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`
    const item$ = this.httpClient.post<BrandClassSearchResults>(url, search)
    return item$.pipe(
      switchMap(data => {
        if (data.errorMessage) {
          this.sitesService.notify('Error Occured' + data.errorMessage, 'close', 50000, 'red')
        }
        return of(data)
      })
    );
  }

  searchView(site: ISite, search :BrandClassSearch): Observable<BrandClassSearchResults> {

    const controller = "/Brands_Clothing/"

    const endPoint   = `SearchBrands`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`
    const item$ = this.httpClient.post<BrandClassSearchResults>(url, search)
    return item$.pipe(
      switchMap(data => {
        if (data.errorMessage) {
          this.sitesService.notify('Error Occured' + data.errorMessage, 'close', 50000, 'red')
        }
        return of(data)
      })
    );

  }

  getBrandsByAttributeDepartment(site: ISite, departmentID : number, attribute: string,gender: number): Observable<ItemBasicResults> {

    const controller = "/Brands_Clothing/"

    const endPoint   = `getBrandsByAttributeDepartment`

    const parameters = `?departmentID=${departmentID}&attribute=${attribute}&gender=${gender}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<ItemBasicResults>(url)

  }

  getBrandsByAttributeDepartment_sub(site: ISite, departmentID : number, attribute: string, gender: number, brandName?:string): Observable<ItemBasicResults> {


    if (!brandName) {
      brandName = null;
    }
    const controller = "/Brands_Clothing/"

    const endPoint   = `getBrandsByAttributeDepartment_sub`

    const parameters = `?departmentID=${departmentID}&attribute=${attribute}&gender=${gender}&brandName=${brandName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<ItemBasicResults>(url)

  }

  get(site: ISite, id : number): Observable<Brands_Resale> {

    const controller = "/Brands_Clothing/"

    const endPoint   = `GetBrands_Clothing`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  }


  delete(site: ISite, id: number): Observable<Brands_Resale> {

    const controller ="/Brands_Clothing/"

    const endPoint = `DeleteClasses_Clothing`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

  }

  save(site: ISite, item: Brands_Resale, id: number): Observable<Brands_Resale> {

    if (item.id != 0 ) {
      return this.put(site,item)
    }

    return this.post(site,item)

  }


  put(site, item: Brands_Resale) {

    const controller ="/Brands_Clothing/"

    const endPoint = `PutBrands_Clothing`

    const parameters = `?id=${item.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.put <any>(url, item)
  }

  post(site, item: Brands_Resale) {

    const controller ="/Brands_Clothing/"

    const endPoint = `PostBrands_Clothing`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, item)
  }

  saveList(site: ISite, list: Brands_Resale[]): Observable<Brands_Resale[]> {

    const controller ="/Brands_Clothing/"

    const endPoint = `saveList`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  }

}
