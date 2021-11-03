import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IPaymentSalesSearchModel, IPaymentSalesSummary, PaymentSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';

@Component({
  selector: 'app-payment-report',
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.scss']
})
export class PaymentReportComponent implements OnInit,OnChanges {

  //[site]="site" [dateFrom]="dateFrom" [dateTo]="dateTo"   [notifier]="childNotifier"
  @Input() site    : ISite;
  @Input() dateTo  : string;
  @Input() dateFrom: string;
  @Input() notifier: Subject<boolean>
  @Input() groupBy = "paymentMethod"
  @Input() zrunID  : string;

  sales$             : Observable<IPaymentSalesSummary>;
  sales              : PaymentSummary[]
  paymentSalesSummary: IPaymentSalesSummary
  message            : string;

  constructor(private salesPaymentService: SalesPaymentsService) { }

  ngOnInit(): void {
    console.log('')
  }

  ngOnChanges() {
    this.refreshSales();
  }

  refreshSales() {
    const searchModel = {} as IPaymentSalesSearchModel
    searchModel.startDate = this.dateFrom;
    searchModel.endDate   = this.dateTo;
    searchModel.groupBy   = this.groupBy;
    searchModel.zrunID    = this.zrunID;

    console.log('searchModel', searchModel)
    this.sales$  = this.salesPaymentService.getPaymentSales(this.site, searchModel)
    // .subscribe( data=>
    //   {
    //     this.paymentSalesSummary = data;
    //     this.sales = data.paymentSummary;
    //     this.message = data.resultMessage
    //   }, error => {
    //     console.log("error", error)
    //   }
    // )
  }
}
