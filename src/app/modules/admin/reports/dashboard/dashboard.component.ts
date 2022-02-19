import { Component, OnInit, ViewChild, OnChanges,  SimpleChange, Input } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { ReportingService} from 'src/app/_services/reporting/reporting.service';
import { ISite,Item,IUser }  from 'src/app/_interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnChanges,OnInit  {
  showValues = false;

  count                 = 0;
  value                  = false;
  childNotifier         : Subject<boolean> = new Subject<boolean>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //for charts
  currentUser$          : Observable<IUser>;
  currentUser           : IUser;

  dataFromFilter        : string;
  dataCounterFromFilter : string; //used to signal refresh of charts
  dateFrom              : string;
  dateTo                : string;
  @Input() groupBy      ="date";

  localSite             : ISite;
  sites$                : Observable<ISite[]>;
  sitecount             = 0;
  observer              : any[];

  item                  : Item; //for routing

  constructor(
              private authentication  : AuthenticationService,
              private reportingService: ReportingService,
              private sitesService    : SitesService,
          ) {
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.initDateRange();
  }

  notifyChild() {


    this.value = !this.value;
    this.childNotifier.next(this.value);
  }

  ngOnInit(): void {
    this.getUser()
    this.sites$ = this.sitesService.getSites()
    this.initDateRange()
    this.dateFrom    = '2/01/2021';
    this.dateTo      = '2/08/2021';
  };

  getUser() {
     const user = this.authentication.userValue;
      this.currentUser    = user;
  }

  initDateRange(){
    this.reportingService.dateFrom = this.dateFrom;
    this.reportingService.dateTo = this.dateTo;
  }

  //gets filterShared Component and displays the chart data
  receiveData($event) {
    this.dateFrom = "" // data[0]
    this.dateTo = ""
    this.dataFromFilter = $event
    var data = this.dataFromFilter.split(":", 3)
    this.dateFrom = data[0]
    this.dateTo = data[1]
    const result = data[2]
    this.count = parseInt(result) + this.count
    if (this.dateFrom && this.dateTo) {
      this.dataCounterFromFilter = data[2];
      this.initDateRange()
    }
  };

}
