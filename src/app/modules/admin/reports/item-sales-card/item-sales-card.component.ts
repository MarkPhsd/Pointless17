import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { Observable, of, Subject, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { IReportingSearchModel, IReportItemSales, ITaxReport, ReportingItemsSalesService, IReportItemSaleSummary, POSItemSearchModel, TaxSalesReportResults } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { SalesItemsComponent } from './sales-items/sales-items.component';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatIconModule } from '@angular/material/icon';
// https://stackoverflow.com/questions/51487689/angular-5-how-to-export-data-to-csv-file

@Component({
  selector: 'item-sales-card',
  standalone: true,
  imports: [CommonModule,MatLegacyCardModule,
    MatLegacyButtonModule,
    MatIconModule,
    MatDividerModule,
    MatLegacyProgressSpinnerModule,
    SalesItemsComponent,
    SharedPipesModule,
  ],
  templateUrl: './item-sales-card.component.html',
  styleUrls: ['./item-sales-card.component.scss']
})
export class ItemSalesCardComponent implements OnInit,OnChanges {
  @ViewChild('salesView')           salesView: TemplateRef<any>;
  @ViewChild('activeReportView')    activeReportView: TemplateRef<any>;
  @ViewChild('adjustmentView')      adjustmentView: TemplateRef<any>;
  @Input() viewType : string;
  @Input() site     : ISite;
  @Input() dateTo   : string;
  @Input() dateFrom : string;
  @Input() scheduleDateStart : string;
  @Input() scheduleDateEnd : string;
  @Input() completed : boolean;
  @Input() notifier : Subject<boolean>
  @Input() zrunID   : string;
  @Input() reportRunID: number;
  @Input() groupBy  : string;
  @Input() reportName: string;
  @Input() removeGiftCard= true;
  @Input() taxFilter = 0;
  @Input() includeDepartments: boolean;
  @Input() autoPrint : boolean;
  @Input() prepView: boolean;
  @Input() locationID : number;
  @Input() prepStatus : number;

  printReadyList = []
  @Output() renderComplete = new EventEmitter<any>();
  @Output() outputComplete = new EventEmitter<any>()
  adjustments$:  Observable<unknown>;
  adjustments: IReportItemSaleSummary;
  action$ :  Observable<unknown>;
  sales$:  Observable<unknown>;
  prepSummary$:  Observable<unknown>;
  showAll: boolean;
  sales: IReportItemSaleSummary | TaxSalesReportResults
  hideList = false;

