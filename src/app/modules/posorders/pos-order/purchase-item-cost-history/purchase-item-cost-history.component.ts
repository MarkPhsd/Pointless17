import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { Observable, switchMap, of, Subscription } from 'rxjs';
import { IPOSOrder, ISite, PosOrderItem } from 'src/app/_interfaces';
import { HistoricalSalesPurchaseOrderMetrcs, OrdersService, ReportingService } from 'src/app/_services';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { IReportItemSales, ItemPOMetrics, POSItemSearchModel } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'purchase-item-cost-history',
  templateUrl: './purchase-item-cost-history.component.html',
  styleUrls: ['./purchase-item-cost-history.component.scss']
})
export class PurchaseItemCostHistoryComponent implements OnInit, OnDestroy, OnChanges {
  searchModel: POSItemSearchModel
  @Input() order: IPOSOrder
  @Input() site: ISite;
  @Input() product: PosOrderItem;
  itemHistorySales$ : Observable<HistoricalSalesPurchaseOrderMetrcs>;
  loadingMessage: boolean;
  _lastItem: Subscription;
 
  itemSales$: Observable<HistoricalSalesPurchaseOrderMetrcs>;

  @Input() barcode: string;
  @Input() productID: number;
  @Input() inputForm: UntypedFormGroup;
  @Input() dateFrom: any;
  @Input() dateTo: any;
  constructor(
    private siteService: SitesService,
    public orderMethodsService: OrderMethodsService,
    private fb: FormBuilder,
    private dateHelper: DateHelperService,
    private orderService: OrdersService,
    private reportingService: ReportingService ) { }

  ngOnInit( ): void {
    this._lastItem = this.orderMethodsService.lastSelectedItem$.subscribe(data => {
      if (!this.productID) {
        this.itemHistorySales$ = this.getAssignedItems(data)
        this.getSalesByDateRange(data)
      }
    })
    this.initCompletionDateForm()
  }

  ngOnChanges() {
    this.getItemByBarcode()
  }

  getItemByBarcode() {
    if (this.productID) {
      const site = this.siteService.getAssignedSite()
      const search = {} as POSItemSearchModel;
      search.productID = this.productID;
      this.loadingMessage = false
      search.showVoids = false
      this.itemHistorySales$  =  this.reportingService.getMetrcsForPO(site, search).pipe(switchMap(data => {
        return of(data)
      }))
    }
  }


  ngOnDestroy() {
    this.itemHistorySales$ = null;
    this.orderMethodsService.updateLastItemSelected(null)
    this.orderService.completionDate_From = null// this.dateHelper.getFormattedByDate(this.searchModel.completionDate_From)
    this.orderService.completionDate_To   = null// this.dateHelper.getFormattedByDate(this.searchModel.completionDate_To)
    
  }

  getAssignedItems(item: PosOrderItem) {
    this.product = null;
    if (this.order && this.order.service.filterType == 1) {
      this.loadingMessage = true
      this.product = item
      if (item && item.productName) {
        const search = {} as POSItemSearchModel;
        search.productName = item.productName;
        const site = this.siteService.getAssignedSite()
        this.loadingMessage = false
        this.refreshSales()
        return this.reportingService.getMetrcsForPO(site, search)
      }
    }
    this.loadingMessage = false
    return of(null)
  }


  initCompletionDateForm() {
    this.inputForm  = this.initForm() //this.getFormRangeInitial(this.scheduleDateForm)
    if (this.inputForm) { 
      if (this.inputForm.get("start").value) {
        this.searchModel.completionDate_From = this.inputForm.get("start").value;
      }
      if (this.inputForm.get("end").value) { 
        this.searchModel.completionDate_To   = this.inputForm.get("end").value;
      }
    }
    this.subscribeToCompletionDatePicker();
  }

  toggleDateRangeFilter() {
    this.initCompletionDateForm()
  }

  subscribeToCompletionDatePicker() {
    const form = this.subscribeToDateRangeData(this.inputForm)
    if (!form) {return}
    form.valueChanges.subscribe( res=> {
      if (form.get("start").value &&
          form.get("end").value) {
          this.orderService.completionDate_From = this.dateHelper.getFormattedByDate(this.searchModel.completionDate_From)
          this.orderService.completionDate_To   = this.dateHelper.getFormattedByDate(this.searchModel.completionDate_To)
          const site = this.siteService.getAssignedSite()
          this.itemSales$  =  this.reportingService.getMetrcsForPO(site, this.searchModel).pipe(switchMap(data => {
            return of(data)
          }))
      }
    })
  }

  refreshSales() { 
    this.getSalesByDateRange(this.product)
  }

  getSalesByDateRange(product) { 
    if (!this.dateFrom || !this.dateTo) { return}
    if (!this.product) {return }
    
    const searchModel = {} as POSItemSearchModel
    searchModel.completionDate_From = this.dateHelper.getFormattedByDate(this.dateFrom);
    searchModel.completionDate_To = this.dateHelper.getFormattedByDate(this.dateTo);
    searchModel.productName = product.productName;
    const site = this.siteService.getAssignedSite()

    this.orderService.completionDate_From = searchModel.completionDate_From;
    this.orderService.completionDate_To = searchModel.completionDate_To;

    let sales: any;
    const order = this.orderMethodsService.currentOrder;
    let order$ = this.orderService.getOrder(site, order?.id.toString(), false, this.orderService.completionDate_From, this.orderService.completionDate_To)
    let sales$ = this.reportingService.getSalesByRange(site, searchModel)
    // this.itemSales$  =  order$.pipe(switchMap(data => {
    //     this.orderMethodsService.updateOrder(data)
      return sales$.pipe(switchMap(data => { 
        return of(data)
      }))
    }

  subscribeToDateRangeData(form: UntypedFormGroup) {
    if (form) {
      form.get('start').valueChanges.subscribe( res=> {
        if (!res) {return}
        this.dateFrom = res
      }
    )

    form.get('end').valueChanges.subscribe( res=> {
      if (!res) {return}
      this.dateTo = res
      }
    )
    return form
  }}

  initForm() {
    return  this.fb.group({
      start: [],
      end: []
    })
  }

}
