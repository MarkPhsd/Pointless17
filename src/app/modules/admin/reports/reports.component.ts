import { Component, OnInit, ViewChild, OnChanges,  SimpleChange } from '@angular/core';
import { ISite}  from 'src/app/_interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { ReportingService,AuthenticationService} from 'src/app/_services';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})

export class ReportsComponent implements OnChanges,OnInit  {

  sites: ISite[] = [];
  dataSource:  MatTableDataSource<ISite>;

  value = false;

  childNotifier : Subject<boolean> = new Subject<boolean>();
  chartData: any;

  //required for filter component.
  dataFromFilter: string;
  dataCounterFromFilter: string; //used to signal refresh of charts
  dateFrom: string;
  dateTo: string;
  groupBy = "Date";

  constructor(private authentication: AuthenticationService,
              private  reportingService: ReportingService) {  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.initDateRange();
  }

  initDateRange(){
    this.reportingService.dateFrom = this.dateFrom;
    this.reportingService.dateTo = this.dateTo;
  }

  notifyChild() {
    this.value = !this.value;
    this.childNotifier.next(this.value);
  }

  ngOnInit(): void {
    this.refreshComponent();
  }

  refreshComponent() //we need to get the sites.
  {
    this.dataSource = new MatTableDataSource<ISite>(this.sites);
  }

   //gets filterShared Component and displays the chart data
  receiveData($event) {
      this.dataFromFilter = $event
      //console.log("From Child:", this.dataFromFilter)
      var data = this.dataFromFilter.split(":", 3)
      this.dateFrom = data[0]
      this.dateTo = data[1]
      this.dataCounterFromFilter = data[2];
      this.initDateRange()
  };
}
