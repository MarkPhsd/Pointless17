import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {
  METRCPatientsGet,
  METRCPatientsAdd,
  METRCPatientsUpdate

} from '../../_interfaces/metrcs/patients';

@Injectable({
  providedIn: 'root'
})
export class MetrcPatientsService {


  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {

   }
  getPatient(id:number, site: ISite): Observable<METRCPatientsGet[]> {

    const controller = '/patients/v1/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPatientsGet[]>(url);

  }

  getPatientsActive(site: ISite): Observable<METRCPatientsGet[]> {

    const controller = '/patients/v1/acvtive'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPatientsGet[]>(url);

  }


  postMETRCPatientAdd(mETRCPatientsAdd: METRCPatientsAdd, site: ISite): Observable<any> {

    const controller = '/patients/v1/add'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPatientsAdd>(url,mETRCPatientsAdd);

  }

  postMETRCPatientUpdate(mETRCPatientsAdd: METRCPatientsAdd[], site: ISite): Observable<any[]> {

    const controller = '/patients/v1/add'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPatientsAdd[]>(url,mETRCPatientsAdd);

  }


  deletePatient(site: ISite): Observable<any> {

    const controller = '/patients/v1/add'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.delete(url);

  }

}
