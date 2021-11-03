import { Component, OnInit, Input} from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-widget-pie',
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
