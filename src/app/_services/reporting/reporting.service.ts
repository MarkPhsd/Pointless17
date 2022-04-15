import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { ISalesPayments, ISalesReportingOrdersSummary, IUser, ISite, ISalesReportingFilter }   from 'src/app/_interfaces';
import { AppInitService } from '../system/app-init.service';
import { IDateRange, ReportDateHelpersService } from './report-date-helpers.service';
import { formatDate, DatePipe } from '@angular/common';
import { IReportItemSales, IReportItemSaleSummary } from './reporting-items-sales.service';
import { DateHelperService } from './date-helper.service';

// this.symbolSearchService.getSymbolData('xl')
// .switchMap(stock => {
//   this.stock = stock;
//   return Observable.combineLatest(
//     this.symbolSearchService.getResearchReportData(stock),
//     this.symbolSearchService.getPGRDataAndContextSummary(stock)
//   )})
// .subscribe(
//   [report, summary] => {
//     this.researchReport = report;
//     this.contextSummary = summary;
//   },
//   err => this.sharedService.handleError
// );

export interface rowValue {
  date: string;
  value: number;
  year: number;
  month: number;
}
@Injectable({
  providedIn: 'root'
})
export class ReportingService {

  ///salespayments?DateFrom=4/1/2019&DateTo=5/1/2019&GroupBy=Date
  Parameter   = ''

  dateFrom    : string; //From and to Dates for Reports.
  dateTo      : string;

  dateSeries  : any[]; //getDateSeries(datefrom, dateTo) retrieved to do series labeling in charts.
  dataSeries  : any[];
  users       : any[];

  groupBy     = "date";

  anyvalues   : any;   //data Values - charts need a Data[] format

  dataSeriesValues: any[];
  sales       : any[];
  salesResults: any[];
  salesValues : any[];
  chartValues : any[];
  chartData   : any[];
  label       : string;

  seriesNames : any[];
  jsonResponse: any;

  salesPayments : ISalesPayments[];
  chartOptions  : {};

  hourFrom      : number;
  hourTo        : number;
  apiUrl        : any;

  constructor( private http            : HttpClient,
               private appInitService  : AppInitService,
               private dateHelpers     : ReportDateHelpersService,
               private datePipe        : DatePipe,
               private dateHelper : DateHelperService,
  ) {
    this.apiUrl   = this.appInitService.apiBaseUrl()
  }

  updateDateRange(dateRange: IDateRange) {

  }

  private tempCode(){
    let newDate = new Date();
    this.dateTo =  new Date(newDate.setDate(newDate.getDate()+1)).toDateString();
    this.dateFrom =  new Date(newDate.setMonth(newDate.getMonth()-1)).toDateString();
  }

  getHourlySeries(values: number) {
    this.dateSeries.push(values)
    return this.dateSeries
  }

  getDateSeries(start: string, end: string) {
    this.dateSeries = [];
    let dateStart: Date;
    let dateEnd: Date;

    dateStart = new Date(start);
    dateEnd = new Date(end);

    for (var d = dateStart; d <= dateEnd; d.setDate(d.getDate() + 1)) {
      var loopDay = new Date(d);
      this.dateSeries.push(
        this.datePipe.transform(loopDay, 'MM/dd/yyyy')
      )
    }
    return this.dateSeries
  }

  getYearSeries(value) {
    this.dateSeries = [];
    let dateStart: Date;
    let dateEnd: Date;

    var d = new Date(new Date().getFullYear(), 0, 1);

    //we will establish 5 years as the default;
    dateStart = new Date(value);
    dateEnd = new Date();

    for (var d = dateStart; d <= dateEnd; d.setDate(d.getDate() + 1)) {
      var loopDay = new Date(d);
      this.dateSeries.push(
        this.datePipe.transform(loopDay, 'MM/dd/yyyy')
      )
    }
    return this.dateSeries
  }

  getMonthSeries(value) {
    this.dateSeries = [];
    let dateStart: Date;
    let dateEnd: Date;
    if (!value) value = 12
    //we will establish 12 years as the default;
    // dateStart = new Date(start);
    // dateEnd = new Date(end);

    for (var d = dateStart; d <= dateEnd; d.setDate(d.getDate() + 1)) {
      var loopDay = new Date(d);
      this.dateSeries.push(
        this.datePipe.transform(loopDay, 'MM/dd/yyyy')
      )
    }
    return this.dateSeries
  }

  getMonthSeriesByCount(dateStarting: Date, count: number, foward: boolean): string[] {
    const series = [];
    const month = this.getMonthString(dateStarting);
    series.push(month);
    for (let i = 1; i < count; i += 1) {
      let y = i;
      if (!foward) {
        y = -i;
      }
      let newDate = new Date(
        dateStarting.setMonth(dateStarting.getMonth() + y)
      );
      let month = this.getMonthString(newDate);
      series.push(month);
    }
    return series;
  }

