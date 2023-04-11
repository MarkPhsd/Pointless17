import { Component, OnInit, Input, TemplateRef, ViewChild } from '@angular/core';
import { IPaymentSalesSummary } from 'src/app/_services/reporting/sales-payments.service';

@Component({
  selector: 'app-payment-report-card',
  templateUrl: './payment-report-card.component.html',
  styleUrls: ['./payment-report-card.component.scss']
})
export class PaymentReportCardComponent implements OnInit {

  @ViewChild('paymentsView')   paymentsView: TemplateRef<any>;
  @ViewChild('refundsView')    refundsView: TemplateRef<any>;
  @ViewChild('voidsView')      voidsView: TemplateRef<any>;

  @Input()  groupBy: string;
  @Input()  payments: any;
  @Input()  refunds: true;
  @Input()  type: string;

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

  get reportView() {
    if (this.type === 'voids') {
      return this.voidsView
    }

    if (this.payments) {

      this.type = 'sales'
    }
    if (this.refunds) {
      this.type = 'refunds'
    }

    if (this.type === 'sales') {
      this.sortView()
      return this.paymentsView
    }
    if (this.type === 'refunds') {
      return this.refundsView
    }

  }

  sortView() {
    if (this.payments) {
      this.payments.sort((a, b) => {
        return a.hour - b.hour;
      });
    }
  }
}
