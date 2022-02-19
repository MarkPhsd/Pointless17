import { Component, OnInit, Input, OnChanges,  SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { Observable, Subject } from 'rxjs';
import { ISalesPayments, ISite }  from 'src/app/_interfaces';
import { ReportingService } from 'src/app/_services';
import { IPaymentSalesSearchModel, PaymentSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-widget-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

//reference for code example of charts
//https://stackblitz.com/edit/angular-highchart-add-series?file=src%2Fapp%2Fapp.component.ts
export class CardComponent  implements OnInit{
  // export class CardComponent  implements OnInit  {
  @Input() notifier   : Subject<boolean>
  value               : boolean;
  tempVal             : boolean;

  //descriptions for component headings
  @Input() label      : string;
  @Input() total      : string;
  @Input() percentage : string;

  //filters inputs for charts and tables
  @Input() dateFrom   : string ;
  @Input() dateTo     : string ;
  @Input() data       : any[];
  @Input() zrunID     : string;
  @Input() groupBy    : string;;
  @Input() chartName  : string;;

  @Input() counter : number;
  lastCounter: number;

  //instance of highchart
  Highcharts      = Highcharts;
  chartData       : any[];
  chart           : Highcharts.Chart;
  chartOptions    : {};
  chartCategories : any[];
  // dataSeriesValues: any[];
  options         : any;
  //data
  sites$          : Observable<ISite[]>
  @Input() sites           : ISite[];
  @Input() site            : ISite;
  salesPayment    : ISalesPayments;
  xAxis           : any;
  subTitle        : any;

  scrollablePlotHeight = {
    minWidth       : 1500,
    opacity        : 0,
    scrollPositionX: -10
  }

  sitesErrorMessage: string;
  constructor(private  sitesService      : SitesService,
              private  reportingService  : ReportingService,
              public   route             : ActivatedRoute,
              private salesPaymentService: SalesPaymentsService
               ) {
  }

  ngOnInit() {
    this.initChart('Values');
    this.initDates();
    if (this.sites || this.site) {
      if (!this.sites) {
        this.sites = [] as ISite[]
        this.sites.push(this.site)
      }
      this.refresh();
      return
    }

    if (!this.sites) {
      this.sitesService.getSites().subscribe( data => {
          this.sites  = data;
          this.refresh();
        }
      )
    }
  };

  initDates(){
    //192.168.0.16:4200/app-widget-card;groupBy=date;dateFrom=09012019;dateTo=09302019
    let dateFrom = this.route.snapshot.paramMap.get('dateFrom');
    let dateTo   = this.route.snapshot.paramMap.get('dateTo');
    let groupBy  = this.route.snapshot.paramMap.get('groupBy');
    if (dateFrom && dateTo && groupBy) {
      this.dateFrom = this.dateConvert(dateFrom)
      this.dateTo   = this.dateConvert(dateTo)
      this.groupBy  = groupBy;
    }
  }

  getCountVersion() {  }

  dateConvert(dateString: string) {
    if (dateString.length == 8) {
      const month = dateString.substr(0, 2);
      const day   = dateString.substr(2, 2);
      const year  = dateString.substr(4, 4);
      return `${month}/${day}/${year}`
    }
  }

  async refresh() {
    this.getCountVersion();
    if (this.dateFrom && this.dateTo && this.groupBy) {
      this.initArrays();
      this.initSeries();
      if (this.sites) {
        this.updateChartSites(this.dateFrom, this.dateTo, this.sites);
      }
    }
  }

  initArrays() {
    this.reportingService.dateSeries  = [];
    this.chartCategories              = [];
    this.chartData                    = [];
    let valuesName   = 'values'
    const subTitle   =  {text: "Range: " + this.dateFrom + " to " + this.dateTo}
    this.subTitle    = subTitle;

    if (this.groupBy.toLowerCase() === 'date') {
      const  categories = [] as any[];
      let dataSeriesValues =  this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)
      dataSeriesValues.forEach(data => {
        if (data.date) {
          const  dt1 = new Date(data.date);
          const date = this.reportingService.getDateString(dt1.toDateString())
          categories.push(date)
        }
      })
      if (categories) {
        this.chartCategories = categories;
      }
      const xAxis = {
        labels    : { enabled: true },
        categories: categories,
        crosshair : true,
      }
      this.chartOptions = { xAxis: [ xAxis ] }
      this.xAxis = xAxis;
      valuesName = '$ Values'
    }

    if (this.groupBy.toLowerCase() === 'hour') {
      const  categories = [] as any[];
      let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
      dataSeriesValues.forEach(data => {
        if (data) { categories.push(data.date) }
      })
      if (categories) { this.chartCategories = categories; }
      const xAxis = {
        labels    : { enabled: true },
        crosshair : true,
        categories: categories
      }
      this.chartOptions = { xAxis: [ xAxis ] }
      this.xAxis = xAxis;
      valuesName = 'Values'
    }

    if (this.groupBy.toLowerCase() === 'orderemployeecount' || this.groupBy.toLowerCase() === 'orderemployeesales') {
      const  categories = [] as any[];
      let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
      dataSeriesValues.forEach(data => { if (data) { categories.push(data.date) }  })
      if (categories) { this.chartCategories = categories; }
      const xAxis = {
        labels    : { enabled: true },
        categories: categories,
        crosshair : true,
        min       : 0,
        max       : dataSeriesValues.length
      }
      // this.scrollablePlotHeight = {
      //   minWidth: 600,
      //   opacity:25,
      //   scrollPositionX: 0
      // }
      this.xAxis = xAxis;
      valuesName = 'Values'
    }
    this.initChart(valuesName);
  }

  updateChartSites(dateFrom: string, dateTo: string, sites: ISite[]) {
    this.updateChartMetrics( sites)
    this.updateChartSitesSales(dateFrom, dateTo, sites)
  }

  setChartData(name: string, dataSeriesValues: any[]) {
    const newSeries = [] as any[];
    dataSeriesValues.forEach(data => { newSeries.push( [ data.date, data.value ] ) })
    this.chartData.push ( { name: name, data: newSeries } )
    this.chartOptions = {  series:  this.chartData }
  }

  refreshSales(site: ISite) {
    const searchModel = {} as IPaymentSalesSearchModel;
    searchModel.startDate = this.dateFrom;
    searchModel.endDate   = this.dateTo;
    searchModel.groupBy   = this.groupBy;
    searchModel.zrunID    = this.zrunID;
    const sales$  = this.salesPaymentService.getPaymentSales(site, searchModel);
    return sales$
  }

  getMatchingIndex(rowValue: ISalesPayments, values: any[]): number {
    if (!values || !rowValue ) { return}
    const  index = values.findIndex(data => { return data.value} );
    return index
  }

  updateChartSitesSales(dateFrom: string, dateTo: string, sites: ISite[]) {

    let runfunction = false;

    if (this.groupBy.toLowerCase()  === 'date' || this.groupBy.toLowerCase() === 'hour' ||
         this.groupBy.toLowerCase() === 'month' || this.groupBy.toLowerCase() === 'year')
    {  runfunction = true; }

    if (!runfunction) { return }

    this.initArrays();
    for (let site of sites) {
      let sales$ =  this.reportingService.getSales(site, dateFrom, dateTo, this.groupBy)
      sales$.subscribe( sales => {
        let dataSeriesValues  = [] as any[]
        if  (sales) {
          if (this.groupBy.toLowerCase() === 'date') {
            let dataSeriesValues =  this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)
            if (dataSeriesValues && sales) {
              site.salesData  = sales;
              // we have to filter and compare dates
              //the dates have to be convered to strings to compare
              dataSeriesValues.forEach( (data, index) => {
                  const  dt1 = new Date(data.date);
                  const item = sales.filter( item =>
                    {
                      const  dt2 = new Date(item.dateCompleted);
                      if( dt2.toString() === dt1.toString())
                      { return item }
                    }
                  );
                  if (item && dt1) {
                    const date = this.reportingService.getDateString(dt1.toDateString())
                    let value = 0;
                    try {
                      if ( item[0].amountPaid) { value = item[0].amountPaid }
                      if (!item[0].amountPaid) { value = item[0].amountPaid }
                    } catch (error) {
                    }
                    const row = { date: date, value: value }
                    dataSeriesValues[index] = row
                  }
              })
              this.setChartData(site.name, dataSeriesValues)
            }
          }

          if ( this.groupBy === 'hour' ) {
            let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
            dataSeriesValues.forEach( (data, index) => {
                const item = sales.filter( item =>  { if( item.dateHour === data.date)  { return item } } );
                if (item && item.length>0) {
                  let value = 0;
                  try {
                    if ( item[0].amountPaid) { value = item[0].amountPaid }
                    if (!item[0].amountPaid) { value = item[0].amountPaid }
                  } catch (error) {
                  }
                  const row = { date: item[0].dateHour, value:  value }
                  dataSeriesValues[index] = row
                }
              }
            )
            this.setChartData(site.name, dataSeriesValues)
          }

          if (this.groupBy.toLowerCase() === 'month') {
          }

          if (this.groupBy.toLowerCase() === 'year') {
          }

          if ( this.groupBy === 'scrub' ) {
            site.salesData  = sales
            site.salesData.forEach( dateValue =>  {
              dataSeriesValues.push(
                  [dateValue.dateHour , dateValue.amountPaid]
              )
            })
            this.chartData.push ( { name: site.name, data: dataSeriesValues } )
            this.chartOptions = { series:  this.chartData }
            dataSeriesValues = [];
          }
        }
      }
      )
    }
  }

  updateChartMetrics(sites: ISite[]) {
    if (!sites) { return }
    if ( this.groupBy === 'orderemployeecount' || this.groupBy.toLowerCase() === 'orderemployeesales') {
      this.initArrays();
      for (let site of sites) {
        const sales$ = this.refreshSales(site);
        sales$.subscribe( summary => {
          if (summary.resultMessage === 'failed') { return }
          const sales = summary.paymentSummary;
            //first take the sales of each employee so run a filter on the sales and filter for each employee.
            //get list of employees that have sold.
            // const uniqueArr = [... new Set(students.map(data => data.name))]
            const employeesList = [... new Set(sales.map(t => t.employeeName)) ]
            employeesList.forEach( employee => {this.applyEmployeeSeries(employee,sales, this.groupBy) })
          }
        )
      }
    }
  }

  applyEmployeeSeries(employeName: string, sales: PaymentSummary[], groupBy: string) {
    let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
    dataSeriesValues.forEach( (data, index) => {
        const item = sales.filter( item =>
          { if( item.dateHour === data.date && employeName === item.employeeName) { return item }}
        );
        if (item && item.length>0) {
          let value : any;
          if (groupBy === 'orderemployeecount') { value = item[0].count;     }
          if (groupBy === 'orderemployeesales') { value =item[0].amountPaid; }
          const row = { date: item[0].dateHour, value:  value }
          dataSeriesValues[index] = row
        }
      }
    )
    this.setChartData(employeName, dataSeriesValues)
  }

  initChart(chartValuesName: string) {

    this.chartOptions =  {
      chart: {
            type: 'line',
            backgroundColor: null,
            scrollablePlotArea: this.scrollablePlotHeight,
            borderWidth: 0,
            height: 300,
        },
        title: {text: this.chartName },
        subtitle : this.chartName,
        xAxis: this.xAxis,
        yAxis: {
          title:{ text: chartValuesName},
          labels: { enabled: true
        },
        tickWidth: 1,
        lineWidth: 1,
        opposite: false
      }
    };

    HC_exporting(Highcharts);

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);

  };

  initSeries() {
    this.initHourSeries()
    this.initDateSeries()
  }

  initDateSeries() {
    try {
      if (!this.chartCategories) {
        if (this.groupBy == "date") {
          this.chartCategories = this.reportingService.dateSeries;
          return this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)
        }
      }
    } catch (error) {
      return
    }
  }

  initHourSeries() {
    try {
      if (this.groupBy === "hour" ) {
        // console.log('this.groupBy', this.groupBy)
        //this is an adjustment so that the hourly charts show just one day.
        let newDate = new Date(this.dateFrom);
        this.dateTo =  new Date(newDate.setDate(newDate.getDate()+1)).toLocaleDateString();
      }
    } catch (error) {
      return
    }
  }

  groupArray(array: any, key: any) {
    // Accepts the array and key
    const groupBy = (array, key) => {
      // Return the end result
      return array.reduce((result, currentValue) => {
        // If an array already present for key, push it to the array. Else create an array and push the object
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
          currentValue
        );
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return result;
      }, {}); // empty object is the initial value for result object
    };
    return groupBy(array, key)
  }

}


  //   {
  //     millisecond: '%H:%M:%S.%L',
  //     second: '%H:%M:%S',
  //     minute: '%H:%M',
  //     hour: '%H:%M',
  //     day: '%e. %b',
  //     week: '%e. %b',
  //     month: '%b \'%y',
  //     year: '%Y'
  // }

  //we have the sites with data we want to loop, add the site data within the site so we first add to this.chart loop the sites, add the series data to the second column of the array.
  //initialize the date range or time range within an array that
  //incudlues all date point values
  //then beneath we look up the assocaited index of the
  //date point and assing the value to the value field.
