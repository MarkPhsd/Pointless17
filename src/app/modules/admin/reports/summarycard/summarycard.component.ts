import { Component, OnInit, Input,  SimpleChange} from '@angular/core';
import * as Highcharts from 'highcharts';
import { Observable, Subject } from 'rxjs';
import { ReportingService} from 'src/app/_services';
import { ISalesPayments, ISite, ISalesReportingOrdersSummary }  from 'src/app/_interfaces';

@Component({
  selector: 'app-summarycard',
  templateUrl: './summarycard.component.html',
  styleUrls: ['./summarycard.component.scss']
})
export class SummarycardComponent implements OnInit {

  @Input() notifier: Subject<boolean>
  //filters inputs for charts and tables
  @Input() dateFrom: string;
  @Input() dateTo: string;
  //data
  @Input() site: ISite;

  //for html component
  orderTotal     = 0;
  count          = 0
  average        = 0;
  averageDollar  = 0;;

  sales$: Observable<ISalesReportingOrdersSummary[]>;

  constructor(  private reportingService:ReportingService
    ) { }

  ngOnInit(): void {
    this.refreshComponents();
  };

  ngOnChanges() {
    this.refreshComponents();
  }

  refreshComponents() {

    this.sales$  =  this.reportingService.getSalesOrderSummary(this.site, this.dateFrom, this.dateTo, "Range")

  }


}
