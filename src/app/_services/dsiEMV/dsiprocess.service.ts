import { Injectable } from '@angular/core';
import { IPOSPayment } from 'src/app/_interfaces';
import { DSIEMVSettings } from '../system/settings/uisettings.service';
import { OrderMethodsService } from '../transactions/order-methods.service';
import { Account, Amount, RStream, DSIEMVTransactionsService, Transaction, CmdResponse, TranResponse } from './dsiemvtransactions.service';
@Injectable({
  providedIn: 'root'
})
export class DSIProcessService {

  constructor(
    private orderMethodsService: OrderMethodsService,
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
    const transactiontemp     = JSON.parse(item) as Transaction;
    let transaction           ={} as Transaction // {...transactiontemp, id: undefined}
    transaction               = this.initTransaction()
    transaction.TranCode      =transactiontemp.TranCode;
    return this.dsi.pinPadReset(transaction)
  }

  async emvSale(amount: number, paymentID: number, manual: boolean, tipPrompt: boolean): Promise<RStream>  {
    const commandResponse = await this.emvTransaction('EMVSale', amount, paymentID, manual, tipPrompt, '')
    console.log('emvSale', commandResponse)
    return commandResponse;
  }

  async  emvReturn(amount: number, paymentID: number, manual: boolean): Promise<RStream> {
    const commandResponse = await this.emvTransaction('EMVReturn', amount, paymentID, manual, false, 'credit')
    return commandResponse;
  }

  async emvVoid(posPayment: IPOSPayment ): Promise<RStream> {

    try {
      const reset               = await this.pinPadReset(); //ignore response for now.
      const item                = localStorage.getItem('DSIEMVSettings')
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
      transaction.TranCode = 'VoidSaleByRecordNo';

      if (transaction.SecureDevice === 'EMV_VX805_PAYMENTECH') {
        transaction.TranType = 'Credit';
        transaction.TranCode = 'EMVVoidSale';
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
      if (posPayment.amountReceived) {
        transaction.Amount.Purchase = posPayment.amountReceived.toString();
      }
      if (!posPayment.tipAmount && posPayment.tipAmount != 0) {
        transaction.Amount.Gratuity = posPayment.tipAmount.toString();
      }
      if (+amount.Purchase == 0) {
        amount.Purchase = posPayment.amountPaid.toString();
      }
      transaction.ProcessData = '';

      transaction.Amount = amount;
      console.log('emvVoid transaction' , transaction)
      return this.dsi.emvTransaction(transaction)

    } catch (error) {
      console.log('DSIEMVVoid', error)
    }

  }

  async emvReset(): Promise<RStream>  {
    let item = this.initTransaction()
    const commandResponse = this.emvReset()
    return commandResponse;
  }
  // XML = XML & setTag("TranType", opay.TranType) 'CREDIT/DEBIT/EBT
  // XML = XML & setTag("TranCode", opay.TranCode) ''SALE/REFUND/VOUCHERReturn

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

  async emvTransaction(tranCode: string, amount: number,
                       paymentID: number, manual: boolean, tipPrompt: boolean, TranType: string ): Promise<RStream> {
    const item  = localStorage.getItem('DSIEMVSettings');

    if (!item) { return null }

    const transactiontemp     = JSON.parse(item) as Transaction;

    if (transactiontemp.SecureDevice === 'testDevice') {
      const result = this.testSale(tranCode, amount,paymentID, manual, tipPrompt, TranType)
      return result;
    }

    const reset               = await this.pinPadReset(); //ignore response for now.

    let transaction           = {} as Transaction // {...transactiontemp, id: undefined}
    transaction               = this.initTransaction()
    transaction.TranCode      = tranCode;
    if (TranType) {
      transaction.TranType      = TranType;
    }

    transaction.InvoiceNo     = paymentID.toString();
    transaction.RefNo         = paymentID.toString();

    if (manual) {
      transaction.Account = {} as Account;
      transaction.Account.AcctNo = 'Prompt'
    }

    transaction.Amount = {} as Amount
    transaction.Amount.Purchase = amount.toString();

    if (tipPrompt) {
      transaction.Amount.Gratuity = 'Prompt'
    }

    console.log('emv transaction', transaction)
    const result =  await this.dsi.emvTransaction(transaction)
    console.log('emv transaction', result)
    return result
  }

  applyAmouunt(amount: number, gratuity: number): Amount {
    return null
  }


}
