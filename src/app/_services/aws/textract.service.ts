import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { error } from 'protractor';
import { IDriversLicense } from 'src/app/_interfaces/people/drivers-license';
import { AppInitService } from '../system/app-init.service';



@Injectable({
  providedIn: 'root'
})
export class TextractService {

  apiUrl: any;

  constructor(
              private http: HttpClient,
              private appInitService  : AppInitService,
  ) {
    this.apiUrl =  this.appInitService.apiBaseUrl()
  }

  readDriversLicense(fileName: string): Observable<IDriversLicense> {

    const controller = `/AWSTextract/`

    const endPoint = `readDriversLicense`

    const parameter = `?filename=${fileName}`

    const url = `${this.apiUrl}${controller}${endPoint}${parameter}`

    console.log(url)

    return this.http.get<IDriversLicense>(url)

  }



}
