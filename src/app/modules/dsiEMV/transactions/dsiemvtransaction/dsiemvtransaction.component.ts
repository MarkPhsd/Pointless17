import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPOSPayment } from 'src/app/_interfaces';
import { CmdResponse } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'app-dsiemvtransaction',
  templateUrl: './dsiemvtransaction.component.html',
  styleUrls: ['./dsiemvtransaction.component.scss']
})
export class DSIEMVTransactionComponent implements OnInit {

  payment: any;
  amount : number;

  message: string;
  resultMessage: string;
  processing: boolean;
  constructor(
    private paymentsMethodsProcess: PaymentsMethodsProcessService,
    private dsiProcess      : DSIProcessService,
    private dialogRef   : MatDialogRef<DSIEMVTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  )
  {
    if (data)  {
      this.payment = data.data;
      this.amount  = data.amount;
    }
  }

  ngOnInit(): void {
    const i = 0;
     this.message  = 'Press Process to use Card'
     this.process();
  }

  async process() {
    this.processing = true;
    this.message  = 'Please check the device for input if required.'
    this.resultMessage = '';
    setTimeout(()=>{
      this.processCard();
    },50);
  }

  async processCard() {
    const amount = this.amount
    const payment = this.payment
    const response  = await this.dsiProcess.emvSale(amount, payment.id, false, false );
    if (!response) {
      this.message = 'Processing failed, reason uknown.'
      this.processing = false;
    }
    if (response) {
       const cmdResponse =  await this.paymentsMethodsProcess.processCreditCardResponse(response, this.payment)
       this.readResult(cmdResponse);
    }
  }

  readResult(cmdResponse: CmdResponse) {
    this.message = cmdResponse.TextResponse;
    this.resultMessage  = cmdResponse.CmdStatus;
    this.processing = false;
  }

  cancel() {
    this.dialogRef.close();
  }

}
