import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { PriceMenuGroup, PriceMenuGroupItem, PSMenuGroupPaged, PSSearchModel, PS_SearchResultsPaged } from 'src/app/_interfaces/menu/price-schedule';

@Injectable({
  providedIn: 'root'
})

export class PriceScheduleMenuGroupService {

  constructor(
    private http: HttpClient,
      )
  { }

  delete(site: ISite, id: number): Observable<any> {

    const endpoint = "/PSMenuGroup/"

    const parameters = `Delete?id=${id}`

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.delete<any>(url)

  }

  getList(site: ISite): Observable<PriceMenuGroup[]> {

    const endpoint = "/PSMenuGroup/"

    const parameters = "GetMenuGroupList"

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.get<PriceMenuGroup[]>(url)

  };


  getGroup(site: ISite, id: number): Observable<PriceMenuGroup> {

    const endpoint = "/PSMenuGroup/"

    const parameters = `GetMenuGroup?id=${id}`

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.get<PriceMenuGroup>(url)

  };

  put(site: ISite, price: PriceMenuGroup): Observable<PriceMenuGroup> {

    const endpoint = "/PSMenuGroup/"

    const parameters = `put?id=${price.id}`

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.put<PriceMenuGroup>(url, price)

  };

  post(site: ISite, price: PriceMenuGroup): Observable<PriceMenuGroup> {

    const endpoint = "/PSMenuGroup/"

    const parameters = "post"

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.post<PriceMenuGroup>(url, price)

  };

  save(site: ISite, price: PriceMenuGroup) : Observable<PriceMenuGroup> {
    if (price.id == null) { price.id = 0}

    if (price.id == 0) {
      return  this.post(site, price)
    }

    if (price.id ) {
      return this.put(site, price)
    }

    return EMPTY

  }

  sortItemsList(site: ISite, list: PriceMenuGroup[]): Observable<PriceMenuGroup[]> {

    const endpoint = "/PSMenuGroup/"

    const parameters = "PostMenuItemsList"

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.post<PriceMenuGroup[]>(url, list)
  }

  searchList(site: ISite, searchModel: PSSearchModel ): Observable<PSMenuGroupPaged> {
    const endpoint = "/PSMenuGroupItem/"

    const parameters = "PostMenuItemsList"

    const url = `${site.url}${endpoint}${parameters}`

    return  this.http.post<PSMenuGroupPaged>(url, searchModel)
  }

}
