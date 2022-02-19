import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IPaymentSalesSearchModel, IPaymentSalesSummary, PaymentSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';

@Component({
  selector: 'payment-report',
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.scss']
})
export class PaymentReportComponent implements OnInit, OnChanges {

  @Input() site    : ISite;
  @Input() dateTo  : string;
  @Input() dateFrom: string;
  @Input() notifier: Subject<boolean>
  @Input() groupBy = "paymentMethod"
  @Input() zrunID  : string;

  sales$             : Observable<IPaymentSalesSummary>;
  sales              : PaymentSummary[];
  paymentSalesSummary: IPaymentSalesSummary;
  message            : string;

  constructor(private salesPaymentService: SalesPaymentsService) { }

  ngOnInit(): void {

    console.log(this.groupBy);
  }

  ngOnChanges() {
    this.refreshSales();
  }

  refreshSales() {
    const searchModel = {} as IPaymentSalesSearchModel;
    searchModel.startDate = this.dateFrom;
    searchModel.endDate   = this.dateTo;
    searchModel.groupBy   = this.groupBy;
    searchModel.zrunID    = this.zrunID;
    this.sales$  = this.salesPaymentService.getPaymentSales(this.site, searchModel);
  }
}
