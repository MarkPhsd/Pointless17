import { Component, Input, OnInit } from '@angular/core';
import { IReportItemSaleSummary, IReportItemSales, ITaxReport } from 'src/app/_services/reporting/reporting-items-sales.service';
import * as _ from "lodash";
@Component({
  selector: 'app-sales-items',
  templateUrl: './sales-items.component.html',
  styleUrls: ['./sales-items.component.scss']
})
export class SalesItemsComponent implements OnInit {

  @Input() sales: IReportItemSales[] | ITaxReport[];
  @Input() includeDepartments: boolean;
  @Input() showSort = true;
  @Input() adjustments: IReportItemSaleSummary ;
  @Input() showAll : boolean;
  @Input() autoPrint : boolean;
  @Input() groupBy: string;

  groupedReport: any;
  constructor() { }

  ngOnInit(): void {
    //then we group by
    if (this.includeDepartments) {  this.groupedReport =  _.groupBy(this.sales, 'department');  }
  }

  sortName(list) {
    if (this.sales) {

      if (this.groupBy === 'void') {
        this.sales = list.sort((a, b) => (a.employee < b.employee ? 1 : -1));
        return;
      }

      this.sales = list.sort((a, b) => (a.productName < b.productName ? 1 : -1));
    }
    if (this.adjustments) {
      let itemList = list as  IReportItemSales[]

      if (this.groupBy === 'void') {
        this.adjustments.results = itemList.sort((a, b) => (a.employee < b.employee ? 1 : -1));
        return;
      }

      this.adjustments.results = itemList.sort((a, b) => (a.productName < b.productName ? 1 : -1));
    }
  }

  sortSales(list) {

    if (this.sales) {

      if (this.groupBy === 'void') {
        this.sales = list.sort((a, b) => (a.voidAmount < b.voidAmount ? 1 : -1));
        return;
      }

      this.sales = list.sort((a, b) => (a.itemTotal < b.itemTotal ? 1 : -1));
      return;
    }

    if (this.adjustments) {

      if (this.groupBy === 'void') {
        let itemList = list as  IReportItemSales[]
        this.adjustments.results = itemList.sort((a, b) => (a.voidAmount < b.voidAmount ? 1 : -1));
        return;
      }

      let itemList = list as  IReportItemSales[]
      this.adjustments.results = itemList.sort((a, b) => (a.originalPrice < b.originalPrice ? 1 : -1));
    }
  }

  viewOrder(id: any) {
    //determine if it's history or not
    //sale?.orderID*
  }
}
