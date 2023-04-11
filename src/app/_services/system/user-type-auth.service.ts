import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { SitesService } from '../reporting/sites.service';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { AppInitService } from './app-init.service';

@Injectable({
  providedIn: 'root'
})
export class UserTypeAuthService {

  constructor( private http: HttpClient,
    private httpCache: HttpClientCacheService,
    private auth: AuthenticationService,
    private siteService: SitesService,
    private appInitService  : AppInitService,
    ) {
  }


  // getUserTypeAuth(site: ISite):  Observable<ISetting[]> {

  //   const controller = '/settings/'

  //   const endPoint = 'getListOfPOSComputers'

  //   const parameters = ''

  //   const url = `${site.url}${controller}${endPoint}${parameters}`

  //   return this.http.get<ISetting[]>(url);

  // }

  // saveUserTypeAuth(site: ISite, auth: IUserTypeAuth) {}

  // putUserTypeAuth(site: ISite, id: number):  Observable<ISetting> {

  //   const controller = "/settings/"

  //   const endPoint = 'deleteSetting';

  //   const parameters = `?id=${id}`

  //   const url = `${site.url}${controller}${endPoint}${parameters}`

  //   return this.http.put<ISetting>(url);

  // }


  // postUserTypeAuth(site: ISite, id: number):  Observable<ISetting> {

  //   const controller = "/settings/"

  //   const endPoint = 'deleteSetting';

  //   const parameters = `?id=${id}`

  //   const url = `${site.url}${controller}${endPoint}${parameters}`

  //   return this.http.post<ISetting>(url);

  // }

  // deleteUserTypeAuth(site: ISite, id: number):  Observable<ISetting> {

  //   const controller = "/settings/"

  //   const endPoint = 'deleteSetting';

  //   const parameters = `?id=${id}`

  //   const url = `${site.url}${controller}${endPoint}${parameters}`

  //   return this.http.delete<ISetting>(url);

  // }


}
