import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPOSPayment } from 'src/app/_interfaces';
import { DSIEMVSettings } from '../system/settings/uisettings.service';
import { OrderMethodsService } from '../transactions/order-methods.service';
import { Account, Amount, RStream, DSIEMVTransactionsService, Transaction, CmdResponse, TranResponse, BatchSummary, BatchClose } from './dsiemvtransactions.service';
@Injectable({
  providedIn: 'root'
})
export class DSIProcessService {

  constructor(
    private orderMethodsService: OrderMethodsService,
    private matSnack        : MatSnackBar,
    private dsi : DSIEMVTransactionsService) { }

  initTransaction(): Transaction {
    const item = localStorage.getItem('DSIEMVSettings');
    if (!item) { return null }
    const dsiSettings     = JSON.parse(item) as DSIEMVSettings;
    const transaction         ={} as Transaction // {...transactiontemp, id: undefined}
    transaction.MerchantID    =dsiSettings.merchantID;
    transaction.TerminalID    =dsiSettings.terminalID;;
    transaction.OperatorID    =dsiSettings.operatorID;
    transaction.HostOrIP      =dsiSettings.hostOrIP;
    transaction.IpPort        =dsiSettings.ipPort;
    transaction.UserTrace     ='PointlessPOS1.0';
    transaction.SecureDevice  =dsiSettings.secureDevice;
    transaction.ComPort       =dsiSettings.comPort;
    transaction.SequenceNo    ='0010010010'
    return transaction
  }

  pinPadReset(): Promise<RStream> {
    const item = localStorage.getItem('DSIEMVSettings')
    if (!item) { return }
    const transactiontemp     = JSON.parse(item) as DSIEMVSettings;
    if (transactiontemp?.secureDevice.toLowerCase() === 'test') { return null; }

    let transaction           = {} as Transaction // {...transactiontemp, id: undefined}
    transaction               = this.initTransaction()
    transaction.TranCode      = transactiontemp?.tranCode;
    return this.dsi.pinPadReset(transaction)
  }

  async emvSale(amount: number, paymentID: number, manual: boolean, tipPrompt: boolean): Promise<RStream>  {
    const commandResponse = await this.emvTransaction('EMVSale', amount, paymentID, manual, tipPrompt, '');
    console.log('emvSale', commandResponse)
    return commandResponse;
  }

  async  emvReturn(amount: number, paymentID: number, manual: boolean): Promise<RStream> {
    const commandResponse = await this.emvTransaction('Return', amount, paymentID, manual, false, 'credit');
    console.log('emvReturn', commandResponse)
    return commandResponse;
  }

