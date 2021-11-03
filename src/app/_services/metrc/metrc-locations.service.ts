import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {
  METRCLocations,
  METRCLocationTypes,
  METRCLocationsPOST,
  METRCLocationsPUT
} from '../../_interfaces/metrcs/locations';

@Injectable({
  providedIn: 'root'
})
export class MetrcLocationsService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {}

  getLocationByID(id:number, site: ISite): Observable<METRCLocations[]> {

    const controller = '/locations/v1/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCLocations[]>(url);

  }


  getLocaitonsActive(site: ISite): Observable<METRCLocations[]> {

    const controller = '/locations/v1/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCLocations[]>(url);

  }


  getLocationTypes(site: ISite): Observable<METRCLocationTypes[]> {

    const controller = '/locations/v1/types'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCLocationTypes[]>(url);

  }

  postLocations(mETRCLocationsPOST: METRCLocationsPOST[],site: ISite): Observable<METRCLocationsPOST[]> {

    const controller = '/locations/v1/create'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCLocationsPOST[]>(url, mETRCLocationsPOST);

  }

  postLocationsUpdate(mETRCLocationsPOST: METRCLocationsPUT[],site: ISite): Observable<METRCLocationsPUT[]> {

    const controller = '/locations/v1/update'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCLocationsPUT[]>(url, mETRCLocationsPOST);

  }

  deleteLocation(id: number, site: ISite) {

    const controller = '/locations/v1/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.delete(url);

  }


}
