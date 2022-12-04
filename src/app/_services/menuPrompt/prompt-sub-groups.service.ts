import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, Observable, } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { IPagedList } from '../system/paging.service';
import { ISite } from 'src/app/_interfaces';
import { IPromptGroup, PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface MenuSubPromptSearchModel {
  name:                         string;
  pageSize:                     number;
  pageNumber:                   number;
  pageCount:                    number;
  currentPage:                  number;
  lastPage:                     number;
  recordCount:                  number;
}

export interface IPromptSubResults {
 results: PromptSubGroups[]
 paging:  IPagedList
}

@Injectable({
  providedIn: 'root'
})
export class  PromptSubGroupsService {

  private __promptSubGroup       = new BehaviorSubject<PromptSubGroups>(null);
  public promptSubGroup$         = this.__promptSubGroup.asObservable();

  updatePromptSubGroup(promptSubGroup:  PromptSubGroups) {
    this.__promptSubGroup.next(promptSubGroup);
  }

  constructor(
    private http      : HttpClient,
    private httpCache : HttpClientCacheService,
    private auth      : AuthenticationService,
    private fb        : FormBuilder,
  ) { }

  initForm(inputForm: FormGroup) {

    inputForm = this.fb.group({
      id             : [],
      name           : ['', Validators.required],
      minQuantity    : [],
      maxQuantity    : [],
      moveOnQuantity : [],
      created        : [],
      lastEdited     : [],
      image          : [],
      instructions   : [],
      hideSplitOptions: [],
    })

    return inputForm

  }

  searchSubPrompts(site: ISite, searchModel: MenuSubPromptSearchModel): Observable<IPromptSubResults> {

    const controller = "/promptSubGroups/"

    const endPoint = `SearchSubPrompts`;

    const parameters= ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPromptSubResults>(url, searchModel)

  }

  getPromptSub(site: ISite, id: number): Observable<PromptSubGroups> {

    const controller = "/promptSubGroups/"

    const endPoint = `getPromptSubGroups`;

    const parameters= `?id=${id}`;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<PromptSubGroups>(url)

  }

  deletePromptSub(site: ISite, id: number): Observable<PromptSubGroups> {

    const controller = "/promptSubGroups/"

    const endPoint = `deletePromptSubGroups`;

    const parameters= `?id=${id}`;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<PromptSubGroups>(url)

  }

  putPromptSub(site: ISite, prompt: PromptSubGroups): Observable<PromptSubGroups> {

    const controller = "/promptSubGroups/"

    const endPoint = `putPromptSubGroups`;

    const parameters= `?id=${prompt.id}`;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<PromptSubGroups>(url, prompt)

  }

  //PutPromptSubGroupNochildren

  putPromptSubNoChildren(site: ISite, prompt: PromptSubGroups): Observable<PromptSubGroups> {

    const controller = "/promptSubGroups/"

    const endPoint = `putPromptSubGroupNochildren`;

    const parameters= `?id=${prompt.id}`;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<PromptSubGroups>(url, prompt)

  }

  postPromptSub(site: ISite,  prompt: PromptSubGroups): Observable<PromptSubGroups> {

    const controller = "/promptSubGroups/"

    const endPoint = `postPromptSubGroups`;

    const parameters= ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<PromptSubGroups>(url, prompt)

  }

  save(site: ISite,  prompt: PromptSubGroups): Observable<PromptSubGroups> {

    if (prompt.id) {
      return  this.putPromptSub(site, prompt);

    } else {
      return this.postPromptSub(site, prompt);

    }
  }

}
