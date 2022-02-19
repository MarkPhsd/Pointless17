import { Component, OnInit, Input } from '@angular/core';
import { IPaymentSalesSummary } from 'src/app/_services/reporting/sales-payments.service';

@Component({
  selector: 'app-payment-report-card',
  templateUrl: './payment-report-card.component.html',
  styleUrls: ['./payment-report-card.component.scss']
})
export class PaymentReportCardComponent implements OnInit {

  @Input()  groupBy: string;
  @Input()  payments: any;
  constructor() { }

  ngOnInit(): void {
    if (this.payments) {
      this.payments.sort((a, b) => {
        return a.hour - b.hour;
      });
    }
  }

}
