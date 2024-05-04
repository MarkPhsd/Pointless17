import { DatePipe } from '@angular/common';
import { Component, OnInit,Input, OnDestroy } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ReportingService } from 'src/app/_services';
import { IDateRange } from 'src/app/_services/reporting/report-date-helpers.service';
import { IReportingSearchModel, IReportItemSaleSummary, ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { BalanceSheetService } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'app-card-dashboard',
  templateUrl: './card-dashboard.component.html',
  styleUrls: ['./card-dashboard.component.scss']
})
export class CardDashboardComponent implements OnInit, OnDestroy {

  site    : ISite;
  posName : string;
  sites$  : Observable<ISite[]>;
  @Input() disableActions: boolean;
  @Input() refreshTime  = 1;
  @Input() name         = 'A Chart';
  @Input() chartType    = 'line';
  @Input() chartHeight  = '350px';
  @Input() chartWidth   = '1200';
  @Input() menuType     : string;
  @Input() cardValueType: string;
  @Input() rangeType    : string;
  @Input() rangeValue   : number;
  @Input() dateFrom     : string;
  @Input() dateTo       : string;
  @Input() salesSummary ='salesSummary'
  errorMessage =[]  as string[]
  groupBy : string;
  itemNames = [] as string[]
  showReport: boolean;
  reportItemSaleSummary$: Observable<IReportItemSaleSummary>
  zrunID   : string;
  _sites   : Subscription;
  sites    : ISite[];
  sales$   : Observable<IReportItemSaleSummary>;
  salesList$ : any[]
  reportItemSaleSummaries: IReportItemSaleSummary[]

  initSitesSubscriber(){
    this._sites = this.sitesService.sites$.subscribe( data => {
      this.sites = data;
    })
  }

  initSubscriptions() {
    this.initSitesSubscriber();
  }

  constructor(
              private reportingService          : ReportingService,
              public  route                     : ActivatedRoute,
              public  balanceSheetService       : BalanceSheetService,
              public  layoutService             : GridsterLayoutService,
              private datePipe                  : DatePipe,
              private sitesService              : SitesService,
               private reportingItemsSalesService: ReportingItemsSalesService
    ) { }


  getReportType() {
    const reportType = this.cardValueType.toLowerCase();

    if (reportType === 'category sales' ||
        reportType === 'department sales' ||
        reportType === 'type sales'  ||
        reportType === 'product sales') {
      this.refreshProductSalesGroup();
    }

    if (reportType === 'sales' ||
        reportType === 'sales count' ||
        reportType === 'employee sales' ||
        reportType === 'employee sales count'
        ) {
      this.refreshPaymentBasedSales();
    }

  }

  ngOnInit(): void {
   this.getReportType()
  }

  ngOnDestroy(): void {
      if ( this._sites) { this._sites.unsubscribe()}
  }

  refreshProductSalesGroup() {
    this.sitesService.getSites().subscribe(data => {
      if (data) {
        this.sitesService.updateSitesSubscriber(data)
        this.initSubscriptions();
        const i = 0

        if (!this.validateCard()) {
          console.log('card not valid')
          return
        }

        data.forEach(site => {
          let sales$ = this.refreshProductBasedSales(site);
          if (sales$) {
            sales$.subscribe(
              {next:
                data => {
                  data.site = site;
                  if (data.resultMessage) {
                    this.errorMessage.push(`${site.name} - ${data.resultMessage}`);
                  }
                  if (!data.resultMessage) {
                    if (!this.reportItemSaleSummaries) { this.reportItemSaleSummaries = [] as IReportItemSaleSummary[] }
                    let itemNames = this.reportingService.listofProductsInSales(data.results)
                    this.itemNames = [... itemNames, ...this.itemNames]
                    this.itemNames = [... new Set(this.itemNames)]
                    this.reportItemSaleSummaries.push(data)
                  }
                },
                error: error => {
                  this.errorMessage.push(`${site.name} - ${error}`);
                }
              }
            )
          }
        });
      }
    })
  }

  validateCard(): boolean {
    const message = []  as string[];
    let result: boolean;

    if (!this.cardValueType) {
      const message = 'no card type'
      console.log(message)
      this.errorMessage.push(message)
      result = false
    }

    if (!this.rangeType) {
      const message = 'no range type'
      console.log(message)
      this.errorMessage.push(message)
      result = false
    }

    if (!this.chartType) {
      const message ='No chart type.'
      console.log(message)
      this.errorMessage.push(message)
      result = false
    }

    return true;

  }

  getDateRange() {

  }

  getZrunID()  {

  }

  getGroupBy(searchModel: IReportingSearchModel, reportType: string) {
    if (reportType === 'category sales')  { searchModel.groupByCategory = true;}
    if (reportType === 'department sales'){ searchModel.groupByDepartment = true;}
    if (reportType === 'type sales')      { searchModel.groupByType = true;}
    if (reportType === 'product sales')   { searchModel.groupByProduct = true;}
    if (reportType === 'employee sales')  { searchModel.groupByEmployee = true;}

    return searchModel;
  }

