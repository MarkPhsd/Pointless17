import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RowNodeBlockLoader } from 'ag-grid-community';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { Observable, Subject } from 'rxjs';
import { ISalesPayments, ISite }  from 'src/app/_interfaces';
import { ReportingService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';



@Component({
  selector: 'app-widget-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

//reference for code example of charts
//https://stackblitz.com/edit/angular-highchart-add-series?file=src%2Fapp%2Fapp.component.ts
export class CardComponent  implements OnInit  ,OnChanges{
  // export class CardComponent  implements OnInit  {
  @Input() notifier   : Subject<boolean>
  value               : boolean;
  tempVal             : boolean;

  //descriptions for component headings
  @Input() label      : string;
  @Input() total      : string;
  @Input() percentage : string;

  //filters inputs for charts and tables
  @Input() dateFrom   : string;
  @Input() dateTo     : string;
  @Input() data       : any[];
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
  sites           : ISite[];
  salesPayment    : ISalesPayments;
  xAxis           : any;
  subTitle        : any;



  constructor(private  sitesService     : SitesService,
              private  reportingService : ReportingService,
              public   route            : ActivatedRoute,
               ) {
    this.initChart();
  }

  initDates(){
    //192.168.0.16:4200/app-widget-card;groupBy=date;dateFrom=09012019;dateTo=09302019
    let dateFrom = this.route.snapshot.paramMap.get('dateFrom');
    let dateTo  = this.route.snapshot.paramMap.get('dateTo');
    let groupBy  = this.route.snapshot.paramMap.get('groupBy');
    if (dateFrom && dateTo && groupBy) {
      console.log('removed dates')
      this.dateFrom = this.dateConvert(dateFrom)
      this.dateTo   = this.dateConvert(dateTo)
      this.groupBy  = groupBy;
    }
  }

  getCountVersion() {
    // if (this.counter>this.lastCounter) {
    //   this.chartData  = [];
    //   this.initChart();
    // }
  }

  dateConvert(dateString: string) {
    if (dateString.length == 8) {
      const month = dateString.substr(0, 2);
      const day   = dateString.substr(2, 2);
      const year  = dateString.substr(4, 4);
      return `${month}/${day}/${year}`
    }
  }

  async ngOnInit() {
    this.initDates();
    // this.refresh();
    if (!this.sites) {
      this.sites  = await  this.sitesService.getSites().pipe().toPromise();
    }
    // this.refresh()
  };

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (this.dateFrom && this.dateTo && this.groupBy) {
      console.log(this.dateFrom ,this.dateTo ,this.groupBy)
      this.refresh();
    }
  }

  async refresh() {
    this.getCountVersion();
    if (this.dateFrom && this.dateTo && this.groupBy) {
      this.initArrays();
      this.initSeries();
      console.log('initSeries  and initArrays done')
      this.sites  = await  this.sitesService.getSites().pipe().toPromise();
      if (this.sites) {
        console.log('sites exist running update chart')
        this.updateChartSites(this.dateFrom, this.dateTo, this.sites);
      }
    }
  }

  // refreshChartSeries() {
  //   if (this.dateFrom && this.dateTo && this.groupBy) {
  //     if (this.sites) { this.updateChartSites(this.dateFrom, this.dateTo, this.sites);  }
  //   }
  // }

  initArrays() {
    this.reportingService.dateSeries  = [];
    this.chartCategories              = [];
    this.chartData                    = [];

    const subTitle =  {
      text: "Range: " + this.dateFrom + " to " + this.dateTo
    }
    this.subTitle = subTitle;

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
      console.log('date categories', categories)
      if (categories) {
        //  this.initChart();
        this.chartCategories = categories;
        // this.chartOptions = { series:  this.chartData }
        const xAxis = {
          labels    : { enabled: true },
          categories: categories,
          crosshair : true,
        }
        this.chartOptions = { xAxis: [ xAxis ] }
        this.xAxis = xAxis;
      }
    }

    if (this.groupBy.toLowerCase() === 'hour') {
      const  categories = [] as any[];
      let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
      dataSeriesValues.forEach(data => {
        if (data) {
          categories.push(data.date)
        }
      })
      if (categories) {
        //  this.initChart();
        this.chartCategories = categories;
        // this.chartOptions = { series:  this.chartData }

        const xAxis = {
          labels    : { enabled: true },
          categories: categories,
          crosshair : true,
        }
        this.chartOptions = { xAxis: [ xAxis ] }
        this.xAxis = xAxis;
      }
    }

    this.initChart();
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
  updateChartSites(dateFrom: string, dateTo: string, sites: ISite[]) {

    if (!sites) { return }
    this.initArrays();
    for (let site of sites) {
      let sales$ =  this.reportingService.getSales(site, dateFrom, dateTo, this.groupBy)
      sales$.subscribe( sales => {
        let dataSeriesValues  = [] as any[]
        if  (sales) {

          if (this.groupBy.toLowerCase() === 'date') {
            let dataSeriesValues =  this.reportingService.getDateSeriesWithValue(this.dateFrom, this.dateTo)

            if (dataSeriesValues) {
              site.salesData  = sales
              // we have to filter and compare dates
              //the dates have to be convered to strings to compare
              dataSeriesValues.forEach( (data, index) => {
                  const  dt1 = new Date(data.date);
                  const item = sales.filter( item =>
                    {
                      const  dt2 = new Date(item.dateCompleted);
                      // console.log('dateCompleted Log', dt2)
                      if( dt2.toString() === dt1.toString())
                      { return item }
                    }
                  );
                  if (item.length > 0 && dt1) {
                    const date = this.reportingService.getDateString(dt1.toDateString())
                    const row = { date: date, value:  item[0].amountPaid }
                    dataSeriesValues[index] = row
                  }
              })
              const newSeries = [] as any[]

              dataSeriesValues.forEach(data => { newSeries.push( [ data.date, data.value ] ) })
              this.chartData.push ( { name: site.name, data: newSeries } )
              this.chartOptions = {  series:  this.chartData }

            }
          }


          if ( this.groupBy === 'hour' ) {
            let dataSeriesValues =  this.reportingService.getDateSeriesWithHours(this.dateFrom, this.dateTo)
            dataSeriesValues.forEach( (data, index) => {
                const item = sales.filter( item =>
                  {
                    if( item.dateHour === data.date)
                    { return item }
                  }
                );
                if (item && item.length>0) {
                  const row = { date: item[0].dateHour, value:  item[0].amountPaid }
                  dataSeriesValues[index] = row
                }
              }
            )
            const newSeries = [] as any[]
            dataSeriesValues.forEach(data => { newSeries.push( [ data.date, data.value ] ) })
            this.chartData.push ( { name: site.name, data: newSeries } )
            this.chartOptions = {  series:  this.chartData }
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

  // groupSeries(arrary: any, key: any){
  //   const groupBy = (array, key) => {
  //     // Return the end result

  //   return result
  // }



  getMatchingIndex(rowValue: ISalesPayments, values: any[]): number {
    if (!values || !rowValue ) { return}
    console.log('getMatching Index value:',  values.findIndex(data => { return data.value} ))
    const  index = values.findIndex(data => { return data.value} );
    return index
  }

  initChart() {

      this.chartOptions =  {
        chart: {
                type: 'line',
                backgroundColor: null,
                borderWidth: 0,
                height: 300
                },
        title: {
          text: "Sales Grouped By " + this.groupBy
        },

        subtitle : this.subTitle,
        xAxis: this.xAxis,

        // xAxis: {
        //   title: {
        //     text: 'Date'
        //   },
        //   type: 'datetime',

        //   // Use the date format in the
        //   // labels property of the chart
        //   labels: {
        //     formatter: function() {
        //       return Highcharts.dateFormat('%H:%M %d %b %Y',
        //                                     this.value);
        //     }
        //   }
        // },

        yAxis: {
            title:{
              text:"Values"
            },
            labels: {
              enabled: true
            },
        },

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
     console.log('initDate Series error', error)
     return
   }

  }

  initHourSeries() {
    try {
        if (this.groupBy == "hour") {
          //this is an adjustment so that the hourly charts show just one day.
          let newDate = new Date(this.dateFrom);
          this.dateTo =  new Date(newDate.setDate(newDate.getDate()+1)).toLocaleDateString();
        }
    } catch (error) {
      console.log('initDate Series error', error)
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

