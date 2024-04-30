import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable,  } from 'rxjs';
import { IPaymentResponse, IPaymentSearchModel, IPOSOrder, IPOSPayment,
         IPOSPaymentsOptimzed, ISite, OperationWithAction }   from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { IPaymentMethod } from './payment-methods.service';

// Generated by https://quicktype.io

@Injectable({
  providedIn: 'root'
})
export class POSPaymentService {



  private _searchModel          = new BehaviorSubject<IPaymentSearchModel>(null);
  public searchModel$           = this._searchModel.asObservable();

  private _currentPayment       = new BehaviorSubject<IPOSPayment>(null);
  public currentPayment$        = this._currentPayment.asObservable();

  isApp                         = false;

  private _paymentWithAction       = new BehaviorSubject<OperationWithAction>(null);
  public paymentWithAction$        = this._paymentWithAction.asObservable();


  updateSearchModel(searchModel: IPaymentSearchModel) {
    this._searchModel.next(searchModel);
  }

  updatePaymentSubscription(order: IPOSPayment) {
    this._currentPayment.next(order);
  }

  updateItemWithAction(item: OperationWithAction ) {
    this._paymentWithAction.next(item);
  }

  constructor(
    private http: HttpClient,
    private _SnackBar: MatSnackBar,
    private _fb: UntypedFormBuilder,
            )
  {

  }