 getMonthSeriesValueByCount(dateStarting: Date, count: number, foward: boolean): rowValue[] {
   const series = [];
    const month = this.getMonthString(dateStarting);

    series.push(month);
    for (let i = 1; i < count; i += 1) {
      let y = i;
      if (!foward) {
        y = -i;
      }
      // let newDate = new Date(
      //   dateStarting.setMonth(dateStarting.getMonth() + y)
      // );
      const date = new Date(month)
      const result = this.dateHelper.add('month', y, date)

      // let month = this.getMonthString(newDate);
      const dateValue = this.datePipe.transform(result, 'MM/dd/yyyy')
      const yearValue = this.datePipe.transform(result, 'yyyy')
      const monthValue = this.datePipe.transform(result, 'MM')
      const item = {date: dateValue, value: 0, year: +yearValue, month: +monthValue }
      series.push(item);
    }

    return series;
}

  getMonthWithDatesSeries(start: string, end: string) {
    this.dateSeries = [];
    // let dateStart: Date;
    // let dateEnd: Date;
    // if (!value) value = 12
    //we will establish 12 years as the default;
    let dateStart = new Date(start);
    let dateEnd = new Date(end);

    console.log('start Date' , this.datePipe.transform(dateStart, 'MM/dd/yyyy'))
    console.log('end   Date' , this.datePipe.transform(dateEnd,   'MM/dd/yyyy'))

    for (var d = dateStart; d <= dateEnd; d.setDate(d.getDate() + 1)) {
      var loopDay = new Date(d);

      this.dateSeries.push(
        this.datePipe.transform(loopDay, 'MM/dd/yyyy')
      )
    }

    console.log(this.dataSeries)
    return this.dateSeries
  }



  getDateSeriesWithHours(start: string, end: string): rowValue[] {
    this.dateSeries =  [];
    const dateStart =  new Date(start)
    this.dateSeries =  this.push24HoursToDateArray(dateStart, this.dateSeries);
    this.dateSeries =  this.push24HoursToDateArray(this.addDays(dateStart, 1), this.dateSeries);
    return this.dateSeries
  }

  _getDateSeriesWithHours(start: string, end: string): rowValue[] {
    this.dateSeries =  [];
    const dateStart =  new Date(start)
    this.dateSeries =  this.push24HoursToDateArray(dateStart, this.dateSeries);

    const dateEnd = new Date(end);

    for (var d = dateStart; d <= dateEnd; d.setDate(d.getDate() + 1)) {
      var loopDay = new Date(d);
      this.dateSeries.push(
        formatDate(loopDay, 'yyyy/MM/dd', 'en-US')
      )
    }

    this.dateSeries =  this.push24HoursToDateArray(this.addDays(dateStart, 1), this.dateSeries);
    return this.dateSeries
  }

  addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
  }

  addDates(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
  }

  push24HoursToDateArray(date, dateSeries) {
    let i = 0
    const dateString = this.getDateString(date.toDateString())
    for (let i = 0; i < 24; i++) {
      dateSeries.push(
        {date:  `${dateString} ${i}`, value: 0}
      )
      if (i>23) { i = 24}
    }
    return dateSeries;
  }

  getDateString(dateString) {
    if (!dateString) { return }
    return new Date(dateString).toLocaleDateString('en-US', {
      day  : '2-digit',
      month: '2-digit',
      year : 'numeric',
    })
  }

  getDateSeriesWithValue(start: string, end: string) : rowValue[] {
    this.dateSeries = [];
    let dateStart: Date;
    let dateEnd: Date;
    dateStart = new Date(start);
    dateEnd = new Date(end);
    for (var d = dateStart; d <= dateEnd; d.setDate(d.getDate() + 1)) {
      var loopDay = new Date(d);
      this.dateSeries.push(
        {date: formatDate(loopDay, 'yyyy/MM/dd', 'en-US'), value: 0}
      )
    }
    return this.dateSeries
  }

  // getMonthSeriesWithValue(start: string, end: string) : rowValue[] {
  getMonthSeriesWithValue(dateStarting: Date, count: number, foward: boolean):  rowValue[] {

    const series = [];
    const month = this.getMonthString(dateStarting);
    series.push(month);
    for (let i = 1; i < count; i += 1) {
      let y = i;
      if (!foward) {
        y = -i;
      }
      let newDate = new Date(
        dateStarting.setMonth(dateStarting.getMonth() + y)
      );

      const item = {date: month, value: 0}
      series.push(item);
    }
     console.log('getMonthSeriesWithValue', series)
     return series;
  }

  getMonthString(month: Date): string {
    // console.log(month);
    return this.datePipe.transform(month, 'MM/dd/yyyy');
  }

  getResults(url: string, parameters: string, headers: HttpHeaders, InterFaceName: any[]) {
    this.http.get<any[]>(url + parameters, { headers })
                .subscribe(data => InterFaceName = data)
    return InterFaceName;
  };

  getSiteStatus(site: ISite): Observable<any> {
    let parameters = "values"
    return  this.http.get<any[]>(`${site.url}${parameters}`)
  };

  getSales(site: ISite, dateFrom: string, dateTo: string, groupBY: string): Observable<ISalesPayments[]> {
    const controller = `/SalesPayments/`

    const endPoint = `getSalesSummary`

    let filter = {} as ISalesReportingFilter
    filter.startDate = dateFrom
    filter.endDate = dateTo
    filter.groupBy = groupBY

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.post<ISalesReportingOrdersSummary[]>(url, filter )
  };

  getDataSeriesValues(salesValues: any): any[] {
    this.salesPayments = salesValues;
    this.dataSeriesValues =  [];
    if (salesValues?.length) {
      for(var i = 0; i < salesValues.length; i++)(
        this.dataSeriesValues.push(salesValues[i].amountPaid)
          );
      }
    return  this.dataSeriesValues;
  };

  //get the current date for the filter
  setFilterToday() {
    //in the API always get +1 for the sales.
    this.dateFrom = new Date().toLocaleDateString();
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dateTo = tomorrow.toLocaleDateString();
    this.tempCode();
  }

  dateConvert(dateString: string) {
    if (dateString.length == 8) {
      const month =  dateString.substr(0, 2);
      const day   = dateString.substr(2, 2);
      const year  = dateString.substr(4, 4);
      // return this.datePipe.transform(dateString,'MM/dd/yyyy');
      return `${month}/${day}/${year}`
    }
  }

  getHoursBackUsingCurrentDate(value): IDateRange {
    const startDate     = this.dateHelpers.getCurrentDay();
    const d             = new Date();
    const endDate       =  this.datePipe.transform(this.addDates(d, value), 'MM/dd/yyyy');
    const dateRange     = {} as IDateRange;
    dateRange.startdate = startDate;
    dateRange.endDate   = endDate;
    return dateRange;
  }

  getDaysBackUsingCurrentDate(value): IDateRange {
    const startDate     = this.dateHelpers.getCurrentDay();
    const d             = new Date();
    const endDate       = this.datePipe.transform(this.addDates(d, value), 'MM/dd/yyyy');
    const dateRange     = {} as IDateRange;
    dateRange.startdate = startDate;
    dateRange.endDate   = endDate;
    return dateRange;
  }

  getWeeksBackUsingCurrentDate(value) {
    const startDate     = this.dateHelpers.getCurrentDay();
    const d             = new Date();
    const endDate       = this.datePipe.transform(this.addDates(d, value), 'MM/dd/yyyy');
    const dateRange     = {} as IDateRange;
    dateRange.startdate = startDate;
    dateRange.endDate   = endDate;
    return dateRange;
  }

  getMonthsBackUsingCurrentDate(value) {
    const startDate     = this.dateHelpers.getFirstDayOfMonthFromCurrentMonth(-value);
    const endDate       = this.dateHelpers.getLastDayofCurrentMonth()

    let dateStart       = Date();
    const dateRange     = {} as IDateRange;
    const startMonth    = this.dateHelpers.getFirstMonthInSeries(startDate, value, false)
    // const startMonth    = dateStart.setDate(dateStart.getDate() + value)

    dateRange.startdate = this.datePipe.transform(startMonth, 'MM/dd/yyyy');
    dateRange.endDate   = this.datePipe.transform(endDate  , 'MM/dd/yyyy');;
    return dateRange;
  }

  getYearsBackUsingCurrentDate(value) {
    const startDate     = this.dateHelpers.getCurrentYear();
    const year          = new Date(startDate)
    const endDate       = this.dateHelpers.getLastYearInSeries(year, value, false)
    const dateRange     = {} as IDateRange;
    dateRange.startdate = this.datePipe.transform(startDate, 'MM/dd/yyyy');
    dateRange.endDate   = endDate;
    return dateRange;
  }

  //SalesReportingOrders?DateFrom=1/1/2020&DateTo=1/15/2020&GroupBY=Range
  getSalesOrderSummary(site: ISite,dateFrom: string, dateTo: string, groupBY: string): Observable<ISalesReportingOrdersSummary[]> {

    const controller = `/SalesReportingOrders/`

    const endPoint = `getAPIReportingPaymentGrouped`

    const parameters = `?DateFrom=${dateFrom}&DateTo=${dateTo}&GroupBy=${groupBY}`

    return  this.http.get<ISalesReportingOrdersSummary[]>(`${site.url}${controller}${endPoint}${parameters}`)

  };

  ///Product Sales////
  listofProductsInSales(sales:  IReportItemSales[]): string[] {
    let itemNames = [] as string[]
    for (let item of sales)  {
      itemNames.push(item.productName)
    }
    itemNames =  [...new Set(itemNames)]
    return itemNames;
  }

  //not implemented
  listofSumProductsInSales(sales: IReportItemSales[]): string[]  {
    let itemNames = [] as string[]
    for (let item of sales)  {
      itemNames.push(item.productName)
    }
    itemNames =  [...new Set(itemNames)]
    return itemNames
  }

}
