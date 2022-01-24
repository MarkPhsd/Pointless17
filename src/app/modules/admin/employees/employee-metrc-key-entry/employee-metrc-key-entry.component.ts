import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { employee } from 'src/app/_interfaces';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-employee-metrc-key-entry',
  templateUrl: './employee-metrc-key-entry.component.html',
  styleUrls: ['./employee-metrc-key-entry.component.scss']
})
export class EmployeeMetrcKeyEntryComponent  {

  inputForm: FormGroup;
  employee:  employee;

  constructor(private employeeService: EmployeeService,
              private fb             : FormBuilder,
              private siteService    : SitesService,
              private _snackBar      : MatSnackBar,
              private dialogRef      : MatDialogRef<EmployeeMetrcKeyEntryComponent>,
              @Inject(MAT_DIALOG_DATA) public data: employee
    ) {
      this.initForm()
      if (data) {
        this.employee = data as employee;
        this.inputForm.patchValue(data)
      }

      if (!data) {
        this.notifyEvent('Employee not initialized', 'Failed')
      }
    }

    initForm() {
      this.inputForm = this.employeeService.initForm(this.inputForm)
    }

    saveEmployee(){
      const site = this.siteService.getAssignedSite();
      const employee = this.inputForm.value as employee
      this.employeeService.putEmployeeMetrcKey(site, employee.id, employee).subscribe(data => {
        this.notifyEvent('Employee key saved', 'Success')
        this.cancel(true)
      }, err=> {
        this.notifyEvent('Employee key not saved ', 'Failed')

      })
    }

    cancel(result) {
      this.dialogRef.close(result)
    }

    notifyEvent(message: string, action: string) {
      this._snackBar.open(message, action, {
        duration: 2000,
        verticalPosition: 'top'
      });
    }

  }


// openEmployeeMetrcKeyEntryComponent
