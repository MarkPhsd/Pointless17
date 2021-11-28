import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IReportingSearchModel, IReportItemSales, ITaxReport, ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';

@Component({
  selector: 'sales-tax-report',
  templateUrl: './sales-tax-report.component.html',
  styleUrls: ['./sales-tax-report.component.scss']
})
export class SalesTaxReportComponent implements OnInit, OnChanges {

  //[site]="site" [dateFrom]="dateFrom" [dateTo]="dateTo"   [notifier]="childNotifier"
  @Input() site: ISite;
  @Input() dateTo: string;
  @Input() dateFrom: string;
  @Input() notifier: Subject<boolean>
  @Input() zrunID  : string;
  @Input() minimized: boolean;

  sales$ : Observable<ITaxReport>;
  constructor(private reportingItemsSalesService: ReportingItemsSalesService) { }

  ngOnInit(): void {
    // this.refreshSales()
    console.log('')
  }

  ngOnChanges() {
    this.refreshSales();
  }

  refreshSales() {
    this.sales$ =
      this.reportingItemsSalesService.putSalesTaxReport
        (this.site, this.dateFrom, this.dateTo, this.zrunID)
  }



}
