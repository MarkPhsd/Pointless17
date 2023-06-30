import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, OnChanges,  SimpleChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { BehaviorSubject, Observable, Subject, Subscription, finalize, forkJoin, of, switchMap, take } from 'rxjs';
import { ISalesPayments, ISite }  from 'src/app/_interfaces';
import { ReportingService, rowValue } from 'src/app/_services';
import { IReportItemSaleSummary} from 'src/app/_services/reporting/reporting-items-sales.service';
import { IPaymentSalesSearchModel, PaymentSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { BalanceSheetService } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'time-chart-report',
  templateUrl: './time-chart-report.component.html',
  styleUrls: ['./time-chart-report.component.scss']
})
export class TimeChartReportComponent implements OnInit {

  private observablesArraySubject = new BehaviorSubject<Observable<any>[]>([]);
  public observablesArray$ = this.observablesArraySubject.asObservable();
  @Input() chartType: string = 'column'
  @Input() chartHeight  = '350px'
  @Input() chartWidth   = '1200'
  @Input() notifier   : Subject<boolean>
  value               : boolean;
  tempVal             : boolean;
  @Input() dateFrom  : string;
  @Input() dateTo    : string;
  @Input() groupBy    : string;
  @Input() site      : ISite;
  @Input() counter: number;

  chartOptions: any;
  action$: Observable<any>;

  reportType: string;
  sales                  = []
  lastCounter: number;
  showData: boolean;
  //instance of highchart
  Highcharts      = Highcharts;
  chartData       : any[];
  chart           : Highcharts.Chart;
  chartCategories : any[];

  options         : any;
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

  _changeNotifier: Subscription
  sitesErrorMessage: string;
  _sites: Subscription;


  initNotifierSubscription() {
    if (!this.notifier) {
      // this.refresh();
      return
    }
    this._changeNotifier = this.notifier.asObservable().subscribe(data => {
      this.refresh();
    })
  }
  constructor(private  sitesService      : SitesService,
    private  reportingService  : ReportingService,
    public   route             : ActivatedRoute,
    public   balanceSheetService : BalanceSheetService,
    private  salesPaymentService: SalesPaymentsService,
    public   layoutService      : GridsterLayoutService,
    private  datePipe           : DatePipe,
  ) {
  }

  ngOnInit(): void {
    this.initNotifierSubscription();
    this.refresh()
  }

  ngOnChanges() {
    this.refresh()
  }

  refresh() {
    if (this.groupBy.toLowerCase() === "avgHourly".toLowerCase()) {
      // console.log('hourly')
      this.initHourlyChart();
    }

    if (this.groupBy.toLowerCase() === 'avg15min'.toLowerCase()) {
      // console.log('15 minunte')
      this.init15MinuteChart();
    }

    // console.log('chart options', this.chartOptions)
    this.refreshChartData(this.groupBy, this.site, this.dateFrom, this.dateTo)
  }

  refreshChartData(groupBy: string, site:ISite, startDate: string, endDate: string) {
    let sales$
    if (groupBy.toLowerCase() === 'avgHourly'.toLowerCase()) {
      sales$ = this.salesPaymentService.getAvgWeekDayHourlySalesReport(site, startDate, endDate)
    }
    if (groupBy.toLowerCase() === 'avg15min'.toLowerCase()){
      sales$ = this.salesPaymentService.getAverageSalesReportBy15Minutes(site, startDate, endDate)
    }

    if (!sales$ ) { return }

    this.action$ = sales$.pipe(switchMap(data => {
      this.chartOptions.series = this.prepareAvgHourlyData(data) ; // this.prepareData()
      // console.log('series data', data)
      return of(data)
    }))
  }

  prepareAvgHourlyData(salesData): Highcharts.SeriesOptionsType[] {
    // Replace with actual API call
    const seriesData: Highcharts.SeriesOptionsType[] = [];
    for (let dayOfWeek in salesData) {
      let dayData: Highcharts.SeriesColumnOptions = {
        name: dayOfWeek,
        data: [],
        type: 'column'
      };
      for (let hour in salesData[dayOfWeek]) {
        dayData.data.push(salesData[dayOfWeek][hour]);
      }
      seriesData.push(dayData);
    }
    return seriesData;
  }

  initHourlyChart() {
    const array = Array.from({length: 24}, (_, i) => i + ':00') // ['0:00', '1:00', ..., '23:00']l
    const title =  'Average Sales by Weekday and Hour'
    this.chartOptions = this.initBasicChart(array, title)
  }

  init15MinuteChart() {
    const title = 'Average Sales per 15 Minute, by Weekday and Hour';
    const list = this.initBasicChart(this.quarterHourArray, title);
    console.log('list', list)
    this.chartOptions = list
  }

  initBasicChart(array, title) {
    const scrollablePlot = {
      minWidth        : +this.chartWidth,
      opacity         : 0,
      scrollPositionX : -10
    }

    if (!this.chartWidth) { this.chartWidth = '1200'}

    return {
      chart: {
        type: this.chartType,
        scrollablePlotArea: scrollablePlot,
        backgroundColor: null,
        borderWidth: 0,
        height: this.chartHeight,
      },
      title: {
        text:title
      },
      xAxis: {
        categories: array // Array.from({length: 24}, (_, i) => i + ':00') // ['0:00', '1:00', ..., '23:00']
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Sales'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: 'gray'
          }
        }
      },
      plotOptions: {
        // column: {
        //   stacking: 'normal'
        // }
      },
      series: [],
      exporting: {
        enabled: true
      }
    };
  }

  get  quarterHourArray() {
    return Array.from({length: 96}, (_, i) => {
      let hour = Math.floor(i / 4);
      let minutes = 15 * (i % 4);
      return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });
  }

}
