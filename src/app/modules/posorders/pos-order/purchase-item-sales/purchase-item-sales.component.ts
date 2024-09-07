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
  totalPurchases: number = 0;
  @Input() serviceType : string;
  @Input() barcode: string;
  @Input() productID: number;

  constructor(
    private siteService: SitesService,
    public orderMethodsService: OrderMethodsService,
    private reportingService: ReportingService ) { }

    ngOnInit( ): void {
      this._lastItem = this.orderMethodsService.lastSelectedItem$.subscribe(data => {
        if (!this.productID) {
          this.itemHistorySales$ = this.getAssignedItems(data)
        }
      })
    }

    ngOnChanges() {
      // console.log('on changes', this.productID)
      this.getItemByBarcode()
    }

    getItemByBarcode() {
      if (this.productID) {
        const site = this.siteService.getAssignedSite()
        const search = {} as POSItemSearchModel;
        search.productID   = this.productID;
        this.loadingMessage = false

        if (this.serviceType) {
          // search.serviceType = 'buy'
        }

        search.showVoids = false
        search.lessThanZero = true
        // console.log('get item by barcode')
        this.itemHistorySales$  = this.reportingService.getPurchaseOrderHelper(site, search).pipe(switchMap(data => {
          let  totalPurchases : number;
          totalPurchases = 0
          data.forEach(data => {
            if (data && data.quantity) {
              totalPurchases = +data.quantity + totalPurchases
            }
          })
          this.totalPurchases = totalPurchases;
          return of(data)
        }))
      }
    }

    ngOnDestroy() {
      this.itemHistorySales$ = null;
      this.orderMethodsService.updateLastItemSelected(null)
    }

    getAssignedItems(item: PosOrderItem) {
      if (this.order && this.order.service.filterType == 1) {
        this.loadingMessage = true
        if (item && item.productName) {
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



}
