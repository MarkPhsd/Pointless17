import { IUnitTypePaged, UnitType } from 'src/app/_interfaces/menu/price-categories';
import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { Observable, switchMap, } from 'rxjs';
import { ISite,  }  from 'src/app/_interfaces';
import { HttpClient } from '@angular/common/http';
import { SearchModel } from '../system/paging.service';


@Injectable({
  providedIn: 'root'
})
export class UnitTypesService {


  @Input() currentPage = 1;
  @Input() lastPage    :number;
  @Input() pageCount   :number;
  @Input() pageSize    = 25;
  @Input() pageNumber  = 1;

  constructor( private http: HttpClient,
               private auth: AuthenticationService
              )
  { }

  delete(site: ISite, id: number): Observable<any> {

    const controller = "/UnitTypes/"

    const endPoint = `DeleteUnitType`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

   }

   getUnitTypesSearch(site: ISite, searchModel: SearchModel): Observable<IUnitTypePaged> {

    const controller =  "/UnitTypes/"

    const endPoint = "GetUnitTypesSearch"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IUnitTypePaged>(url,searchModel)

  };

  getBasicTypes(site: ISite,  searchModel: SearchModel): Observable<IUnitTypePaged> {

    const controller =  "/UnitTypes/"

    const endPoint = "GetBasicTypes"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IUnitTypePaged>(url,searchModel)

  }
;

get(site: ISite, id: number): Observable<UnitType> {

  const controller =  "/UnitTypes/"

  const endPoint = "GetUnitType"

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.get<UnitType>(url)

};

  // api/PriceCategories/GetPriceCategories
  getList(site: ISite, searchModel: SearchModel): Observable<IUnitTypePaged> {

    const controller =  "/UnitTypes/"

    const endPoint = "GetUnitTypesSearch"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IUnitTypePaged>(url, searchModel)

  };

  save(site: ISite,  item: UnitType): Observable<UnitType> {
    if (item.id) {
      return  this.put(site, item.id, item);
    } else {
      return this.post(site, item);
    }
  }

   post(site: ISite,  item: UnitType): Observable<UnitType> {
    const controller ="/UnitTypes/"

    const endPoint = `POSTUnitType`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, item)
  }

   put(site: ISite, id: number, item: UnitType): Observable<UnitType> {

    if (id && item) {

      const controller = '/UnitTypes/'

      const endPoint = 'PutUnitType'

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.put<any>(url, item)

    }

  }





}
