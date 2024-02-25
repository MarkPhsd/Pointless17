import { Injectable } from '@angular/core';
import { switchMap, of } from 'rxjs';
import { OperationWithAction } from 'src/app/_interfaces';
import { RStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { DcapRStream, DcapService } from './dcap.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { OrdersService } from 'src/app/_services';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { Transaction } from 'electron/main';

@Injectable({
  providedIn: 'root'
})
export class DcapMethodsService {

  constructor(
    private siteService: SitesService,
    private pOSPaymentService: POSPaymentService,
    private orderService: OrdersService,
    private orderMethodService: OrderMethodsService,
  ) { }

 

  readResult(cmdResponse: DcapRStream) {
    // console.log('readresult', cmdResponse?.TextResponse, cmdResponse)
    let message: string;
    let resultMessage: string;
    let processing: boolean;
    let success: boolean;
    success = false
    processing = false

    const status = cmdResponse?.CmdStatus 
    if (status ==   "Declined") { 
      return {success :false , message: status, processing: processing, resultMessage: status};
    }
    const response = cmdResponse?.TextResponse.toLowerCase();
    if (response === 'approved'.toLowerCase() || response === 'AP*'.toLowerCase() ||
        response === 'captured'.toLowerCase() || response === 'approval'.toLowerCase()
      || response === 'approved, Partial AP'.toLowerCase()

    ) {
     success = true
     return {success : success , message: message, processing: processing, resultMessage: resultMessage}
    }


    if (!cmdResponse) {
      message = 'Processing failed, no command response.'
      console.log('readResult', cmdResponse,  message)
      // return {success :false , message: message, processing: processing, resultMessage: resultMessage}
    }
    if (!cmdResponse.TextResponse) {
       message = 'Processing failed, no text ressponse.'
      console.log('readResult', cmdResponse,  message)
      // return {success :false , message: message, processing: processing, resultMessage: resultMessage}
    }
    if (!cmdResponse.CmdStatus) {
      message = 'Processing failed, no cmdStatus.'
      console.log('readResult', cmdResponse,  message)
      // return {success :false , message: message, processing: processing, resultMessage: resultMessage}
    }

    message        = cmdResponse?.TextResponse;
    resultMessage  = cmdResponse?.CmdStatus;
    processing     = false;

    const len = 'Transaction rejected because the referenced original transaction is invalid'.length;
    if (response.substring(0, len) === 'Transaction rejected because the referenced original transaction is invalid.') {
      return {success :false , message: message, processing: processing, resultMessage: resultMessage}
    }

    return {success :false , message: message, processing: processing, resultMessage: resultMessage};
  }

  processVoidResults(action: any,voidPayment, response: RStream) {
    let message: string;
    let resultMessage: string;
    let processing: boolean;
    let success: boolean;
    success = false;
    try {
      // console.log('processVoidResults RStream', response.CmdResponse)
      const cmdResponse = response?.CmdResponse;
      const result =  this.readResult(cmdResponse);
      if (!result) {
        processing = false;
        const item =  {success: false, message: message, processing: processing, resultMessage: resultMessage}
        return of(item)
      }
      if (!response) {
        message = 'Processing failed, reason uknown.'
        processing = false;
        const item =  {success: false, message: message, processing: processing, resultMessage: resultMessage}
        return of(item)
      }

      if (response) {
        const item = {} as OperationWithAction;
        item.action  = action;
        item.payment = voidPayment;
        try {
          item.payment.textResponse     = response?.CmdResponse?.TextResponse;
        } catch (error) {

        }
        try {
          item.payment.amountPaid      = +response.TranResponse?.Amount?.Purchase;
        } catch (error) {
        }

        try {
          item.payment.tipAmount       = +response?.TranResponse?.Amount?.Gratuity;
        } catch (error) {
        }

        try {
          item.payment.captureStatus   = response?.TranResponse?.CaptureStatus;
        } catch (error) {
        }

        try {
          item.payment.entryMethod     = response?.TranResponse?.EntryMethod;
        } catch (error) {
        }

        try {
          item.payment.applicationLabel= response?.TranResponse?.ApplicationLabel;
        } catch (error) {
        }

        try {
          item.payment.captureStatus   = response?.TranResponse?.CaptureStatus;
        } catch (error) {
        }

        try {
          item.payment.amountReceived  = +response?.TranResponse?.Amount?.Purchase;
        } catch (error) {
        }

        try {
          item.payment.processData     = response?.TranResponse?.ProcessData;
        } catch (error) {
        }

        try {
          item.payment.trancode        = response?.TranResponse?.TranCode
          item.payment.tranType        = response?.TranResponse?.TranCode
        } catch (error) {
        }

        const site = this.siteService.getAssignedSite()
        const response$ = this.pOSPaymentService.voidPayment(site, item)

        return response$.pipe(
          switchMap(response => {
            const id = item.payment.orderID.toString()
            return this.orderService.getOrder(site, id, false)
          }
        )).pipe(switchMap( order => {
            this.orderMethodService.updateOrderSubscription(order)
            this.orderMethodService.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
            message = 'Payment voided. Press cancel to continue. Order is re-opened if closed.'
            const item =  {data: order, success: false, message: message, processing: processing, resultMessage: resultMessage}
          return of(item)
        }))

      }

    } catch (error) {
      const item =  {success: false, message: 'Process Void Error', processing: processing, resultMessage: 'Process Void Error'}
      return of(item)
    }
  }
}
