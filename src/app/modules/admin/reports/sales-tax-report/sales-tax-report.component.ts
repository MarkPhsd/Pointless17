import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { catchError, Observable, of, Subject, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IReportingSearchModel, IReportItemSales, ITaxReport, ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';

@Component({
  selector: 'sales-tax-report',
  templateUrl: './sales-tax-report.component.html',
  styleUrls: ['./sales-tax-report.component.scss']
})
export class SalesTaxReportComponent implements OnInit, OnChanges {

  @Input() summaryOnly: boolean;
  //[site]="site" [dateFrom]="dateFrom" [dateTo]="dateTo"   [notifier]="childNotifier"
  @Input() site: ISite;
  @Input() dateTo: string;
  @Input() dateFrom: string;

  @Input() scheduleDateStart: string;
  @Input() scheduleDateEnd: string;
  // scheduleDateStart       :     string;
  // scheduleDateEnd         :     string;
  @Input() notifier: Subject<boolean>
  @Input() zrunID  : string;
  @Input() minimized: boolean;
  @Input() pendingTransactions: boolean;
  sales: ITaxReport;
  sales$ : Observable<ITaxReport>;
  constructor(private reportingItemsSalesService: ReportingItemsSalesService) { }
  processing: boolean;

  ngOnInit(): void {
    // this.refreshSales()
    // console.log('')
    const i = 0
  }

  ngOnChanges() {
    this.refreshSales();
  }

  refreshSales() {

    this.processing = true;

    let item = {startDate: this.dateFrom, endDate: this.dateTo, zrunID: this.zrunID, 
                pendingTransactions: this.pendingTransactions, 
                scheduleDateEnd: this.scheduleDateEnd, 
                scheduleDateStart: this.scheduleDateStart } as IReportingSearchModel;

    if (item.scheduleDateEnd && item.scheduleDateStart) {
      console.log('performing schedule report')
      this.sales$ =
      this.reportingItemsSalesService.putSalesTaxReport
        (this.site, item ).pipe(switchMap(data => {
          this.sales = data;
          this.processing = false;
          return of(data)
        })),catchError(data => { 
          console.log('data error', data)
          return of(data )
        })
      return
    }

    if (item.zrunID) {
      this.sales$ =
      this.reportingItemsSalesService.putSalesTaxReport
        (this.site, item ).pipe(switchMap(data => {
          this.sales = data;
          this.processing = false;
          return of(data)
        }))
      return
    }

    console.log('performing range report')
  
    this.sales$ =
      this.reportingItemsSalesService.putSalesTaxReport
        (this.site, item).pipe(switchMap(data => {
          this.sales = data;
          this.processing = false;
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
