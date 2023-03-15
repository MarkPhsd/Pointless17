import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment, ISite } from 'src/app/_interfaces';
import { ProductEditButtonService } from '../menu/product-edit-button.service';
import { SitesService } from '../reporting/sites.service';
import { TransactionUISettings } from '../system/settings/uisettings.service';
import { POSPaymentService } from '../transactions/pospayment.service';
import { TriposResult } from './triposModels';

  export interface	authorizationPOST {
    action: string;
    laneId: string;
    transactionAmount: string;
    tipAmount: string;
    referenceNumber: string;
    invokeManualEntry : boolean;
    getToken: string;
    cardLogo: string;
    clerkNumber: string;
    tokenId: string;
    tokenProvider: string;
    vaultId: string;
    transactionID: string;
    paymentType: string;
    description: string;
    terminalId: string;
    activationCode: string;
    marketCode: string;
  }

@Injectable({
  providedIn: 'root'
})
export class TriPOSMethodService {

  public _dialog        = new BehaviorSubject<any>(null);
  public _dialog$       = this._dialog.asObservable();
  private dialogRef: any;

  constructor(private http: HttpClient,
                private dialogOptions       : ProductEditButtonService,
                private paymentService: POSPaymentService,
              private siteService: SitesService) { }

  authorizeAmount(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "Authorization"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }

  authorizationToken(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "authorizationToken"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }

  authorizationCompletion(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "authorizationCompletion"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }

  sale(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "sale"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }

  reboot(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "reboot"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }

  returnTransaction(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "returnTransaction"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }

  refund(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "refund"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }

  // {
  //   "laneId": -90856942,
  //   "cardHolderPresentCode": "non quis",
  //   "clerkNumber": "enim ut",
  //   "configuration": {
  //     "marketCode": "culpa non irure velit dolore"
  //   },
  //   "referenceNumber": "amet dolor commodo non",
  //   "shiftId": "pariatur et consequat",
  //   "ticketNumber": "consectetur minim non"
  // }

  void(site: ISite, item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "void"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }


  reversal(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "reversal"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }


  displayTextView(site: ISite,item: authorizationPOST): Observable<TriposResult> {

    const controller = '/TriPOSProcessing/'

    const endPoint = "displayTextView"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<TriposResult>(url,  item)

  }


  openDialogCreditPayment ( order: IPOSOrder,
                            amount: number,
                            manualPrompt: boolean,
                            settings: TransactionUISettings) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    const site = this.siteService.getAssignedSite();
    const  posPayment = {} as IPOSPayment;
    posPayment.orderID = order.id;
    posPayment.zrun = order.zrun;
    posPayment.reportRunID = order.reportRunID;
    const payment$  = this.paymentService.postPOSPayment(site, posPayment)

    const paymentProcess = {order: order, posPayment: posPayment, settings: settings, manualPrompt: manualPrompt, action: 1}

    console.log('paymentProcess', paymentProcess)
    return payment$.pipe(
      switchMap(data =>
      {
        data.amountPaid = amount;
        console.log('payment', data)
        paymentProcess.posPayment = data;
        this.dialogRef = this.dialogOptions.openTriPOSTransaction(
          paymentProcess
        );
        this._dialog.next(this.dialogRef)
        return of(data)
      }
    ))

  }

  openDialogCompleteCreditPayment ( order: IPOSOrder,
    amount: number,
    posPayment: IPOSPayment,
    settings: TransactionUISettings) {
    //once we get back the method 'Card Type'
    //lookup the payment method.
    //we can't get the type of payment before we get the PaymentID.
    //so we just have to request the ID, and then we can establish everything after that.
    const site = this.siteService.getAssignedSite();
    // const  posPayment = {} as IPOSPayment;
    posPayment.orderID      = order.id;
    posPayment.zrun         = order.zrun;
    posPayment.reportRunID  = order.reportRunID;
    posPayment.amountPaid   = order.creditBalanceRemaining;
    if (settings.triposEnabled) {
      posPayment.amountPaid = amount;
    }
    const payment$          = this.paymentService.savePOSPayment(site, posPayment)
    const paymentProcess    = {order: order, posPayment: posPayment, settings: settings, manualPrompt: false, action: 1}

    return payment$.pipe(
    switchMap(data =>
      {
        data.amountPaid = amount;
        paymentProcess.posPayment = data;
        this.dialogRef = this.dialogOptions.openTriPOSTransaction(
        paymentProcess
      );
        this._dialog.next(this.dialogRef)
        return of(data)
    }
  ))

}

}
