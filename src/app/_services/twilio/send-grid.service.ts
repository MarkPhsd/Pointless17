import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
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

export interface  emailSMTP {
  name : string;
  subject : string;
  body : string;
  emailTo : string;
  id : number;
  type : string;
  history : true;
  dateFrom : string;
  dateTo : string;
}


@Injectable({
  providedIn: 'root'
})
export class SendGridService {

  constructor(
    private http: HttpClient,
    private _fb: FormBuilder,
    private matSnack : MatSnackBar,
    private siteService: SitesService,
  )
  {

  }

  sendTestEmail(): Observable<any> {

    const site = this.siteService.getAssignedSite()

    const controller =  "/SendGrid/"

    const endPoint = `sendTEstEmail`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  sendBalanceSheet(id: number): Observable<any>  {

    const site = this.siteService.getAssignedSite();

    const controller =  "/SendGrid/"

    const endPoint = `SendBalanceSheet`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  sendTemplateOrder(id: number, history: boolean, emailTo: string, customerName: string, template: string, subject: string): Observable<any> {

    const site = this.siteService.getAssignedSite()

    const controller =  "/SendGrid/"

    const endPoint = `sendTemplateOrder`

    const parameters = `?id=${id}&history=${history}&emailTo=${emailTo}&emailReceiverName=${customerName}&template=${template}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  sendOrder(id: number, history: boolean, emailTo: string, customerName: string): Observable<any> {

    const site = this.siteService.getAssignedSite()

    const controller =  "/SendGrid/"

    const endPoint = `sendOrder`

    const parameters = `?id=${id}&history=${history}&emailTo=${emailTo}&emailReceiverName=${customerName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  sendSMTPTest( emailTo: string, customerName: string): Observable<any> {

    const site = this.siteService.getAssignedSite()

    const controller =  "/FluentMail/"

    const endPoint = `sendSMTPTest`

    const item = {} as emailSMTP
    item.emailTo = emailTo;
    item.name = customerName;
    item.subject = 'Test email'
    item.type = 'test';
    item.body = 'This is a test email from PointlessPOS.'
    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>(url, item)

  }


  sendSalesReport(id: number, dateFrom:string, dateTo: string): Observable<any> {

    const site = this.siteService.getAssignedSite()

    const controller =  "/SendGrid/"

    const endPoint = `sendSalesReport`

    const parameters = `?id=${id}&dateFrom=${dateFrom}&dateTo=${dateTo}&`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  notify(message: string, title: string) {
    this.matSnack.open(message, title, {duration:1000})
  }

}
