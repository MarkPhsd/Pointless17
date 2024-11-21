import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { BehaviorSubject, Observable, } from 'rxjs';
import { ISetting }   from 'src/app/_interfaces';
import { SitesService } from '../reporting/sites.service';
import { AppInitService } from './app-init.service';

export interface SiteLogin {
  id: number;
  userName : string;
  token: string;
  siteUrl : string;
  siteName: string;
}

@Injectable({
  providedIn: 'root'
})

export class SiteLoginsService {
  apiUrl: any;

  private _siteLogins          = new BehaviorSubject<SiteLogin[]>(null);
  public siteLogins$           = this._siteLogins.asObservable();

  updateLogins(logins: SiteLogin[]) {
    this._siteLogins.next(logins)
  }
  constructor( private http: HttpClient,
               private siteService: SitesService,
               private appInitService  : AppInitService,
               ) {
     this.apiUrl =  this.appInitService.apiBaseUrl()
  }

  getLogins(userName: string):  Observable<ISetting> {

    const site = this.siteService.getAssignedSite();
    const controller = "/sitesLogin/"

    const endPoint = 'getLogins';

    const parameters = `?userName=${userName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ISetting>(url);

  }

  deleteUser(userName: string):  Observable<ISetting> {

    const site = this.siteService.getAssignedSite();

    const controller = "/sitesLogin/"

    const endPoint = 'deleteLogins';

    const parameters = `?userName=${userName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<ISetting>(url);

  }

}
