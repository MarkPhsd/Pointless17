import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, } from 'rxjs';
import { MenusService } from '../system/menus.service';
import { SitesService } from '../reporting/sites.service';
import { ISite } from 'src/app/_interfaces';

export interface SchemaUpdateResults {
  name:               string;
  result:             string;
  message:            string;
  errorCount:         number;
  errorHappened:      boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor( private http: HttpClient,
               private auth: AuthenticationService,
               private menusService: MenusService,
               private siteService: SitesService,) {
        }


   getSyncDatabaseSchema(site:ISite):  Observable<SchemaUpdateResults[]> {

    const controller = "/System/"

    const endPoint = 'getSyncDatabaseSchema'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<SchemaUpdateResults[]>(url);

  }


}
