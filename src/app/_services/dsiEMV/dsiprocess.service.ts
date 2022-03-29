import { Injectable } from '@angular/core';
import { IPOSPayment } from 'src/app/_interfaces';
import { Account, Amount, CmdResponse, CommandResponse, DSIEMVTransactionsService, Transaction } from './dsiemvtransactions.service';

@Injectable({
  providedIn: 'root'
})
export class DSIProcessService {

  constructor(private dsi : DSIEMVTransactionsService) { }

  initTransaction(): Transaction {
    const item = localStorage.getItem('DSIEMVSettings')
    if (!item) { return null }
    const transactiontemp = JSON.parse(item) as Transaction;
    const transaction         ={} as Transaction // {...transactiontemp, id: undefined}
    transaction.MerchantID    =transactiontemp.MerchantID;
    transaction.TerminalID    =transactiontemp.TerminalID;;
    transaction.OperatorID    =transactiontemp.OperatorID;
    transaction.HostOrIP      = transactiontemp.HostOrIP;
    transaction.IpPort        =transactiontemp.IpPort;
    transaction.UserTrace     ='PointlessPOS1.0';
    transaction.SecureDevice  =transactiontemp.SecureDevice;
    transaction.ComPort       =transactiontemp.ComPort;
    transaction.SequenceNo    ='0010010010'
    //if mercury maybe include memo.
    return transaction
  }

  pinPadReset(): Promise<CommandResponse> {
    const item = localStorage.getItem('DSIEMVSettings')
    if (!item) { return }
    const transactiontemp = JSON.parse(item) as Transaction;
    let transaction           ={} as Transaction // {...transactiontemp, id: undefined}
    transaction               = this.initTransaction()
    transaction.TranCode      =transactiontemp.TranCode;
    return this.dsi.pinPadReset(transaction)
  }

  async emvSale(amount: number, paymentID: number, manual: boolean, tipPrompt: boolean): Promise<CommandResponse>  {
    const commandResponse = this.emvTransaction('EMVSale', amount, paymentID, manual, tipPrompt)
    console.log(commandResponse)
    return commandResponse;
  }

  emvReturn(amount: number, paymentID: number, manual: boolean): Promise<CommandResponse> {
    const commandResponse = this.emvTransaction('EMVReturn', amount, paymentID, manual, false)
    return commandResponse;
  }

  async voidSale(posPayment: IPOSPayment ) {
    const reset               = await this.pinPadReset(); //ignore response for now.
    const item                = localStorage.getItem('DSIEMVSettings')
    if (!item) { return null }

    let transaction      = this.initTransaction();
    transaction.TranType = 'Credit';
    transaction.TranCode = 'VoidSaleByRecordNo';

    if (transaction.SecureDevice === 'EMV_VX805_PAYMENTECH') {
      transaction.TranType = 'EMVVoidSale';
      transaction.TranCode = '';
    }

    transaction.InvoiceNo   = posPayment.id.toString();
    transaction.RefNo       = posPayment.refNumber.toString();
    transaction.AuthCode    =posPayment.approvalCode.toString();
    transaction.RecordNo    = posPayment.ccNumber;
    transaction.Frequency   = 'OneTime'
    transaction.AcqRefData  = posPayment.dlNumber.toString();
    transaction.ProcessData = posPayment.processData.toString();

    transaction.Amount = {} as Amount;
    transaction.Amount.Purchase = posPayment.amountPaid.toString();
    if (!posPayment.tipAmount && posPayment.tipAmount != 0) {
      transaction.Amount.Gratuity = posPayment.tipAmount.toString();
    }

    return this.dsi.emvTransaction(transaction)
  }

  async emvTransaction(type: string, amount: number, paymentID: number, manual: boolean, tipPrompt: boolean ): Promise<CommandResponse> {
    const reset               = await this.pinPadReset(); //ignore response for now.
    const item                = localStorage.getItem('DSIEMVSettings')
    if (!item) { return null }
    const transactiontemp     = JSON.parse(item) as Transaction;
    let transaction           = {} as Transaction // {...transactiontemp, id: undefined}
    transaction               = this.initTransaction()
    transaction.TranCode      = type ;
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
    return this.dsi.emvTransaction(transaction)
  }

  applyAmouunt(amount: number, gratuity: number): Amount {

    return null
  }


}
