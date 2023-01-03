import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable, of, switchMap, } from 'rxjs';

import { ISite } from 'src/app/_interfaces';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ElectronService } from 'ngx-electron';
import { SitesService } from '../reporting/sites.service';
import { PlatformService } from '../system/platform.service';


export interface  IBalanceEmployeeSummary {
  employeeName : string;
  totalSale : number;
  count : number;
  message: string;
}
export interface IBalanceSheetPagedResults {
  results:      BalanceSheetOptimized[];
  paging:       Paging;
  summary:      Summary;
  errorMessage: string;
}

export interface Paging {
  hasNextPage:      boolean;
  hasPreviousPage:  boolean;
  lastItemOnPage:   number;
  pageSize:         number;
  currentPage:      number;
  pageCount:        number;
  recordCount:      number;
  isLastPage:       boolean;
  isFirstPage:      boolean;
  totalRecordCount: number;
}

export interface BalanceSheetOptimized {
  id:                number;
  type:              number;
  dateTime:          string;
  noSales:           number;
  startTime:         string;
  deviceName:        string;
  employeeID:        number;
  salesTotal:        number;
  overUnderTotal:    number;
  registerPosVoids:  number;
  registerNegVoids:  number;
  startedWith:       number;
  endedWith:         number;
  endTime:           string;
  cashIn:            number;
  creditIn:          number;
  cashDropCheck:     number;
  reportRunMasterID: number;
  creditTips:        number;
  paidOuts:          number;
  mileage:           number;
  storeID:           string;
  cashDeposit:       number;
  checkDeposit:      number;
  otherDeposit:      number;
  depositer:         string;
  cashDropAmount:    number;
  reportName:        string;
  balanceSheetEmployee  : BalanceSheetEmployee;
}

export interface IBalanceSheet {
  id:                   number;
  type:                 number;
  dateTime:             string;
  noSales:              number;
  startTime:            string;
  deviceName:           string;
  employeeID:           number;
  salesTotal:           number;
  overUnderTotal:       number;
  registerPosVoids:     number;
  registerNegVoids:     number;
  startedWith:          number;
  endedWith:            number;
  endTime:              string;
  cashIn:               number;
  creditIn:             number;
  cashDropCheck:        number;
  reportRunMasterID:    number;
  onesEnd:              number;
  fivesEnd:             number;
  tensEnd:              number;
  twentiesEnd:          number;
  fiftiesEnd:           number;
  hundredsEnd:          number;
  pennyEnd:             number;
  nickelEnd:            number;
  dimeEnd:              number;
  quarterEnd:           number;
  halfDollarEnd:        number;
  dollarsEnd:           number;
  drawerAB:             number;
  cashTips:             number;
  giftCertificates:     number;
  giftCard:             number;
  checks:               number;
  trvlrCheck:           number;
  creditTips:           number;
  paidOuts:             number;
  mileage:              number;
  storeID:              string;
  cashDeposit:          number;
  checkDeposit:         number;
  otherDeposit:         number;
  depositer:            string;
  c1s:                  number;
  c5s:                  number;
  c10s:                 number;
  c20s:                 string;
  c50s:                 string;
  c100s:                string;
  cashDropAmount:       number;
  reportName:           string;
  dollarsStart:         number;
  fivesStart:           number;
  tensStart:            number;
  twentiesStart:        number;
  fiftiesStart:         number;
  hundredsStart:        number;
  pennyStart:           number;
  dimeStart:            number;
  nickelStart:          number;
  quarterStart:         number;
  halfDollarStart:      number;
  dollarStart:          number;
  shiftStarted:         number;
  twoDollars:           number;
  twoDollarsStart:      number;
  fiveHundreds:         number;
  twoHundreds:          number;
  fiveHundredsStart:    number;
  twoHundredsStart:     number;
  tooniesEnd:           number;
  tooniesStart:         number;
  cashDropTotal:        number;
  balanceSheetEmployee: BalanceSheetEmployee;
  cashDrops            : CashDrop;
  message              : string;
}

export interface CashDrop {
  id          : number;
  amount      : number;
  reportRunID : number;
}

export interface BalanceSheetEmployee {
  id:              number;
  firstName:       string;
  lastName:        string;
  phone:           string;
  cell:            string;
  email:           string;
  position:        number;
  dob:             string;
  payRate:         number;
  active:          boolean;
  hireDate:        string;
  activePosition:  number;
  onClock:         number;
  terminationDate: string;
  securityLevel:   number;
  siteID:          number;
  clientID:        number;
}



export interface Summary {
}

// Generated by https://quickt

export interface BalanceSheetSearchModel {
  completionDate_From: string;
  completionDate_To:   string;
  deviceName:          string;
  balanceSheetStatus:  number;
  employeeID:          number;
  suspendedOrder:      number;
  pageSize:            number;
  pageNumber:          number;
  pageCount:           number;
  currentPage:         number;
  lastPage:            number;
  greaterThanZero:     number;
  id:                  number;
  type          :     number;
}

