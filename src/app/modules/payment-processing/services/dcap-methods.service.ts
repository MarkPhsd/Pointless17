import { Injectable } from '@angular/core';
import { switchMap, of } from 'rxjs';
import { IPOSPayment, OperationWithAction } from 'src/app/_interfaces';
import { CmdResponse, RStream, TranResponse } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { DCAPAndroidRStream, DcapRStream, DcapService } from './dcap.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { OrdersService } from 'src/app/_services';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { XMLParser } from 'fast-xml-parser';

@Injectable({
  providedIn: 'root'
})
export class DcapMethodsService {

  title = 'xml-parser-example';
  xmlString = `<?xml version="1.0"?>`


  extractLineProperties(rStream: any): Record<string, string> {
    const lineData: Record<string, string> = {};
  
    // Ensure rStream is a valid object
    if (typeof rStream !== 'object' || rStream === null) {
      console.error('Invalid RStream object:', rStream);
      this.siteService.notify('Invalid RStream Object', 'lose', 10000)
      return lineData;
    }
  
    // Iterate over all properties of the object
    Object.entries(rStream).forEach(([key, value]) => {
      if (key.startsWith('Line') && typeof value === 'string') {
        lineData[key] = value.trim(); // Add only Line properties
      }
    });
  
    return lineData;
  }
  
  // extractLineProperties(rStream: { [key: string]: any }): { [key: string]: string } {
  //   if (!rStream) { return {}}
  //   const lineData: { [key: string]: string } = {};
  //   // Loop through all properties
  //   Object.keys(rStream).forEach((key) => {
  //     if (key.startsWith("Line")) {
  //       lineData[key] = String(rStream[key]); // Convert to string in case it's not
  //     }
  //   });
  //   return lineData;
  // }

  constructor(
    private siteService: SitesService,
    private pOSPaymentService: POSPaymentService,
    private orderService: OrdersService,
    private orderMethodService: OrderMethodsService,
    // private xmlParserService: XmlParserService,
  ) { }

  parseXml(xmlString: string): DCAPAndroidRStream {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const parsedResult = parser.parse(xmlString);
    return parsedResult.RStream as DCAPAndroidRStream;
  }

  convertToObject(value:string) {
    return this.parseXml(value);
  }

  validateAndroidTransactionData(posPayment: IPOSPayment) {
    let result = true;
    if (!posPayment) {
      this.siteService.notify('No Payment', 'Alert', 2000)
       result = false
    }
    // if (!terminalSettings) {
    //   this.siteService.notify('No device settings', 'Alert', 2000)
    //    result = false
    // }
    // if (!ui) {
    //   this.siteService.notify('No system settings', 'Alert', 2000)
    //     result = false
    // }
    return result
  }

  validateTransactionData(posPayment: IPOSPayment, terminalSettings: ITerminalSettings, ui: TransactionUISettings) {
    let result = true;
    if (!posPayment) {
      this.siteService.notify('No Payment', 'Alert', 2000)
       result = false
    }
    if (!terminalSettings) {
      this.siteService.notify('No device settings', 'Alert', 2000)
       result = false
    }
    if (!ui) {
      this.siteService.notify('No system settings', 'Alert', 2000)
        result = false
    }
    return result
  }

  // if (obj?.RStream?.CmdResponse?.TextResponse === 'TRANSACTION NOT COMPLETE - In Process!') {
  //   this.response     = null // obj
  //   this.cmdResponse  = null // (obj?.RStream?.CmdResponse);
  //   this.textResponse = null // (obj?.RStream?.CmdResponse?.TextResponse);
  //   this.tranResponse = null // obj?.RStream?.TranResponse as TranResponse;

  //   console.log('respose in progress')
  //   return;
  // }


