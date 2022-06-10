import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SitesService } from '../reporting/sites.service';

export interface EmailModel {
  id : string;
  name : string;
  email : string;
  password : string;
  smtpSender_SMPTHOST : string;
  mailGunSender_Enabled : boolean
  mailGunSender_Domain : string; //'("domainname.com",
  mailGunSender_APIKey : string; //'"yourapikey", FluentEmail.Mailgun.MailGunRegion.USA);
  sendGridSender_Enabled : boolean
  sendGridSender_APIKey : string; //'("apikey")
  mailkitSender_Enabled : boolean
  mailKitSender_Server : string;
  mailKitSender_Port : string;
  mailKitSender_UseSSL : boolean
  mailKitSender_User : string;
  emailContent: EmailContent;

  endOfDayAddresses: string[];
  alertAddresses   : string[];

}

export interface EmailContent {
  subject : string;
	emailTo : string;
	emailToName : string;
	plainText : string;
	htmlContent : string;
}


@Injectable({
  providedIn: 'root'
})
export class SendGridService {

  constructor(
    private http: HttpClient,
    private _fb: FormBuilder,
    private siteService: SitesService,
  )
  {

  }

  sendTestEmail() {

    const site = this.siteService.getAssignedSite()
    const controller =  "/SendGrid/"

    const endPoint = `sendTEstEmail`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  sendBalanceSheet(id: number) {

    const site = this.siteService.getAssignedSite();

    const controller =  "/SendGrid/"

    const endPoint = `SendBalanceSheet`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  sendOrder(id: number, history: boolean, emailTo: string, customerName: string) {

    const site = this.siteService.getAssignedSite()

    const controller =  "/SendGrid/"

    const endPoint = `sendTEstEmail`

    const parameters = `?id=${id}&history=${history}&emailTo=${emailTo}&`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }
}
