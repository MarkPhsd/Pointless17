import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import {
   METRCTransfersIncomingGET,
   METRCTransfersOutgoingGet,
   METRCTransfersRejectedGet,
   METRCTransfersDeliveriesGET,
   METRCTransfersDeliveryPackagesGET,
   METRCTransfersDeliveryPackagesWholeSaleGET,
   METRCTransfersDeliveryPackagesRequiredLabTestBatchesGET,
   METRCTransfersDeliveryPackagesStatesGet,
   METRCTransfersExternalIncomingPOST,
   METRCTransfersExternalIncomingPUT,
   METRCTransfersTemplatesGet,
   METRCTansfersTemplatesDeliveriesGet,
   MetrcTransfersTemplatesDeliveryPackagesGet,
   METRCTransfersTemplatesPOST,
   METRCTransfersTypesGet,
} from 'src/app/_interfaces/metrcs/transfers'

@Injectable({
  providedIn: 'root'
})

export class MetrcTransfersService {

  constructor( private http: HttpClient, private auth: AuthenticationService, ) { }

  getTransfersIncoming(site: ISite):  Observable<METRCTransfersIncomingGET[]> {

    const controller = '/transfers/v1/'

    const endPoint = 'incoming'

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersIncomingGET[]>(url);

  }

  getTransfersOutgoing(site: ISite):  Observable<METRCTransfersOutgoingGet[]> {

    const controller = '/transfers/v1/'

    const endPoint = 'outgoing'

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersOutgoingGet[]>(url);

  }

  getTransfersRejected(site: ISite):  Observable<METRCTransfersRejectedGet[]> {

    const controller = '/transfers/v1/'

    const endPoint = 'rejected'

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersRejectedGet[]>(url);

  }

  getTransfersDeliveries(id: number,site: ISite):  Observable<METRCTransfersDeliveriesGET[]> {

    const controller = '/transfers/v1/'

    const endPoint = `${id}/deliveries`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersDeliveriesGET[]>(url);

  }

  getTransfersDeliveryPackagesGet(id: number, site: ISite):  Observable<METRCTransfersDeliveryPackagesGET[]> {

    const controller = '/transfers/v1/deliveries/'

    const endPoint = `${id}/packages`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersDeliveryPackagesGET[]>(url);

  }

  getTransfersDeliveryPackagesWholeSale(id: number, site: ISite):  Observable<METRCTransfersDeliveryPackagesWholeSaleGET[]> {

    const controller = '/transfers/v1/deliveries/'

    const endPoint = `${id}/packages/wholesale`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersDeliveryPackagesWholeSaleGET[]>(url);

  }

  getTransfersDeliveryPackagesRequiredLabTestBatches(id: number, site: ISite):  Observable<METRCTransfersDeliveryPackagesRequiredLabTestBatchesGET[]> {

    const controller = '/transfers/v1/delivery/packages'

    const endPoint = `${id}/requiredlabtestbatches`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersDeliveryPackagesRequiredLabTestBatchesGET[]>(url);

  }

  getTransfersDeliveryPackagesStates(site: ISite):  Observable<METRCTransfersDeliveryPackagesStatesGet[]> {

    const controller = '/transfers/v1/delivery/packages/states'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersDeliveryPackagesStatesGet[]>(url);

  }

  postTransfersExternalIncoming(mETRCTransfersExternalIncomingPOST: METRCTransfersExternalIncomingPOST[], site: ISite) {

    const controller = '/transfers/v1/external/incoming'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post(url, mETRCTransfersExternalIncomingPOST);

  }

  putTransfersExternalIncoming(mETRCTransfersExternalIncomingPUT: METRCTransfersExternalIncomingPUT[], site: ISite) {

    const controller = '/transfers/v1/external/incoming'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.put(url, mETRCTransfersExternalIncomingPUT);

  }

  dELETETransfersExternalIncoming(id: number, site: ISite) {

    const controller = '/transfers/v1/external/incoming'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.delete(url);

  }

  getMETRCTransfersTemplates(site: ISite):  Observable<METRCTransfersTemplatesGet[]> {

    const controller = '/transfers/v1/templates'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersTemplatesGet[]>(url);

  }

  getMETRCTansfersTemplatesDeliveries(id: number, site: ISite):  Observable<METRCTansfersTemplatesDeliveriesGet[]> {

    const controller = '/transfers/v1/templates/'

    const endPoint = `${id}/deliveries`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTansfersTemplatesDeliveriesGet[]>(url);

  }

  getMetrcTransfersTemplatesDeliveryPackages(id: number, site: ISite):  Observable<MetrcTransfersTemplatesDeliveryPackagesGet[]> {

    const controller = '/transfers/v1/templates/delivery/'

    const endPoint = `${id}/packages`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<MetrcTransfersTemplatesDeliveryPackagesGet[]>(url);

  }

  postMETRCTransfersTemplates(mETRCTransfersTemplatesPOST: METRCTransfersTemplatesPOST[], site: ISite) {
    const controller = '/transfers/v1/templates'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post(url, mETRCTransfersTemplatesPOST);

  }

  putMETRCTransfersTemplates(mETRCTransfersTemplatesPOST: METRCTransfersTemplatesPOST[], site: ISite) {
    const controller = '/transfers/v1/templates'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post(url, mETRCTransfersTemplatesPOST);

  }

  deleteTransferTemplates(id: number, site: ISite): Observable<any> {

    const controller = '/transfers/v1/templates/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.delete<any>(url);

  }

  getMETRCTransfersTypes(site: ISite): Observable<METRCTransfersTypesGet[]> {

    const controller = '/transfers/v1/types'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCTransfersTypesGet[]>(url);

  }

}
