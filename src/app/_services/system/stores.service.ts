import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, map, Observable, } from 'rxjs';
import { ISetting}   from 'src/app/_interfaces';
import { SitesService } from '../reporting/sites.service';
import { AppInitService } from './app-init.service';
import { SiteLogin } from './site-logins.service';

export interface store {
  id: number; // As Integer
  name : string;
  siteReferenceKey : number; // As Nullable(Of Integer)
  binaryValue: bigint //| string | number;
  storeNumber : string;
  active : boolean; // As Nullable(Of Boolean)
  errorMessage: string;
  assign: boolean;
  displayBinaryValue?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  apiUrl: any;

  private _siteLogins          = new BehaviorSubject<SiteLogin[]>(null);
  public siteLogins$           = this._siteLogins.asObservable();

  constructor( private http: HttpClient,
    private siteService: SitesService,
    private appInitService  : AppInitService,
    ) {
      this.apiUrl =  this.appInitService.apiBaseUrl()
    }

    getActiveStores():  Observable<store[]> {

      const site = this.siteService.getAssignedSite();
      const controller = "/stores/"

      const endPoint = 'getActiveStores';

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<store[]>(url).pipe(
        map(data => {
          data.forEach((store: store, index: number) => {
            if (store.binaryValue != null) {
              store.binaryValue = BigInt(store.binaryValue);
            } else {
              // Assign binaryValue if it's missing
              store.binaryValue = BigInt(1) << BigInt(index);
            }
          });
          return data;
        }))

    }

    getStores():  Observable<store[]> {

      const site = this.siteService.getAssignedSite();
      const controller = "/stores/"

      const endPoint = 'getStores';

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<store[]>(url).pipe(
        map(data => {
          data.forEach((store: store, index: number) => {
            if (store.binaryValue != null) {
              store.binaryValue = BigInt(store.binaryValue);
            } else {
              // Assign binaryValue if it's missing
              store.binaryValue = BigInt(1) << BigInt(index);
            }
          });
          return data;
        }))

    }

    getStore(id: number):  Observable<store> {

      const site = this.siteService.getAssignedSite();
      const controller = "/stores/"

      const endPoint = 'getStore';

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<store>(url);

    }

    putStore(store: store):  Observable<store> {

      const site = this.siteService.getAssignedSite();
      const controller = "/stores/"

      const endPoint = 'putStore';

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.put<store>(url, store);

    }
}