  readAndroidResult(streamResponse: DCAPAndroidRStream, tranType?: string) {
    // console.log('readresult', cmdResponse?.TextResponse, cmdResponse)
    let message: string;
    let resultMessage: string;
    let processing: boolean;
    let success: boolean;
    success = false
    processing = false;

    console.log('readResult', streamResponse)
    // CmdStatus
    const status = streamResponse?.CmdResponse.CmdStatus

    if (tranType === 'AdjustByRecordNo') {
      if (streamResponse?.CmdResponse?.TextResponse ==='TRANSACTION NOT COMPLETE - In Process!' ) {
        return {success : false , message: 'continue', processing: processing, resultMessage:  streamResponse?.CmdResponse?.TextResponse};
      }
    }

    if (status ==   "Declined") {
      return {success : false , message: status, processing: processing, resultMessage:  streamResponse?.CmdResponse?.TextResponse};
    }
    if (status ==   "Error") {
      return {success : false , message: status, processing: processing, resultMessage: streamResponse?.CmdResponse?.TextResponse};
    }
    if (status ==   "Failed") {
      return {success : false , message: status, processing: processing, resultMessage:  streamResponse?.CmdResponse?.TextResponse};
    }

    const cmdResponse = streamResponse?.CmdResponse;
    const tranResponse = streamResponse?.TranResponse;
    const responseResult = this.getDCAPResponse(cmdResponse, streamResponse?.TranResponse)
    return responseResult
  }

  getDCAPResponse(cmdResponse: CmdResponse, tranResponse: any) {
    let message: string;
    let resultMessage: string;
    let processing: boolean;
    let success: boolean;
    success = false
    processing = false;

    let response = cmdResponse?.CmdStatus;
    if (response) {
      if (
        response.toLowerCase() === 'completed'.toLowerCase() ||
        response.toLowerCase() === 'success'.toLowerCase() ||
        response.toLowerCase() === 'approved'.toLowerCase() ||
        response.toLowerCase() === 'AP*'.toLowerCase() ||
        response.toLowerCase() === 'captured'.toLowerCase() ||
        response.toLowerCase() === 'approval'.toLowerCase() ||
        response.toLowerCase() === 'approved, Partial AP'.toLowerCase()
      ) {
        success = true
        return {success : success , message:  cmdResponse?.TextResponse, processing: processing, resultMessage: resultMessage}
      }
    }

    response = cmdResponse?.TextResponse;
    if (response) {
      if (
        response.toLowerCase() === 'completed'.toLowerCase() ||
        response.toLowerCase() === 'success'.toLowerCase() ||
        response.toLowerCase() === 'approved'.toLowerCase() ||
        response.toLowerCase() === 'AP*'.toLowerCase() ||
        response.toLowerCase() === 'captured'.toLowerCase() ||
        response.toLowerCase() === 'approval'.toLowerCase() ||
        response.toLowerCase() === 'approved, Partial AP'.toLowerCase()
      ) {
        success = true
        return {success : success , message:  cmdResponse?.TextResponse, processing: processing, resultMessage: resultMessage}
      }
    }

    //CaptureStatus
    const captureStatus = tranResponse?.CaptureStatus;
    if (captureStatus) {
      if (
        captureStatus.toLowerCase() === 'completed'.toLowerCase() ||
        captureStatus.toLowerCase() === 'success'.toLowerCase() ||
        captureStatus.toLowerCase() === 'approved'.toLowerCase() ||
        captureStatus.toLowerCase() === 'AP*'.toLowerCase() ||
        captureStatus.toLowerCase() === 'captured'.toLowerCase() ||
        captureStatus.toLowerCase() === 'approval'.toLowerCase() ||
        captureStatus.toLowerCase() === 'approved, Partial AP'.toLowerCase() ||
        captureStatus.toLowerCase() === 'partial ap'.toLowerCase()
      ) {
        success = true
        return {success : success , message:  cmdResponse?.TextResponse, processing: processing, resultMessage: resultMessage}
      }
    }

    if (!cmdResponse) {
      message = 'Processing failed, no command response.'
      console.log('readResult', cmdResponse,  message)
    }
    if (!cmdResponse.TextResponse) {
       message = 'Processing failed, no text ressponse.'
      console.log('readResult', cmdResponse,  message)
    }
    if (!cmdResponse.CmdStatus) {
      message = 'Processing failed, no cmdStatus.'
      console.log('readResult', cmdResponse,  message)
    }

    message        = cmdResponse?.TextResponse;
    resultMessage  = cmdResponse?.CmdStatus;
    processing     = false;

    if (response) {
      const len = 'Transaction rejected because the referenced original transaction is invalid'.length;
      if (response.substring(0, len) === 'Transaction rejected because the referenced original transaction is invalid.') {
        return {success :false , message: message, processing: processing, resultMessage: resultMessage}
      }
    }

    return {success :false , message: message, processing: processing, resultMessage: resultMessage};

  }

