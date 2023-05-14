import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { MetrcSalesService } from 'src/app/_services/metrc/metrc-sales.service';
import { METRCSalesReportPaged, PointlessMETRCSalesService, PointlessMetrcSearchModel } from 'src/app/_services/metrc/pointless-metrcsales.service';
import { ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { IPaymentSalesSummary } from 'src/app/_services/reporting/sales-payments.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-metrc-summary',
  templateUrl: './metrc-summary.component.html',
  styleUrls: ['./metrc-summary.component.scss']
})
export class MetrcSummaryComponent implements OnInit, OnChanges {

  @Input() site    : ISite;
  @Input() dateTo  : string;
  @Input() dateFrom: string;
  @Input() notifier: Subject<boolean>
  @Input() groupBy : string;
  @Input() type    : string;
  @Input() zrunID  : string;
  @Input() counter: number;
  @Input() sales   : IPaymentSalesSummary;
  public metrcSummary$ : Observable<METRCSalesReportPaged>;

  constructor(
    private metrcSalesService: MetrcSalesService,
    private pointlessMETRCSalesService: PointlessMETRCSalesService,
    private siteService: SitesService,
    private reportingItemsSalesService: ReportingItemsSalesService,)
  { }

  ngOnInit(): void {
    this.refreshSales()
  }

  ngOnChanges() {
    this.refreshSales();
  }

  refreshSales() {
    const search = {} as PointlessMetrcSearchModel;
    search.endDate = this.dateTo;
    search.startDate = this.dateFrom;
    search.zRUN = this.zrunID;
    // const site = this.siteService.getAssignedSite()
    this.metrcSummary$ = this.pointlessMETRCSalesService.getSalesSummary(this.site, search)
  }

  // downloadCSV() {
  //   if (!this.sales) { return }
  //   this.reportingItemsSalesService.downloadFile(this.sales.paymentSummary, 'PaymentReport')
  // }

}
