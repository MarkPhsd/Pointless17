import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, Observable, } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { IPagedList } from '../system/paging.service';
import { ISite } from 'src/app/_interfaces';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

export interface MenuPromptSearchModel {
  name:                         string;
  pageSize:                     number;
  pageNumber:                   number;
  pageCount:                    number;
  currentPage:                  number;
  lastPage:                     number;
  recordCount:                  number;
}

export interface IPromptResults{
 results: IPromptGroup[]
 paging:  IPagedList
}

export interface IItemBasic{
 name: string;
 id  : number;
 type: string;
 optionBoolean: boolean;
}

export interface editWindowState {
  tabBosition: number;

}

@Injectable({
  providedIn: 'root'
})
export class PromptGroupService {

  private _promptGroup       = new BehaviorSubject<IPromptGroup>(null);
  public promptGroup$        = this._promptGroup.asObservable();

  private _editWindowState       = new BehaviorSubject<editWindowState>(null);
  public editWindowState$         = this._editWindowState.asObservable();

  updatePromptGroup(promptGroup:  IPromptGroup) {
    this._promptGroup.next(promptGroup);
  }

  updateEditWindowState(item:  editWindowState) {
    this._editWindowState.next(item);
  }

  constructor(
          private http: HttpClient,
          private httpCache: HttpClientCacheService,
          private auth: AuthenticationService,
          private fb   : UntypedFormBuilder,
  ) { }

  initForm(inputForm: UntypedFormGroup) {

    inputForm = this.fb.group({
      id       :  [],
      name      : [],
      created   : [],
      lastEdited: [],
      image   : [],
      instructions: [],
    })

    return inputForm

  }

    //this list passes a list of all the groups and uses the id number as the tax id to assign to the groups.
    saveList(site: ISite,  promptGroup: IPromptGroup): Observable<IPromptGroup> {

      const controller = '/promptGroups/';

      const parameters = ``;

      const endPoint = 'SaveList';

      const url = `${site.url}${controller}${endPoint}${parameters}`;

      return  this.http.post<IPromptGroup>(url, promptGroup);

    }


  searchMenuPrompts(site: ISite, searchModel: MenuPromptSearchModel): Observable<IPromptResults> {

    const controller = "/promptGroups/"

    const endPoint = `searchPrompts`;

    const parameters= ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPromptResults>(url, searchModel)

  }

  getPrompt(site: ISite, id: number): Observable<IPromptGroup> {

    const controller = "/promptGroups/"

    const endPoint = `getPrompt`;

    const parameters= `?id=${id}`;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPromptGroup>(url)

  }

  getPrompts(site: ISite): Observable<IPromptGroup[]> {

    const controller = "/promptGroups/"

    const endPoint = `getPrompts`;

    const parameters= ``;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPromptGroup[]>(url)

  }

  deletePrompt(site: ISite, id: number): Observable<IPromptGroup> {

    const controller = "/promptGroups/"

    const endPoint = `deletePrompt`;

    const parameters= `?id=${id}`;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<IPromptGroup>(url)

  }

  putPrompt(site: ISite, prompt: IPromptGroup): Observable<IPromptGroup> {

    const controller = "/promptGroups/"

    const endPoint = `putPrompt`;

    const parameters= `?id=${prompt.id}`;

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<IPromptGroup>(url, prompt)

  }

  postPrompt(site: ISite,  prompt: IPromptGroup): Observable<IPromptGroup> {

    const controller = "/promptGroups/"

    const endPoint = `postPrompt`;

    const parameters= ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPromptGroup>(url, prompt)

  }

  save(site: ISite,  prompt: IPromptGroup): Observable<IPromptGroup> {

    if (prompt.id) {
      return  this.putPrompt(site, prompt);

    } else {
      return this.postPrompt(site, prompt);

    }
  }

}
