import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { IUser } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-new-user-guest',
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


  ngOnInit() {
    this.user = this.userAuthService._user.value;
    this.uiHome$ =  this.settingService.getUIHomePageSettings()
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
    const updateUser$ = this.userAuthService.requestNewUser(iUser);

    this.action$ = updateUser$.pipe(switchMap(data => {
      if (data) {

        console.log(data)

        if (data?.userExists) {
          //then send us to the password reset
          this.closeDialog()
          this.router.navigate(['/changepassword', {userName: user.userName}]);
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

}