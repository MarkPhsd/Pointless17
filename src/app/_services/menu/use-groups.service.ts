import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable  } from 'rxjs';
import { ISite }  from 'src/app/_interfaces';
import { IItemBasicB } from './menu.service';


export interface UseGroups {
  id:            number;
  name:          string;
  useGroupTaxes: UseGroupTax[];
}

export interface UseGroupTax {
  iD:    number;
  taxID: number;
  taxes: Taxes;
}

export interface Taxes {
  iD:    number;
  value: number;
  name:  string;
}

@Injectable({
  providedIn: 'root'
})
export class UseGroupsService {

  site: ISite;
  constructor(private http: HttpClient,
            private auth: AuthenticationService) { }

  delete(site: ISite, id: number): Observable<UseGroups> {

    const controller = '/ItemTypes/';

    const parameters = `?id=${id}`;

    const endPoint = 'deleteItemType';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.delete<UseGroups>(url);

  }

  deleteItems(site: ISite, items: UseGroups[]): Observable<UseGroups[]> {

    const controller = '/ItemTypes/';

    const parameters = ``;

    const endPoint = 'DeleteItemTypes';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.post<UseGroups[]>(url, items);

  }

  getDefaultGroups(): UseGroups[] {
    let   useGroup    = {} as UseGroups[]
    const groupsTaxes = {} as UseGroupTax[]

    useGroup =  [
      { name: 'Adjustment',    id: 2, useGroupTaxes: groupsTaxes},
      { name: 'Cannabis',      id: 7, useGroupTaxes: groupsTaxes},
      { name: 'Discounts',     id: 4, useGroupTaxes: groupsTaxes},
      { name: 'Food',          id: 12,useGroupTaxes: groupsTaxes},
      { name: 'Grouping',      id: 3, useGroupTaxes: groupsTaxes},
      { name: 'Grocery',       id: 10,useGroupTaxes: groupsTaxes},
      { name: 'Generic',       id: 11,useGroupTaxes: groupsTaxes},
      { name: 'Med-Cannabis',  id: 8, useGroupTaxes: groupsTaxes},
      { name: 'Product',       id: 1, useGroupTaxes: groupsTaxes},
      { name: 'Retail Liquor', id: 9, useGroupTaxes: groupsTaxes},
      { name: 'Restaurant',    id: 12,useGroupTaxes: groupsTaxes},
      { name: 'Retail',        id: 5, useGroupTaxes: groupsTaxes},
      { name: 'Tobacco',       id: 6, useGroupTaxes: groupsTaxes},

   ]
   return useGroup

  }

  initGroups(site: ISite): Observable<UseGroups[]> {
    const useGroup = this.getDefaultGroups();
    return this.postItemGroups(site, useGroup)
  }

  postItemGroups(site: ISite, iItemType: UseGroups[]): Observable<UseGroups[]> {

    const controller = '/UseGroups/';

    const parameters = '';

    const endPoint ='PostUseGroupList';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.post<UseGroups[]>(url, iItemType);

  }

  getGroup(site: ISite, id: number): Observable<UseGroups> {

    const controller = '/UseGroups/';

    const parameters = `?id=${id}`;

    const endPoint = 'GetUseGroup';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.get<UseGroups>(url);

  }

  getUseGroupListNoChildren(site: ISite): Observable<UseGroups[]> {

    const controller = '/UseGroups/';

    const parameters = ``;

    const endPoint = 'getUseGroupListNoChildren';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.get<UseGroups[]>(url);

  }

  getBasicTypes(site: ISite): Observable<IItemBasicB[]> {

    const controller = '/UseGroups/';

    const parameters = '';

    const endPoint = 'GetBasicTypes';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.get<IItemBasicB[]>(url);

  }

}
