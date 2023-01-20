import { Component, OnInit, ViewChild, OnChanges,  SimpleChange, Input } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, Subject, switchMap } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { ReportingService} from 'src/app/_services/reporting/reporting.service';
import { ISite,Item,IUser }  from 'src/app/_interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DatePipe } from '@angular/common'
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnChanges,OnInit  {

  emailSending = false;
  showValues = false;
  email$                : Observable<any>;
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
              private sendGridService     :   SendGridService,
              private sitesService    : SitesService,
              private siteService        : SitesService,
              private matSnack           : MatSnackBar,
              public datepipe: DatePipe
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
    this.refreshReports()
  };

  setInitialDateRange() {
    const date = new Date();
    const firstDay =   new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.dateFrom = this.datepipe.transform(firstDay, 'yyyy-MM-dd')
    this.dateTo = this.datepipe.transform(lastDay, 'yyyy-MM-dd')
  }

  refreshReports() {
    this.getUser()
    this.sites$ = this.sitesService.getSites()
    this.initDateRange()
    this.setInitialDateRange();
  }

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
    this.count += 1
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

  _email() {

    this.emailSending = true;
    const site = this.siteService.getAssignedSite();
    const list = this.siteService.getSites();

    return  list.pipe(
      switchMap( data => {
          const reports$ = []
          data.forEach( site => {
              reports$.push(this.sendGridService.sendSalesReport(site,0, this.dateFrom, this.dateTo))
            }
          )
          const result = forkJoin(reports$)
          return result
        }
      )
    )

    // return this.sendGridService.sendSalesReport(site,0, this.dateFrom, this.dateTo).pipe(
    //   switchMap( data => {
    //     this.emailSending = false;
    //     this.matSnack.open('Email Sent', 'Success', {duration: 1500})
    //     return of(data)
    //   }
    // ));

  }

  email() {
    this.email$ = this._email()
  }
}
