import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, Observable, switchMap, } from 'rxjs';
import { ISetting, ISite, IUser }   from 'src/app/_interfaces';
import { SitesService } from '../reporting/sites.service';
import { SettingsService } from './settings.service';

export interface EmailSMTP {
  name : string;
  subject: string;
  body: string;
  emailTo: string;
  id: number;
  useDefaultCredentials: boolean;
  password: string;
  port: string;
  host: string;
  history: boolean;
  dateFrom : string;
  dateTo : string;
  type: string;
}

export interface EmailModel {
  smtp : string;
  host : string;
  port : string;
  emailFrom: string;
  password : string;
  emailTo: string;
  UseDefaultCredentials: boolean
  name: string;
  Subject: string;
  body : string;
}

@Injectable({
  providedIn: 'root'
})

export class EmailSMTPService {
  apiUrl: any;


  constructor( private http: HttpClient,
               private auth: AuthenticationService,
               private siteService: SitesService,
               private settingsService: SettingsService,
               ) {

  }

  sentTestEmail(name : string, email: string):  Observable<any> {

    const site = this.siteService.getAssignedSite();
    const controller = "/FluentMail/"

    const endPoint = 'getLogins';

    const parameters = `?email=${email}&name=${name}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);

  }

  emailDCAPProperties(emailModel: EmailModel):  Observable<any> {

    const site = this.siteService.getAssignedSite();

    const controller = "/FluentMail/"

    const endPoint = 'emailDCAPProperties';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, emailModel);

  }

  credentialTest(emailModel: EmailModel):  Observable<any> {

    const site = this.siteService.getAssignedSite();

    const controller = "/FluentMail/"

    const endPoint = 'credentialTest';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, emailModel);

  }

  passwordReset(emailSMTP: EmailSMTP):  Observable<any> {

    const site = this.siteService.getAssignedSite();

    const setting$ = this.settingsService.getSettingByName(site,'PasswordResetEmailSMTP');


    const controller = "/FluentMail/"

    const endPoint = 'credentialTest';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    emailSMTP.type = 'password reset'

    const results$ = setting$.pipe(
      switchMap(data => {
        if (data) {
          if (data.text) {
            const body = data.text
            emailSMTP.body = body
            return this.http.post<any>(url, emailSMTP);
          }
        }
        emailSMTP.body = 'Hello, a password reset was requested'
        return this.http.post<any>(url, emailSMTP);
      })
    )
    return results$

  }

  newUser(emailSMTP: EmailSMTP):  Observable<any> {

    const site = this.siteService.getAssignedSite();

    const setting$ = this.settingsService.getSettingByName(site,'PasswordResetEmailSMTP');

    const controller = "/FluentMail/"

    const endPoint = 'newUser';

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    emailSMTP.type = 'password reset'

    const results$ = setting$.pipe(
      switchMap(data => {
        if (data) {
          if (data.text) {
            const body = data.text
            emailSMTP.body = body
            return this.http.post<any>(url, emailSMTP);
          }
        }
        emailSMTP.body = 'Hello, a password reset was requested'
        return this.http.post<any>(url, emailSMTP);
      })
    )
    return results$

  }
}
