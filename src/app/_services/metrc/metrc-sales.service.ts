import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { IMETRCSales } from 'src/app/_interfaces/transactions/metrc-sales';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/system/authentication.service';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from '../../_services/reporting/sites.service';

import {
  METRCCustomerTypeGet,
  METRCSalesDeliveries,
  METRCSalesDeliveryReturnReasonsGET,
  METRCSalesDeliveriesPOST,
  METRCSalesDeliveriesPUT,
  METRCSalesDeliveriesCompletePUT,
  METRCSalesReceipts,
  METRCSalesReceiptsPOSTPUT,
  METRCSalesTransactionsGET,
  METRCSalesTransactionsPOST,
  METRCSalesTransactionsPUT
} from '../../_interfaces/metrcs/sales';

@Injectable({
  providedIn: 'root'
})

export class MetrcSalesService {


  constructor( private http: HttpClient,
               private auth: AuthenticationService,
              ) {

              }

  getMETRCCustomerType(site: ISite): Observable<METRCCustomerTypeGet[]> {

    const controller = '/sales/v1/customertypes'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCCustomerTypeGet[]>(url);

  }

  getMETRCSalesDeliveriesInActive(site: ISite): Observable<METRCSalesDeliveries[]> {

    const controller = '/sales/v1/deliveries/inactive'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCSalesDeliveries[]>(url);

  }

  getMETRCSalesDeliveriesActive(site: ISite): Observable<METRCSalesDeliveries[]> {

    const controller = '/sales/v1/deliveries/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCSalesDeliveries[]>(url);

  }

  getMETRCSalesDeliveriesByID(id: number, site: ISite): Observable<METRCSalesDeliveries> {

    const controller = '/sales/v1/deliveries/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCSalesDeliveries>(url);

  }

  getMETRCSalesDeliveryReturnReasons(site: ISite): Observable<METRCSalesDeliveryReturnReasonsGET[]> {

    const controller = '/sales/v1/delivery/returnreasons'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCSalesDeliveryReturnReasonsGET[]>(url);

  }

  postMETRCSalesDeliveries(mETRCSalesDeliveriesPOST: METRCSalesDeliveriesPOST[], site: ISite): Observable<METRCSalesDeliveriesPOST[]> {

    const controller = '/sales/v1/deliveries'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCSalesDeliveriesPOST[]>(url, mETRCSalesDeliveriesPOST);

  }

  putMETRCSalesDeliveries(mETRCSalesDeliveriesPUT: METRCSalesDeliveriesPUT[], site: ISite): Observable<METRCSalesDeliveriesPUT[]> {
    const controller = '/sales/v1/deliveries'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.put<METRCSalesDeliveriesPUT[]>(url, mETRCSalesDeliveriesPUT);
  }

  putMETRCSalesDeliveriesComplete(mETRCSalesDeliveriesPUT: METRCSalesDeliveriesCompletePUT[], site: ISite): Observable<METRCSalesDeliveriesCompletePUT[]> {
    const controller = '/sales/v1/deliveries/complete'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.put<METRCSalesDeliveriesCompletePUT[]>(url, mETRCSalesDeliveriesPUT);

  }

  deleteMETRCSalesDelivery(id:number, site: ISite): Observable<any> {
    const controller = 'sales/v1/delivery/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.delete(url);

  }

  getMETRCSalesReceiptsActive(site: ISite): Observable<METRCSalesReceipts[]> {

    const controller = '/sales/v1/receipts/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCSalesReceipts[]>(url);

  }

  getMETRCSalesReceiptsInActive(site: ISite): Observable<METRCSalesReceipts[]> {

    const controller = '/sales/v1/receipts/inactive'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCSalesReceipts[]>(url);

  }

  getMETRCSalesReceipt(id: number, site: ISite): Observable<METRCSalesReceipts> {

    const controller = '/sales/v1/receipts/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCSalesReceipts>(url);

  }

  postMETRCSalesReceipts(mETRCSalesReceiptsPOST: METRCSalesReceiptsPOSTPUT[], id: number, site: ISite): Observable<METRCSalesReceiptsPOSTPUT[]> {

    const controller = '/sales/v1/receipts/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<METRCSalesReceiptsPOSTPUT[]>(url, mETRCSalesReceiptsPOST);

  }

  putMETRCSalesReceipts(mETRCSalesReceiptsPOSTPUT: METRCSalesReceiptsPOSTPUT[], id: number, site: ISite): Observable<METRCSalesReceiptsPOSTPUT[]> {

    const controller = '/sales/v1/receipts/'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.put<METRCSalesReceiptsPOSTPUT[]>(url, mETRCSalesReceiptsPOSTPUT);

  }

  deleteMETRCSalesReceipts(id:number,site: ISite): Observable<any> {

     const controller = '/sales/v1/receipts/'

     const endPoint = `${id}`

     const parameters = ''

     const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

     const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

     return this.http.delete(url);

  }

  getMETRCSalesTransactions(site: ISite): Observable<METRCSalesTransactionsGET[]> {

    const controller = '/sales/v1/transactions';

    const endPoint = ``;

    const parameters = '';

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`;

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`;

    return this.http.get<METRCSalesTransactionsGET[]>(url);

  }

  ///sales/v1/transactions/{salesDateStart}/{salesDateEnd}
  getMETRCSalesTransactionsByRange(salesDateStart: String, salesDateEnd: String, site: ISite): Observable<METRCSalesTransactionsGET[]> {
    const controller = '/sales/v1/transactions/';

    const endPoint = `${salesDateStart}/${salesDateEnd}`;

    const parameters = '';

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`;

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`;

    return this.http.get<METRCSalesTransactionsGET[]>(url);

  }

  postMETRCSalesTransactions(mETRCSalesTransactionsPOST: METRCSalesTransactionsPOST[], site: ISite, date: string): Observable<METRCSalesTransactionsPOST[]> {

    const controller =  '/sales/v1/transactions/';

    const endPoint = `${date}`;

    const parameters = '';

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`;

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`;

    return this.http.post<METRCSalesTransactionsPOST[]>(url, mETRCSalesTransactionsPOST);

  }

  putMETRCSalesTransactions(mETRCSalesTransactionsPUT: METRCSalesTransactionsPUT[], site: ISite, date: string): Observable<METRCSalesTransactionsPUT[]> {

    const controller =  '/sales/v1/transactions/';

    const endPoint = `${date}`;

    const parameters = '';

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`;

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`;

    return this.http.put<METRCSalesTransactionsPUT[]>(url, mETRCSalesTransactionsPUT);

  }

  //Sales from CCS.
  getMetrcSales(site: ISite):  Observable<IMETRCSales[]> {

    const controller = `/metrcSales/`

    const endPoint = `GetMetrcSales`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IMETRCSales[]>(url)

  }

  getMetrcSalesProcessed(site: ISite):  Observable<IMETRCSales[]> {

    const controller = `/metrcSales/`

    const endPoint =  `GetMetrcSalesProcessed`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IMETRCSales[]>(url)

  }

}

