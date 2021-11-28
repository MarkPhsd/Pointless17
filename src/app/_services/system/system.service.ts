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

  private _webApiStatus          = new BehaviorSubject<ICompany>(null);
  public webApiStatus$           = this._webApiStatus.asObservable();

  constructor( private http: HttpClient,
              )
  { }

   getSyncDatabaseSchema(site:ISite):  Observable<SchemaUpdateResults[]> {

    const controller = "/System/"

    const endPoint = 'getSyncDatabaseSchema'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<SchemaUpdateResults[]>(url);


   }
}
