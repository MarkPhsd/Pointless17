import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from '../system/authentication.service';

export interface IPaymentSalesSearchModel {
  startDate:    string;
  endDate:      string;
  saleType:     string;
  employeeName: string;
  dispatcherID: number;
  driverId:     number;
  pageSize:     number;
  pageNumber:   number;
  groupBy:      string;
  siteID:       number;
  zrunID       :string;
}

export interface IPaymentSalesSummary {
  paymentSummary: PaymentSummary[];
  resultMessage:  string;
  total         : number;
  tipAmount     : number;
  count         : number;
  creditTotal   : number;
}

export interface PaymentSummary {
  amountPaid:    number;
  tipAmount:    number;
  paymentMethod: string;
  isCash      : boolean;
  isCreditCard: boolean;
  count:         number;
  startDate:     string;
  endDate:       string;
  totalPayments: number;
  hour:          number;
  month:         number;
  employeeName:  string;
  dateHour:      string;
  resultMessage: string;
  completionDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesPaymentsService {

  constructor( private http: HttpClient,
               private auth: AuthenticationService,
   ) { }

   getPaymentSales(site: ISite, searchModel: IPaymentSalesSearchModel): Observable<IPaymentSalesSummary> {

    const controller = `/SalesPayments/`

    const endPoint = `GetPaymentSummary`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.post<any>(url, searchModel)

  }


}
