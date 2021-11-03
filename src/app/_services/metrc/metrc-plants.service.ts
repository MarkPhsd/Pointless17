import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {
    METRCPlantsGet,
    METRCPlantsAdditivesGet,
    METRCPlantsGrowthPhasesGET,
    METRCPlantsAdditivesTypesGET,
    METRCPlantsWasteMethodsGET,
    METRCPlantsWasteReasonsGet,
    METRCPlantsMovePlantsPOST,
    METRCPlantsChangeGrowthPhasesPOST,
    METRCPOSTPlantsDestroyPlantsPOST,
    METRCPlantsAdditivesPOST,
    METRCPlantsAdditivesByLocationPOST,
    METRCPlantsCreatePlantingsPOST,
    METRCPlantsCreatePlantBatchPackagePOST,
    METRCPlantsManicurePlantPOST,
    METRCPlantsHarvestPlantsPOST
} from '../../_interfaces/metrcs/plants';

@Injectable({
  providedIn: 'root'
})
export class MetrcPlantsService {

  constructor( private http: HttpClient,
    private auth: AuthenticationService,
   ) {

   }

   getMETRCPlants(id:number, site: ISite): Observable<METRCPlantsGet[]> {

    const controller = '/plants/v1/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsGet[]>(url);

  }


  getMETRCPlantsByLabel(label:string, site: ISite): Observable<METRCPlantsAdditivesGet[]> {

    const controller = '/plants/v1/'

    const endPoint = `${label}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsAdditivesGet[]>(url);

  }

  getMETRCPlantsVegatative(site:ISite): Observable<METRCPlantsGet[]> {

    const controller = '/plants/v1/vegetative'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsGet[]>(url);

  }

  getMETRCPlantsflowering(site:ISite): Observable<METRCPlantsGet[]> {

    const controller = '/plants/v1/flowering'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsGet[]>(url);

  }

  getMETRCPlantsOnHold(site:ISite): Observable<METRCPlantsGet[]> {

    const controller = '/plants/v1/onhold'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsGet[]>(url);

  }

  getMETRCPlantsinActive(site:ISite): Observable<METRCPlantsGet[]> {

    const controller = '/plants/v1/inactive'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsGet[]>(url);

  }

  getMETRCPlantsAdditives(site:ISite): Observable<METRCPlantsAdditivesGet[]> {

    const controller = '/plants/v1/additives'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsAdditivesGet[]>(url);

  }

  getMETRCPlantsGrowthPhases(site:ISite): Observable<METRCPlantsGrowthPhasesGET[]> {

    const controller = '/plants/v1/growthhases'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsGrowthPhasesGET[]>(url);

  }

  getMETRCPlantsAdditivesTypes(site:ISite): Observable<METRCPlantsAdditivesTypesGET[]> {

    const controller = '/plants/v1/additives/types'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsAdditivesTypesGET[]>(url);

  }


  getMETRCPlantsWasteMethods(site:ISite): Observable<METRCPlantsWasteMethodsGET[]> {

    const controller = '/plants/v1/waste/methods'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsWasteMethodsGET[]>(url);

  }

  getMETRCPlantsWasteReasons(site:ISite): Observable<METRCPlantsWasteReasonsGet[]> {

    const controller = '/plants/v1/waste/reasons'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCPlantsWasteReasonsGet[]>(url);

  }

  postMETRCPlantsMovePlants(mETRCPlantsMovePlantsPOST: METRCPlantsMovePlantsPOST[] , site: ISite): any {

    const controller = '/plants/v1/move/plants'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantsWasteReasonsGet[]>(url,mETRCPlantsMovePlantsPOST);

  }

  postMETRCPlantsChangeGrowthPhases(mETRCPlantsChangeGrowthPhasesPOST: METRCPlantsChangeGrowthPhasesPOST[] , site: ISite): any {

    const controller = '/plants/v1/changeGrowthPhases'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantsChangeGrowthPhasesPOST[]>(url, mETRCPlantsChangeGrowthPhasesPOST);

  }

  postMETRCPOSTPlantsDestroyPlants(mETRCPOSTPlantsDestroyPlantsPOST: METRCPOSTPlantsDestroyPlantsPOST[] , site: ISite): any {

    const controller = '/plants/v1/destroyplants'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPOSTPlantsDestroyPlantsPOST[]>(url, mETRCPOSTPlantsDestroyPlantsPOST);

  }

  postMETRCPlantsAdditives(mETRCPlantsAdditivesPOST: METRCPlantsAdditivesPOST[] , site: ISite): any {

    const controller = '/plants/v1/additives'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantsAdditivesPOST[]>(url, mETRCPlantsAdditivesPOST);

  }


  postMETRCPlantsAdditivesByLocation(mETRCPlantsAdditivesByLocationPOST: METRCPlantsAdditivesByLocationPOST[] , site: ISite): any {
    const controller = '/plants/v1/additives/bylocation'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantsAdditivesByLocationPOST[]>(url, mETRCPlantsAdditivesByLocationPOST);

  }

  postMETRCPlantsCreatePlantings(mETRCPlantsCreatePlantingsPOST: METRCPlantsCreatePlantingsPOST[] , site: ISite): any {
    const controller = '/plants/v1/create/plantings'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantsCreatePlantingsPOST[]>(url, mETRCPlantsCreatePlantingsPOST);

  }

  postMETRCPlantsCreatePlantBatchPackage(mETRCPlantsCreatePlantBatchPackagePOST: METRCPlantsCreatePlantBatchPackagePOST[] , site: ISite): any {
    const controller = '/plants/v1/create/plantbatch/packages'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantsCreatePlantBatchPackagePOST[]>(url, mETRCPlantsCreatePlantBatchPackagePOST);

  }

  postMETRCPlantsManicurePlant(mETRCPlantsManicurePlantPOST: METRCPlantsManicurePlantPOST[] , site: ISite): any {
    const controller = '/plants/v1/manicureplants'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantsManicurePlantPOST[]>(url, mETRCPlantsManicurePlantPOST);
  }


  postMETRCPlantsHarvestPlants(mETRCPlantsHarvestPlantsPOST: METRCPlantsHarvestPlantsPOST[] , site: ISite): any {
    const controller = '/plants/v1/harvestplants'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCPlantsHarvestPlantsPOST[]>(url, mETRCPlantsHarvestPlantsPOST);

  }


}