  getCreditTipTotals(site: ISite, id: number): Observable<number> {
    
    const controller = "/POSPayments/";

    const endPoint = "getCreditTipTotals";

    const parameters = `?reportID=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>( url )

  }

  processDCAPPreAuthResponse(site: ISite, paymentID: number, response, deviceName): Observable<IPaymentResponse> {

    const controller = "/POSPayments/";

    const endPoint = "processDCAPResponse";

    const parameters = `?id=${paymentID}&deviceName=${deviceName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>( url , response )

  }

  processDCAPResponse(site: ISite, paymentID: number, response, deviceName): Observable<IPaymentResponse> {

    const controller = "/POSPayments/";

    const endPoint = "processDCAPResponse";

    const parameters = `?id=${paymentID}&deviceName=${deviceName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>( url , response )

  }

  getPaymentSummaryByGroups(site: ISite, id: number, history: boolean): Observable<IPOSPaymentsOptimzed> {

    const devicename = localStorage.getItem('devicename')

    const controller = '/POSPayments/'

    const endPoint  = 'getPaymentSummaryByGroups'

    const parameters = `?reportRunID=${id}&history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSPaymentsOptimzed>(url);

  }

  makePayment(site: ISite, payment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Observable<IPaymentResponse> {

    const devicename = localStorage.getItem('devicename')

    const payLoad  = { order, payment: payment, amount: amount, paymentMethod, deviceName: devicename }

    const controller = '/POSPayments/'

    const endPoint  = 'makePayment'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPaymentResponse>(url, payLoad);

  }


  makeStripePayment(site: ISite, payment: IPOSPayment, order: IPOSOrder): Observable<IPaymentResponse> {

    const payLoad  = { amount: payment.amountPaid, order, payment }

    const controller = '/POSPayments/'

    const endPoint  = 'makeStripePayment'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPaymentResponse>(url, payLoad);

  }

  getPOSPayment(site: ISite, id: number, history: boolean): Observable<IPOSPayment> {
    const controller = '/POSPayments/'

    const endPoint  = 'GetPOSPayment'

    const parameters = `?id=${id}&history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSPayment>(url);
  }


  getFullPaymentInfo(site: ISite, id: number, history: boolean): Observable<IPOSPayment> {
    const controller = '/POSPayments/'

    const endPoint  = 'GetPOSPayment'

    const parameters = `?id=${id}&history=${history}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IPOSPayment>(url);
  }

  putPOSPayment(site: ISite, payment: IPOSPayment): Observable<IPOSPayment> {
    const controller = '/POSPayments/'

    const endPoint  = 'PutPOSPayment'

    const parameters = `?id=${payment.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<IPOSPayment>(url, payment);
  }

  postPOSPayment(site: ISite, payment: IPOSPayment): Observable<IPOSPayment> {
    const controller = '/POSPayments/'

    const endPoint  = 'PostPOSPayment'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPOSPayment>(url, payment);
  }

  savePOSPayment(site: ISite, payment: IPOSPayment) {

    console.log('save pos payment', payment.id)
    if (payment.id == 0) {
      return this.postPOSPayment(site, payment)
    }
    if (payment.id != 0) {
      return this.putPOSPayment(site, payment)
    }

  }

  deletePOSPayment(site: ISite, id: number): Observable<IPOSPayment> {
    const controller = '/POSPayments/'

    const endPoint  = 'deletePOSPayment'

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<IPOSPayment>(url);
  }

  voidPayment(site: ISite, paymentWithAction: OperationWithAction): Observable<OperationWithAction> {

    const controller = "/POSPayments/"

    const endPoint = "VoidPayment"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<OperationWithAction>(url, paymentWithAction)

  }

  notificationEvent(description, title){
    this._SnackBar.open ( description, title , {
      duration: 2000,
      verticalPosition: 'top'
    })
  }

  remotePrintMessage(site: ISite, remotePrint: any): Observable<boolean> {
    const controller = '/POSPayments/'

    const endPoint  = 'RemotePrintMessage'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<boolean>(url, remotePrint);
  }


  searchPayments(site: ISite, searchModel: IPaymentSearchModel): Observable<IPOSPaymentsOptimzed> {
    const controller = '/POSPayments/'

    const endPoint  = 'SearchPayments'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IPOSPaymentsOptimzed>(url, searchModel);
  }


  initForm(fb: UntypedFormGroup): UntypedFormGroup {
    // const serializedDate = new Date(user?.dob)
         fb = this._fb.group({
            id:                  [],
            paymentMethodID:           [],
            amountPaid:           [],
            checkNumber:          [],
            saleType:             [],
            groupNumber:          [],
            approvalCode:        [], //string
            preAuth:             [], //string
            isBatched:           [], //string
            cardHolder:          [], //string
            getResult:            [],
            getRefNumber:         [],
            getTroutID:           [],
            userID:              [], //string
            cardNum:             [], //string
            refNumber:           [], //string
            ccNumber:            [], //string
            amountReceived:       [],
            tipAmount:            [],
            exp:                 [], //string
            clientID:             [],
            groupID:              [],
            groupDate:           [], //string
            orderDate:           [], //string
            serviceTypeID:        [],
            employeeID:           [],
            zrun:                [], //string
            completionDate:      [], //string
            reportRunID:          [],
            registerTransaction: [], //string
            positiveNegative:     [],
            serviceType:         [], //string
            employeeName:        [], //string
            cAddress:            [], //string
            cAddress2:           [], //string
            cCity:               [], //string
            cState:              [], //string
            cZip:                [], //string
            invoicedDate:        [], //string
            driverID:             [],
            vehicle:             [], //string
            origin:              [], //string
            destination:         [], //string
            accountNum:          [], //string
            clientName:          [], //string
            cvc:                 [], //string
            managerID:            [],
            batchDate:           [], //string
            discountGiven:        [],
            siteID:               [],
            giftCardID:           [],
            dlNumber:            [], //string
            processData:         [], //string
            gcBalance:            [],
            voidReason:          [], //string
            voidAmount:           [],
            applicationLabel:    [], //string
            aid:                 [], //string
            tvr:                 [], //string
            iad:                 [], //string
            tsi:                 [], //string
            arc:                 [], //string
            emvTime:             [], //string
            emvDate:             [], //string
            emvcvm:              [], //string
            entryMethod:         [], //string
            trancode:            [], //string
            textResponse:        [], //string
            captureStatus:       [], //string
            tranType:            [], //string
            beginDate:           [], //string
            endDate:             [], //string
            surchargeAmount     :[],
            orderID:              [],
          }
        )
        return fb
    }
}
