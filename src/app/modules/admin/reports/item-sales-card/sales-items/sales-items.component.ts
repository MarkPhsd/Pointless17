import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IReportItemSaleSummary, IReportItemSales } from 'src/app/_services/reporting/reporting-items-sales.service';
import * as _ from "lodash";
@Component({
  selector: 'app-sales-items',
  templateUrl: './sales-items.component.html',
  styleUrls: ['./sales-items.component.scss']
})
export class SalesItemsComponent implements OnInit {

  @Input() sales: IReportItemSales[];
  @Input() includeDepartments: boolean;
  @Input() showSort = true;
  @Input() adjustments: IReportItemSaleSummary;
  @Input() showAll : boolean;
  groupedReport: any;
  constructor() { }

  ngOnInit(): void {

    //then we group by
    if (this.includeDepartments) {
      // console.log(_.groupBy(data, 'foo.name'));
      this.groupedReport =  _.groupBy(this.sales, 'department');
      // console.log('groupedreport', this.groupedReport)
    }

  }

  sortName(list) {
    if (this.sales) {
      this.sales = list.sort((a, b) => (a.productName < b.productName ? 1 : -1));
    }
    if (this.adjustments) {
      let itemList = list as  IReportItemSales[]
      this.adjustments.results = itemList.sort((a, b) => (a.productName < b.productName ? 1 : -1));
    }
  }

  sortSales(list) {
    if (this.sales) {
      this.sales = list.sort((a, b) => (a.itemTotal < b.itemTotal ? 1 : -1));
    }

    if (this.adjustments) {
      let itemList = list as  IReportItemSales[]
      this.adjustments.results = itemList.sort((a, b) => (a.originalPrice < b.originalPrice ? 1 : -1));
    }
  }
}
