import { Component, Inject,  OnInit} from '@angular/core';
import { EmployeeClockService } from 'src/app/_services/employeeClock/employee-clock.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { employeeBreak, EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import { Observable, of , map, switchMap, catchError } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';

@Component({
  selector: 'app-employee-clock-edit',
  templateUrl: './employee-clock-edit.component.html',
  styleUrls: ['./employee-clock-edit.component.scss'],
})
export class EmployeeClockEditComponent implements OnInit {

  action$:  Observable<any>;
  clock$: Observable<EmployeeClock>;
  clock: EmployeeClock;
  inputForm: UntypedFormGroup;
  breaks: employeeBreak[];
  message: string;
  login: Date;
  logOut:Date;
  private _logOutTime: Date;

  dateTimeFormat = 'y-MM-dd h:mm:ss a'
  constructor(
      private employeeClockService: EmployeeClockService,
      private siteService: SitesService,
      private fb: UntypedFormBuilder,
      private dataHelper: DateHelperService,
      private dialogRef: MatDialogRef<EmployeeClockEditComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    const site = this.siteService.getAssignedSite();
    this.initForm();
    this.clock$ = this.employeeClockService.getEmployeeClock(site, data).pipe(
      switchMap(data => {
        this.patchValuesToForm(data)
        return of(data)
      }),catchError(data => {
        this.message = 'Error ' + JSON.stringify(data)
        return of(data)
      })
    )
  }


  // | "y" | "year"
	// | "M" | "month"
	// | "d" | "day"
	// | "h" | "hour"
	// | "m" | "minute"
	// | "s" | "second"
	// | "S" | "millisecond"


  patchValuesToForm(data) {
    this.clock = data;
    this.breaks = data.breaks
    this.inputForm.patchValue(data)
    this.login  = null; // Date
    this.logOut = null; //Date;

    if (data.logInTime) {
      this.login = new Date(this.dataHelper.format( data.logInTime,  this.dateTimeFormat))
    }
    if (data.logOutTime) {
      this.logOut = new Date(this.dataHelper.format( data.logOutTime, this.dateTimeFormat))
    }

    this.inputForm.patchValue({ logInTime: this.login, logOutTime: this.logOut })

  }

  updateTime() {
    const value1 =  this.inputForm.controls['loginTime'].value;
    const value2 = this.inputForm.controls['logOutTime'].value;
    console.log('update time, ', value1)

    this.inputForm.patchValue({ logInTime: this.login, logOutTime: this.logOut })
  }


  ngOnInit(): void {
    const i = 0;
    this.initForm();
  };

  initForm() {
    this.inputForm = this.fb.group({
      id:               [],
      employeeID:       [],
      logInTime:        [],
      logInDate:        [],
      logOutTime:       [],
      logOutDate:       [],
      note:             [],
      active:           [],
      periodID:         [],
      employeePosition: [],
      payRate:          [],
      employeMealCount: [],
      regHours:         [],
      otHours:          [],
      regPay:           [],
      otPay:            [],
      employeeName:     [],
      breakMinutes:     [],
      originalClockIn:  [],
      originalClockOut: [],
      managerID:        [],
      shiftID:          [],
      shiftName:        [],
      siteID:           [],
    })
  }

  getClockValue() {

    const clock = this.inputForm.value as EmployeeClock
    let logInTime  : string;
    let logOutTime : string;

    try {
      if (clock && clock.logInTime) {
        logInTime = this.dataHelper.format( clock.logInTime,  this.dateTimeFormat)
        clock.logInTime = logInTime
        clock.logInDate = logInTime
      }
    } catch (error) {

    }

    try {
      if (clock &&  clock.logOutTime && clock.logOutTime != null) {
        logOutTime = this.dataHelper.format( clock.logOutTime,  this.dateTimeFormat)
        clock.logOutDate = logOutTime
        clock.logOutTime = logOutTime
      }
    } catch (error) {

    }

    return clock;
  }
  updateSave(event) {
    const site = this.siteService.getAssignedSite()
    const clock = this.getClockValue()

    this.clock$ = this.employeeClockService.putEmployeeClock(site, clock.id, clock).pipe(
      switchMap( data => {
        this.patchValuesToForm(data)
        return of(data)
      }),catchError(data => {
        this.message = 'Error ' + JSON.stringify(data)
        return of(data)
      })
    )
  }

  updateItemExit(event) {
    const site = this.siteService.getAssignedSite()
    const clock = this.getClockValue()

    this.clock$  = this.employeeClockService.putEmployeeClock(site, clock.id,clock).pipe(
      switchMap( data => {
        this.patchValuesToForm(data)
        this.onCancel(null)
        return of(data)
      }),catchError(data => {
        this.message = 'Error ' + JSON.stringify(data)
        return of(data)
      })
    )
  }

  deleteItem(event) {
    const site  = this.siteService.getAssignedSite()
    const clock = this.inputForm.value
    this.clock$ = this.employeeClockService.deleteEmployeeClock(site, clock.id).pipe(
      switchMap( data => {
        this.patchValuesToForm(data)
        this.onCancel(null)
        return of(data)
      }),catchError(data => {
        this.message = 'Error ' + JSON.stringify(data)
        return of(data)
      })
    )
  }

  onCancel(event) {
    this.dialogRef.close();
  }

}
