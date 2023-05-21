import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { IPagedList } from '../system/paging.service';
import { ISite } from 'src/app/_interfaces';
import { IPromptGroup, PromptSubGroups, PromptMenuItem } from 'src/app/_interfaces/menu/prompt-groups';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';

export interface postedNewItem {
  promptMenuItem: PromptMenuItem;
  promptMenuItems: PromptMenuItem[];
}
@Injectable({
  providedIn: 'root'
})
export class PromptMenuItemsService {

  constructor(
    private http      : HttpClient,
    private httpCache : HttpClientCacheService,
    private auth      : AuthenticationService,
    private fb        : UntypedFormBuilder,
  ) { }


    //PutPromptSubGroupNochildren
    postItem(site: ISite, item: PromptMenuItem, list: PromptMenuItem[]): Observable<PromptMenuItem[]> {

      const postedNewItem = {} as postedNewItem
      postedNewItem.promptMenuItem  = item;
      postedNewItem.promptMenuItems = list;

      const controller = "/PromptMenuItems/"

      const endPoint = `postItem`;

      const parameters= ``;

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.post<PromptMenuItem[]>(url, postedNewItem)

    }

    postItemList(site: ISite, list: PromptMenuItem[]): Observable<PromptMenuItem[]> {

      const controller = "/PromptMenuItems/"

      const endPoint = `postPromptMenuItemsList`;

      const parameters= ``;

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.post<PromptMenuItem[]>(url, list)

    }

    deleteMenuItemSelected(site: ISite, id: number): Observable<PromptSubGroups> {

      const controller = "/PromptMenuItems/"

      const endPoint = `deletePromptMenuItem`;

      const parameters= `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.delete<PromptSubGroups>(url)

    }

}
