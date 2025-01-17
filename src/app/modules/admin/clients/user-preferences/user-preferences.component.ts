import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable,  of, switchMap } from 'rxjs';
import { IUser, UserPreferences } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ToggleThemeComponent } from 'src/app/shared/widgets/toggle-theme/toggle-theme.component';
import { ValueFieldsComponent } from '../../products/productedit/_product-edit-parts/value-fields/value-fields.component';

@Component({
  selector: 'app-user-preferences',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,
  ToggleThemeComponent,ValueFieldsComponent,
  SharedPipesModule],
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {
  inputForm: FormGroup;
  action$ : Observable<any>;
  headerColor: any;
  user: IUser
  @Input() saveDisabled: boolean;

  _user = this.authenticationService.user$.subscribe(user => {
    this.user = user;
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
      firstTime_FilterOrderInstruction:  [true], //boolean;
      enableCoachMarks: [], // boolean;
      contactPreference:  [], //number;
      orderID:  [], //number;
      ebayItemJSONHidden:  [], //boolean;
      headerColor:  [], //string;
      messagingPreference: [],
      metrcKey: [],
      metrcUseMetrcLabel: [],
      customerDisplayPin: [],
    })

    this.inputForm.patchValue(this.user?.userPreferences)
    this.headerColor  = this.user?.userPreferences?.headerColor;

    this.inputForm.valueChanges.subscribe(data => {
      const formValue = data;
      if (this.headerColor) {   data.headerColor = this.headerColor  }
      let pref =     this.user.userPreferences = formValue;

      this.action$ = this.savePreferences(data, this.userAuthorizationService?.user?.id).pipe(switchMap(formValue => {
        pref.firstTime_FilterOrderInstruction = false;
        this.user.preferences = pref;
        this.authenticationService.updateUser(this.user)
        this.authenticationService.updatePreferences(formValue);
        return of(data)
      }))
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
    const formValue = data;
    this.action$ = this.savePreferences(data, this.userAuthorizationService.user.id).pipe(switchMap(data => {
      this.userAuthorizationService.user.userPreferences = formValue;
      this.user.userPreferences = formValue;
      this.authenticationService.updateUser(this.user)
      setTimeout(() => {
          this._close()
      }, 10);
      return of(data)
    }))
  }

  _close() {
    if (this.saveDisabled) { return }
    if (this.dialogRef) {
      try {
        this.dialogRef.close();
      } catch (error) {
        return of('error')
      }
    }
  }
}
