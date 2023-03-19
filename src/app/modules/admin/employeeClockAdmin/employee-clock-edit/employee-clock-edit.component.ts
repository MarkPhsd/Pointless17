import { Component, Inject,  OnInit} from '@angular/core';
import { EmployeeClockService } from 'src/app/_services/employeeClock/employee-clock.service';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { employeeBreak, EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import { Observable, of , map, switchMap, catchError } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';


@Component({
  selector: 'app-employee-clock-edit',
  templateUrl: './employee-clock-edit.component.html',
  styleUrls: ['./employee-clock-edit.component.scss']
})
export class EmployeeClockEditComponent implements OnInit {

  action$:  Observable<any>;
  clock$: Observable<EmployeeClock>;
  clock: EmployeeClock;
  inputForm: FormGroup;
  breaks: employeeBreak[];
  message: string;

  constructor(
      private employeeClockService: EmployeeClockService,
      private siteService: SitesService, 
      private fb: FormBuilder, 
      private dataHelper: DateHelperService,
      private fbProductsService: FbProductsService,
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
    let login: string 
    let logOut: string;
    login = this.dataHelper.format( data.logInTime, 'y-MM-dd hh:mm')
    logOut = this.dataHelper.format( data.logOutTime, 'y-MM-dd hh:mm')
    this.inputForm.patchValue({ logInTime: login, logOutTime: logOut })
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
      payRate:         [],
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

  updateSave(event) { 
    const site = this.siteService.getAssignedSite()
    const clock = this.inputForm.value
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
    const clock = this.inputForm.value
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