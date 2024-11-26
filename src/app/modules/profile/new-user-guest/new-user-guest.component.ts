import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { IUser } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { LogoComponent } from 'src/app/shared/widgets/logo/logo.component';
import { ValueFieldsComponent } from '../../admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { LoginInfoComponent } from 'src/app/shared/widgets/login-info/login-info.component';

@Component({
  selector: 'app-new-user-guest',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    LogoComponent, ValueFieldsComponent,LoginInfoComponent,
  SharedPipesModule],
  templateUrl: './new-user-guest.component.html',
  styleUrls: ['./new-user-guest.component.scss']
})
export class NewUserGuestComponent implements OnInit {

  inputForm: FormGroup;
  mobileEnabled: boolean;
  dialogOpen: boolean;
  user: IUser;
  uiHome$: Observable<any>;
  action$: Observable<any>;
  newUser = true;
  constructor(
              private settingService: SettingsService,
              private fb: FormBuilder,
              private siteService: SitesService,
              private userAuthService: AuthenticationService,
              private router: Router,
              @Optional() private dialogRef  : MatDialogRef<NewUserGuestComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
            )
    {
      this.dialogOpen = true
    }

  toggleNewUser(){
    this.newUser = !this.newUser;
    this.initForm()
    if (this.newUser) {
    }
  }

  ngOnInit() {
    this.user = this.userAuthService._user.value;
    this.uiHome$ =  this.settingService.getUIHomePageSettings()
    this.initForm()
  }

  initForm() {
    this.inputForm = this.fb.group({
      userName: ['', Validators.required],
      email: [],
      phone: [],
    })

  }
  requestUser() {

    const user = this.inputForm.value;
    if (!user.email && !user.phone) {
      this.siteService.notify('Email or mobile is required', 'close', 5000)
      return;
    }

    let iUser = {} as IUser
    iUser.username = user.userName;
    iUser.email = user?.email;
    iUser.phone = user?.phone;
    iUser.id = this.user.id;

    if (iUser.email) {
      iUser.username = iUser.email;
    } else {
      iUser.username = iUser.phone;
    }
    const updateUser$ = this.userAuthService.requestNewUser(iUser);

    this.action$ = updateUser$.pipe(switchMap(data => {
      if (data) {

        // console.log(data)

        if (data?.userExists) {
          //then send us to the password reset
          this.closeDialog()
          this.router.navigate(['/changepassword', {userName: iUser.username}]);
          // this.userAuthService.requestPasswordResetToken(data?.userName)
        }
        if (!data?.userExists) {
          //then notifiy us this user is not possible
          this.siteService.notify(data?.message, 'close',10000, 'red', 'top')
        }
      }
      return of(data)
    }))
  }


  closeDialog() {
    if (this.dialogOpen) {
      try {
        this.dialogRef.close();
      } catch (error) {
        return of('error')
      }
    }
  }

  onLoginCompleted(event) {
    // console.log('completed')
    this.closeDialog()
  }

}
