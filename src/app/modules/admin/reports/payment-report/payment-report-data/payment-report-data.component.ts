import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { IPaymentSalesSummary } from 'src/app/_services/reporting/sales-payments.service';

@Component({
  selector: 'app-payment-report-data',
  templateUrl: './payment-report-data.component.html',
  styleUrls: ['./payment-report-data.component.scss']
})
export class PaymentReportDataComponent implements OnInit {

  @Input() site    : ISite;
  @Input() dateTo  : string;
  @Input() dateFrom: string;
  @Input() notifier: Subject<boolean>
  @Input() groupBy = "paymentMethod"
  @Input() zrunID  : string;
  @Input() sales   : IPaymentSalesSummary;

  constructor(
    private reportingItemsSalesService: ReportingItemsSalesService)
     { }

  ngOnInit(): void {
    const i = 0
  }

  downloadCSV() {
    if (!this.sales) { return }
    this.reportingItemsSalesService.downloadFile(this.sales.paymentSummary, 'PaymentReport')
  }
}
