import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IComponentUsage, MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'part-usage-graph',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    HighchartsChartModule
  ],

  templateUrl: './part-usage-graph.component.html',
  styleUrls: ['./part-usage-graph.component.scss']
})
export class PartUsageGraphComponent implements OnInit {

  Highcharts      = Highcharts;
  chartData       : any[];
  chart           : Highcharts.Chart;
  chartCategories : any[];
  errorMessage: string;
  @Input() productID = 0;
  action$: Observable<any>;
  chartOptions: any;
  loading: boolean;

  scrollablePlotHeight = {
    minWidth        : 1500,
    opacity         : 0,
    scrollPositionX : -10
  }

  @Input() chartType = 'column'
  @Input() chartHeight = '300'
  @Input() chartWidth = '1000'

  results
  usageResults: IComponentUsage;
  constructor(
    private _snackBar              : MatSnackBar,
    private menuService            : MenuService,
    private fb                     : UntypedFormBuilder,
    private siteService            : SitesService,
    private dateHelper: DateHelperService,
    private dialog: MatDialog,
  )
{ }

  ngOnInit(): void {
    this.refreshChartData()

  }

  ngOnChanges() {
    console.log('on changes', this.productID)
    this.refreshChartData()
  }

  refreshChartData() {
    if (!this.productID || this.productID == 0) {return }

    const site = this.siteService.getAssignedSite()
    let today = new Date();
    let dtstartDate = new Date(today.setMonth(today.getMonth() - 12));
    let startDate = this.dateHelper.format(dtstartDate, 'MM/dd/yyyy')
    let endDate = this.dateHelper.format(new Date(), 'MM/dd/yyyy')

    this.errorMessage = '';

    this.loading = true
    this.action$ = this.menuService.getComponentUsageByMonth(site, startDate, endDate, this.productID).pipe(
      switchMap(data => {
        if (data && data.errorMessage) {
          this.errorMessage = data.errorMessage;
        }
        if (data && data.results){
          this.chartOptions =  this.refreshChartUI(data.results)
        }
        this.results = data;
        this.loading = false;
        return of(data)
      }))
  }

  refreshChartUI(data: any[]) {

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
        text: 'Component Usage'
      },
      xAxis: {
        categories: data.map(item => `${item.month}/${item.year}`),
        title: {
          text: 'Month/Year'
        },
        minRange: 1
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Usage',
          align: 'high'
        },
        labels: {
          overflow: 'justify'
        }
      },
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true
          }
        }
      },
      navigator: {
        enabled: true
      },
      rangeSelector: {
        enabled: false
      },
      series: [{
        name: 'Quantity',
        data: data.map(item => item.quantity)
      }, {
        name: 'Cost',
        data: data.map(item => item.cost)
      }]
    }
  }

}

