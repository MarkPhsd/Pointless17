import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ISite, IUser } from 'src/app/_interfaces';
import { IUserExists } from '..';

@Injectable({
  providedIn: 'root'
})
export class AuthLoginService {

  constructor( private http             : HttpClient,) { }

  requestUserSetupToken(site: ISite, trackerInfo: string,userName: string): Observable<IUserExists> {

    const api =  site.url// this.siteService.getAssignedSite().url
    const url = `${api}/users/RequestUserSetupToken`

    // const messsage = this.getTracker(userName)
    const messsage = trackerInfo// this.getTracker(userName)

    return this.http.post<any>(url, { userName: userName, message: messsage });
  };

  requestPasswordResetToken(site: ISite, trackerInfo: string, userName: string): Observable<any> {
    // const api = this.siteService.getAssignedSite().url;
    const url = `${site?.url}/users/RequestPasswordResetToken`;

    const messsage = trackerInfo// this.getTracker(userName)

    return this.http.post<any>(url, { userName: userName, message: messsage });
  }

  assignUserNameAndPassword(site:ISite,user: IUser): Observable<IUserExists>  {
    const api = site.url
    const url = `${api}/users/CreateNewUserName`
    return  this.http.post<any>(url, user)
  };

  createTempUser(site:ISite) : Observable<any> {
    //check local storage.
    //if local user exists then return that as observable
    const user = localStorage.getItem('user');
    if (user) {
      return of(user);
    }
    const api = site.url
    const url = `${api}/users/CreateTempUser`
    return  this.http.get<any>(url);

  }

  updatePassword(site:ISite, trackerInfo: string, user: IUser): Observable<any> {
    const api = site.url
    const url = `${api}/users/updatePassword`
    // return  this.http.post<any>(url, user)
    user.message = trackerInfo;
    // const message = this.getTracker(user?.username)
    // user.message = message;
    return this.http.post<any>(url, user);
  }

  requestNewUser(site: ISite, trackerInfo: string, user: IUser): Observable<IUserExists> {
    const api = site.url
    const url = `${api}/users/RequestNewUser`
    // const message = this.getTracker(user?.username)
    user.message = trackerInfo;
    return this.http.post<any>(url, user);
  }
}
