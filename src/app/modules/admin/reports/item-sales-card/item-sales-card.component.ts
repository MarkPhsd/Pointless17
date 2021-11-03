import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IReportingSearchModel, IReportItemSales, ITaxReport, ReportingItemsSalesService, IReportItemSaleSummary } from 'src/app/_services/reporting/reporting-items-sales.service';

@Component({
  selector: 'item-sales-card',
  templateUrl: './item-sales-card.component.html',
  styleUrls: ['./item-sales-card.component.scss']
})
export class ItemSalesCardComponent implements OnChanges {

  //[site]="site" [dateFrom]="dateFrom" [dateTo]="dateTo"   [notifier]="childNotifier"
  @Input() site     : ISite;
  @Input() dateTo   : string;
  @Input() dateFrom : string;
  @Input() notifier : Subject<boolean>
  @Input() zrunID   : string;
  @Input() groupBy  : string;
  sales$:  Observable<IReportItemSaleSummary>;

  constructor(private reportingItemsSalesService: ReportingItemsSalesService) { }

  ngOnChanges() {
    this.refreshSales();
  }

  refreshSales() {

    if (this.groupBy === 'items') {
      const searchModel = {} as IReportingSearchModel
      searchModel.startDate = this.dateFrom;
      searchModel.endDate = this.dateTo;
      searchModel.zrunID = this.zrunID;
      searchModel.groupByProduct = true;
      console.log(searchModel)
      this.sales$ =
          this.reportingItemsSalesService.groupItemSales(this.site, searchModel)
      return
    }

  }



}
