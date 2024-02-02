import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPOSPayment } from 'src/app/_interfaces';
import { CmdResponse } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

export interface   DcapRStream {
  CmdResponse?: CmdResponse;
  ResponseOrigin?: string;
  DSIXReturnCode?: string;
  CmdStatus?: string;
  TextResponse?: string;
  SequenceNo?: string;
  UserTrace?: string;
  MerchantID?: string;
  AcctNo?: string;
  CardType?: string;
  TranCode?: string;
  AuthCode?: string;
  CaptureStatus?: string;
  CardHolderID?: string;
  RefNo?: string;
  InvoiceNo?: string;
  OperatorID?: string;
  ExpDateMonth?: string;
  ExpDateYear?: string;
  PayAPI_Id?: string;
  ProcessorToken?: string;
  Purchase?: string;
  Gratuity?: string;
  SurchargeWithLookup?: string;
  CashBack?: string;
  Tax?: string;
  Authorize?: string;
  CardholderName?: string;
  AcqRefData?: string;
  PostProcess?: string;
  ProcessData?: string;
  RecordNo?: string;
  EntryMethod?: string;
  Date?: string;
  Time?: string;
  ApplicationLabel?: string;
  AID?: string;
  TVR?: string;
  IAD?: string;
  TSI?: string;
  ARC?: string;
  CVM?: string;
  ReceiptLanguage?: string;
  CustomerReceiptLanguage?: string;
  ISORespCode?: string;
}
@Injectable({
  providedIn: 'root'
})
export class DcapService {


  site = this.siteService.getAssignedSite()
  constructor(private http: HttpClient,
              private siteService: SitesService
              ) { }

  resetDevice(deviceName: string): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "ResetDevice"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)
  }

  emvParamDownload(deviceName: string): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "paramDownload"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)
  }

  // PostProcess

  payAmount(deviceName: string, posPayment: IPOSPayment): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "payAmount"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  payAmountManual(deviceName: string, posPayment: IPOSPayment): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "payAmountManual"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  voidSaleByRecordNo(deviceName: string, id: number, device): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "VoidByRecordNo"

    const parameters = `?deviceName=${deviceName}&id=${id}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)
  }

  returnAmount(deviceName: string, posPayment: IPOSPayment, manual: boolean): Observable<DcapRStream> {

    const controller = '/dCap/'

    const endPoint = "refundAmount"

    const parameters = `?deviceName=${deviceName}&manual=${manual}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  preAuth(deviceName: string, posPayment: IPOSPayment, manual: boolean): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "preAuth"

    const parameters = `?deviceName=${deviceName}&manual=${manual}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  preAuthCaptureByRecordNo(deviceName: string, posPayment: IPOSPayment): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "preAuthCaptureByRecordNo"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  //To increase the authorized amount of a previous PreAuth transaction
  incrementalAuthByRecordNo(deviceName: string, posPayment: IPOSPayment): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "preAuthCapture"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  //To add a gratuity to a previously processed EMVPreAuth transaction and capture the transaction to the current batch.
  preAuthCapture(deviceName: string, posPayment: IPOSPayment): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "preAuthCapture"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  zeroAuth(deviceName: string, posPayment: IPOSPayment): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "EMVZeroAuth"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }


}
