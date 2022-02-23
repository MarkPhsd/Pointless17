import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { ISalesPayments, ISalesReportingOrdersSummary, IUser, ISite, ISalesReportingFilter }   from 'src/app/_interfaces';
import { formatDate } from '@angular/common';
import { AppInitService } from '../system/app-init.service';

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
}

@Injectable({
  providedIn: 'root'
})
export class ReportingService {

  ///salespayments?DateFrom=4/1/2019&DateTo=5/1/2019&GroupBy=Date
  Parameter = ''

  dateFrom: string; //From and to Dates for Reports.
  dateTo: string;

  dateSeries: any[]; //getDateSeries(datefrom, dateTo) retrieved to do series labeling in charts.
  dataSeries: any[];

  users: any[];

  groupBy = "date";

  anyvalues: any;
  //data Values - charts need a Data[] format

  dataSeriesValues: any[];
  sales: any[];
  salesResults: any[];
  salesValues: any[];
  chartValues: any[];
  chartData: any[];
  label: string;

  seriesNames: any[];
  jsonResponse: any;

  salesPayments: ISalesPayments[];
  chartOptions: {};

  hourFrom : number;
  hourTo   : number;
  apiUrl   : any;

  constructor( private http            : HttpClient,
               private appInitService  : AppInitService,
            ) {
    this.apiUrl   = this.appInitService.apiBaseUrl()
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
          formatDate(loopDay, 'yyyy/MM/dd', 'en-US')
        )
    }
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  //SalesReportingOrders?DateFrom=1/1/2020&DateTo=1/15/2020&GroupBY=Range
  getSalesOrderSummary(site: ISite,dateFrom: string, dateTo: string, groupBY: string): Observable<ISalesReportingOrdersSummary[]> {

    const controller = `/SalesReportingOrders/`

    const endPoint = `getAPIReportingPaymentGrouped`

    const parameters = `?DateFrom=${dateFrom}&DateTo=${dateTo}&GroupBy=${groupBY}`

    return  this.http.get<ISalesReportingOrdersSummary[]>(`${site.url}${controller}${endPoint}${parameters}`)

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

}
