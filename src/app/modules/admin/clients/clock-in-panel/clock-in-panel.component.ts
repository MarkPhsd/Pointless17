import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, of, switchMap } from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'app-clock-in-panel',
  templateUrl: './clock-in-panel.component.html',
  styleUrls: ['./clock-in-panel.component.scss']
})
export class ClockInPanelComponent implements OnInit {

  @ViewChild('clockView') clockView : TemplateRef<any>;
  spinnerLoading
  errorMessage: string;
  loginAction$: Observable<any>;
  message : string;
  user
  constructor(
    private siteService: SitesService,
    private authenticationService : AuthenticationService,
    @Optional() private dialogRef  : MatDialogRef<ClockInPanelComponent>,
    private userSwitchingService: UserSwitchingService) { }


  get clockViewEnabled() {
    if (this.user) {
      return this.clockView;
    }
    return null;
  }
  ngOnInit(): void {
    this.initInfo();
    this.clearUserSettings()
  }

  ngOnDestroy() {
    this.initInfo()
    this.clearUserSettings()
  }

  initInfo() {
    this.message = ''
    this.errorMessage = ''
    this.spinnerLoading = false;
  }

  clearUserSettings() {
    this.spinnerLoading = false;
    this.user = null;
    this.authenticationService.clearUserSettings();
  }

  pinLogin(event) {
    const pin = event.password;
    const user = event.username;
    this.submitLogin( user, pin)
  }

  submitLogin(userName: string, password: string) {

    this.errorMessage = ''
    this.message = ''
    const clockInOnly = true;

    this.loginAction$ = this.userSwitchingService.processTimeClockLogin(userName, password).pipe(
      switchMap(result =>
        {
          this.message = "Retry your code."
          // console.log('result', result)
          if (!result || (result && result.errorMessage)) {
            this.siteService.notify(result?.errorMessage, 'Close', 10000,'red' );
            this.clearUserSettings()
            return of('failed')
          }

          //if is app then result is a combination of user and sheet
          //if is not app then result is the user.
          let user = result?.user ;
          let sheet = result?.sheet as IBalanceSheet;

          if (result && result.username != undefined) { user = result }

          if (user) {
            this.spinnerLoading = false;


            if (user && user?.errorMessage === 'failed') {
              this.clearUserSettings()

              this.authenticationService.updateUser(null);
              return of('failed')
            }

            if (user && user?.message && user?.message.toLowerCase() === 'success') {
              let pass = false
              this.user = result
              this.message = "Success: Choose to clock in or out as applicable."
              return of('success')
            }
          }
        }
    ))
  }

  close() {
    if (this.dialogRef) {
      try {
        this.dialogRef.close();
      } catch (error) {
        return of('error')
      }
    }
  }

}
