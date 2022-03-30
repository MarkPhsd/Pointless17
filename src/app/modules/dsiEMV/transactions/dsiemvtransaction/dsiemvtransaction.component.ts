import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPOSPayment } from 'src/app/_interfaces';
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

  constructor(
    private paymentsMethodsProcess: PaymentsMethodsProcessService,
    private dsiProcess      : DSIProcessService,
    private dialogRef   : MatDialogRef<DSIEMVTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  )
  {
      console.log('dsi emv', data)
    if (data)  {
      this.payment = data.data;
      this.amount  = data.amount;
    }
  }

  ngOnInit(): void {
    const i = 0;
     this.message  = ''
  }

  async process() {
    this.message  = ''
    const amount = this.amount
    const payment = this.payment
    const response  = await this.dsiProcess.emvSale(amount, payment.id, false, false );
    if (!response) {
      this.message = 'Processing failed, reason uknown.'
    }
    if (response) {

      this.paymentsMethodsProcess.processCreditCardResponse(response, this.payment)
    }
  }

  cancel() {
    this.dialogRef.close();
  }

}
