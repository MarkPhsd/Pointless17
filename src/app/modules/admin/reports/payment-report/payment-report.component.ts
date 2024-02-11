import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { supportsReferrerPolicy } from '@sentry/utils';
import { Observable, Subject, of, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IPaymentSalesSearchModel, IPaymentSalesSummary, PaymentSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';

@Component({
  selector: 'payment-report',
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.scss']
})
export class PaymentReportComponent implements OnInit, OnChanges {

  @Input()  type    : string;
  @Input()  site    : ISite;
  @Input()  dateTo  : string;
  @Input()  dateFrom: string;
  @Input()  notifier: Subject<boolean>
  @Input()  groupBy = "paymentMethod"
  @Input()  zrunID  : string;
  @Input()  reportRunID: number;
  @Output() renderComplete = new EventEmitter<any>()
  @Input()  surCharge: boolean;
  refreshList = []
  @Input() autoPrint: boolean;
  refunds$           : Observable<IPaymentSalesSummary>;
  sales$             : Observable<IPaymentSalesSummary>;
  voids$             : Observable<IPaymentSalesSummary>;
  sales              : PaymentSummary[];
  paymentSalesSummary: IPaymentSalesSummary;
  message            : string;
  styles$            : Observable<any>;
  @Output() outputComplete = new EventEmitter<any>()

  constructor(
    private httpClient: HttpClient,
    private salesPaymentService: SalesPaymentsService) { }

  ngOnInit() {
    this.initStyle()
    this.refreshReports()
  }

  initStyle() {
    this.voids$ = null;
    this.refunds$ = null;
    this.sales$ = null;

    this.styles$ =  this.httpClient.get('assets/htmlTemplates/balancesheetStyles.txt', {responseType: 'text'}).pipe(switchMap(data => {
      const style = document.createElement('style');
      style.innerHTML = data;
      document.head.appendChild(style);
      return of(data)
    })).pipe(switchMap(data => {
      return of(data)
    }))
  }

  ngOnChanges() {
    this.refreshReports()
  }

  refreshReports() {
    this.voids$ = null;
    this.refunds$ = null;
    this.sales$ = null;

    // console.log('sales')
    if (this.type === 'service') {
      this.refreshService();
    }

    if (this.type == 'sales') {
      this.refreshSales();
      this.refreshRefunds();
      this.refreshVoids();
      return;
    }

    if (this.type != 'refunds' && this.type != 'voids' ) {
      this.refreshSales();
      return;
    }

    if (this.type == 'refunds') {
      this.refreshRefunds();
      return;
    }

    if (this.type == 'voids') {
      this.refreshVoids();
      return;
    }
  }

  checkList(value) {
    this.refreshList.push(1)
    if (this.refreshList.length > 2 ) {
      this.renderComplete.emit(true)
      this.outputComplete.emit('paymentReport')
    }
  }

  refreshSales() {
    const searchModel = {} as IPaymentSalesSearchModel;
    searchModel.startDate = this.dateFrom;
    searchModel.endDate   = this.dateTo;
    searchModel.groupBy   = this.groupBy;
    searchModel.zrunID    = this.zrunID;
    searchModel.reportRunID = this.reportRunID;
    this.sales$  = this.salesPaymentService.getPaymentSales(this.site, searchModel).pipe(switchMap(data => {
      this.checkList(1)
      // console.log('type', this.type)
      if (this.type == 'service' || this.groupBy === 'service' ||
          this.groupBy == 'paymentMethod' ||
          this.groupBy == 'devicename' ||
          this.groupBy === 'orderEmployeeCount' ||
          this.groupBy === 'employee') {
        this.outputComplete.emit('paymentReport')
      }
      return of(data)
    }))
  }

  refreshRefunds() {
    const searchModel = {} as IPaymentSalesSearchModel;
    searchModel.startDate = this.dateFrom;
    searchModel.endDate   = this.dateTo;
    searchModel.groupBy   = this.groupBy;
    searchModel.zrunID    = this.zrunID;
    searchModel.reportRunID = this.reportRunID;
    searchModel.refunds   = true;
    this.refunds$          = this.salesPaymentService.getPaymentSales(this.site, searchModel).pipe(switchMap(data => {
      this.checkList(1)
      if (this.type == 'refunds') {
        this.outputComplete.emit('paymentReport')
      }
      return of(data)
    }))
  }

  refreshVoids() {
    const searchModel = {} as IPaymentSalesSearchModel;
    searchModel.startDate = this.dateFrom;
    searchModel.endDate   = this.dateTo;
    searchModel.groupBy   = this.groupBy;
    searchModel.zrunID    = this.zrunID;
    searchModel.reportRunID = this.reportRunID;
    searchModel.voids       = true
    this.voids$             = this.salesPaymentService.getPaymentSales(this.site, searchModel).pipe(switchMap(data => {
      this.checkList(1)
      if (this.type == 'voids') {
        this.outputComplete.emit('paymentReport')
      }
      return of(data)
    }))
  }

  refreshService() {
    const searchModel = {} as IPaymentSalesSearchModel;
    searchModel.startDate = this.dateFrom;
    searchModel.endDate   = this.dateTo;
    searchModel.groupBy   = this.groupBy;
    searchModel.zrunID    = this.zrunID;
    searchModel.reportRunID = this.reportRunID;
    searchModel.voids     = true
    this.voids$         = this.salesPaymentService.getPaymentSales(this.site, searchModel).pipe(switchMap(data => {
      this.checkList(1)
      if (this.type == 'service') {
        this.outputComplete.emit('paymentReport')
      }
      return of(data)
    }))
  }
}
