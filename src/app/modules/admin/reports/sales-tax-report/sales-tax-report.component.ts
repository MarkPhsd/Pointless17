import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject, switchMap } from 'rxjs';
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
  sales: ITaxReport;
  sales$ : Observable<ITaxReport>;
  constructor(private reportingItemsSalesService: ReportingItemsSalesService) { }

  ngOnInit(): void {
    // this.refreshSales()
    // console.log('')
    const i = 0
  }

  ngOnChanges() {
    this.refreshSales();
  }

  refreshSales() {

    if (this.zrunID) {
      this.sales$ =
      this.reportingItemsSalesService.putSalesTaxReport
        (this.site, null, null, this.zrunID).pipe(switchMap(data => {
          this.sales = data;
          return of(data)
        }))
      return
    }

    this.sales$ =
      this.reportingItemsSalesService.putSalesTaxReport
        (this.site, this.dateFrom, this.dateTo, null).pipe(switchMap(data => {
          this.sales = data;
          return of(data)
        }))
  }

  downloadCSV() {
    if (!this.sales) { return }
    console.log('sales', this.sales)
    const item = [] as unknown as ITaxReport[];
    item.push (this.sales)
    this.reportingItemsSalesService.downloadFile(item, 'SalesTaxReport')
  }

}
