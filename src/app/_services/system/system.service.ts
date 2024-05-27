import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable, } from 'rxjs';
import { ICompany, ISite } from 'src/app/_interfaces';

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



  // GetSyncDatabaseSchema
  // CreateAPIViews
  // CreateViews
  // CreateTablesA
  // CreateTablesB
  // createAPIReportviews

  updateSections = ['GetSyncDatabaseSchema', 'CreateAPIViews', 'CreateViews', 'CreateTablesA', 'CreateTablesB', 'createAPIReportviews']

  private _webApiStatus          = new BehaviorSubject<ICompany>(null);
  public webApiStatus$           = this._webApiStatus.asObservable();

  constructor( private http: HttpClient,

              )
  { }

  getToken(site:ISite) :Observable<string> {
    const controller = "/System/"
    const endPoint = 'getToken'
    const parameters = ''
    const url = `${site.url}${controller}${endPoint}${parameters}`
    return this.http.get<string>(url);
  }

   getSyncDatabaseSchema(site:ISite):  Observable<SchemaUpdateResults[]> {
    const controller = "/System/"
    const endPoint = 'getSyncDatabaseSchema'
    const parameters = ''
    const url = `${site.url}${controller}${endPoint}${parameters}`
    return this.http.get<SchemaUpdateResults[]>(url);
   }
   cleanData(site: ISite) {
    const controller = "/System/"
    const endPoint = 'cleanData'
    const parameters = ''
    const url = `${site.url}${controller}${endPoint}${parameters}`
    return this.http.get<any>(url);
  }
   getAPIVersion(site: ISite): Observable<string> {
    const controller = "/System/"
    const endPoint = 'getAPIVersion'
    const parameters = ''
    const url = `${site.url}${controller}${endPoint}${parameters}`
    return this.http.get<string>(url);
   }

   updateDatabase(site:ISite, section: string):  Observable<SchemaUpdateResults[]> {
    const controller = "/System/"
    const endPoint   = section
    const parameters = ''
    const url = `${site.url}${controller}${endPoint}${parameters}`
    return this.http.get<SchemaUpdateResults[]>(url);
   }


  getUsedLocalStorageSpace(){
    let allStrings = '';
    for(const key in window.localStorage){
        if(window.localStorage.hasOwnProperty(key)){
            allStrings += window.localStorage[key];
        }
    }
    return allStrings ? 3 + ((allStrings.length*16)/(8*1024)) + ' KB' : 'Empty (0 KB)';
  };




}
