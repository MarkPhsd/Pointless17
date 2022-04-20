import { T } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, OnChanges,  SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import numeral, { validate } from 'numeral';
import { Observable, Subject, Subscription, switchMap } from 'rxjs';
import { ISalesPayments, ISite }  from 'src/app/_interfaces';
import { ReportingService } from 'src/app/_services';
import { IReportingSearchModel, IReportItemSaleSummary, ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { IPaymentSalesSearchModel, PaymentSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { BalanceSheetService } from 'src/app/_services/transactions/balance-sheet.service';

export interface ProductSale {
  name: string;
  value: number;
  count: number;
}
@Component({
  selector: 'app-widget-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

//reference for code example of charts
//https://stackblitz.com/edit/angular-highchart-add-series?file=src%2Fapp%2Fapp.component.ts
export class CardComponent  implements OnInit , OnChanges{
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
  @Input() groupBy    : string;
  @Input() chartName  : string;
  @Input() counter    : number;
  @Input() sites      : ISite[];
  @Input() site       : ISite;

  @Input() name         = '';
  @Input() chartType    = 'line';
  @Input() chartHeight  = '350px'
  @Input() chartWidth   = '1200'
  @Input() menuType     : string;
  @Input() cardValueType: string;
  @Input() rangeType    : string;
  @Input() rangeValue   : number;
  @Input() itemNames    : string[];
  @Input() salesSummary : IReportItemSaleSummary;
  @Input() reportItemSaleSummaries: IReportItemSaleSummary[]
  reportType: string;
  sales = []
  lastCounter: number;
  showData: boolean;
  //instance of highchart
  Highcharts      = Highcharts;
  chartData       : any[];
  chart           : Highcharts.Chart;
  chartOptions    : any;
  chartCategories : any[];
  // dataSeriesValues: any[];
  options         : any;
  //data
  sites$          : Observable<ISite[]>
  salesPayment    : ISalesPayments;
  xAxis           : any;
  subTitle        : any;

  dataSeriesValues : any[];

  scrollablePlotHeight = {
    minWidth        : 1500,
    opacity         : 0,
    scrollPositionX : -10
  }

  sitesErrorMessage: string;
  _sites: Subscription;

  initSubscriptions() {
    if (this.sites) {return}
    this.sitesService.sites$.subscribe(data => {
      this.sites = data;
      // this.sites = [...new Set(data)]
    })
  }

  constructor(private  sitesService      : SitesService,
              private  reportingService  : ReportingService,
              public   route             : ActivatedRoute,
              public balanceSheetService : BalanceSheetService,
              private salesPaymentService: SalesPaymentsService,
              public  layoutService      : GridsterLayoutService,
              private datePipe           : DatePipe,
              private reportingItemsSalesService: ReportingItemsSalesService
      ) {
  }


  ngOnInit() {
    // order of operations
    // this.initSeriesLabels();
    // this.initChart('values')
    // this.initSeries();

    //only works for product sales so far.
    if (this.cardValueType && this.reportItemSaleSummaries) {

      const xAxis = this.initSeriesLabels();
    
      let options = this.initChart('values');

      this.refreshProductSales();

      if (options) {

        if (!this.chartWidth) { this.chartWidth = '1200'}

        const scrollablePlot = {
          minWidth        : +this.chartWidth,
          opacity         : 0,
          scrollPositionX : -10
        }

        const chart = {
          type: this.chartType,
          backgroundColor: null,
          scrollablePlotArea: scrollablePlot,
          borderWidth: 0,
          height: this.chartHeight,
        };

        const yAxis = {
          title:  { text: 'values'},
          labels: { enabled: true },
          tickWidth: 1,
          lineWidth: 1,
          opposite: false
        }

        options.xAxis = xAxis;

        options.chart = chart // { chart };

        options.series =   this.chartData

        const sort =  {  dataSorting: {
                          enabled: true
                          }
                      }

        options.series.sort = sort;

        this.chartOptions = options;
      }
      return
    }

    this.initSubscriptions();
    this.refreshSitesData()
    this.initChart('Values');
    if (this.cardValueType) { this.initDates() };
    if (!this.cardValueType) {this.initDates() };
    this.refreshChart();
  };

  ngOnChanges() {
    this.refresh();
  }

  refreshChart() {
    this.reportType = this.cardValueType;
    const reportType = this.reportType;

    if ((!this.dateFrom || !this.dateTo) && !this.reportType) {
      if (!this.groupBy) {this.groupBy = 'hour'}
      this.getStartEndFromZRun().subscribe(data => {
      })
    }

    this.refreshSitesData();
  }

  refreshSitesData() {
    if (this.sites || this.site) {
      if (!this.sites) { 
        this.sites = []
        this.sites.push(this.site)
        console.log('refreshSitesData 1', this.sites)
      }
      this.refresh();
      return;
    }

    if (!this.sites) {
      this.sitesService.getSites().subscribe( data => {
          this.sites  = data;
          console.log('refreshSitesData 2', data)
          // const sites = [...new Set(data)]
          // console.log ('refresh sites 3', sites)
          this.refresh();
        }
      )
    }
  }

  initDates(){
    let dateFrom = this.route.snapshot.paramMap.get('dateFrom');
    let dateTo   = this.route.snapshot.paramMap.get('dateTo');
    let groupBy  = this.route.snapshot.paramMap.get('groupBy');
    if (dateFrom && dateTo && groupBy) {
      this.dateFrom = this.reportingService.dateConvert(dateFrom)
      this.dateTo   = this.reportingService.dateConvert(dateTo)
      this.groupBy  = groupBy;
    }
  }

  getStartEndFromZRun() : Observable<ISite[]> {
    //get the observable, then pipe through to the sites if needed.
    const site = this.sitesService.getAssignedSite();
    const zrun$ = this.balanceSheetService.getZRUNBalanceSheet(site)
    const sites$ = this.sitesService.getSites()

    return zrun$.pipe(
      switchMap(data => {
      if (data.endTime && data.startTime) {
        this.dateFrom = this.reportingService.dateConvert(data.startTime)
        this.dateTo   = this.reportingService.dateConvert(data.endTime)
      }
      if (!data.endTime && data.startTime) {
        this.dateFrom   =  this.datePipe.transform(data.startTime, 'M/d/yy')
        const startdate = new Date(data.startTime)
        this.dateTo     = this.reportingService.addDates(startdate, 1).toISOString();
      }
      if (data.startTime && this.dateTo) { 
        this.dateFrom = this.datePipe.transform(data.startTime, 'M/d/yy')
        this.dateTo   = this.datePipe.transform(this.dateTo   , 'M/d/yy')
      } 
      if (data.id) { 
        this.zrunID   = data.id.toString();
      }
      return sites$
    }))
  }

  getCountVersion() {  }

  refresh() {
    this.getCountVersion();
    if (this.sites && this.dateFrom && this.dateTo && this.groupBy) {
      this.initSeriesLabels();
      this.initChart('values')
      this.initSeries();
      this.updateChartSites(this.dateFrom, this.dateTo, this.sites);
    }
  }

  isProductSalesType(type) {
    if (!this.cardValueType) { return false }
    if (this.cardValueType.toLowerCase() === 'product sales') { return true}
    if (this.cardValueType.toLowerCase() === 'category sales') { return true}
    if (this.cardValueType.toLowerCase() === 'department sales') { return true}
    if (this.cardValueType.toLowerCase() === 'type sales') { return true}
  }

  getXAxis(categories) {
    const xAxis = {
      labels    : { enabled: true },
      crosshair : true,
      categories: categories
    }
    return xAxis;
  }

  initSeriesLabels() {

    this.reportingService.dateSeries  = [];
    this.chartCategories              = [];
    this.chartData                    = [];
    let valuesName                    = 'Values'

    if (!this.dateFrom || !this.dateTo) { return }
    const subTitle                    =  {text: "Range: " + this.dateFrom + " to " + this.dateTo}
    this.subTitle                     = subTitle;

    if (!this.chartOptions) { this.initChart(valuesName)}

    if (this.isProductSalesType(this.cardValueType)) {
      this.chartCategories = this.itemNames;
      // console.log(this.itemNames)
      // console.log(this.chartCategories)
     
      this.xAxis = this.getXAxis(this.chartCategories);
     
      return this.xAxis;
    }

    if (!this.groupBy) { return }
    const  categories = [] as any[];

    if (this.groupBy.toLowerCase() === 'date') {
      let dataSeriesValues =  this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)
      dataSeriesValues.forEach(data => {
        if (data.date) {
          const  dt1 = new Date(data.date);
          const date = this.reportingService.getDateString(dt1.toDateString())
          categories.push(date)
        }
      })
      if (categories) { this.chartCategories = categories; }
      this.xAxis = this.getXAxis(categories);
      return this.xAxis;
    }

    if (this.groupBy.toLowerCase() === 'hour') {
      let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
      dataSeriesValues.forEach(data => { if (data) { categories.push(data.date) } })
      this.dataSeriesValues
      if (categories) { this.chartCategories = categories; }
      this.xAxis = this.getXAxis(categories);
      return;
    }

    if (this.groupBy.toLowerCase() === 'month') {

      if (this.rangeValue) { 
        const  d  = new Date(this.dateFrom)
        let dataSeriesValues = this.reportingService.getMonthSeriesValueByCount(d, this.rangeValue, true)
        dataSeriesValues.forEach(data => { if (data) { categories.push(data.date) } })
        if (categories) { this.chartCategories = categories; }
        this.xAxis = this.getXAxis(categories);
        this.dataSeriesValues = dataSeriesValues
        return this.xAxis;
      }

      let dataSeriesValues =  this.reportingService.getMonthWithDatesSeries(this.dateFrom, this.dateTo)
      dataSeriesValues.forEach(data => { if (data) { categories.push(data.date) } })
      if (categories) { this.chartCategories = categories; }
      this.xAxis = this.getXAxis(categories);
      return this.xAxis;
    }

    if (this.groupBy.toLowerCase() === 'orderemployeecount' ||
        this.groupBy.toLowerCase() === 'orderemployeesales') {

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
      this.xAxis = xAxis;
      return this.xAxis;
    }

  }

  updateChartSites(dateFrom: string, dateTo: string, sites: ISite[]) {
    this.updateChartMetrics(sites)
    this.updateChartSitesSales(dateFrom, dateTo, sites)
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

  isMultiSiteReport() {
    if (this.groupBy.toLowerCase()  === 'date' || this.groupBy.toLowerCase() === 'hour' ||
         this.groupBy.toLowerCase() === 'month' || this.groupBy.toLowerCase() === 'year')
    { return  true; }
    return false
  }

  initLocalSeries() {
    let dataSeriesValues: any;
    if (this.groupBy.toLowerCase() === 'date') {
      let dataSeriesValues =  this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)
      this.dataSeriesValues = dataSeriesValues
    }
    if ( this.groupBy === 'hour' ) {
      let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
      this.dataSeriesValues = dataSeriesValues
    }
    //requires work
    if (this.groupBy.toLowerCase() === 'month') {
      if (this.dateFrom && this.dateTo) {
        if(!this.dataSeriesValues) { 

          if (this.rangeValue) { 
            const  d  = new Date(this.dateFrom)
            let dataSeriesValues = this.reportingService.getMonthSeriesValueByCount(d, this.rangeValue, true)
            this.dataSeriesValues = dataSeriesValues
            return dataSeriesValues;
          }
  
          let dataSeriesValues =  this.reportingService.getMonthWithDatesSeries(this.dateFrom, this.dateTo)
          this.dataSeriesValues = dataSeriesValues
          return dataSeriesValues;
        }
      }

      let dataSeriesValues =  this.reportingService.getMonthSeries(12)
      this.dataSeriesValues = dataSeriesValues
    }
    //requires work
    if (this.groupBy.toLowerCase() === 'year') {
     let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
     this.dataSeriesValues = dataSeriesValues
    }
    return dataSeriesValues
  }

  refreshProductSales() {
    if (this.reportItemSaleSummaries && this.itemNames) {
      this.reportItemSaleSummaries.forEach(item => { this.updateProductSales(item.site, item, this.itemNames) })
    }
  }

  updateProductSales(site: ISite, reportItemSaleSummaries: IReportItemSaleSummary, itemNames: string[]) {
    //list all products in array of items.
    this.chartCategories = itemNames;
    if (!itemNames) { return }
    const productList = this.getProductValuesSeries(itemNames)
    if (!productList) { return }
    const salesList = reportItemSaleSummaries.results;
    let siteSales = [] as ProductSale[];

    salesList.forEach(saleTotal => {
      const item = {name:saleTotal.productName,value:saleTotal.itemTotal} as ProductSale
      siteSales.push(item)
    })

    this.setChartProductSalesData(site.name, siteSales)
  }

  setChartProductSalesData(name: string, list: ProductSale[]) {
    let newSeries = [] as any[];
    try {
      list.forEach(data => {
        newSeries.push( [ data.name, data.value ]
        )
      })
    } catch (error) {
      console.log('error', error)
    }

    newSeries.sort((a, b) => (a.value > b.value) ? 1 : -1)
    newSeries = newSeries.slice(0,550);
    //reset the product names to the top 50 because
    //there can be multple locations, and the average number of product
    //names willl have to be associated with the total products.
    //call initArrays which will restruture the report based on this adjusted list

    newSeries.forEach(data => { this.itemNames.push( data.name) })

    if (!this.chartData) { this.chartData = []}
      this.chartData.push ( { name: name, data: newSeries }
    )

  }

  getProductValuesSeries(itemNames: string[]): ProductSale[]  {
    //list all products in array of items.
    if (!itemNames) { return }
    const productList = [] as ProductSale[];

    for (let name of itemNames) {
      const item = {name: name, value: 0, count: 0} as ProductSale;
      productList.push( item )
    }
  
    return productList;
  }

  setChartDateSeriesData(name: string, dataSeriesValues: any[]) {
    const newSeries = [] as any[];
    dataSeriesValues.forEach(data => { newSeries.push( [ data.date, data.value ] ) })
    this.chartData.push ( { name: name, data: newSeries } )
    this.chartOptions = { series:  this.chartData }
  }

  validateSalesValue(sales) {
    try {
      const item = sales.filter( item => {})
      return true;
    } catch (error) {
      // console.log(sales)
    }
    // console.log('validateSalesValue  false', sales)
    return false
  }

  updateChartSitesSales(dateFrom: string, dateTo: string, sites: ISite[]) {
    if (!this.isMultiSiteReport()) { return }
    // console.log('updateChartSiteSales')
    this.initSeriesLabels();
    this.initChart('values')
    // let dataSeriesValues =  this.initLocalSeries();
    // if (!this.dataSeriesValues) { return }
    let dataSeriesValues = [] as any[]
    this.sales = []
  
    for (let site of sites) {
      let sales$ =  this.reportingService.getSales(site, dateFrom, dateTo, this.groupBy)
      sales$.subscribe( sales => {

        this.sales.push(sales)
        if  (sales) {
          if ( this.groupBy === 'hour' ) {
            let dataSeriesValues = this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
            dataSeriesValues.forEach( (data, index) => {
                try {
                  const item = sales.filter( item => {})
                } catch (error) {
                  // console.log(sales)
                  return
                }
                const item = sales.filter( item =>  { if( item.dateHour === data.date)  { return item } } );
                if (item && item.length>0) {
                  let value = 0;
                  try {
                    if ( item[0].amountPaid) { value = item[0].amountPaid }
                  } catch (error) {
                  }
                  const row = { date: item[0].dateHour, value:  value ,  year: 0, month: 0 }
                  dataSeriesValues[index] = row
                }
              }
            )
            this.setChartDateSeriesData(site.name, dataSeriesValues)
          }
          if (this.groupBy.toLowerCase() === 'date') {
            let dataSeriesValues =  this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)
            site.salesData  = sales;
            // we have to filter and compare dates
            //the dates have to be convered to strings to compare
            dataSeriesValues.forEach( (data, index) => {
                const  dt1 = new Date(data.date);
                try {
                  const item = sales.filter( item => {})
                } catch (error) {
                  // console.log(sales)
                }

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
                  const row = { date: date, value: value,  year: 0, month: 0 }
                  dataSeriesValues[index] = row
                }
            })
            this.setChartDateSeriesData(site.name, dataSeriesValues)
          }

          if (this.groupBy.toLowerCase() === 'month') {

            if (!this.rangeValue) {
              dataSeriesValues = this.reportingService.getMonthWithDatesSeries(this.dateFrom, this.dateTo)
            }
         
            if (this.rangeValue) {
              const  d  = new Date(this.dateFrom)
              dataSeriesValues = this.reportingService.getMonthSeriesValueByCount(d, this.rangeValue, true)
            }

            site.salesData  = sales;
            if (!dataSeriesValues) { return }
            if (this.validateSalesValue(sales)) {
              dataSeriesValues.forEach( (data, index) => {
                  const item = sales.filter( item =>  {
                    // console.log(item.month, item.year,data.year, data.month)
                    if( item.month == data.month && item.year == data.year)  {
                      return item
                    }
                    }
                  );
                  if (item && item.length>0) {
                    let value = 0;
                    try {
                      // console.log('item from loop for month', item)
                      if ( item[0].amountPaid) { value = item[0].amountPaid }
                    } catch (error) {
                      console.log(error)
                    }
                    const row = { date: item[0].dateHour, value:  value }
                    dataSeriesValues[index] = row
                  }
                }
            
              )  
            }
            this.setChartDateSeriesData(site.name, dataSeriesValues)
          }

          if (this.groupBy.toLowerCase() === 'year') {
            let dataSeriesValues = this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
            dataSeriesValues.forEach( (data, index) => {
                try {
                  const item = sales.filter( item => {})
                } catch (error) {
                  // console.log(sales)
                  return
                }
                const item = sales.filter( item =>  { if( item.dateHour === data.date)  { return item } } );
                if (item && item.length>0) {
                  let value = 0;
                  try {
                    if ( item[0].amountPaid) { value = item[0].amountPaid }
                  } catch (error) {
                    console.log(error)
                  }
                  const row = { date: item[0].dateHour, value:  value, year: 0, month: 0 }
                  dataSeriesValues[index] = row
                }
              }
            )
            this.setChartDateSeriesData(site.name, dataSeriesValues)
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
    if ( this.groupBy.toLowerCase() === 'orderemployeecount' ||
         this.groupBy.toLowerCase() === 'orderemployeesales') {
      this.initSeriesLabels();
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
          if (groupBy === 'orderemployeesales') { value = item[0].amountPaid; }
          const row = { date: item[0].dateHour, value:  value,   year: 0, month: 0 }
          dataSeriesValues[index] = row
        }
      }
    )
    this.setChartDateSeriesData(employeName, dataSeriesValues)
  }

  initChart(chartValuesName: string) {

    if (!this.chartType) { this.chartType = 'line'}
    if (this.name)       { this.chartName = this.name   }

    this.chartOptions =  {
      chart: {
        type: this.chartType,
        backgroundColor: null,
        scrollablePlotArea: this.scrollablePlotHeight,
        borderWidth: 0,
        height: this.chartHeight,
      },
      title: {text: this.chartName },
      subtitle : this.chartName,
      xAxis: this.xAxis,
      yAxis: {
        title:  { text: chartValuesName},
        labels: { enabled: true },
        tickWidth: 1,
        lineWidth: 1,
        opposite: false
      },
      plotOptions: {
        column: { cropThreshold: 500 },
        series: { borderWidth: 0 }
      }
    };

    HC_exporting(Highcharts);
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
    return this.chartOptions
  };

  initSeries() {
    this.initHourSeries()
    this.initDateSeries()
  }

  initMonthSeries() {
    try {
      if (!this.chartCategories) {
        if (this.groupBy == "month") {
          this.chartCategories = this.reportingService.dateSeries;
          return this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)
        }
      }
    } catch (error) {
      return
    }
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
