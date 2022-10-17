import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { Observable,switchMap,of } from 'rxjs';
import { SystemService } from 'src/app/_services/system/system.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.scss']
})
export class EmailSettingsComponent implements OnInit {
  showSendGridOptions: boolean;
  testEmail$: Observable<any>;
  message: string;

  @Input() inputForm          : FormGroup;

  constructor(
    private systemService   : SystemService,
    private _snackbar: MatSnackBar,
    private sendGridService :  SendGridService,
  ) {
  }

  ngOnInit() {
   const i = 0;
  }

  sendSMTPTestEmail() {

    this.message = ''
    if (this.inputForm) {
      const emailTo = this.inputForm.controls['salesReportsEmail'].value;
      const emailName = this.inputForm.controls['salesReportsEmail'].value;

      if (!emailTo) {
        this._snackbar.open('Email From not set in Manager Email Section Below. Please input email for Sales Reports', 'Alert')
      }

      console.log("email interference.")
      const item$ = this.sendGridService.sendSMTPTest(emailTo, emailName)
      this.testEmail$ = item$.pipe(
            switchMap(data => {
              this.message = 'Please check your email.'
              return of(data)
            })
          )
      this._snackbar.open('Please check your email', 'Alert')

    }
  }

  sendTestEmail() {
    this.sendGridService.sendTestEmail().subscribe(data =>  {
      console.log(data)
    })
  }
}
