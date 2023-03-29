import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, of, } from 'rxjs';
import { ISite }   from 'src/app/_interfaces';
import { SitesService } from './sites.service';
import { saveAs } from 'file-saver'
import { Papa, UnparseConfig } from 'ngx-papaparse';
// Generated by https://quicktype.io
// Generated by https://quicktype.io

export interface IReportItemSaleSummary {
  results: IReportItemSales[];
  summary: IReportItemSales;
  resultMessage: string;
  site   : ISite;
}

export interface IReportItemSales {
  productName:             string;
  serialNumber:            string;
  employee:                string;
  posName:                 string;
  zRunID:                  string;
  balanceSheetID:          number;
  itemTotal:               number;
  taxTotal1:               number;
  taxTotal2:               number;
  taxTotal3:               number;
  cRV:                     number;
  pointDiscount:           number;
  itemCashDiscounts:       number;
  orderCashDiscount:       number;
  itemPercentageDiscount:  number;
  orderPercentageDiscount: number;
  completionDate:          string;
  orderDate:               string;
  serviceType:             string;
  prodModifierType:        number;
  giftCardType:            number;
  orderID:                 number;
  ID:                      number;
  productID:               number;
  serviceFilterType:       number;
  quantity:                number;
  unitPrice:               number;
  traceProductCount:       number;
  originalPrice:           number;
  activePO:                boolean;
  clientID:                number;
  barcode:                 string;
  completionDateShort:     string;
  employeeID:              number;
  categoryID:              number;
  category:                string;
  departmentID:            number;
  department:              string;
  weightedItem:            number;
  siteID:                  number;
  cost                   : number;
  itemCost               : number;
  printed : string;
  ItemPrepped : string;
}

export interface IReportingSearchModel {
  startDate:                    string;
  endDate:                      string;
  serviceTypeID:                number;
  employeeID:                   number;
  productName:                  string;
  barcode:                      string;
  prodModifierType:             string;
  userScheduledateDateForRange: boolean;
  userOrderDateForRange:        boolean;
  clientID:                     number;
  pageSize:                     number;
  pageNumber:                   number;
  groupByEmployee:              boolean;
  groupByProduct:               boolean;
  groupByCategory:              boolean;
  groupByDepartment:            boolean;
  groupByType                 : boolean;
  groupByDate:                  boolean;
  weightedItem:                 boolean;
  productsOnly:                 boolean;
  discountsOnly:                boolean;
  zrunID                  :     string;
  scheduleDateStart      :     string;
  scheduleDateEnd         :     string;
  removeGiftCards: boolean;
  itemPrepped: number;
  itemPrinted: number;
}

// Generated by https://quicktype.io

export interface ITaxReport {
  nonTaxableSalesTotal:     number;
  taxTotal1:                number;
  taxTotal2:                number;
  taxTotal3:                number;
  grossSales:               number;
  netSales:                 number;
  itemTotal:                number;
  orderCashDiscount:        number;
  itemPercentDiscount:      number;
  itemCashDiscount:         number;
  orderPercentDiscount:     number;
  itemLoyaltyPointDiscount: number;
  crv:                      number;
  startDate:                string;
  endDate:                  string;
  giftCardIssuances:        number;
  paidOuts:                 number;
  resultsMessage          : string;
  productName              : string;
  itemType                : string;
  category                : string;
  department              : string;
  scheduleDate            : string;
  completed:boolean
}

@Injectable({
  providedIn: 'root'
})
export class ReportingItemsSalesService {

  constructor( private http: HttpClient, private auth: AuthenticationService,
               private papa: Papa,
               private sitesService: SitesService) { }

  //Tax Sales Report Standard
  putSalesTaxReport(site: ISite, startDate: string, endDate: string, zrunID: string): Observable<ITaxReport> {

    const controller = `/ReportItemSales/`

    const endPoint = `PutSalesTaxReport`

    const filter ={} as IReportingSearchModel
    filter.startDate = startDate
    filter.endDate = endDate
    filter.zrunID  = zrunID
    const url = `${site.url}${controller}${endPoint}`

    return  this.http.put<any>(url, filter)

  };

