import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, switchMap, of, Subscription } from 'rxjs';
import { IPOSOrder, ISite, PosOrderItem } from 'src/app/_interfaces';
import { HistoricalSalesPurchaseOrderMetrcs, ReportingService } from 'src/app/_services';
import { IReportItemSales, ItemPOMetrics, POSItemSearchModel } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'purchase-item-cost-history',
  templateUrl: './purchase-item-cost-history.component.html',
  styleUrls: ['./purchase-item-cost-history.component.scss']
})
export class PurchaseItemCostHistoryComponent implements OnInit, OnDestroy {

  @Input() order: IPOSOrder
  @Input() site: ISite;
  @Input() product: PosOrderItem;
  itemHistorySales$ : Observable<HistoricalSalesPurchaseOrderMetrcs>;
  loadingMessage: boolean;
  _lastItem: Subscription;

  constructor(
    private siteService: SitesService,
    public orderMethodsService: OrderMethodsService,
    private reportingService: ReportingService ) { }

  ngOnInit( ): void {
    this._lastItem = this.orderMethodsService.lastSelectedItem$.subscribe(data => {
      this.itemHistorySales$ = this.getAssignedItems(data)
    })
  }

  ngOnDestroy() {
    this.itemHistorySales$ = null;
    this.orderMethodsService.updateLastItemSelected(null)
  }

  getAssignedItems(item: PosOrderItem) {
    this.product = null;
    if (this.order && this.order.service.filterType == 1) {
      this.loadingMessage = true
      this.product = item
      if (item && item.productName) {
        console.log('PurchaseItemCostHistoryComponent', item)
        const search = {} as POSItemSearchModel;
        search.productName = item.productName;
        const site = this.siteService.getAssignedSite()
        this.loadingMessage = false
        return this.reportingService.getMetrcsForPO(site, search)
      }
    }
    this.loadingMessage = false
    return of(null)
  }

}
