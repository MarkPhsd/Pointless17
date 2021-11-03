import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {
  METRCPlantBatchesGET,
  METRCPlantBatchesTypesGET,
  METRCPlantBatchesCreatePlantingsPOST,
  METRCPlantBatchesCreatePackagesPOST,
  METRCPlantBatchesSplitPOST,
  METRCPlantBatchsCreatePackagesFromMOtherPlantPOST,
  METRCPlantBatchesChangeGrowthPhasePOST,
  METRCPlantBatchesMovePlanBatchesPUT,
  METRCPLantBatchesAdditivesPOST,
  METRCPlantBatchesDestroyPOST

} from '../../_interfaces/metrcs/plant-batches';

@Injectable({
  providedIn: 'root'
})
export class MetrcPlantsBatchesService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {

   }
  //  https://join.zoho.com/444554141

   getMETRCPlantBatches(id:number, site: ISite): Observable<METRCPlantBatchesGET[]> {

    const controller = '/plantbatches/v1/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantBatchesGET[]>(url);

  }


  getMETRCPlantBatchesActive(site: ISite): Observable<METRCPlantBatchesGET[]> {

    const controller = '/plantbatches/v1/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantBatchesGET[]>(url);

  }
  getMETRCPlantBatchesInActive(site: ISite): Observable<METRCPlantBatchesGET[]> {

    const controller = '/plantbatches/v1/inActive'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantBatchesGET[]>(url);

  }

  getMETRCPlantBatchesTypes(id:number, site: ISite): Observable<METRCPlantBatchesTypesGET[]> {

    const controller = '/plantbatches/v1/inActive'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantBatchesTypesGET[]>(url);

  }

  postMETRCPlantBatchesCreatePlantings(mETRCPlantBatchesCreatePlantingsPOST: METRCPlantBatchesCreatePlantingsPOST[], site: ISite): Observable<any> {

    const controller = '/plantbatches/v1/createPlantings'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<any>(url,mETRCPlantBatchesCreatePlantingsPOST);

  }

  postMETRCPlantBatchesCreatePackages(mETRCPlantBatchesCreatePackagesPOST: METRCPlantBatchesCreatePackagesPOST[], site: ISite): Observable<any> {
    const controller = '/plantbatches/v1/createPlantings'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantBatchesCreatePackagesPOST[]>(url, mETRCPlantBatchesCreatePackagesPOST);

  }

  postMETRCPlantBatchesSplit(mETRCPlantBatchesSplitPOST: METRCPlantBatchesSplitPOST[], site: ISite): Observable<any> {
    const controller = '/plantbatches/v1/split'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantBatchesSplitPOST[]>(url, mETRCPlantBatchesSplitPOST);

  }

  postMETRCPlantBatchsCreatePackagesFromMOtherPlant(mETRCPlantBatchsCreatePackagesFromMOtherPlantPOST: METRCPlantBatchsCreatePackagesFromMOtherPlantPOST[], site: ISite): Observable<any> {
    const controller = '/plantbatches/v1/create/packages/frommotherplant'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantBatchsCreatePackagesFromMOtherPlantPOST[]>(url, mETRCPlantBatchsCreatePackagesFromMOtherPlantPOST);

  }


  postMETRCPlantBatchesChangeGrowthPhase(mETRCPlantBatchesChangeGrowthPhasePOST: METRCPlantBatchesChangeGrowthPhasePOST[], site: ISite): Observable<any> {
    const controller = '/plantbatches/v1/changeGrowthPhase'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantBatchesChangeGrowthPhasePOST[]>(url, mETRCPlantBatchesChangeGrowthPhasePOST);

  }

  putMETRCPlantBatchesMovePlanBatches(mETRCPlantBatchesMovePlanBatchesPUT: METRCPlantBatchesMovePlanBatchesPUT[], site: ISite): Observable<any> {
    const controller = '/plantbatches/v1/moveplantbatches'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.put<METRCPlantBatchesMovePlanBatchesPUT[]>(url, mETRCPlantBatchesMovePlanBatchesPUT);

  }

  postMETRCPLantBatchesAdditives(mETRCPLantBatchesAdditivesPOST: METRCPLantBatchesAdditivesPOST[], site: ISite): Observable<any> {
    const controller = '/plantbatches/v1/additives'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPLantBatchesAdditivesPOST[]>(url, mETRCPLantBatchesAdditivesPOST);

  }

  postMETRCPlantBatchesDestroy(mETRCPlantBatchesDestroyPOST: METRCPlantBatchesDestroyPOST[], site: ISite): Observable<any> {
    const controller = '/plantbatches/v1/destroy'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantBatchesDestroyPOST[]>(url, mETRCPlantBatchesDestroyPOST);

  }


}
