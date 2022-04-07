import { Injectable, Input } from '@angular/core'; '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISite,  IUserProfile}  from 'src/app/_interfaces';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../system/authentication.service';
import { AppInitService } from '../system/app-init.service';
import { SitesService } from '../reporting/sites.service';


@Injectable({
    providedIn: 'root'
  })
export class UserService {
     apiUrl : any;

    constructor(
      private auth: AuthenticationService,
      private http: HttpClient,
      private appInitService  : AppInitService,
      private siteService: SitesService,
      ) {
      this.apiUrl   = this.appInitService.apiBaseUrl()
    }

  getProfile():  Observable<IUserProfile>  {
     const site = this.siteService.getAssignedSite()
      const user = this.auth.userValue
      if (user) {
        return this.http.post<any>(`${site.url}/users/GetUserInfo`,user);
      }
    }

  getProfileOfUSerByID(id: number):  Observable<IUserProfile>  {
    const url = `${this.apiUrl}/clients/getClientByID?=${id}`;
    return this.http.get<IUserProfile>(url);
  }

  getRemoteProfile(site: ISite):  Observable<IUserProfile>  {
    const user = this.auth.userValue
    if (user) {
      return this.http.post<IUserProfile>(`${site.url}/users/GetUserInfo`, user)
    }
  }
}
