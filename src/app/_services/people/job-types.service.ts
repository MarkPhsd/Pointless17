import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite, jobTypes } from 'src/app/_interfaces';
import { AuthenticationService } from '../system/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class JobTypesService {

  constructor(
                private http: HttpClient,
                private auth: AuthenticationService, ) {

  }

  getType(site: ISite, id: any) :  Observable<jobTypes> {

    const controller = '/jobType/'

    const endPoint = 'GetJobType'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<jobTypes>(url)

  }

  getTypes(site: ISite) :  Observable<jobTypes[]> {

    const controller = '/jobType/'

    const endPoint = 'getJobTypes'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<jobTypes[]>(url)

  }

  putjobTypes(site: ISite, id: any, type: jobTypes):  Observable<jobTypes> {

    const controller = '/jobType/'

    const endPoint = 'PutJobType';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<any>(url, status)

  }

  postJobType(site: ISite,  type: jobTypes) :  Observable<jobTypes> {

    const controller = '/jobType/'

    const endPoint = 'PostJobType'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<any>(url, status)

  }

  delete(site: ISite,   id: any, type: jobTypes):  Observable<jobTypes> {

    const controller = '/jobType/'

    const endPoint = 'delete'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

  }

}
