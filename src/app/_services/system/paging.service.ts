import { Injectable } from '@angular/core';

export interface SearchModel {
  name:                  string;
  pageSize:              number;
  pageNumber:            number;
  pageCount:             number;
  recordCount:           number;
  currentPage:           number;
  lastPag:               number;
  isLastPage:            number;
  isFirstPage:           number;
  loadChildren     :     boolean;
}
export interface IPagedList {
  pageCount:       number;
  currentPage:     number;
  pageSize:        number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
  lastItemOnPage:  number;
  recordCount:     number
  isLastPage:      boolean
  isFirstPage:     boolean
  totalRecordCount:number
}


@Injectable({
  providedIn: 'root'
})
export class PagingService {

  constructor() { }

  getPaging(data: any): IPagedList {

    const page = JSON.parse(data.headers.get('Paging-Headers'));

    let pagedList = {} as IPagedList
    pagedList.currentPage = page.CurrentPage
    pagedList.hasNextPage = page.PasNextPage
    pagedList.hasPreviousPage = page.HasPreviousPage
    pagedList.pageCount = page.PageCount
    pagedList.pageSize = page.PageSize
    pagedList.recordCount = page.RecordCount

    return pagedList;

  }
}
