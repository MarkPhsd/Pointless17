import { Injectable } from '@angular/core';
import { UseGroupTax } from './use-groups.service';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable  } from 'rxjs';
import { ISite }  from 'src/app/_interfaces';
import { UseGroupTaxAssignedList } from './taxes.service';

@Injectable({
  providedIn: 'root'
})
export class UseGroupTaxesService {

  site: ISite;
  constructor(private http: HttpClient,
            private auth: AuthenticationService) { }

  //this list passes a list of all the groups and uses the id number as the tax id to assign to the groups.
  saveList(site: ISite, id: number, useGroupTaxes: UseGroupTaxAssignedList[]): Observable<UseGroupTaxAssignedList[]> {

    const controller = '/UseGroupTaxes/';

    const parameters = `?id=${id}`;

    const endPoint = 'SaveList';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.post<UseGroupTaxAssignedList[]>(url, useGroupTaxes);

  }

  getGroupsByTaxID(site: ISite, taxID: number): Observable<UseGroupTax[]> {

    const controller = '/UseGroupTaxes/';

    const parameters = `?taxID=${taxID}`;

    const endPoint = 'GetGroupsByTaxID';

    const url = `${site.url}${controller}${endPoint}${parameters}`;

    return  this.http.get<UseGroupTax[]>(url);

  }



}
