import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { IClientTable } from 'src/app/_interfaces';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-password-validation',
  templateUrl: './password-validation.component.html',
  styleUrls: ['./password-validation.component.scss']
})
export class PasswordValidationComponent implements OnInit {

  inputForm   : UntypedFormGroup;
  clientForm  : UntypedFormGroup;
  confirmPassword: UntypedFormGroup;

  @Input() client     : IClientTable;
  isAuthorized        : boolean ;
  isStaff             : boolean ;
  passwordsMatch      = true;
  password1
  password2

  constructor(
      private siteService           : SitesService,
      private fb                    : UntypedFormBuilder,
      private clientTableService    : ClientTableService,
      private fbContactsService     : FbContactsService,
      private userAuthorization     : UserAuthorizationService,
      private _snackBar             : MatSnackBar,

  ) { }

  ngOnInit(
    ) {
    const i = 0;
    this.isAuthorized =  this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff      =  this.userAuthorization.isUserAuthorized('admin, manager, employee')
    this.initConfirmPassword()
  }

  initConfirmPassword()  {
    this.confirmPassword = this.fb.group( {
      confirmPassword: ['']
    })
    this.inputForm = this.fb.group( {
      apiPassword: ['']
    })
    this.validateMatchingPasswords();
  }

  initClientForm(client: IClientTable) {
    this.clientForm = this.fbContactsService.initForm(this.clientForm)
    client.password    = '';
    client.apiPassword = ''
    this.clientForm.patchValue(client)
    this.validateMatchingPasswords2();
  }

  validateMatchingPasswords() {
    try {
      this.confirmPassword.valueChanges.subscribe( data => {
        if (!this.confirmPassword) { this.initConfirmPassword()}
        if (this.confirmPassword) {
          this.password1 = this.confirmPassword.controls['confirmPassword'].value;
          if (this.password1 == this.password2) {
            this.passwordsMatch = true;
            return
          }
        }
        this.passwordsMatch = false
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  validateMatchingPasswords2() {
    try {
      this.clientForm.valueChanges.subscribe( data => {
        if (this.clientForm) {
          this.password2 = this.clientForm.controls['apiPassword'].value;
          if (this.password1 == this.password2) {
            this.passwordsMatch = true;
            return
          }
        }
        this.passwordsMatch = false
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  saveClient() {
    const site = this.siteService.getAssignedSite();
    if (this.client) {
      const client = this.client;
      client.apiPassword = this.password1
      this.clientTableService.putPassword(site, client.id, client).subscribe( data => {
        this.notifyEvent('Saved', "Success")
      })
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
