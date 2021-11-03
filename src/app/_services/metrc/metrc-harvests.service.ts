import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {
  METRCHarvest,
  METRCHarvestWasteTypes,
  METRCHarvestPackagePOST,
  METRCHarvestCreatePackagesTesting,
  METRCHarvestPackageRemoveWaste,
  METRCHarvestPackageMove,
  METRCHarvestFinish,
  METRCHarvestUnfinish
} from '../../_interfaces/metrcs/harvest';

@Injectable({
  providedIn: 'root'
})
export class MetrcHarvestsService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {}

  getHarvest(id:number, site: ISite): Observable<METRCHarvest[]> {

    const controller = '/harvests/v1/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCHarvest[]>(url);

  }

  getHarvestsActive(site: ISite): Observable<METRCHarvest[]> {

    const controller = '/harvests/v1/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCHarvest[]>(url);

  }

  getHarvestsOnHold(site: ISite): Observable<METRCHarvest[]> {

    const controller = '/harvests/v1/onHold'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCHarvest[]>(url);

  }

  getHarvestsInActive(site: ISite): Observable<METRCHarvest[]> {

    const controller = '/harvests/v1/inActive'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCHarvest[]>(url);

  }

  getHarvestWasteTypes(site: ISite): Observable<METRCHarvestWasteTypes[]> {

    const controller = '/harvests/v1/waste/types'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCHarvestWasteTypes[]>(url);

  }

  postHarvestsCreatePackages(mETRCHarvestPackagePOST: METRCHarvestPackagePOST[],site: ISite): Observable<any> {

    const controller = '/harvests/v1/create/packages'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCHarvestPackagePOST[]>(url, mETRCHarvestPackagePOST);

  }

  postHarvestsCreatePackagesTesting(mETRCHarvestCreatePackagesTesting: METRCHarvestCreatePackagesTesting[],site: ISite): Observable<any> {

    const controller = '/harvests/v1/create/packages/testing'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCHarvestCreatePackagesTesting[]>(url, mETRCHarvestCreatePackagesTesting);

  }

  putHarvestsMove(mETRCHarvestPackageMove: METRCHarvestPackageMove[],site: ISite): Observable<any> {

    const controller = '/harvests/v1/move'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.put<METRCHarvestPackageMove[]>(url, mETRCHarvestPackageMove);

  }

  postHarvestsRemoveWaste(mETRCHarvestPackageRemoveWaste: METRCHarvestPackageRemoveWaste[], site: ISite): Observable<any> {

    const controller = '/harvests/v1/removeWaste'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCHarvestPackageRemoveWaste[]>(url, mETRCHarvestPackageRemoveWaste);

  }

  postHarvestsFinish(mETRCHarvestFinish: METRCHarvestFinish[], site: ISite): Observable<any> {

    const controller = '/harvests/v1/finish'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCHarvestFinish[]>(url, mETRCHarvestFinish);

  }

  postHarvestsUnfinish(mETRCHarvestUnfinish: METRCHarvestUnfinish[], site: ISite): Observable<any> {

    const controller = '/harvests/v1/unfinish'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCHarvestUnfinish[]>(url, mETRCHarvestUnfinish);

  }



}
