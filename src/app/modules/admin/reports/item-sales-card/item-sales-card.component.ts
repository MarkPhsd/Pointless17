import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, of, Subject, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { IReportingSearchModel, IReportItemSales, ITaxReport, ReportingItemsSalesService, IReportItemSaleSummary, POSItemSearchModel, TaxSalesReportResults } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
// https://stackoverflow.com/questions/51487689/angular-5-how-to-export-data-to-csv-file

@Component({
  selector: 'item-sales-card',
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
  printReadyList = []
  @Output() renderComplete = new EventEmitter<any>();

  adjustments$:  Observable<unknown>;
  adjustments: IReportItemSaleSummary;
  action$ :  Observable<unknown>;
  sales$:  Observable<unknown>;
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
    }
    if (this.groupBy === 'items') {   searchModel.groupByProduct = true; }
    if (this.groupBy === 'category') {   searchModel.groupByCategory = true;  }
    if (this.groupBy === 'department') {   searchModel.groupByDepartment = true;  }
    if (this.groupBy === 'type') {   searchModel.groupByType = true;  }
    if (this.removeGiftCard) {  }

    if (this.groupBy === 'void') {   
      searchModel.groupBy = 'void'
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
        this.renderComplete.emit(true)
        return of(data)
      }))
    }
    return
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
          sales.results.filter(item => {
            return !item.ID
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

