import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from '../system/authentication.service';
interface ILaborSummary {
  Weekday: string;
  Hour: number | null;
  AverageQuantity: number | null;
  AveragePay: number | null;
  AverageSales: number | null;
}
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
  refunds     : boolean;
  voids       : boolean;
  serviceType: string;
  deviceName: string;
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
  voidReason:     string;
  voidAmount   : string;
  serviceType: string;
  deviceName: string;
  history: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SalesPaymentsService {

  getPaymentDiscrepancy(site: any, zrunID: number, dateFrom: string, dateTo: string): Observable<IPaymentSalesSummary> {
    const controller = `/SalesPayments/`

    const endPoint = `getPaymentDiscrepancy`

    const model = {zrunID:  zrunID, startDate: dateFrom, endDate: dateTo}

    const parameters = ``;
    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IPaymentSalesSummary>(`${url}`, model)
  }


  getSalesAndLaborPeriodAverage(site: ISite, startDate: string, endDate: string) : Observable<ILaborSummary[]> {

    const controller = `/SalesPayments/`

    const endPoint = `GetSalesAndLaborPeriodAverage`

    const parameters = `?startDate=${startDate}&endDate=${endDate}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ILaborSummary[]>(url)

  }

  getAvgWeekDayHourlySalesReport(site: ISite, startDate: string, endDate: string) : Observable<any> {

    const controller = `/SalesPayments/`

    const endPoint = `getAvgWeekDayHourlySalesReport`

    const parameters = `?startDate=${startDate}&endDate=${endDate}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  getAverageSalesReportBy15Minutes(site: ISite, startDate: string, endDate: string) : Observable<any> {

    const controller = `/SalesPayments/`

    const endPoint = `GetAverageSalesReportBy15Minutes`

    const parameters = `?startDate=${startDate}&endDate=${endDate}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

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
