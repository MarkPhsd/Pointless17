import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { IComponentUsage, MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';

@Component({
  selector: 'part-usage-graph',
  templateUrl: './part-usage-graph.component.html',
  styleUrls: ['./part-usage-graph.component.scss']
})
export class PartUsageGraphComponent implements OnInit {

  Highcharts      = Highcharts;
  chartData       : any[];
  chart           : Highcharts.Chart;
  chartCategories : any[];

  @Input() productID = 0;
  action$: Observable<any>;
  chartOptions: any;
  constructor(
    private _snackBar              : MatSnackBar,
    private menuService            : MenuService,
    private fb                     : UntypedFormBuilder,
    private siteService            : SitesService,
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
    if (!this.productID || this.productID ==0) {return }
    const site = this.siteService.getAssignedSite()
    let today = new Date();
    let startDate = new Date(today.setMonth(today.getMonth() - 12));
    let endDate = new Date();
    this.action$ = this.menuService.getComponentUsageByMonth(site, startDate,endDate,this.productID).pipe(
      switchMap(data => {
        this.refreshChartUI(data.results)
        return of(data)
      }))
  }

  refreshChartUI(data: IComponentUsage[]) {
    return {
      chart: {
        type: 'column'
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
        name: 'Total',
        data: data.map(item => item.total)
      }, {
        name: 'Cost',
        data: data.map(item => item.cost)
      }]
    }
  }


}
function switchMap(arg0: (data: any) => any): import("rxjs").OperatorFunction<import("src/app/_services").IComponentUsageResults, any> {
  throw new Error('Function not implemented.');
}

function of(data: any) {
  throw new Error('Function not implemented.');
}

