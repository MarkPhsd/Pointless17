import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {METRCEmployees} from '../../_interfaces/metrcs/employees';
@Injectable({
  providedIn: 'root'
})
export class MetrcEmployeesService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {}

  getFacilities(site: ISite): Observable<METRCEmployees[]> {

    const controller = '/harvests/v1/'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCEmployees[]>(url);

  }

}
