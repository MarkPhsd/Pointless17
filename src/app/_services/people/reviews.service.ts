import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { Observable, } from 'rxjs';

import {  Review } from '../../_interfaces/menu/menu-products';
import { environment } from 'src/environments/environment';
import { IReviewsFilter, ISite } from '../../_interfaces';

// https://medium.com/better-programming/how-to-create-a-star-rating-component-in-angular-ff32234ea531

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  constructor(private http: HttpClient) { }

  getReview(site: ISite, id: any): Observable<Review>  {

    const controller =  '/reviews/'

    const endPoint = 'getReview'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<Review>(url)

  }

  getReviewsOfProduct(site: ISite, productiD: any): Observable<Review[]>  {

    const controller = `/reviews/`

    const endPoint = `getReviewsOfProduct`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    let reviewFilter = {} as IReviewsFilter

    reviewFilter.productID = productiD
    reviewFilter.pageNumber = 1
    reviewFilter.pageSize = 100

    return this.http.post<Review[]>(url, reviewFilter)

  }

  deleteReview(site: ISite, id: any): Observable<Review>  {

    const controller = `/reviews/`

    const endPoint = `deleteReview`

    const parameters = '?id=${id}'

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<Review>(url)

  }

  putReview(site: ISite, id: any, review: Review): Observable<Review> {

    const controller = `/reviews/`

    const endPoint = `putReview`

    const parameters = '?id=${id}'

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<Review>(url, review)

  }

  postReview(site: ISite, review: Review) {

    const controller = '/reviews/'

    const endPoint = 'putReview'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<Review>(url, review)

  }


}
