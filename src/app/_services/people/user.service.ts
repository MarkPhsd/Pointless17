import { Injectable, Input } from '@angular/core'; '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISite,  IUserProfile}  from 'src/app/_interfaces';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../system/authentication.service';
import { AppInitService } from '../system/app-init.service';


@Injectable({
    providedIn: 'root'
  })
export class UserService {
     apiUrl : any;

    constructor(
      private auth: AuthenticationService,
      private http: HttpClient,
      private appInitService  : AppInitService,
      ) {
      this.apiUrl   = this.appInitService.apiBaseUrl()

    }

    // getUserRole()

   getProfile():  Observable<IUserProfile>  {
      const user = this.auth.userValue
      if (user) {
        const username = user.username
        const password = user.password
        return this.http.post<any>(`${this.apiUrl}/users/GetUserInfo`, { username: username, password: password });
      }
    }

    getProfileOfUSerByID(id: number):  Observable<IUserProfile>  {
      const url = `${this.apiUrl}/clients/getClientByID?=${id}`;
      return this.http.get<IUserProfile>(url);
    }

    getRemoteProfile(site: ISite):  Observable<IUserProfile>  {

      const user = this.auth.userValue
      if (user) {
        const body = {'username': user.username, 'password':  user.password};
        return this.http.post<IUserProfile>(`${site.url}users/GetUserInfo`, body)
      }

    }
}
