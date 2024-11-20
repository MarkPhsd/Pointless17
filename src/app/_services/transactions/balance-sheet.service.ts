import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable, of, switchMap, } from 'rxjs';

import { ISite } from 'src/app/_interfaces';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
// import { ElectronService } from 'ngx-electron';
import { SitesService } from '../reporting/sites.service';
import { PlatformService } from '../system/platform.service';
import { ItemBasic } from 'src/app/modules/admin/report-designer/interfaces/reports';
import { AuthenticationService } from '../system/authentication.service';


export interface  IBalanceEmployeeSummary {
  employeeName : string;
  totalSale : number;
  count : number;
  message: string;
}
export interface IBalanceSheetPagedResults {
  results:      BalanceSheetOptimized[];
  paging:       Paging;
  summary:      BalanceSheetOptimized;
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
  netSales: number;
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
  dollarEnd            : number;
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
  batchJSON           : string;
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
  balanceSheetEmployee : BalanceSheetEmployee;
  cashDrops            : CashDrop[];
  message              : string;
  errorMessage         : string;
  netSales: number;
}

export interface CashDrop {
  id          : number;
  amount      : number;
  reportRunID : number;
  dropTime: string;
  clientID: number;
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

  // get name() {
  //   return  `${this.firstName} ${this.lastName}`
  // }
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
  reportRunID :     number;
  zRunID: number;
}

@Injectable({
  providedIn: 'root'
})

export class BalanceSheetService {

  constructor(
    private authenticationService: AuthenticationService,
    private platFormService: PlatformService,
    private siteService: SitesService,
    private http: HttpClient,
    private _fb: UntypedFormBuilder,
  )
  {
  }

  validateDaysSales(site: any) :  Observable<any>  {
    const controller = "/BalanceSheets/"

    const endPoint  = "validateDaysSales"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
  }

  getLastBalanceEndingValue(site: ISite, id: number): Observable<IBalanceSheet> {
    const controller = "/BalanceSheets/"

    const endPoint  = "GetLastBalanceEndingValue"

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
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

  isDeviceInUse(site: ISite, device: string): Observable<any> {
    const controller = '/BalanceSheets/'

    const endPoint  = "isDeviceInUse"

    const parameters = `?deviceName=${device}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url);
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

  getOpenBalanceSheets(site: ISite)   : Observable<ItemBasic[]> {
    const controller = '/BalanceSheets/'

    const endPoint  = "getOpenBalanceSheets"

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<ItemBasic[]>(url);
  }



  postDrop(site: ISite, id: number, amount: number)  : Observable<IBalanceSheet> {
    const controller = '/BalanceSheets/'

    const endPoint  = "PostDrop"

    const parameters = `?amount=${amount}&balanceSheetID=${id}`

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

    const user = this.authenticationService._user.value;

    let userTrue : boolean;
    userTrue = false
    if (user) {
      userTrue = true
    }

    // console.log('getCurrentUserBalanceSheet service', userTrue, deviceName)
    if (!userTrue) {
      let item = {} as IBalanceSheet;
      item.id = 0;
      return of(item)
    }

    if (!deviceName) {
      let item = {} as IBalanceSheet
      item.id = 0;
      return of(item)
    }


    user.authdata = ''
    this.authenticationService.updateUser(user)

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

    // console.log('balance sheet', balanceSheet)

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

