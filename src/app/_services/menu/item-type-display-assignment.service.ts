import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable  } from 'rxjs';
import {  ISite }  from 'src/app/_interfaces';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';

export interface   IDisplayAssignment{
  id        : number;
  name      : string;
  itemTypeID: number;
  sort      : number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemTypeDisplayAssignmentService {


  site: ISite;
  constructor(private http: HttpClient,
              private auth: AuthenticationService,
              private httpCache: HttpClientCacheService,
              ) { }


    deleteItemType(site: ISite, id: number): Observable<IDisplayAssignment> {

      const controller = '/ItemTypeDisplayAssignment/';

      const parameters = `?ItemTypeID=${id}`;

      const endPoint = 'deleteItemType';

      const url = `${site.url}${controller}${endPoint}${parameters}`;

      return  this.http.delete<IDisplayAssignment>(url);

    }

    delete(site: ISite, id: number): Observable<IDisplayAssignment> {

      const controller = '/ItemTypeDisplayAssignment/';

      const parameters = `?id=${id}`;

      const endPoint = 'DeleteItem';

      const url = `${site.url}${controller}${endPoint}${parameters}`;

      return  this.http.delete<IDisplayAssignment>(url);

    }

    getSortedList(site: ISite): Observable<IDisplayAssignment[]> {

      const controller = '/ItemTypeDisplayAssignment/';

      const parameters = ``;

      const endPoint = 'getSortedList';

      const url = `${site.url}${controller}${endPoint}${parameters}`;

      return  this.http.get<IDisplayAssignment[]>(url);

    }

    saveItemList(site: ISite, iDisplayAssignment: IDisplayAssignment[]): Observable<IDisplayAssignment[]> {

      const controller = '/ItemTypeDisplayAssignment/';

      const parameters = ``;

      const endPoint = 'SaveItemList';

      const url = `${site.url}${controller}${endPoint}${parameters}`;

      return  this.http.post<IDisplayAssignment[]>(url, iDisplayAssignment);

    }


  }
