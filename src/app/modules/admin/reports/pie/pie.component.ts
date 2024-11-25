import { CommonModule } from '@angular/common';
import { Component, OnInit, Input} from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-widget-pie',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
  HighchartsChartModule,
  ],
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit {

  Highcharts = Highcharts;
  chartOptions: {};
  constructor() { }

    ngOnInit(): void {
      this.chartOptions =  {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Categories'
        },
        subtitle: {
            text: null
        },
        tooltip: {
            split: true,
            valueSuffix: ' thousands'
        },
        exporting:  {
          enabled: true
        },
        credits: {
          enabled:  false
        },
        series: [{
            name: 'NH1',
            data: [502, 635, 409, 547, 302, 634, 393]
        }]
    };

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);

  }
}
