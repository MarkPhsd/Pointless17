import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, } from 'rxjs';
import { ISetting, ISite, IUserProfile }   from 'src/app/_interfaces';
import { environment } from 'src/environments/environment';

export interface zplLabel {
  text  : string;
  height: string;
  width : string;
}

@Injectable({
  providedIn: 'root'
})
export class LabelaryService {

  constructor( private http: HttpClient,
               private auth: AuthenticationService, ) { }

  postZPL(site: ISite, zpl: zplLabel):  Observable<any> {

    const controller = "/system/"

    const endPoint = `postLabel`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>(url, zpl )


  }

}
