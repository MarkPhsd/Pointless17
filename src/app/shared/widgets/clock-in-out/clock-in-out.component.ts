import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, TemplateRef,ViewChild, Optional, EventEmitter, Output } from '@angular/core';
import { Observable , switchMap, of, repeatWhen, catchError, delay, retryWhen, delayWhen, timer, throwError, Subject, finalize} from 'rxjs';
import { employeeBreak, EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import { IItemBasic } from 'src/app/_services';
import { EmployeeClockMethodsService } from 'src/app/_services/employeeClock/employee-clock-methods.service';
import { EmployeeClockService } from 'src/app/_services/employeeClock/employee-clock.service';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';

import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ClockViewComponent } from './clock-view/clock-view.component';

@Component({
  selector: 'clock-in-out',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ClockViewComponent,
  ],
  templateUrl: './clock-in-out.component.html',
  styleUrls: ['./clock-in-out.component.scss']
})
export class ClockInOutComponent implements OnInit {
  @ViewChild('onDisplayOnly')      onDisplayOnly: TemplateRef<any>;
  @ViewChild('clockInOutEditor')   clockInOutEditor: TemplateRef<any>;
  @Output() outPutClose = new EventEmitter()

  clock$ : Observable<any> | undefined;
  @Input()  clock: EmployeeClock;
  break$ : Observable<any>;
  isOnBreak$: Observable<any>;
  isOnBreak: boolean;
  isOnClock: boolean;
  breaksList$: Observable<IItemBasic>;
  break: employeeBreak;
  @Input() user: any;
  @Input() displayOnly: boolean;
  refrechClockCheck: boolean;
  timerID: any;
  @Input() displayPrintView: boolean;

  _clockRefresh$             : Observable<EmployeeClock>;
  clockRefresh$              : Subject<Observable<EmployeeClock>> = new Subject();

  constructor(
                      private employeeClockMethodsService: EmployeeClockMethodsService,
                      private employeeClockService: EmployeeClockService,
                      private siteService: SitesService,
                      private employeeService: EmployeeService,
                      private userAuthorizationService: UserAuthorizationService,
                      private printingService: PrintingService,
                      ) { }

  ngOnInit(): void {
    if (this.clock && this.displayOnly) { return }
    this.refresh();
    if (this.displayOnly) {
      // this.refreshTimer();
    }
  }

  get displayResults() {
    if (!this.user) { return null }
    if (this.displayOnly) {return this.onDisplayOnly }
    return this.clockInOutEditor
  }

  refresh() {
    this.isOnClock = false;
    const site = this.siteService.getAssignedSite()
    this.breaksList$ = this.employeeClockService.getBreakList(site)
    const user = this.userAuthorizationService.user;
    this.user = user;
    if (!user) { return }
    this.clock$  = this.employeeClockMethodsService.getUserOnClock(site, user).pipe(
      switchMap(data => {
        // console.log('getUserOnClock', data)
        if (!data) {
          this.isOnBreak = false;
          this.clock = null;
          this.isOnClock = false;
          return of(null)
        }
        if (!data.logOutDate) {
          this.isOnClock = true;
        }
        this.clock = data;
        this.getUserOnBreak(data)
        return of(data)
    }))
  }

  // _clockRefresh$             : Observable<EmployeeClock>;
  // clockRefresh$              : Subject<Observable<EmployeeClock>> = new Subject();
  refreshTimer() {
    // const user = this.userAuthorizationService.user
    // if (!user) { return }
    // if (user.roles === 'user') {return }
    // console.log('refresh timer')
    // const site   = this.siteService.getAssignedSite()
    // this._clockRefresh$  =  this.getClockInObs().pipe(
    //   repeatWhen(notifications =>
    //     notifications.pipe(
    //       delay(2000)),
    //   ),
    //   catchError((err: any) => {
    //     return throwError(err);
    //   })
    // )
  }

  refreshOrderCheck() {
    // this.timerID = setInterval( () =>
    //   this.refresh(),
    //   10000
    // );
  }

  getClockIn(jobID : number) {
    const site = this.siteService.getAssignedSite()
    const user = this.userAuthorizationService.user;
    this.user = user;
    this.breaksList$ = this.employeeClockService.getBreakList(site)
    return  this.employeeClockService.clockIn(site, user.employeeID, jobID ).pipe(
      switchMap(data => {
        if (!data) {
          this.isOnClock = false;
          return of(null)
        }
        this.isOnClock = true;
        this.getUserOnBreak(data)
        return of(data)
      })
    )
  }

  clockIn() {
    this.clock$ = this.getClockInObs().pipe(switchMap(data => {
      setTimeout(() => {
        this.emitClose
      }, 1000);
      return of(data)
    }))
  }

  emitClose() {
    this.outPutClose.emit(true)
  }

  getClockInObs() {
    const site = this.siteService.getAssignedSite();
    const employee$ = this.getEmployee();
    return employee$.pipe(
      switchMap(data => {
        if (data) {
          if (!data?.jobTypeID) {
            this.siteService.notify('No primary job assigned', 'Error', 2000);
            return of(null);
          }
          return this.getClockIn(data.jobTypeID);
        }
        return of(null)
      })).pipe(
        switchMap(data => {
          if (!data) {
            this.isOnClock = false;
            return of(null)
          }
          this.isOnClock = true;
          this.getUserOnBreak(data);
          this.siteService.notify('Clocked In', 'Success', 2000);
          return of(data);
      })
    )
  }

  print(clock){
    //set to time clock type.
    this.employeeClockMethodsService.clock = clock;
    this.printingService.updatePrintView(5);
    return this.printingService.previewReceipt(true )
  }

  clockOut() {
    const site = this.siteService.getAssignedSite()
    const employee$ = this.getEmployee()
    this.clock$ = employee$.pipe(
      switchMap(data => {
        if (data) {
          const clock$ = this.employeeClockService.clockOut(site, data.id);
          return clock$
        }
        return of(null)
      })).pipe(
        switchMap(data => {
          if (!data) {
            this.isOnClock = false;
            return of(null);
          }
          this.clock = data;
          this.siteService.notify('Clocked Out', 'Success', 2000);
          this.isOnClock = false;
          return this.employeeClockService.isOnClock(site, this.user?.employeeID);
        }
      )
    )
  }

  getUserOnBreak(clock: EmployeeClock) {
    this.isOnBreak = false
    this.employeeClockMethodsService.getUserOnBreak(clock);
    this.isOnBreak = this.employeeClockMethodsService.isOnBreak;
    this.break = this.employeeClockMethodsService.break;
    return false;
  }

  getEmployee() {
    const site = this.siteService.getAssignedSite()
    let user
    if (!this.user) {
      this.user =  this.userAuthorizationService.user;
    }
    return this.employeeService.getEmployee(site, this.user?.employeeID);
  }

  startBreak(item: IItemBasic) {
    const site       = this.siteService.getAssignedSite()
    const employeeID = this.userAuthorizationService.user.employeeID;
    this.break$      = this.employeeClockService.startBreak(site, item.id, employeeID).pipe(
      switchMap(data =>  {
        this.isOnBreak = true;
        this.siteService.notify('Break Started', 'Success', 1000);
        this.refresh()
        return of(data)
      })
    )
  }

  endBreak() {
    const site       = this.siteService.getAssignedSite()
    const employeeID = this.userAuthorizationService.user.employeeID;
    this.break$      = this.employeeClockService.endBreak(site, employeeID).pipe(
      switchMap(data => {
        this.isOnBreak = false;
        this.siteService.notify('Break Completed', 'Success', 1000);
        this.refresh()
        return of(data);
      })
    )
  }

}

