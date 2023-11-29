import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { SitesService } from '../reporting/sites.service';
import { PlatformService } from '../system/platform.service';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { IPagedList } from '../system/paging.service';
import { Tracing } from 'trace_events';

export interface ClassClothingSearch {
  name: string;
  attributeDesc: string;
  department: string;
  gender?: number | null;
  classValue?: number | null;
  productID: number;
  pageSize: number;
  pageNumber: number;
  pageCount: number;
  currentPage: number;
  lastPage: number;
  departmentID: number;
}

export interface Classes_Clothing_View {
  id: number;
  department: string;
  classValue?: number | null;
  attributeDesc: string;
  gender?: number | null;
  name: string;
  price?: number | null;
  classID_Barcode?: number | null;
  brandTypeID: number;
  errorMessage: string;
  departmentID: number;
  thumbNail: string;
}


export interface Classes_Clothing {
  id: number;
  departmentID?: number | null;
  classValue?: number | null;
  gender?: number | null;
  name: string;
  price?: number | null;
  classID_Barcode?: number | null;
  errorMessage: string;
  thumbNail: string;
  department: string;
  // Public Property ClassValue As Nullable(Of Integer)
  // Public Property Gender As Nullable(Of Integer)
  // Public Property AttributeDesc As String
  // Public Property Price As Nullable(Of Decimal)
  // Public Property BrandTypeID As Nullable(Of Integer)
  // Public Property BrandType As String
  // Public Property ID As Integer
}

export interface ClassResaleSearchResults {
  results: Classes_Clothing_View[]
  paging: IPagedList
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClassesResaleService {


  private _Search       = new BehaviorSubject<ClassClothingSearch>(null);
  public search$        = this._Search.asObservable();


  constructor(
    private httpCache               : HttpClientCacheService,
    private httpClient              : HttpClient,
    private sitesService            : SitesService,
    private userAuthorizationService: UserAuthorizationService,
    private platFormService         : PlatformService,
    private auth                    : AuthenticationService,
    private fb: FormBuilder,) {
  }

  updateSearchModel(search: ClassClothingSearch) {
    this._Search.next(search)
  }

  getAttributeList(site: ISite): Observable<Classes_Clothing[]> {

    const controller = "/Classes_Clothing/"

    const endPoint   = `GetAttributeList`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<Classes_Clothing[]>(url)
  }

  getAttributeListByDepartment(site: ISite, id: number) : Observable<Classes_Clothing[]> {

    const controller = "/Classes_Clothing/"

    const endPoint   = `GetAttributeListByDepartment`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<Classes_Clothing[]>(url)
  }

  searchView(site: ISite, search :ClassClothingSearch): Observable<ClassResaleSearchResults> {

    const controller = "/Classes_Clothing/"

    const endPoint   = `searchView`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<ClassResaleSearchResults>(url, search)

  }

  get(site: ISite, id : number): Observable<Classes_Clothing> {

    const controller = "/Classes_Clothing/"

    const endPoint   = `GetClasses_Clothing`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<Classes_Clothing>(url)

  }


  delete(site: ISite, id: number): Observable<Classes_Clothing> {

    const controller ="/Classes_Clothing/"

    const endPoint = `DeleteClasses_Clothing`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

  }

  save(site: ISite, matrix: Classes_Clothing, id: number): Observable<Classes_Clothing> {

    const controller ="/Classes_Clothing/"

    const endPoint = `SaveClasses_Clothing`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, matrix)

  }

  saveList(site: ISite, list: Classes_Clothing[]): Observable<Classes_Clothing[]> {

    const controller ="/Classes_Clothing/"

    const endPoint = `saveList`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, list)

  }

}