  async emvVoid(posPayment: IPOSPayment): Promise<RStream> {

    try {
      const item     = localStorage.getItem('DSIEMVSettings') ;
      const device   = JSON.parse(item) as DSIEMVSettings;
      const reset    = await this.pinPadReset(); //ignore response for now.
      if (!item) {
        this.orderMethodsService.notification('Could not initialized DSI Settings', 'Error')
        return null
      }
      let transaction      = this.initTransaction();
      if (!transaction) {
        this.orderMethodsService.notification('Could not Initialize Transaction Settings', 'Error')
        return null
      }

      transaction.TranType = 'Credit';
      transaction.TranCode = 'VoidSale';

      if (transaction.SecureDevice.toLowerCase() === 'test') {
        transaction.TranType = 'Credit';
        transaction.TranCode = 'VoidSale';
      }

      if (transaction.SecureDevice.toLowerCase() === 'EMV_ISC250_HEARTLAND'.toLowerCase()) {
        transaction.TranType = 'Credit';
        transaction.TranCode = 'VoidSaleByRecordNo';
      }

      if (transaction.SecureDevice === 'EMV_VX805_PAYMENTECH') {
        transaction.TranType = 'Credit';
        transaction.TranCode = 'VoidSale';
      }

      if (transaction.SecureDevice === "EMV_VX805_MERCURY" ||
          transaction.SecureDevice === "EMV_VX805_VANTIV" ||
          transaction.SecureDevice === "EMV_VX805_RAPIDCONNECT") {
        transaction.TranType = 'Credit';
        transaction.TranCode = 'VoidSaleByRecordNo';
      }

      if (posPayment.id) {
        transaction.InvoiceNo   = posPayment.id.toString();
      }
      if ( posPayment.refNumber) {
        transaction.RefNo       = posPayment.refNumber.toString();
      }
      if (posPayment.approvalCode) {
        transaction.AuthCode    = posPayment.approvalCode.toString();
      }
      if (posPayment.refNumber) {
        transaction.RecordNo    = posPayment.ccNumber.toString();
      }
      transaction.Frequency   = 'OneTime'
      if (posPayment.dlNumber ) {
        transaction.AcqRefData  = posPayment.dlNumber.toString();
      }
      if (posPayment.processData) {
        transaction.ProcessData = posPayment.processData.toString();
      }

      let amount = {} as Amount;
      if (posPayment.tipAmount && posPayment.tipAmount != 0) {
        transaction.Amount.Gratuity = posPayment.tipAmount.toFixed(2).toString();
      }
      amount.Purchase = posPayment.amountPaid.toFixed(2).toString();

      if (!amount.Purchase) {
        this.orderMethodsService.notification('Void amount cannot be 0.00', 'Error')
        return;
      }

      if (transaction.SecureDevice.toLowerCase() === 'test') {
        transaction.TranType = 'Credit';
        transaction.TranCode = 'VoidSale';
        const result = this.testVoid(transaction.TranCode, +transaction.Amount, posPayment.id, false, false,  transaction.TranType)
        result.TranResponse.TranCode = 'EMVVoidSale';
        return result
      }

      console.log('void transaction ', transaction)
      if (transaction.SecureDevice.toLowerCase() != 'test') {
        transaction.Amount = amount;
        const transResult = await this.dsi.emvTransaction(transaction)
        return transResult.RStream
      }

    } catch (error) {
      console.log('DSIEMVVoid', error)
    }

  }

  async emvReset(): Promise<RStream>  {
    let item = this.initTransaction()
    const commandResponse = this.emvReset()
    return commandResponse;
  }
 
  async emvTransaction(tranCode: string, amount: number,
                       paymentID: number, manual: boolean,
                       tipPrompt: boolean, TranType: string ): Promise<any> {

    const item  = localStorage.getItem('DSIEMVSettings');
    if (!item) { 
      return 'no dsiemvSettings' 
    }

    if (!amount) { 
      const result  = 'Failed, no amount given.'
      return result
    }

    const transactiontemp     = JSON.parse(item) as Transaction;

    if (!transactiontemp){ 
      const result  = 'Failed, transaction settings not found.'
      return result
    }
    
    if (transactiontemp.SecureDevice === 'test') {
      const result = this.testSale(tranCode, amount,paymentID, manual, tipPrompt, TranType)
      return result;
    }

    const reset               = await this.pinPadReset(); //ignore response for now.
    let transaction           = {} as Transaction // {...transactiontemp, id: undefined}
    transaction               = this.initTransaction()
    transaction.TranCode      = tranCode;
    if (TranType) { transaction.TranType   = TranType; }

    transaction.InvoiceNo     = paymentID.toString();
    transaction.RefNo         = paymentID.toString();

    if (manual) {
      transaction.Account = {} as Account;
      transaction.Account.AcctNo = 'Prompt'
    }

    transaction.Amount = {} as Amount
    if (amount) {
      const value = +amount
      transaction.Amount.Purchase = value.toFixed(2)
    }

    if (tipPrompt) {
      transaction.Amount.Gratuity = 'Prompt'
    }

    console.log('transaction', transaction)
    const result =  await this.dsi.emvTransaction(transaction)

    console.log(result)
    console.log('CmdResponse', result?.CmdResponse)
    console.log('TranResponse', result?.TranResponse)
    console.log('RStream', result?.RStream)
    console.log('RStream2', result?.rStream)
    return result
  }

  applyAmount(amount: number, gratuity: number): Amount {
    return null
  }

  // XML = XML & setTag("TranType", opay.TranType) 'CREDIT/DEBIT/EBT
  // XML = XML & setTag("TranCode", opay.TranCode) ''SALE/REFUND/VOUCHERReturn
  async emvBatch() : Promise<BatchClose> {
    const item                = localStorage.getItem('DSIEMVSettings');
    const reset               = await this.pinPadReset(); //ignore response for now.
    console.log('reset complete')
    const batchSummary        = await this.emvBatchInquire()
    let transaction           = {} as Transaction // {...transactiontemp, id: undefined}
    transaction               = this.initTransaction()
    const  response =  await this.dsi.emvBatch(transaction, batchSummary)
    if (response) {
      return  response?.RStream?.BatchClose
    }
    this.matSnack.open('Issue closing batch.', 'Alert', {duration: 1500})
    return null
  }

