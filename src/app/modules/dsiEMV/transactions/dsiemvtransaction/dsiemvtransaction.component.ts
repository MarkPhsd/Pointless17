import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPOSPayment } from 'src/app/_interfaces';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'app-dsiemvtransaction',
  templateUrl: './dsiemvtransaction.component.html',
  styleUrls: ['./dsiemvtransaction.component.scss']
})
export class DSIEMVTransactionComponent implements OnInit {

  payment: IPOSPayment;
  amount : number;

  constructor(
    private paymentsMethodsProcess: PaymentsMethodsProcessService,
    private dsiProcess      : DSIProcessService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  )
  {
    if (data)  {
      this.payment = data.payment;
      this.amount  = data.amount;
    }
  }

  ngOnInit(): void {
    const i = 0;
  }

  async process() {
    const amount = this.amount
    const payment = this.payment
    const response  = await this.dsiProcess.emvSale(amount, payment.id, false, false );
    if (response) {
      this.paymentsMethodsProcess.processCreditCardResponse(response, this.payment)
    }
  }

  cancel() {

  }

}
