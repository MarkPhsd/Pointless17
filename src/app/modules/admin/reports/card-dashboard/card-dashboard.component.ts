import { DatePipe } from '@angular/common';
import { Component, OnInit,Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
export class CardDashboardComponent implements OnInit {

  site    : ISite;
  posName : string;
  sites$  : Observable<ISite[]>;
  @Input() disableActions: boolean;
  @Input() refreshTime  = 1;
  @Input() name         = 'A Chart';
  @Input() chartType    = 'line';
  @Input() chartHeight  = '350px'
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

  initDateSubscriber(){
    this._sites = this.sitesService.sites$.subscribe( data => {
      this.sites = data;
    })
  }

  initSubscriptions() {
    this.initSitesSubscriber();
    this.initDateSubscriber();
  }

  constructor(
              private reportingService          : ReportingService,
              public  route                     : ActivatedRoute,
              public  balanceSheetService       : BalanceSheetService,
              public  layoutService             : GridsterLayoutService,
              private datePipe                  : DatePipe,
              private sitesService              : SitesService,
              private matSnack                  : MatSnackBar,
              private reportingItemsSalesService: ReportingItemsSalesService
    ) { }

  ngOnInit(): void {

    this.sitesService.getSites().subscribe(data => {
      this.sitesService.updateSitesSubscriber(data)
      this.initSubscriptions();
      const i = 0
      data.forEach(site => {
        if (!this.validateCard(site)) {
          console.log('card not valid')
          return
        }

        this.refreshProductBasedSales(site).subscribe(
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
      });
    })
  }

  validateCard(site: ISite): boolean {
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
    if (!site) { return }
    if (!this.cardValueType) { return }
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
            item = this.reportingService.getMonthBackUsingCurrentDate(this.rangeValue)
          }

          if (this.rangeType === 'week') {

            item = this.reportingService.getWeeksBackUsingCurrentDate(this.rangeValue)
          }

          if (this.rangeType === 'year') {
            // if (this.rangeValue == 0) { this.rangeValue = 1 }
            item = this.reportingService.getYearsBackUsingCurrentDate(this.rangeValue)
          }

          if (item) {
            this.dateFrom         = item.startdate;
            this.dateTo           = item.endDate
            const searchModel = this.initSearchModel(item.startdate,item.endDate,0,reportType)
            return this.reportingItemsSalesService.groupItemSales(site, searchModel)
          }
      }
    }

    return null;
  }

  initSearchModel(startDate,endDate,zRunID,reprotType) {
    let searchModel     = {} as IReportingSearchModel
    searchModel = this.getGroupBy(searchModel, reprotType)
    searchModel.startDate = this.dateFrom;
    searchModel.endDate   = this.dateTo;
    searchModel.zrunID    = this.zrunID;
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

  // updateChartSitesSales(dateFrom: string, dateTo: string, sites: ISite[]) {

  //   this.initArrays();
  //   // let dataSeriesValues =  this.initLocalSeries();
  //   // if (!this.dataSeriesValues) { return }
  //   let dataSeriesValues = [] as any[]
  //   for (let site of sites) {
  //     let sales$ =  this.reportingService.getSales(site, dateFrom, dateTo, this.groupBy)
  //     sales$.subscribe( sales => {
  //       if  (sales) {
  //         if (this.groupBy.toLowerCase() === 'date') {
  //             let dataSeriesValues =  this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)
  //             site.salesData  = sales;
  //             // we have to filter and compare dates
  //             //the dates have to be convered to strings to compare
  //             dataSeriesValues.forEach( (data, index) => {
  //                 const  dt1 = new Date(data.date);
  //                 try {
  //                   const item = sales.filter( item => {})
  //                 } catch (error) {
  //                   // console.log(sales)
  //                 }
  //                 const item = sales.filter( item =>
  //                   {
  //                     const  dt2 = new Date(item.dateCompleted);
  //                     if( dt2.toString() === dt1.toString())
  //                     { return item }
  //                   }
  //                 );
  //                 if (item && dt1) {
  //                   const date = this.reportingService.getDateString(dt1.toDateString())
  //                   let value = 0;
  //                   try {
  //                     if ( item[0].amountPaid) { value = item[0].amountPaid }
  //                     if (!item[0].amountPaid) { value = item[0].amountPaid }
  //                   } catch (error) {
  //                   }
  //                   const row = { date: date, value: value }
  //                   dataSeriesValues[index] = row
  //                 }
  //             })
  //             this.setChartData(site.name, dataSeriesValues)
  //         }

  //         if ( this.groupBy === 'hour' ) {
  //           let dataSeriesValues = this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
  //           dataSeriesValues.forEach( (data, index) => {
  //               try {
  //                 const item = sales.filter( item => {})
  //               } catch (error) {
  //                 console.log(sales)
  //                 return
  //               }
  //               const item = sales.filter( item =>  { if( item.dateHour === data.date)  { return item } } );
  //               if (item && item.length>0) {
  //                 let value = 0;
  //                 try {
  //                   if ( item[0].amountPaid) { value = item[0].amountPaid }
  //                   if (!item[0].amountPaid) { value = item[0].amountPaid }
  //                 } catch (error) {
  //                 }
  //                 const row = { date: item[0].dateHour, value:  value }
  //                 dataSeriesValues[index] = row
  //               }
  //             }
  //           )
  //           this.setChartData(site.name, dataSeriesValues)
  //         }

  //         if (this.groupBy.toLowerCase() === 'month') {

  //         }

  //         if (this.groupBy.toLowerCase() === 'year') {
  //           let dataSeriesValues = this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
  //           dataSeriesValues.forEach( (data, index) => {
  //               try {
  //                 const item = sales.filter( item => {})
  //               } catch (error) {
  //                 console.log(sales)
  //                 return
  //               }
  //               const item = sales.filter( item =>  { if( item.dateHour === data.date)  { return item } } );
  //               if (item && item.length>0) {
  //                 let value = 0;
  //                 try {
  //                   if ( item[0].amountPaid) { value = item[0].amountPaid }
  //                   if (!item[0].amountPaid) { value = item[0].amountPaid }
  //                 } catch (error) {
  //                 }
  //                 const row = { date: item[0].dateHour, value:  value }
  //                 dataSeriesValues[index] = row
  //               }
  //             }
  //           )
  //           this.setChartData(site.name, dataSeriesValues)
  //         }

  //         if ( this.groupBy === 'scrub' ) {
  //           site.salesData  = sales
  //           site.salesData.forEach( dateValue =>  {
  //             dataSeriesValues.push(
  //               [dateValue.dateHour , dateValue.amountPaid]
  //             )
  //           })
  //           this.chartData.push ( { name: site.name, data: dataSeriesValues } )
  //           this.chartOptions = { series:  this.chartData }
  //           dataSeriesValues = [];
  //         }
  //       }
  //     }
  //     )
  //   }
  // }

}
