import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, OnChanges,  SimpleChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { BehaviorSubject, Observable, Subject, Subscription, finalize, forkJoin, of, switchMap, take } from 'rxjs';
import { ISalesPayments, ISite }  from 'src/app/_interfaces';
import { ReportingService, rowValue } from 'src/app/_services';
import { IReportItemSaleSummary, IReportItemSales, IReportingSearchModel, ReportingItemsSalesService} from 'src/app/_services/reporting/reporting-items-sales.service';
import {  SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { BalanceSheetService } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'product-chart-report',
  templateUrl: './product-chart-report.component.html',
  styleUrls: ['./product-chart-report.component.scss']
})
export class ProductChartReportComponent  implements OnInit {

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
  @Input() zrunID    : string;
  @Input() groupBy    : string;
  @Input() site      : ISite;
  @Input() counter: number;
  refreshing: boolean;

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
    private reportingItemsSalesService: ReportingItemsSalesService,
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
    this.refreshChartData(this.groupBy, this.site, this.dateFrom, this.dateTo)
  }

  refreshChartData(groupBy, site, dateFrom, dateTo) {

    const searchModel = {} as IReportingSearchModel
    if (groupBy === 'items') {
      searchModel.groupByProduct = true;
    }
    if (groupBy === 'category') {
      searchModel.groupByCategory = true;
    }
    if (groupBy === 'department') {
      searchModel.groupByDepartment = true;
    }
    if (groupBy === 'type') {
      searchModel.groupByType = true;
    }

    if (this.groupBy === 'void') {
      searchModel.groupByType = false;
    }

    searchModel.startDate         = this.dateFrom;
    searchModel.endDate           = this.dateTo;
    searchModel.zrunID            = this.zrunID;
    this.refreshing = true
    if (this.site) {
      this.action$ = this.reportingItemsSalesService.groupItemSales(this.site, searchModel).pipe(switchMap(data => {
        const value = data as IReportItemSaleSummary;
        this.sitesErrorMessage = value.resultMessage;
        const values = this.prepareAvgHourlyData(value.results)
        this.prepareAvgHourlyData(value.results) ; // this.prepareData()
        this.refreshing= false
        return of(data)
      }))
    }
    return
  }

  prepareAvgHourlyData(salesData: IReportItemSales[]) {
    // Replace with actual API call
    const newData = []
    if (!salesData) { return }
    salesData.forEach(item => {
      newData.push({name:  item?.productName || 'Not Set' , y: item.itemTotal})
    })

    this.chartOptions = this.initChart( 'Group by ' + this.groupBy, newData);
  }

  initChart(title, data) {
    return { chart: {
        type: 'pie'
      },
      title: {
        text: title
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
        point: {
            valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'Sales share',
        data: data
      }]
    }
  }



  get  quarterHourArray() {
    return Array.from({length: 96}, (_, i) => {
      let hour = Math.floor(i / 4);
      let minutes = 15 * (i % 4);
      return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }); // ['00:00', '00:15', ..., '23:45']
  }

}
