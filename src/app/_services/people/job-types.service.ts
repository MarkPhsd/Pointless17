import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite, JobType } from 'src/app/_interfaces';
import { AuthenticationService } from '../system/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class JobTypesService {

  constructor(
                private http: HttpClient,
                private auth: AuthenticationService, ) {

  }

  getType(site: ISite, id: any) :  Observable<JobType> {

    const controller = '/jobType/'

    const endPoint = 'GetJobType'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<JobType>(url)

  }

  getTypes(site: ISite) :  Observable<JobType[]> {

    const controller = '/jobType/'

    const endPoint = 'getJobTypes'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<JobType[]>(url)

  }

  putJobType(site: ISite, id: any, type: JobType):  Observable<JobType> {

    const controller = '/jobType/'

    const endPoint = 'PutJobType';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<any>(url, status)

  }

  postJobType(site: ISite,  type: JobType) :  Observable<JobType> {

    const controller = '/jobType/'

    const endPoint = 'PostJobType'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<any>(url, status)

  }

  delete(site: ISite,   id: any, type: JobType):  Observable<JobType> {

    const controller = '/jobType/'

    const endPoint = 'delete'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

  }

}