  constructor(
    private reportingItemsSalesService: ReportingItemsSalesService,
    private orderMethodsService: OrderMethodsService,
    private popOutService: ProductEditButtonService,
    private cdr: ChangeDetectorRef,
    private siteSerivce: SitesService,)
     { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.site) {
      this.refreshSales();
    }
  }

  ngOnInit(): void {
    if (this.site) {
      this.refreshSales();
    }
  }

  togglesShowAll() {
    this.showAll = !this.showAll;
  }

  refreshSales() {

    if (this.viewType === 'adjustment') {
      this.getAdustmentReport();
      return;
    }

    const searchModel = {} as IReportingSearchModel;
    if (this.groupBy === 'transactionType') {
      searchModel.getServiceFees = true
      searchModel.pendingTransactions = false
    }
    if (this.groupBy === 'serviceFees') {
      searchModel.groupByProduct = true;
      searchModel.getServiceFees = true
      searchModel.groupBy = "serviceFees";
    }

    if (this.groupBy === 'items') {   searchModel.groupByProduct = true; }
    if (this.groupBy === 'category') {   searchModel.groupByCategory = true;  }
    if (this.groupBy === 'department') {   searchModel.groupByDepartment = true;  }
    if (this.groupBy === 'type') {   searchModel.groupByType = true;  }
    if (this.groupBy === 'brand') {   searchModel.groupBy = "brand";  }
    if (this.groupBy === 'subCategory') {   searchModel.groupBy = "subCategory";  }
    if (this.groupBy === 'vendor') {   searchModel.groupBy = "vendor";  }
    if (this.removeGiftCard) {  }

    if (this.groupBy === 'void' || this.groupBy === 'voiditem') {
      searchModel.groupBy = 'voiditem'
      searchModel.groupByProduct = true;
      searchModel.groupByType = false;
    }

    searchModel.removeGiftCards   = this.removeGiftCard
    searchModel.startDate         = this.dateFrom;
    searchModel.endDate           = this.dateTo;
    searchModel.zrunID            = this.zrunID;
    searchModel.scheduleDateStart = this.scheduleDateStart
    searchModel.scheduleDateEnd   = this.scheduleDateEnd;
    searchModel.taxFilter         = this.taxFilter;
    searchModel.reportRunID       = this.reportRunID;

    if (this.groupBy === 'itemQuantity' || this.groupBy === 'uom' || this.groupBy === 'itemSize') {
      searchModel.groupByType = true;
      this.getSpecialReports(this.groupBy, searchModel)
      return
    }

    if (this.prepView) {
      this.getPrepSummary()
    }

    if (this.site) {
      if (this.groupBy === 'transactionType') {
        searchModel.groupBy = this.groupBy
        this.sales$ = this.reportingItemsSalesService.getTransactionTypeSalesReport(this.site, searchModel).pipe(switchMap(data => {
          this.sales = data;
          this.cdr.detectChanges()
          return of(data)
        })).pipe(switchMap(data => {
          setTimeout(data => {
            this.renderComplete.emit(true)
            this.outputComplete.emit('item sales transactionType')
          },500);
          return of(data)
        }))
        return;
      }
    }

    if (this.site) {
      this.sales$ = this.reportingItemsSalesService.groupItemSales(this.site, searchModel).pipe(switchMap(data => {
        this.sales = data;
        this.cdr.detectChanges()
        this.outputComplete.emit('item groupItem Sales')
        this.renderComplete.emit(true)
        return of(data)
      }))
    }
    return
  }

  getPrepSummary() {
    let search = {}  as IReportingSearchModel
    search.itemsPrepped = this.prepStatus;
    search.locationID   = this.locationID
    search.itemsPrinted = 1;
    // locationID : this.locationID, prepStatus: this.prepStatus, itemsPrinted : 1
    this.prepSummary$ = this.reportingItemsSalesService.getItemsToPrep(this.site, search ).pipe(switchMap(data => {
      this.sales = data;
      return of(data)
    }))
  }

  getSpecialReports(name: string, model: any) {
    if (this.site) {
      let sales$: Observable<IReportItemSaleSummary>
      if (name = 'itemSize') {
        sales$ = this.getItemSizeSalesReport(model, this.site)
      }
      if (name = 'itemQuantity') {
        sales$ = this.getItemQuantityGroupedReport(model, this.site)
      }
      if (name = 'uom') {
        sales$ = this.getUOMReport(model, this.site)
      }
      this.sales$ = sales$.pipe(switchMap(data => {
        this.sales = data;
        this.cdr.detectChanges()
        this.outputComplete.emit('item groupItem Sales')
        this.renderComplete.emit(true)
        return of(data)
      }))
    }
  }
    //itemSize
    //itemQuantity

    // itemQuantityGroupedSales
    // itemSizeSales
    // <!-- GetItemSizeSalesReport
    // GetItemQuantityGroupedReport -->
  getItemSizeSalesReport(model: any, site: ISite) {
    return this.reportingItemsSalesService.getUOMReport(this.site, model)
  }
  getUOMReport(model: any, site: ISite) {
    return this.reportingItemsSalesService.getUOMReport(this.site, model)
  }
  getItemQuantityGroupedReport(model: any, site: ISite) {
   return this.reportingItemsSalesService.getItemQuantityGroupedReport(this.site, model)
  }

  dataGridView() {
    this.popOutService.openDynamicGrid(
      {data: this.sales.results, name: 'IReportItemSales'}
    )
  }

  sortUser(list) {
    if (this.sales) {
      this.sales.results = list.sort((a, b) => (a.employeeName < b.employeeName ? 1 : -1));
    }
    if (this.adjustments) {
      let itemList = list as  IReportItemSales[]
      this.adjustments.results = itemList.sort((a, b) => (a.employee < b.employee ? 1 : -1));
    }
  }

  getAdustmentReport() {
    const searchModel = {} as POSItemSearchModel;
    searchModel.completionDate_From         = this.dateFrom;
    searchModel.completionDate_To           = this.dateTo;
    searchModel.zrunID                      = this.zrunID;
    searchModel.reportRunID                 = +this.reportRunID;
    searchModel.pageSize                    = +1000;

    this.sales$ = this.reportingItemsSalesService.listAdjustedItems(this.site, searchModel).pipe(switchMap(data => {
       this.adjustments = data as IReportItemSaleSummary;
       this.cdr.detectChanges()
       this.outputComplete.emit('item getAdustmentReport')
       console.log('item getAdustmentReport')
       this.renderComplete.emit(true)
      return of(data)
    }))
    return;
  }

  downloadCSV() {
    if (this.sales) {
      this.reportingItemsSalesService.downloadFile(this.sales.results, 'ItemReport')
    }
  }

  get reportView() {
    if (this.viewType === 'sales') {
      return this.salesView;
    }
    if (this.viewType === 'activeReportView') {
      return this.activeReportView;
    }
    if (this.viewType === 'adjustment') {
      return this.adjustmentView;
    }
    if (this.viewType === 'voids') {
      return this.salesView;
    }
  }

  setItemGroupAsPrepped(id: number): Observable<IReportItemSaleSummary> {
    const site = this.siteSerivce.getAssignedSite();

    if (id &&   this.scheduleDateStart && this.scheduleDateEnd) {

      const sales = this.sales as  IReportItemSaleSummary
      const action$ =  this.orderMethodsService.setItemGroupAsPrepped(site, id,
                                                                  this.scheduleDateStart,
                                                                  this.scheduleDateEnd,
                                                                  sales)
      return action$.pipe(switchMap(data => {
        if (data) {
          this.renderComplete.emit(true)
          this.outputComplete.emit('item setItemGroupAsPrepped')
          console.log('item setItemGroupAsPrepped')
          sales.results.filter(item => {
            return !item.id
          })
        }
        return of(data)
      }))

    }
    return of(null)
  }

  sortName(list) {
    if (this.sales) {
      this.sales.results = list.sort((a, b) => (a.productName < b.productName ? 1 : -1));
    }
    if (this.adjustments) {
      let itemList = list as  IReportItemSales[]
      this.adjustments.results = itemList.sort((a, b) => (a.productName < b.productName ? 1 : -1));
    }
  }

  sortSales(list) {
    if (this.sales) {
      this.sales.results = list.sort((a, b) => (a.itemTotal < b.itemTotal ? 1 : -1));
    }

    if (this.adjustments) {
      let itemList = list as  IReportItemSales[]
      this.adjustments.results = itemList.sort((a, b) => (a.originalPrice < b.originalPrice ? 1 : -1));
    }
  }

  setPrintReady() {

  }

}

