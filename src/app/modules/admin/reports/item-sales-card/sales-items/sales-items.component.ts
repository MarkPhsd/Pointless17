import { Component, Input, OnInit } from '@angular/core';
import { IReportItemSaleSummary, IReportItemSales, ITaxReport } from 'src/app/_services/reporting/reporting-items-sales.service';
import * as _ from "lodash";
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { of, switchMap, Observable } from 'rxjs';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sales-items',
  standalone: true,
  imports: [
    CommonModule,
    MatLegacyButtonModule,
    MatIconModule,
    MatDividerModule,
    SharedPipesModule, // Import custom pipes
  ],
  templateUrl: './sales-items.component.html',
  styleUrls: ['./sales-items.component.scss']
})
export class SalesItemsComponent implements OnInit {

  action$: Observable<any>;
  @Input() sales: IReportItemSales[] | ITaxReport[];
  @Input() includeDepartments: boolean;
  @Input() showSort = true;
  @Input() adjustments: IReportItemSaleSummary ;
  @Input() showAll : boolean;
  @Input() autoPrint : boolean;
  @Input() groupBy: string;

  groupedReport: any;
  constructor(
    private siteService: SitesService,
    private orderService: OrdersService,
    private orderMethodsService: OrderMethodsService
  ) { }

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
      let itemList = list // as  IReportItemSales[]

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

  viewOrder(id: number) {

    const site    = this.siteService.getAssignedSite();
    const orderCurrent$ = this.orderService.getOrder(site, id.toString(), false );
    const orderHistory$ = this.orderService.getOrder(site, id.toString(), true );
    this.action$ = orderCurrent$.pipe(
      switchMap(data =>  {
        if (!data) {
          return orderHistory$.pipe(switchMap(data => {
            this.orderMethodsService.setActiveOrder( data)
            return of(data)
          }))
        }
        this.orderMethodsService.setActiveOrder( data)
        return of(data)
      }
    ))
  }

}