  getItemSalesReport(site: ISite, IReportingSearchModel: IReportingSearchModel): Observable<IReportItemSales[]> {

    IReportingSearchModel.productsOnly = true;

    const controller = `/ReportItemSales/`

    const endPoint = `getItemSalesReport`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.put<IReportItemSales[]>(url, IReportingSearchModel )

  }

  getGifCardIssueReport(site: ISite, IReportingSearchModel: IReportingSearchModel): Observable<IReportItemSales[]> {

    IReportingSearchModel.productsOnly = true;

    IReportingSearchModel.removeGiftCards = true;

    const controller = `/ReportItemSales/`

    const endPoint = `getItemSalesReport`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.put<IReportItemSales[]>(url, IReportingSearchModel )

  }

  getCategorySalesReport(site: ISite, IReportingSearchModel: IReportingSearchModel): Observable<IReportItemSales[]> {

    IReportingSearchModel.productsOnly = true;

    const controller = `/ReportItemSales/`

    const endPoint = `getCategorySalesReport`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.put<IReportItemSales[]>(url, IReportingSearchModel )

  }

  getDepartmentSalesReport(site: ISite, IReportingSearchModel: IReportingSearchModel): Observable<IReportItemSales[]> {

    IReportingSearchModel.productsOnly = true;

    const controller = `/ReportItemSales/`

    const endPoint = `getDepartmentSalesReport`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.put<IReportItemSales[]>(url, IReportingSearchModel )

}

  getTypeSalesReport(site: ISite, IReportingSearchModel: IReportingSearchModel): Observable<IReportItemSales[]> {

    IReportingSearchModel.productsOnly = true;

    const controller = `/ReportItemSales/`

    const endPoint = `getTypeSalesReport`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.put<IReportItemSales[]>(url, IReportingSearchModel )

  }
  searchItemReport(site: ISite, IReportingSearchModel: IReportingSearchModel): Observable<IReportItemSales[]> {

    IReportingSearchModel.productsOnly = true;

    const controller = `/ReportItemSales/`

    const endPoint = `searchItemReport`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.put<IReportItemSales[]>(url, IReportingSearchModel )

  }

  //https://localhost:44309/api/ReportItemSales/GroupItemSales
  //https://ccsposdemo.ddns.net:4444/api/ReportItemSales/GroupItemSales
  //{ "startdate": "07/01/2018", "enddate": "12/10/2020", "groupByProduct": "true" }
  groupItemSales(site: ISite, searchModel: IReportingSearchModel): Observable<IReportItemSaleSummary> {

    console.log(searchModel)
    if (!site || !site.url) { return of(null)}

    searchModel.productsOnly = true;

    const controller = `/ReportItemSales/`

    const endPoint = `GroupItemSales`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.put<IReportItemSaleSummary>(url, searchModel)

  }

  downloadFile(data: any, fileName: string) {

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    let header
    if (data[0]) {
      header = Object.keys(data[0]);
      let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));

      if (header) {
        csv.unshift(header.join(','));
      }

      let csvArray = csv.join('\r\n');

      var blob = new Blob([csvArray], {type: 'text/csv' })
      saveAs(blob, `${fileName}.csv`);
    }
  }
    downloadFileOptions(data: any, fileName: string, removeHeader: boolean) {
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      let header
      if (data[0]) {
        header = Object.keys(data[0]);
        let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));

        if (removeHeader) {
          csv.unshift(header.join(','));
        }

        let csvArray = csv.join('\r\n');

        var blob = new Blob([csvArray], {type: 'text/csv' })
        saveAs(blob, `${fileName}.csv`);
      }
    }

    downloadPapa(data: any, fileName: string, options?: UnparseConfig) {

      var csv = this.papa.unparse(data,options);
      var blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
      saveAs(blob, `${fileName}.csv`);

    }


}
