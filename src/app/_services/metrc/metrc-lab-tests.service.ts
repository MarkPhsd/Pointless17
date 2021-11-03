import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {
  METRCLabTestsStates,
  METRCLabTestTypes,
  METRCLabTestsResults,
  METRCLabTestsRecordPOST,
  METRCLabTEstsLabeTestDocument,
  METRCLabTestResultsRelease
} from '../../_interfaces/metrcs/lab-tests';

@Injectable({
  providedIn: 'root'
})
export class MetrcLabTestsService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {}

  getLabTestsStates(site: ISite): Observable<METRCLabTestsStates[]> {

    const controller = '/labtests/v1/states'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCLabTestsStates[]>(url);

  }

  getLabtestsTypes(site: ISite): Observable<METRCLabTestTypes[]> {

    const controller = '/labtests/v1/types'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCLabTestTypes[]>(url);

  }

  getLabTestResults(site: ISite): Observable<METRCLabTestsResults[]> {

    const controller = '/labtests/v1/results'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCLabTestsResults[]>(url);

  }

  postLabTestsRecord(mETRCLabTestsRecordPOST: METRCLabTestsRecordPOST [], site: ISite): Observable<any> {

    const controller = '/labtests/v1/record'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCLabTestsRecordPOST[]>(url,mETRCLabTestsRecordPOST);

  }

  putLabtestDocument(mETRCLabTestsRecordPOST: METRCLabTEstsLabeTestDocument [], site: ISite): Observable<any> {

    const controller = '/labtests/v1/labtestdocument'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCLabTEstsLabeTestDocument[]>(url,mETRCLabTestsRecordPOST);

  }
  putLabTestsResultsRelease(mETRCLabTestsRecordPOST: METRCLabTestResultsRelease [], site: ISite): Observable<any> {

    const controller = '/labtests/v1/results/release'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCLabTestResultsRelease[]>(url,mETRCLabTestsRecordPOST);

  }


}