@Injectable({
  providedIn: 'root'
})

export class BalanceSheetService {

  constructor(
    private electronService: ElectronService,
    private platFormService: PlatformService,
    private siteService: SitesService,
    private http: HttpClient,
    private _fb: FormBuilder,
  )
  {
  }

  openDrawerFromBalanceSheet(): Observable<IBalanceSheet> {
    let deviceName = localStorage.getItem('devicename');
    if (!deviceName) {
       deviceName = localStorage.getItem('deviceName');
    }
    const site = this.siteService.getAssignedSite()
    const item$ =  this.getCurrentUserBalanceSheet(site, deviceName).pipe(switchMap(data => {
      if (data.drawerAB == 2) {
        if (this.platFormService.isAppElectron){
          this.openDrawerTwo()
        }
        return of(data)
      }
      if (data.drawerAB == 1 || data.drawerAB == 0) {
        if (this.platFormService.isAppElectron){
          this.openDrawerOne()
        }
        return of(data)
      }
      if (!data) {
        if (this.platFormService.isAppElectron){
          this.openDrawerOne()
        }
        return of(data)
      }
    }))
    return item$
  }

  async  openDrawerOne() {
    const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
    const response        = await emvTransactions.openCashDrawerOne()
  }
  async  openDrawerTwo() {
    const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
    const response        = await emvTransactions.openCashDraweTwo()
  }

  getSheetType(sheet: IBalanceSheet) {

    if (sheet && sheet.type) {
      if (sheet.type == 3) {
        return "Server"
      }
      if (sheet.type == 4) {
        return "Cashier"
      }
      if (sheet.type != 4 && sheet.type != 3) {
        return "other"
      }
    }
    return 'other';
  }

  searchBalanceSheets(site: ISite,
                      searchModel: BalanceSheetSearchModel):  Observable<IBalanceSheetPagedResults>  {

    const controller = '/BalanceSheets/'

    const endPoint  = "SearchBalanceSheets"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IBalanceSheetPagedResults>(url, searchModel);

  }

  closeAllSheets(site: ISite)  : Observable<IBalanceSheet[]> {

    const controller = '/BalanceSheets/'

    const endPoint  = "closeAllSheets"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IBalanceSheet[]>(url);
  }

  getSheet(site: ISite, id: number)  : Observable<IBalanceSheet> {
    const controller = '/BalanceSheets/'

    const endPoint  = "getSheet"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IBalanceSheet>(url);
  }

  getUsersOfBalanceSheet(site: ISite, id: number)  : Observable<IBalanceEmployeeSummary> {
    const controller = '/BalanceSheets/'

    const endPoint  = "getUsersOfBalanceSheet"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IBalanceEmployeeSummary>(url);
  }

  getCurrentUserBalanceSheet(site: ISite, deviceName: string)  : Observable<IBalanceSheet> {

    if (deviceName === '' || !deviceName ) { deviceName = 'nothing'}

    const controller = '/BalanceSheets/'

    const endPoint  = "GetCurrentBalanceSheet"

    const parameters = `?deviceName=${deviceName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IBalanceSheet>(url);
  }

  getZRUNBalanceSheet(site: ISite)  : Observable<IBalanceSheet> {

    const controller = '/BalanceSheets/'

    const endPoint  = "getZRUNBalanceSheet"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<IBalanceSheet>(url);
  }


  getSheetCalculations(site: ISite, balanceSheet: IBalanceSheet)  : Observable<IBalanceSheet> {
    const controller = '/BalanceSheets/'

    const endPoint  = 'GetSheetCalculations'

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IBalanceSheet>(url, balanceSheet);
  }


  postSheet(site: ISite, balanceSheet: IBalanceSheet)  : Observable<IBalanceSheet> {

    const controller = '/BalanceSheets/'

    const endPoint  = "postSheet"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IBalanceSheet>(url, balanceSheet);

  }

  putSheet(site: ISite, balanceSheet: IBalanceSheet)  : Observable<IBalanceSheet> {

    const controller = '/BalanceSheets/'

    const endPoint  = "putSheet"

    const parameters = `?id=${balanceSheet.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<IBalanceSheet>(url, balanceSheet);

  }

  deleteSheet(site: ISite, id: number)  : Observable<any> {
    const controller = '/BalanceSheets/'

    const endPoint  = "deleteSheet"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url);
  }

  closeShift(site: ISite,  balanceSheet: IBalanceSheet)  : Observable<IBalanceSheet> {
    const controller = '/BalanceSheets/'

    const endPoint  = "closeSheet"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IBalanceSheet>(url, balanceSheet);
  }



}

