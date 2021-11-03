import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {
  METRCPackage,
  METRCPackageTypes,
  PackageFilter,
  METRCPackagesAdjustReasonsGet,
  METRCPackagesCreatePOST,
  METRCPackagesCreateTesting,
  METRCPackagesCreatePlantings,
  METRCPacakgesChangeItem,
  METRCPackagesChangeNote,
  METRCPackagesChangeLocations,
  METRCPacakgesAdjust,
  METRCPackagesFinish,
  METRCPackagesUnfinish,
  METRCPackagesRemediate
} from '../../_interfaces/metrcs/packages';

@Injectable({
  providedIn: 'root'
})

export class MetrcPackagesService {

  //example date range &lastModifiedStart=2021-02-26T17:30:00Z&lastModifiedEnd=2021-02-27T17:30:00Z
  activeDateRange = ``

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
  ) {
    }

    getPackagesByID(id:any, site: ISite): Observable<METRCPackage> {

      const controller = '/METRCPackages/'

      const endPoint = `GetMETRCPackage`

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      console.log(url)
      return this.http.get<METRCPackage>(url);

    }

    getPackagesByLabel(label:string, site: ISite): Observable<METRCPackage> {

      const controller = '/METRCPackages/'

      const endPoint = `GetMETRCPackageByLabel`

      const parameters = `${label}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return this.http.get<METRCPackage>(url);

    }

    getActive(site: ISite, packageFilter: PackageFilter): Observable<METRCPackage[]> {

      const controller = '/METRCPackages/'

      const endPoint = `GetMETRCPackages`

      packageFilter.hasImported = false

      const url = `${site.url}${controller}${endPoint}`

      return this.http.post<METRCPackage[]>(url, packageFilter);

    }

    getInActive(site: ISite, packageFilter: PackageFilter): Observable<METRCPackage[]> {

      const controller = '/METRCPackages/'

      const endPoint = `GetMETRCPackages`

      packageFilter.hasImported = false

      const url = `${site.url}${controller}${endPoint}`

      return this.http.post<METRCPackage[]>(url, packageFilter);

    }

    getOnHold(site: ISite): Observable<METRCPackage[]> {

      const controller = '/packages/v1/onHold'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.get<METRCPackage[]>(url);

    }

    getTypes(site: ISite): Observable<METRCPackage[]> {

      const controller = '/packages/v1/types'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.get<METRCPackage[]>(url);

    }

    getAdjustReasons(site: ISite): Observable<METRCPackagesAdjustReasonsGet[]> {

      const controller = '/packages/v1/adjust/reasons'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.get<METRCPackagesAdjustReasonsGet[]>(url);

    }

    postPackages(mETRCPackagesCreatePOST: METRCPackagesCreatePOST[], site: ISite): Observable<METRCPackagesCreatePOST[]> {

      const controller = '/packages/v1/create'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPackagesCreatePOST[]>(url,mETRCPackagesCreatePOST);

    }

    postPackagesCreateTesting(mETRCPackagesCreateTesting: METRCPackagesCreateTesting[], site: ISite): Observable<METRCPackagesCreateTesting[]> {

      const controller = '/packages/v1/create/testing'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPackagesCreateTesting[]>(url, mETRCPackagesCreateTesting);

    }

    postPackagesCreatePlantings(mETRCPackagesCreatePlantings: METRCPackagesCreatePlantings[], site: ISite): Observable<METRCPackagesCreatePlantings[]> {

      const controller = '/packages/v1/create/plantings'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPackagesCreatePlantings[]>(url, mETRCPackagesCreatePlantings);

    }

    postPacakgesChangeItem(mETRCPacakgesChangeItem: METRCPacakgesChangeItem[], site: ISite): Observable<METRCPacakgesChangeItem[]> {

      const controller = '/packages/v1/change/item'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPacakgesChangeItem[]>(url, mETRCPacakgesChangeItem);

    }

    postPacakgesChangeNote(mETRCPackagesChangeNote: METRCPackagesChangeNote[], site: ISite): Observable<METRCPackagesChangeNote[]> {

      const controller = '/packages/v1/change/note'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPackagesChangeNote[]>(url, mETRCPackagesChangeNote);

    }

    postPackagesChangeLocations(mETRCPackagesChangeNote: METRCPackagesChangeLocations[], site: ISite): Observable<METRCPackagesChangeLocations[]> {

      const controller = '/packages/v1/change/locations'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPackagesChangeLocations[]>(url, mETRCPackagesChangeNote);
    }

    postPacakgesAdjust(mETRCPacakgesAdjust: METRCPacakgesAdjust[], site: ISite): Observable<METRCPacakgesAdjust[]> {

      const controller = '/packages/v1/adjust'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPacakgesAdjust[]>(url, mETRCPacakgesAdjust);
    }

    postPackagesfinish(mETRCPacakgesAdjust: METRCPackagesFinish[], site: ISite): Observable<METRCPackagesFinish[]> {

      const controller = '/packages/v1/finish'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPackagesFinish[]>(url, mETRCPacakgesAdjust);
    }

    postPackagesUnfinish(mETRCPacakgesAdjust: METRCPackagesUnfinish[], site: ISite): Observable<METRCPackagesUnfinish[]> {

      const controller = '/packages/v1/unfinish'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPackagesUnfinish[]>(url, mETRCPacakgesAdjust);
    }

    postPackagesRemediate(mETRCPackagesRemediate: METRCPackagesRemediate[], site: ISite): Observable<METRCPackagesRemediate[]> {

      const controller = '/packages/v1/remediate'

      const endPoint = ``

      const parameters = ''

      const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

      const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

      return this.http.post<METRCPackagesRemediate[]>(url, mETRCPackagesRemediate);
    }



    generateSku(sku: string, index: number): string {
      return `mt${sku.substring(sku.length - 7)}-${index}`
    }
}
