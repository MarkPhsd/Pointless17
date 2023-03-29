import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Observable, of, Subject, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IReportingSearchModel, IReportItemSales, ITaxReport, ReportingItemsSalesService, IReportItemSaleSummary } from 'src/app/_services/reporting/reporting-items-sales.service';
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

  @Input() viewType = 'sales'
  @Input() site     : ISite;
  @Input() dateTo   : string;
  @Input() dateFrom : string;

  @Input() scheduleDateStart : string;
  @Input() scheduleDateEnd : string;

  @Input() completed : boolean;
  @Input() notifier : Subject<boolean>
  @Input() zrunID   : string;
  @Input() groupBy  : string;
  @Input() reportName: string;
  @Input() removeGiftCard= true;
  sales$:  Observable<IReportItemSaleSummary>;
  showAll: boolean;
  action$ :  Observable<any>;
  sales: IReportItemSaleSummary
  hideList = false;
  constructor(
    private reportingItemsSalesService: ReportingItemsSalesService, 
    private orderMethodsService: OrderMethodsService,
    private siteSerivce: SitesService,)
     { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.site) {
      this.refreshSales();
    }
  }

  ngOnInit(): void {
    console.log(this.site)
    if (this.site) {
      this.refreshSales();
    }
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
    if (this.removeGiftCard) {

    }
    searchModel.removeGiftCards   = this.removeGiftCard
    searchModel.startDate         = this.dateFrom;
    searchModel.endDate           = this.dateTo;
    searchModel.zrunID            = this.zrunID;
    searchModel.scheduleDateStart = this.scheduleDateStart
    searchModel.scheduleDateEnd   = this.scheduleDateEnd;
  
    if (this.site) {
      this.sales$ = this.reportingItemsSalesService.groupItemSales(this.site, searchModel).pipe(switchMap(data => {
        this.sales = data;
        return of(data)
      }))
    }
    return
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
  } 

  setItemGroupAsPrepped(id: number): Observable<IReportItemSaleSummary> {
      const site = this.siteSerivce.getAssignedSite();
    
      if (id &&   this.scheduleDateStart && this.scheduleDateEnd) {
        const action$ =  this.orderMethodsService.setItemGroupAsPrepped(site, id, 
                                                                   this.scheduleDateStart, 
                                                                   this.scheduleDateEnd,
                                                                   this.sales)

       return action$.pipe(switchMap(data => {
          if (data) { 
            this.sales.results.filter(item => { 
              return !item.ID
            })
          }
          return of(data)
        }))
      
      }

      return of(null)
    }



}

