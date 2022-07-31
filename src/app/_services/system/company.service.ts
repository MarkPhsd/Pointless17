import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import { ICompany, ISite } from   'src/app/_interfaces';
import { AppInitService } from './app-init.service';

@Injectable({
  providedIn: 'root'
})

export class CompanyService {

  apiUrl: any;

  constructor( private http: HttpClient,
               private appInitService  : AppInitService,
               ) {
      this.apiUrl   = this.appInitService.apiBaseUrl()
  }

  getCompany(site: ISite): Observable<ICompany> {

    const controller = '/Companies/'

    const endPoint = 'GetPrimaryCompany'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ICompany>(url)

  };

  updateCompany(site: ISite, company: ICompany): Observable<ICompany> {

    const controller = '/Companies/'

    const endPoint = 'PutCompany'

    const parameters = `?id=${company.companyID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<ICompany>(url,  company)

  };


}
