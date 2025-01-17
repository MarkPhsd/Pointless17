import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import HC_exporting from 'highcharts/modules/exporting';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'average-hourly-sales-labor-chart',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
  HighchartsChartModule,
  ],
  templateUrl: './average-hourly-sales-labor-chart.component.html',
  styleUrls: ['./average-hourly-sales-labor-chart.component.scss']
})
export class AverageHourlySalesLaborChartComponent implements OnInit {
  @Input() data: any;
  Highcharts      = Highcharts;
  chartData       : any[];
  chart           : Highcharts.Chart;
  chartCategories : any[];

  chartOptions: any;

  // Highcharts: typeof Highcharts = Highcharts;
  // chartOptions: Highcharts.Options;

  ngOnInit() {
    this.refreshChart(this.data);
  }

  refreshChart(data) {

    const series = [{
      name: 'AverageQuantity',
      data: []
    }, {
      name: 'AveragePay',
      data: []
    }, {
      name: 'AverageSales',
      data: []
    }];

    data.forEach(item => {
      series[0].data.push([`${item.weekday} ${item.hour}`, item.averageQuantity]);
      series[1].data.push([`${item.weekday} ${item.hour}`, item.averagePay]);
      series[2].data.push([`${item.weekday} ${item.hour}`, item.averageSales]);
    });

    this.chartOptions = {
      chart: {
        type: 'spline'
      },
      title: {
        text: 'Average Metrics per Hour of Weekdays'
      },
      xAxis: {
        type: 'category',
        title: {
          text: 'Hour of Weekday'
        }
      },
      yAxis: {
        title: {
          text: 'Average Metrics'
        }
      },
      series: series
    };
  }
}