  refreshProductBasedSales(site: ISite) : Observable<IReportItemSaleSummary> {
    if (!site) { return  }

    if (!this.cardValueType) {
      console.log(this.cardValueType)
      return
    }

    const reportType = this.cardValueType.toLowerCase();

    if (reportType === 'category sales' ||
        reportType === 'department sales' ||
        reportType === 'type sales'  ||
        reportType === 'product sales') {
      //assume sites are injected.

      if (this.rangeType === 'currentday') {
        //we can use this method to get the date range for the ZRUN.
        const zrun$ = this.getStartEndFromZRun()
        this.sales$ = zrun$.pipe(
          switchMap(data => {
            let searchModel = {} as IReportingSearchModel
            searchModel.startDate = this.dateFrom;
            searchModel.endDate = this.dateTo;
            searchModel.zrunID = this.zrunID;
            searchModel = this.getGroupBy(searchModel, reportType)
            return this.reportingItemsSalesService.groupItemSales(site, searchModel)
        }))
      }

      if (this.rangeType === 'month' ||
          this.rangeType === 'week' ||
          this.rangeType === 'year' ||
          this.rangeType === 'month' ||
          this.rangeType === 'date' ||
          this.rangeType === 'hour'
        ) {
          const item = this.getRange();

          if (item) {
            this.dateFrom         = item.startdate;
            this.dateTo           = item.endDate
            const searchModel = this.initSearchModel(item.startdate,item.endDate,0,reportType)
            this.setChartName(searchModel, this.name)
            return this.reportingItemsSalesService.groupItemSales(site, searchModel)
          }
      }
    }

    return null;
  }

  refreshPaymentBasedSales() : Observable<IReportItemSaleSummary> {
    if (!this.cardValueType) {
      return
    }

    const reportType = this.cardValueType.toLowerCase();

    if (this.rangeType === 'currentday') {
      //we can use this method to get the date range for the ZRUN.
      const zrun$ = this.getStartEndFromZRun()
      // this.sales$ = zrun$.pipe(
      //   switchMap(data => {
      zrun$.subscribe(data => {
        let searchModel = {} as IReportingSearchModel
        searchModel.startDate = this.dateFrom;
        searchModel.endDate   = this.dateTo;
        searchModel.zrunID    = this.zrunID;
        this.groupBy          = 'hour'
        searchModel           = this.getGroupBy(searchModel, reportType)
        this.setChartName(searchModel, this.name)
        this.showReport = true;
        return;
          // return this.reportingItemsSalesService.groupItemSales(site, searchModel)
      })
    }

    if (this.rangeType === 'month' ||
        this.rangeType === 'week' ||
        this.rangeType === 'year' ||
        this.rangeType === 'month' ||
        this.rangeType === 'date' ||
        this.rangeType === 'hour'
      ) {
        const item = this.getRange();
        if (item) {
          this.dateFrom         = item.startdate;
          this.dateTo           = item.endDate
          this.groupBy          = this.rangeType
          const searchModel = this.initSearchModel(item.startdate,item.endDate,0, reportType)
          this.setChartName(searchModel, this.name)
          this.showReport = true;
          // return this.reportingItemsSalesService.groupItemSales(site, searchModel)
        }
    }

    return null;
  }

  getRange() {
    //we can use this method to get the date range for the ZRUN.
    let item: IDateRange
    if (this.rangeType === 'hour') {
      if (this.rangeValue == 0) {   this.rangeValue = 24 }
      item = this.reportingService.getHoursBackUsingCurrentDate(this.rangeValue)
    }

    if (this.rangeType === 'date') {

      item = this.reportingService.getDaysBackUsingCurrentDate(this.rangeValue)
    }

    if (this.rangeType === 'month') {
      item = this.reportingService.getMonthsBackUsingCurrentDate(this.rangeValue)
    }

    if (this.rangeType === 'week') {
      item = this.reportingService.getWeeksBackUsingCurrentDate(this.rangeValue)
    }

    if (this.rangeType === 'year') {
      item = this.reportingService.getYearsBackUsingCurrentDate(this.rangeValue)
    }
    return item;
  }

  setChartName(searchModel: IReportingSearchModel, name: string) {
    try {
      let range = ''
      let rangeValue = ''
      if (searchModel.startDate && searchModel.endDate) { range = `, ${searchModel.startDate} to ${searchModel.endDate}`}
      if (this.rangeType && this.rangeValue) { rangeValue = `, ${this.rangeValue} ${this.rangeType} range` }
      this.name = `${name}  ${rangeValue} ${range}`
    } catch (error) {

    }
  }

  initSearchModel(startDate,endDate,zRunID, reportType) {
    let searchModel     = {} as IReportingSearchModel
    searchModel = this.getGroupBy(searchModel, reportType)
    searchModel.startDate = startDate;
    searchModel.endDate   = endDate;
    searchModel.zrunID    = zRunID;
    return searchModel
  }

  getStartEndFromZRun() : Observable<ISite[]> {
    //get the observable, then pipe through to the sites if needed.
    const site = this.sitesService.getAssignedSite();
    const zrun$ = this.balanceSheetService.getZRUNBalanceSheet(site)
    const sites$ = this.sitesService.getSites()
    return zrun$.pipe(
      switchMap(data => {
      if (data.endTime) {
        this.dateFrom = this.reportingService.dateConvert(data.startTime)
        this.dateTo   = this.reportingService.dateConvert(data.endTime)
      }
      if (!data.endTime && data.startTime) {
        this.dateFrom   =  this.datePipe.transform(data.startTime, 'M/d/yy')
        const startdate = new Date(data.startTime)
        this.dateTo     = this.reportingService.addDates(startdate, 1).toISOString();
      }
      this.dateFrom = this.datePipe.transform(data.startTime, 'M/d/yy')
      this.dateTo   = this.datePipe.transform(this.dateTo , 'M/d/yy')
      this.zrunID   = data.id.toString();
      return sites$
    }))
  }

}
