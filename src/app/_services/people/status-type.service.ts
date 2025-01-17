import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, } from 'rxjs';
import { ISite }   from 'src/app/_interfaces';

// Generated by https://quicktype.io

export interface IStatuses {
  id:     number;
  status: string;
  filter: string;
  icon:   number;
  color:  string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusTypeService {

  constructor(
                private http: HttpClient,
                private auth: AuthenticationService, ) {

  }
  // https://ccsposdemo.ddns.net:4443/api/StatusTypes/GetStatuses
  getStatuses(site: ISite) :  Observable<IStatuses[]> {

    const controller = '/StatusTypes/'

    const endPoint = 'GetStatuses';

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`
    console.log(url)
    return this.http.get<any>(url)

  }

  getStatus(site: ISite, id:any) :  Observable<IStatuses[]> {

    const controller = '/StatusTypes/'

    const endPoint = 'getStatus'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`
    console.log(url)
    return this.http.get<any>(url)

  }

  putStatus(site: ISite, id: any, status: IStatuses) :  Observable<IStatuses> {

    const controller = '/StatusTypes/'

    const endPoint = 'getStatus';

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<any>(url, status)

  }

  postStatus(site: ISite,  status: IStatuses) :  Observable<IStatuses> {

    const controller = '/StatusTypes/'

    const endPoint = 'getStatus'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<any>(url, status)

  }


}
