import { Component, Input, OnInit } from '@angular/core';
import { timeStamp } from 'console';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { IPaymentSalesSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-audit-payment',
  templateUrl: './audit-payment.component.html',
  styleUrls: ['./audit-payment.component.scss']
})
export class AuditPaymentComponent implements OnInit {

  @Input() dateFrom : string;
  @Input() dateTo: string;
  @Input() zrunID : number;
  @Input() site: ISite;
  @Input() notifier
  history: boolean;

  auditPayment$ : Observable<IPaymentSalesSummary>;
  auditPayment  : IPaymentSalesSummary;

  constructor(
    private orderMethodsService: OrderMethodsService,
    private orderService       : OrdersService,
    private paymentReportService: SalesPaymentsService,
    private dateHelper: DateHelperService,
  ) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    if (this.dateFrom && this.dateTo) {
      const dateFrom = new Date(this.dateFrom)
      const dateTo = new Date(this.dateTo)
      if (this.areDatesSame(dateFrom , dateTo)) {
        let dateTo = this.dateHelper.add('d', 1, dateFrom);
        this.dateTo = this.dateHelper.format(dateTo.toISOString(), 'MM/dd/yyyy');
      }
    }
    this.auditPayment$ = this.paymentReportService.getPaymentDiscrepancy(this.site, this.zrunID, this.dateFrom,this.dateTo)
  }

  areDatesSame(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
 }

  setOrder(id: number, history: boolean) {
    if (id) {
      let history = false
      if (this.dateFrom && this.dateTo) {
        history = true;
      }
      this.orderService.getOrder(this.site, id.toString(), history).subscribe(data => {
        this.orderMethodsService.setActiveOrder(this.site, data)
        }
      )
    }
  }


}