  async emvBatchInquire() : Promise<BatchSummary> {
    const item                = localStorage.getItem('DSIEMVSettings');
    const reset               = await this.pinPadReset(); //ignore response for now.
    let transaction           = {} as Transaction // {...transactiontemp, id: undefined}
    transaction               = this.initTransaction()
    const response            = await this.dsi.getBatchInquireValues(transaction)
    if (response) {
      return  response?.RStream?.BatchSummary
    }
    this.matSnack.open('Issue retrieving batch info.', 'Alert', {duration: 1500})
    return null
  }

  testSale(TranCode: string, amount: number, paymentID: number, manual: boolean, tipPrompt: boolean, TranType: string): RStream {
    const stream = {} as RStream;
    stream.CmdResponse = {} as CmdResponse
    stream.TranResponse = {} as TranResponse
    stream.TranResponse.Amount = {} as Amount

    stream.CmdResponse.CmdStatus = "Approved"
    stream.CmdResponse.TextResponse = "APPROVED"

    stream.TranResponse.CardType = "VISA"

    stream.TranResponse.AuthCode     = "00421D" //</AuthCode>
		stream.TranResponse.CaptureStatus= "Captured" //</CaptureStatus>
		stream.TranResponse.RefNo        = "212442535014"//</RefNo>
    stream.TranResponse.InvoiceNo    = "249571"//</InvoiceNo>
		stream.TranResponse.OperatorID   =" Wolf Wolverson"//</OperatorID>

    stream.TranResponse.Amount.Authorize = amount.toString();
    stream.TranResponse.Amount.Purchase = amount.toString();

    stream.TranResponse.AcqRefData  ="|1623410529|95985"//</AcqRefData>
    stream.TranResponse.AVSResult   ="Z"//</AVSResult>
		stream.TranResponse.CVVResult   ="M"//</CVVResult>
		stream.TranResponse.RecordNo    ="1623410529"//</RecordNo>
		stream.TranResponse.EntryMethod ="CHIP READ/MANUAL"//</EntryMethod>
		stream.TranResponse.Date        ="05/04/2022"//</Date>
		stream.TranResponse.Time        ="15:00:14"//</Time>

    return stream;
  }

  testVoid(TranCode: string, amount: number, paymentID: number, manual: boolean, tipPrompt: boolean, TranType: string): RStream {
    const stream = {} as RStream;
    stream.CmdResponse = {} as CmdResponse
    stream.TranResponse = {} as TranResponse
    stream.TranResponse.Amount = {} as Amount

    //VoidSaleByRecordNo	APPROVED	Captured
    stream.CmdResponse.CmdStatus      = "Approved"
    stream.CmdResponse.TextResponse   = "APPROVED"

    stream.TranResponse.CardType      = "VISA"

    stream.TranResponse.AuthCode     = "00421D" //</AuthCode>
		stream.TranResponse.CaptureStatus= "Captured" //</CaptureStatus>
		stream.TranResponse.RefNo        = "212442535014"//</RefNo>
    stream.TranResponse.InvoiceNo    = "249571"//</InvoiceNo>
		stream.TranResponse.OperatorID   =" Wolf Wolverson"//</OperatorID>

    stream.TranResponse.Amount.Authorize = amount.toString();
    stream.TranResponse.Amount.Purchase = amount.toString();

    stream.TranResponse.AcqRefData  ="|1623410529|95985"//</AcqRefData>
    stream.TranResponse.AVSResult   ="Z"//</AVSResult>
		stream.TranResponse.CVVResult   ="M"//</CVVResult>
		stream.TranResponse.RecordNo    ="1623410529"//</RecordNo>
		stream.TranResponse.EntryMethod ="CHIP READ/MANUAL"//</EntryMethod>
		stream.TranResponse.Date        ="05/04/2022"//</Date>
		stream.TranResponse.Time        ="15:00:14"//</Time>

    return stream;
  }


}