  readResult(cmdResponse: DcapRStream) {
    console.log('readresult', cmdResponse?.TextResponse, cmdResponse)

    let message: string;
    let resultMessage: string;
    let processing: boolean;
    let success: boolean;
    success = false
    processing = false


    //TRANSACTION NOT COMPLETE - DUKPT not Enabled
    if (cmdResponse?.TextResponse == 'TRANSACTION NOT COMPLETE - DUKPT not Enabled') {
      const status = "Failed - If entering manually, do not use CVV or ZIP."
      return {success : false , message: status, processing: processing, resultMessage: status, textResponse: cmdResponse?.TextResponse};
    }

    if (cmdResponse?.TextResponse == 'Invalid Check Digit. Check Acct Number') {
      const status = "Card entered wrong. Please retry"
      return {success : false , message: status, processing: processing, resultMessage: status, textResponse: cmdResponse?.TextResponse};
    }

    // console.log('readResult', cmdResponse)
    const status = cmdResponse?.CmdStatus

    if (status ==   "Declined") {
      return {success : false , message: status, processing: processing, resultMessage: status, textResponse: cmdResponse?.TextResponse};
    }
    //set to be removed
    const response = cmdResponse?.TextResponse;
    const captureStatus = cmdResponse?.CaptureStatus;

    if (response) {
      if (
        response.toLowerCase() === 'completed'.toLowerCase() ||
        response.toLowerCase() === 'success'.toLowerCase() ||
        response.toLowerCase() === 'approved'.toLowerCase() ||
        response.toLowerCase() === 'ap*'.toLowerCase() ||
        response.toLowerCase() === 'captured'.toLowerCase() ||
        response.toLowerCase() === 'approval'.toLowerCase() ||
        response.toLowerCase() === 'approved, partial ap'.toLowerCase()
      ) {
        success = true
        return {success : success , message: message, processing: processing, resultMessage: resultMessage, textResponse: cmdResponse?.TextResponse}
      }
    }

    //set to be removed
    //CaptureStatus
    if (captureStatus) {
      if (
        captureStatus.toLowerCase() === 'completed'.toLowerCase() ||
        captureStatus.toLowerCase() === 'success'.toLowerCase() ||
        captureStatus.toLowerCase() === 'approved'.toLowerCase() ||
        captureStatus.toLowerCase() === 'AP*'.toLowerCase() ||
        captureStatus.toLowerCase() === 'captured'.toLowerCase() ||
        captureStatus.toLowerCase() === 'approval'.toLowerCase() ||
        captureStatus.toLowerCase() === 'approved, Partial AP'.toLowerCase()
      ) {
        success = true
        return {success : success , message: message, processing: processing, resultMessage: resultMessage}
      }
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
    if (response) {
      if (response.substring(0, len) === 'Transaction rejected because the referenced original transaction is invalid.') {
        return {success :false , message: message, processing: processing, resultMessage: resultMessage}
      }
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
          item.payment.tranCode        = response?.TranResponse?.TranCode
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
