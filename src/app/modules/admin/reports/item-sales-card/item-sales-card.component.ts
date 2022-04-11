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
  @Input() reportName: string;
  sales$:  Observable<IReportItemSaleSummary>;
  showAll: boolean;

  constructor(private reportingItemsSalesService: ReportingItemsSalesService) { }

  ngOnChanges() {
    this.refreshSales();
  }

  togglesShowAll() {
    this.showAll = !this.showAll;
  }

  refreshSales() {
    const searchModel = {} as IReportingSearchModel
    if (this.groupBy === 'items') {
      searchModel.groupByProduct = true;
    }
    if (this.groupBy === 'category') {
      searchModel.groupByCategory = true;
    }
    if (this.groupBy === 'department') {
      searchModel.groupByDepartment = true;
    }
    if (this.groupBy === 'type') {
      searchModel.groupByType = true;
    }
    searchModel.startDate = this.dateFrom;
    searchModel.endDate = this.dateTo;
    searchModel.zrunID = this.zrunID;
    this.sales$ = this.reportingItemsSalesService.groupItemSales(this.site, searchModel)
    return
  }



}
