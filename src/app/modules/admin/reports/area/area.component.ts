import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import HC_exporting from 'highcharts/modules/exporting';
import { DashboardService } from 'src/app/_services';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-widget-area',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    HighchartsChartModule
  ],
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})

export class AreaComponent implements OnInit {

  @Input() data: any[];

  chartOptions: {};

  Highcharts = Highcharts;
  salesValues: any[];
  salesSeriesNames = [];
  staticValues = [];
  categories: any[];

  constructor(private dashboardService: DashboardService) { }

    ngOnInit(): void {
        this.refreshChart()
      }

    refresh() {

    }

    refreshChart() {

       this.chartOptions =  {
        chart: {
            type: 'area'
        },
        title: {
            text: 'Sales by Site'
        },
        subtitle: {
            text: 'Range of date/time'
        },
        tooltip: {
            split: true,
            valueSuffix: ' '
        },
        exporting:  {
          enabled: true
        },
        credits: {
          enabled:  false
        },
        xAxis: {

          labels: { enabled: true,  },
          title: { text: null },
              staartOnTick: false,
              endOnTick: false,
              TickOptions: []
        },
        yAxis: { labels: { enabled: true, },
            title: { text: null },
              staartOnTick: false,
              endOnTick: false,
              TickOptions: []
        },

    };


    HC_exporting(Highcharts);

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);

    }
}
