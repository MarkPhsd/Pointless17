import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPOSOrder, IPOSPayment, OperationWithAction } from 'src/app/_interfaces';
import { CmdResponse, TranResponse } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

export  interface refundResponse  {
  errorMessage: string;
  payment : IPOSPayment;
  order: IPOSOrder;
  response : TranResponse;
}
export  interface DCAPPaymentResponse  {
  errorMessage: string;
  payment : IPOSPayment;
  response : TranResponse;
  order: IPOSOrder;
  success: boolean;
}
export interface DCAPAndroidRStream {
  CmdResponse: {
    ResponseOrigin: string;
    DSIXReturnCode: string;
    CmdStatus: string;
    TextResponse: string;
    SequenceNo: string;
    UserTrace: string;
  };
  TranResponse: {
    MerchantID: string;
    AcctNo: string;
    CardType: string;
    TranCode: string;
    AuthCode: string;
    CaptureStatus: string;
    RefNo: string;
    InvoiceNo: string;
    Amount: {
      Purchase: number;
      Authorize: number;
    };
    AcqRefData: string;
    ProcessData: string;
    RecordNo: string;
    EntryMethod: string;
    Date: string;
    Time: string;
    ApplicationLabel: string;
    AID: string;
    TVR: string;
    IAD: string;
    TSI: string;
    CVM: string;
    PayAPI_Id: string;
  };
  PrintData: {
    Line1: string;
    LineN: string;

    // Line2: string;
    // Line3: string;
    // Line4: string;
    // Line5: string;
    // Line6: string;
    // Line7: string;
    // Line8: string;
    // Line9: string;
    // Line10: string;
    // Line11: string;
    // Line12: string;
    // Line13: string;
    // Line14: string;
    // Line15: string;
    // Line16: string;
    // Line17: string;
    // Line18: string;
    // Line19: string;
    // Line20: string;
    // Line21: string;
    // Line22: string;
    // Line23: string;
    // Line24: string;
    // Line25: string;
    // Line26: string;
    // Line27: string;
    // Line28: string;
    // Line29: string;
    // Line30: string;
  };
}


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
  authorize?: string;
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
  TranType?: string;
}
@Injectable({
  providedIn: 'root'
})
export class DcapService {


  site = this.siteService.getAssignedSite()
  constructor(private http: HttpClient,
              private siteService: SitesService
              ) { }

  adustByRecordNoV2(device: string, payment: IPOSPayment, amount: number) : Observable<DCAPPaymentResponse>{

    const controller = '/dCap/'

    const endPoint = "AdjustByRecordNoV2"

    const parameters = `?deviceName=${device}&gratuity=${amount}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<DCAPPaymentResponse>(url, payment)
  }

  adustByRecordNo(device: string, payment: IPOSPayment, amount: number) {

    const controller = '/dCap/'

    const endPoint = "AdjustByRecordNo"

    const parameters = `?deviceName=${device}&gratuity=${amount}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, payment)
  }

  voidByRecordNumber(name: string, id: number) {

    const controller = '/dCap/'

    const endPoint = "voidByRecordNumber"

    const parameters = `?deviceName=${name}&id=${id}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<refundResponse>(url)
  }


  voidSaleByInvoiceNo(name: string, id: number) {

    const controller = '/dCap/'

    const endPoint = "VoidByInvoiceNo"

    const parameters = `?deviceName=${name}&id=${id}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<refundResponse>(url)
  }


  refundByRecordNo(name: string, history: boolean, id: number, removeTipOnly): Observable<refundResponse> {

    const controller = '/dCap/'

    const endPoint = "RefundByRecordNo"

    const parameters = `?deviceName=${name}&history=${history}&id=${id}&removeTipOnly=${removeTipOnly}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<refundResponse>(url)
  }

  batchClose(device: string) : Observable<any> {

    const controller = '/dCap/'

    const endPoint = "batchClose"

    const parameters = `?deviceName=${device}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)
  }

  batchSummary(device: string) : Observable<any> {

    const controller = '/dCap/'

    const endPoint = "batchSummary"

    const parameters = `?deviceName=${device}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)
  }


  transactionCancel(deviceName: string): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "TransactionCancel"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)
  }

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

  payAmountV2Debit(deviceName: string, posPayment: IPOSPayment): Observable<DCAPPaymentResponse> {

    const controller = '/dCap/'

    const endPoint = "payAmountV2Debit"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  payAmountV2Credit(deviceName: string, posPayment: IPOSPayment): Observable<DCAPPaymentResponse> {

    const controller = '/dCap/'

    const endPoint = "PayAmountV2Credit"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }


  payAmountV2(deviceName: string, posPayment: IPOSPayment): Observable<DCAPPaymentResponse> {

    const controller = '/dCap/'

    const endPoint = "payAmountv2"

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

  payAmountManualV2(deviceName: string, posPayment: IPOSPayment): Observable<DCAPPaymentResponse> {

    const controller = '/dCap/'

    const endPoint = "payAmountManualV2"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, posPayment)
  }

  returnAmountV2(deviceName: string, posPayment: IPOSPayment, manual: boolean): Observable<DCAPPaymentResponse> {

    const controller = '/dCap/'

    const endPoint = "RefundAmountV2"

    const parameters = `?deviceName=${deviceName}&manual=${manual}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<DCAPPaymentResponse>(url, posPayment)
  }

  voidSaleByRecordNoV2(action: OperationWithAction): Observable<DCAPPaymentResponse> {

    const controller = '/dCap/'

    const endPoint = "VoidByRecordNumberV2"

    const parameters = ``

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.post<DCAPPaymentResponse>(url, action)
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

    const endPoint = "incrementalAuthByRecordNo"

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
