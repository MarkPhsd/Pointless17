import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { Observable,switchMap,of } from 'rxjs';
import { SystemService } from 'src/app/_services/system/system.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EmployeeDetailsPanelComponent } from '../../employees/employee-details-panel/employee-details-panel.component';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.scss']
})
export class EmailSettingsComponent implements OnInit {
  showSendGridOptions: boolean;
  testEmail$: Observable<any>;
  message: any;

  @Input() inputForm          : UntypedFormGroup;

  constructor(
    private systemService   : SystemService,
    private _snackbar: MatSnackBar,
    private orderService: OrdersService,
    private orderMethodsService: OrderMethodsService ,
    private sitesSerivce: SitesService,
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

      // console.log("email interference.")
      const item$ = this.sendGridService.sendSMTPTest(emailTo, emailName)
      this.testEmail$ = item$.pipe(
            switchMap(data => {
              this.message = 'Please check your email.' + data.toString()
              this._snackbar.open('Please check your email. ' + data.toString(), 'Alert')
              return of(data)
            })
          )

    }
  }

  sendOrderTest() {

    const site = this.sitesSerivce.getAssignedSite()
    const orderID = this.orderMethodsService.currentOrder.id;
    const emailTo = this.inputForm.controls['salesReportsEmail'].value;
    const emailName = this.inputForm.controls['salesReportsEmail'].value;

    this.testEmail$ = this.sendGridService.sendOrderTest(orderID, false, emailTo, emailName).pipe(data => {
      this.message = data;
      return of(data)
    })

  }

  sendTestEmail() {
    this.sendGridService.sendTestEmail().subscribe(data =>  {
      console.log(data)
    })
  }
}
