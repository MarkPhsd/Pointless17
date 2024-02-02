import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IUser, UserPreferences } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {
  inputForm: FormGroup;
  action$ : Observable<any>;
  headerColor: any;
  user: IUser

  _user = this.authenticationService.user$.subscribe(user => {
    this.user = user;
    // console.log('user', user.userPreferences)
    this.initForm()
  })

  constructor(
    private userAuthorizationService: UserAuthorizationService,
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private siteService: SitesService,
    private clientTableService: ClientTableService,
    @Optional() private dialogRef  : MatDialogRef<UserPreferencesComponent>,

  ) { }

  ngOnInit(): void {
    this.initForm()
  }

  ngOnDestroy() {
    if (this._user) { this._user.unsubscribe()}
  }

  initForm(){
    if (!this.user) { return }
    this.inputForm = this.fb.group({
      darkMode: [], //
      swapMenuOrderPlacement:  [], //boolean;
      orderFilter:  [], //IPOSOrderSearchModel
      product:  [], //ProductSearchModel;
      showAllOrders:  [], //boolean;
      firstTime_notifyShowAllOrders: [], // boolean;
      firstTime_FilterOrderInstruction:  [], //boolean;
      enableCoachMarks: [], // boolean;
      contactPreference:  [], //number;
      orderID:  [], //number;
      ebayItemJSONHidden:  [], //boolean;
      headerColor:  [], //string;

    })


    this.inputForm.patchValue(this.user?.userPreferences)
    this.headerColor  = this.user?.userPreferences?.headerColor;

    this.inputForm.valueChanges.subscribe(data => {
      if (this.headerColor) {   data.headerColor = this.headerColor  }
      this.action$ = this.savePreferences(data, this.userAuthorizationService.user.id)
    })
  }

  savePreferences(userPreferences: UserPreferences, id: Number) {
    userPreferences.headerColor = this.headerColor;
    let item = JSON.stringify(userPreferences)
    const site = this.siteService.getAssignedSite()
    return this.clientTableService.savePreferences(site, item, +id);
  }

  close() {
    let data = this.inputForm.value as UserPreferences
    data.headerColor  = this.headerColor;
    this.action$ = this.savePreferences(data, this.userAuthorizationService.user.id).pipe(switchMap(data => {
      this.authenticationService.updatePreferences(data)
      setTimeout(() => {
          this._close()
      }, 10);
      return of(data)
    }))
  }

  _close() {
    if (this.dialogRef) {
      try {
        this.dialogRef.close();
      } catch (error) {
        return of('error')
      }
    }
  }
}
