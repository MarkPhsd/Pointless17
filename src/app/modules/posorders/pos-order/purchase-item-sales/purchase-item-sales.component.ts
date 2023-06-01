import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IPOSOrder, ISite, PosOrderItem } from 'src/app/_interfaces';
import { ReportingService } from 'src/app/_services';
import { IReportItemSales, POSItemSearchModel } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'purchase-item-sales',
  templateUrl: './purchase-item-sales.component.html',
  styleUrls: ['./purchase-item-sales.component.scss']
})
export class PurchaseItemSalesComponent implements OnInit,OnChanges,OnDestroy {

  @Input() order: IPOSOrder
  @Input() site: ISite;
  @Input() item: PosOrderItem;
  itemHistorySales$ : Observable<IReportItemSales[]>;
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
      // this.product = null;
      if (this.order && this.order.service.filterType == 1) {
        this.loadingMessage = true
        // this.product = item
        if (item && item.productName) {
          // console.log('PurchaseItemSalesComponent', item)
          const search = {} as POSItemSearchModel;
          search.productName = item.productName;
          const site = this.siteService.getAssignedSite()
          this.loadingMessage = false
          return this.reportingService.getPurchaseOrderHelper(site, search)
        }
      }
      this.loadingMessage = false
      return of(null)
    }

  ngOnChanges() {
    // const item = this.orderMethodsService.assignPOSItems[0]
    // console.log('item changed', item.productName)

    // if (site && item) {
    //   const search = {} as POSItemSearchModel;
    //   search.productName = this.item.productName;
    //   this.itemHistorySales$ = this.reportingService.getPurchaseOrderHelper(site, search)
    // }
  }

}
