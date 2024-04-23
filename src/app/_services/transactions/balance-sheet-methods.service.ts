import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IOrdersPaged, IUser } from 'src/app/_interfaces';
import { OrdersService } from '..';
import { SitesService } from '../reporting/sites.service';
import { BalanceSheetSearchModel, BalanceSheetService, CashDrop, IBalanceSheet } from './balance-sheet.service';
import { Capacitor } from '@capacitor/core';
import { catchError, switchMap } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PlatformService } from '../system/platform.service';
import { ElectronService } from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class BalanceSheetMethodsService {

  get platForm() {  return Capacitor.getPlatform(); }
  deviceName: string;
  isApp                       = false;

  cashDrop: CashDrop; //for priting cash drops

  private _orderCount         = new BehaviorSubject<number>(null);
  public orderCount$           = this._orderCount.asObservable();

  private _ordersOpen         = new BehaviorSubject<number>(null);
  public ordersOpen$           = this._ordersOpen.asObservable();

  private _balanceSheet       = new BehaviorSubject<IBalanceSheet>(null);
  public balanceSheet$        = this._balanceSheet.asObservable();

  private _balanceSheetSearchModel       = new BehaviorSubject<BalanceSheetSearchModel>(null);
  public balanceSearchModelSheet$        = this._balanceSheetSearchModel.asObservable();

  constructor(
    private posOrderService                : OrdersService,
    private sitesService                   : SitesService,
    private sheetService                   : BalanceSheetService,
    private _fb                            : UntypedFormBuilder,
    private router                         : Router,
    private location                       : Location,
    public  platformService                : PlatformService,
    private electronService                : ElectronService,
    private siteService                     : SitesService,
    private balanceSheetService             : BalanceSheetService,

  ) {
    if ( this.platForm  === "Electron" || this.platForm === "android" || this.platForm === "capacitor")
    { this.isApp = true }
    this.deviceName = localStorage.getItem('devicename')
  }

  updateOrderCount(value: number) {
    this._orderCount.next(value)
  }

  updateOpenOrders(value: number)  {
    this._ordersOpen.next(value)
  }

  getOrderCount(sheet: IBalanceSheet): Observable<IOrdersPaged> {
    if (sheet) {
      const site = this.sitesService.getAssignedSite();
      return this.posOrderService.getOrderCountCompletedInBalanceSheet(site, sheet);
    }
  }

  getOrdersOpen(id: number): Observable<IOrdersPaged>   {
    if (id) {
      const site = this.sitesService.getAssignedSite();
      return this.posOrderService.getPendingInBalanceSheet(site, id)
    }
  }

  updateBalanceSheet(data:  IBalanceSheet) {
    if (!data) {
      // console.trace('No Balannce Sheet Data!')
    }
    this._balanceSheet.next(data);
  }

  updateBalanceSearchModel(searchModel:  BalanceSheetSearchModel) {
    this._balanceSheetSearchModel.next(searchModel);
  }

  promptBalanceSheet(user: IUser): Observable<any> {
    if (this.platformService.isAppElectron || this.platformService.androidApp) {
      const site     = this.sitesService.getAssignedSite()
      const deviceName = this.getDeviceName();
      localStorage.setItem('user', JSON.stringify(user))

      return this.sheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(
        switchMap( data => {
          if (data && data.errorMessage) {
            this.sitesService.notify(`Balance sheet error. ${data.errorMessage}`, 'Close', 3000, 'red')
            return of({sheet: null, user: user, err: null})
          }
          if (data.id == 0 )  {
             return of({sheet: null, user: user, err: null})
          }
          const item = {sheet: data, user: user, err: null};
          return of(item)
        }),
        catchError( e => {
          this.sitesService.notify('Balance sheet error. User may not have employee assigned.' + e.toString(), 'Close', 3000, 'red')
          return of({sheet: null, user: user, err: e})
        })
      )
    }
    return of({sheet: null, user: user, err: null})
  }

  openBalanceSheet(id) {
    this.router.navigate(['/balance-sheet', {id: id}]);
  }

  getCurrentBalanceSheet(): Observable<IBalanceSheet> {
    const deviceName = this.getDeviceName();
    const site = this.sitesService.getAssignedSite()
    return   this.sheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(
      switchMap(sheet => {
        return  this.getSheetCalc(site, sheet)
    })).pipe(switchMap(data => {
      this.updateBalanceSheet(data)
      return of(data)
    }))
  }

  getSheetCalc(site, sheet: IBalanceSheet): Observable<IBalanceSheet> {
    return this.sheetService.getSheetCalculations(site, sheet).pipe(switchMap(data => {
      return of (data)
    }),catchError(data => {
      console.log('error ', JSON.stringify(data))
      this.siteService.notify('Sheet calc error', 'close', 5000, 'red')
      return of (sheet)
    }))
  }

  async getSheet(sheetID: string) {

    if(!sheetID) { return }
    const deviceName = this.getDeviceName()
    const id = parseInt(sheetID)
    const site = this.sitesService.getAssignedSite()
    this.sheetService.getSheet(site, id).pipe(
      switchMap(sheet => {
        this.updateBalanceSheet(sheet)
        return this.sheetService.getSheetCalculations(site, sheet)
      })).subscribe(
      sheet => {
        this.updateBalanceSheet(sheet)
      }
    )
  }

  getSheetObservable(sheetID: string) {

    if(!sheetID) { return of(null) }
    const deviceName = this.getDeviceName()
    const id = parseInt(sheetID)
    const site = this.sitesService.getAssignedSite()
    return this.sheetService.getSheet(site, id).pipe(
      switchMap(sheet => {
        return  this.sheetService.getSheetCalculations(site, sheet)
    })).pipe(switchMap(data => {
      this.updateBalanceSheet(data)
      return of(data)
    }))
  }

  getDeviceName() {
    let deviceName = localStorage.getItem('devicename');
    if (!deviceName || deviceName.length == 0 || deviceName == undefined || deviceName === '' ){
      deviceName = 'nada'
    }
    return deviceName;
  }

  updateSheet(sheet: IBalanceSheet, startShiftInt: number): Observable<IBalanceSheet> {
    const site = this.sitesService.getAssignedSite();
    if (sheet.shiftStarted  != 1) {
      sheet.shiftStarted = startShiftInt;
    }

    return this.sheetService.putSheet(site, sheet).pipe(
      switchMap(
        data => {
          this.updateBalanceSheet(data)
          return of(data)
        }),
        catchError(err => {
          this.siteService.notify('Sheet not saved.' + err, 'Failure', 5000, 'red')
          return of({} as IBalanceSheet)
        }
      )
    )
  }


  closeSheet(sheet: IBalanceSheet, navigateUrl: string): Observable<any> {
    if (sheet) {
      const site = this.sitesService.getAssignedSite();
      return  this.sheetService.closeShift(site, sheet).pipe(
        switchMap( data => {
          // console.log('close sheet', data?.balanceSheetEmployee?.lastName)
          this.updateBalanceSheet(data)
          if (navigateUrl) {
            this.router.navigateByUrl(navigateUrl)
          }
          return of(data)
      }))
    }
  }

  deleteItem(isAuthorized: boolean, sheet: IBalanceSheet) {
    if (isAuthorized) {
      const result = window.confirm('Are you sure you need to remove this?')
      if (result && sheet.id) {
        const site = this.sitesService.getAssignedSite();
        this.sheetService.deleteSheet(site, sheet.id).subscribe( data => {
          this.siteService.notify('Sheet is deleted.', 'Succes', 1000, 'yellow', )
          this.location.back()
        }, (err) => {
           this.siteService.notify('Sheet not deleted.' + err, 'Failure', 1000, 'red', )
        })
      }
    }
  }


  initForm(fb: UntypedFormGroup) : UntypedFormGroup {

    fb = this._fb.group({
      id:                  [''],
      type:                [''],
      dateTime:            [''],
      noSales:             [''],
      startTime:           [''],
      restaurantSectionID: [''],
      deviceName:          [''],
      employeeID:          [''],
      salesTotal:          [''],
      overUnderTotal:      [''],
      registerPosVoids:    [''],
      registerNegVoids:    [''],
      startedWith:         [''],
      endedWith:           [''],
      endTime:             [''],
      cashIn:              [''],
      creditIn:            [''],
      cashDropCheck:       [''],
      reportRunMasterID:   [''],
      onesEnd:             [, Validators.min(0)],
      fivesEnd:            [, Validators.min(0)],
      tensEnd:             ['', Validators.min(0)],
      twentiesEnd:         ['', Validators.min(0)],
      fiftiesEnd:          ['', Validators.min(0)],
      hundredsEnd:         ['', Validators.min(0)],
      pennyEnd:            ['', Validators.min(0)],
      nickelEnd:           ['', Validators.min(0)],
      dimeEnd:             ['', Validators.min(0)],
      quarterEnd:          ['', Validators.min(0)],
      halfDollarEnd:       ['', Validators.min(0)],
      dollarEnd:           ['', Validators.min(0)],
      drawerAB:            [''],
      cashTips:            [''],
      giftCertificates:    [''],
      giftCard:            [''],
      checks:              [''],
      trvlrCheck:          [''],
      creditTips:          [''],
      paidOuts:            [''],
      mileage:             [''],
      storeID:             [''],
      cashDeposit:         [''],
      checkDeposit:        [''],
      otherDeposit:        [''],
      depositer:           [''],
      c1s:                 ['', Validators.min(0)],
      c5s:                 ['', Validators.min(0)],
      c10s:                ['', Validators.min(0)],
      c20s:                ['', Validators.min(0)],
      c50s:                ['', Validators.min(0)],
      c100s:               ['', Validators.min(0)],
      cashDropAmount:      ['', Validators.min(0)],
      reportName:          [''],
      dollarsStart:        ['', Validators.min(0)],
      fivesStart:          ['', Validators.min(0)],
      tensStart:           ['', Validators.min(0)],
      twentiesStart:       ['', Validators.min(0)],
      fiftiesStart:        ['', Validators.min(0)],
      hundredsStart:       ['', Validators.min(0)],
      pennyStart:          ['', Validators.min(0)],
      dimeStart:           ['', Validators.min(0)],
      nickelStart:         ['', Validators.min(0)],
      quarterStart:        ['', Validators.min(0)],
      halfDollarStart:     ['', Validators.min(0)],
      dollarStart:         ['', Validators.min(0)],
      shiftStarted:        [''],
      twoDollars:          ['', Validators.min(0)],
      twoDollarsStart:     ['', Validators.min(0)],
      fiveHundreds:        [''],
      twoHundreds:         ['', Validators.min(0)],
      fiveHundredsStart:   ['', Validators.min(0)],
      twoHundredsStart:    ['', Validators.min(0)],
      tooniesEnd:          ['', Validators.min(0)],
      tooniesStart:        ['', Validators.min(0)],
      dollarsEnd:          ['', Validators.min(0)],

    })

    return fb
  }

  // notify(message: string, action: string) {
  //   this._snackBar.open(message, action, {
  //     duration: 2000,
  //     verticalPosition: 'top'
  //   });
  // }

  openDrawerFromBalanceSheet(): Observable<IBalanceSheet> {

    let deviceName = localStorage.getItem('devicename');
    const electron = this.platformService.isAppElectron
    const android = this.platformService.isApp()

    // console.log('openDrawerFromBalanceSheet', android, electron)
    //if we are doing online sales, no balance sheet is used.
    if (!android && !electron) {
      return of(null)
    }

    //then if is app
    if (!deviceName) {
      this.siteService.notify('No device is assigned. Notify manager.', 'close', 2000, 'yellow')
      // console.log('returning no balance sheet observable, opening drawer');
      this.openDrawerOne()
      return of(null)
    }

    const site = this.siteService.getAssignedSite()
    const item$ =  this.balanceSheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(switchMap(data => {
          if (!data) {
            this.siteService.notify('Balance sheet was not defined', 'close', 2000, 'yellow')
            return of(data)
          }
          if (data.drawerAB == 2) {
            this.openDrawerTwo()
          }
          if (data.drawerAB == 1 || data.drawerAB == 0 || !data.drawerAB) {
            this.openDrawerOne()
          }
          return of(data)
        }
      ), catchError(data => {
        this.siteService.notify('Balance sheet was not defined', 'close', 2000, 'yellow')
        return of(null)
      }))
    return item$;
  }

  async  openDrawerOne() {
    // console.log('open cash drawer one')
    const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
    const response        = await emvTransactions.openCashDrawerOne();
  }

  async  openDrawerTwo() {
    // console.log('open cash drawer one')
    const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
    const response        = await emvTransactions.openCashDraweTwo();
  }

  async openDrawerNoSale(sheet:IBalanceSheet) {
    await this.openDrawerOne()
  }

}
