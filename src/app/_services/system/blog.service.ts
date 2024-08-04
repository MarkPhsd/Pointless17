import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IOrdersPaged, ISite, Paging } from 'src/app/_interfaces';
import { AppInitService } from './app-init.service';

export interface ISearchBlogs {
  name: string;
  type: string;
  blogID: string;
  id: number;
  pageSize: number;
  pageNumber: number;
  currentPage: number;
  recordCount: number;
  group: string;
  enabled: boolean;
}

export interface IBlog {
  id: number;
  name: string;
  sort: number;
  group: string;
  link: string;
  enabled: boolean;
}

export interface IBlogResults {
  results: IBlog[];
  message: string;
  paging:  Paging;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  apiUrl: any;
  groups = ['Footer', 'Brand Head',  'Category Head', 'Department Head', 'Menu Head', 'Main Page', 'Tier Head', 'Sale Policy'];

  constructor( private http: HttpClient,
               private appInitService  : AppInitService,
               ) {
      this.apiUrl   = this.appInitService.apiBaseUrl()
  }

  searchBlogs(site: ISite, search: ISearchBlogs): Observable<IBlogResults> {

    const controller  = '/blogs/'

    const endPoint    = 'searchBlogs'

    const parameters  = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IBlogResults>(url, search)

  };

  getBlog(site: ISite, id: number): Observable<any> {

    const controller  = '/blogs/'

    const endPoint    = 'getBlog'

    const parameters  = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  };


  delete(site: ISite, id: number): Observable<any> {

    const controller  = '/blogs/'

    const endPoint    = 'DeleteBlog'

    const parameters  = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<any>(url)

  };

  putBlog(site: ISite, blog: IBlog): Observable<any> {

    const controller  = '/blogs/'

    const endPoint    = 'putBlog'

    const parameters  = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<any>(url, blog)

  };

  postBlog(site: ISite, blogs: IBlog): Observable<IBlog> {

    const controller  = '/blogs/'

    const endPoint    = 'postBlog'

    const parameters  = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IBlog>(url, blogs)

  };

  save(site: ISite, blogs: IBlog): Observable<IBlog> {
    if (blogs.id) {
      return this.putBlog(site, blogs)
    }
    return this.postBlog(site, blogs)
  }

  putBlogList(site: ISite, blogs: IBlog[]): Observable<IBlog[]> {

    const controller  = '/blogs/'

    const endPoint    = 'postBlogList'

    const parameters  = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IBlog[]>(url, blogs)

  };

  getBlogPost(blogURL: string, slug: string): Observable<any> {

    const url =  `${blogURL}${slug}`

    return  this.http.get<any>(url)

  }
}
