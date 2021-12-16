import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IOrdersPaged, IUser } from 'src/app/_interfaces';
import { OrdersService } from '..';
import { SitesService } from '../reporting/sites.service';
import { BalanceSheetSearchModel, BalanceSheetService, IBalanceSheet } from './balance-sheet.service';
import { Capacitor } from '@capacitor/core';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PlatformService } from '../system/platform.service';


@Injectable({
  providedIn: 'root'
})
export class BalanceSheetMethodsService {

  get platForm() {  return Capacitor.getPlatform(); }
  deviceName: string;
  isApp                       = false;

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
    private _fb                            : FormBuilder,
    private _snackBar                      : MatSnackBar,
    private router                         : Router,
    private location                       : Location,
    public platformService                 : PlatformService,

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

  updateBalanceSheet(BalanceSheet:  IBalanceSheet) {
    this._balanceSheet.next(BalanceSheet);
  }

  updateBalanceSearchModel(searchModel:  BalanceSheetSearchModel) {
    this._balanceSheetSearchModel.next(searchModel);
  }

  promptBalanceSheet(user: IUser): Observable<any> {
    if (this.platformService.isAppElectron || this.platformService.androidApp) {
      const site     = this.sitesService.getAssignedSite()
      const deviceName = this.getDeviceName();
      this.getCurrentBalanceSheet()
      return this.sheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(
        switchMap( data => {
          return of({sheet: data, user: user})
        })
      )
    }
    return of('false')
  }

  openBalanceSheet(id) {
    this.router.navigate(['/balance-sheet', {id: id}]);
  }

  getCurrentBalanceSheet() {

    const deviceName = this.getDeviceName();
    const site = this.sitesService.getAssignedSite()
    this.sheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(
      switchMap(sheet => {
        this.updateBalanceSheet(sheet)
        return  this.sheetService.getSheetCalculations(site, sheet)
    })).subscribe( sheet => {
      this.updateBalanceSheet(sheet)
    })

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

  getDeviceName() {
    let deviceName = localStorage.getItem('devicename');
    if (!deviceName || deviceName.length == 0 || deviceName == undefined || deviceName === '' ){
      deviceName = 'nada'
    }
    return deviceName;
  }

  updateSheet(inputForm: FormGroup, startShiftInt: number) {
    const site = this.sitesService.getAssignedSite();
    if (inputForm.valid) {
      const sheet  = inputForm.value
      if (sheet.shiftStarted  != 1) {
        sheet.shiftStarted = startShiftInt;
      }
      this.sheetService.putSheet(site, sheet).subscribe(data => {
        this.updateBalanceSheet(data)
        this.notify('Sheet saved.', 'Succes')
      }, (err) => {
        this.notify('Sheet note deleted.' + err, 'Failure')
      })
    }
  }

  closeSheet(sheet: IBalanceSheet) {
      if (sheet) {
      const site = this.sitesService.getAssignedSite();
      this.sheetService.closeShift(site, sheet).subscribe(data=> {
        this.updateBalanceSheet(data)
        this.router.navigateByUrl('/app-main-menu')
        this.notify('Sheet is closed.', 'Succes')
      })
    }
  }

  deleteItem(isAuthorized: boolean, sheet: IBalanceSheet) {
    if (isAuthorized) {
      const result = window.confirm('Are you sure you need to remove this?')
      if (result && sheet.id) {
        const site = this.sitesService.getAssignedSite();
        this.sheetService.deleteSheet(site, sheet.id).subscribe( data => {
          this.notify('Sheet is deleted.', 'Succes')
          this.location.back()
        }, (err) => {
          this.notify('Sheet note deleted.' + err, 'Failure')
        })
      }
    }
  }


  initForm(fb: FormGroup) : FormGroup {

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
      onesEnd:             [''],
      fivesEnd:            [''],
      tensEnd:             [''],
      twentiesEnd:         [''],
      fiftiesEnd:          [''],
      hundredsEnd:         [''],
      pennyEnd:            [''],
      nickelEnd:           [''],
      dimeEnd:             [''],
      quarterEnd:          [''],
      halfDollarEnd:       [''],
      dollarEnd:           [''],
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
      c1s:                 [''],
      c5s:                 [''],
      c10s:                [''],
      c20s:                [''],
      c50s:                [''],
      c100s:               [''],
      cashDropAmount:      [''],
      reportName:          [''],
      dollarsStart:        [''],
      fivesStart:          [''],
      tensStart:           [''],
      twentiesStart:       [''],
      fiftiesStart:        [''],
      hundredsStart:       [''],
      pennyStart:          [''],
      dimeStart:           [''],
      nickelStart:         [''],
      quarterStart:        [''],
      halfDollarStart:     [''],
      dollarStart:         [''],
      shiftStarted:        [''],
      twoDollars:          [''],
      twoDollarsStart:     [''],
      fiveHundreds:        [''],
      twoHundreds:         [''],
      fiveHundredsStart:   [''],
      twoHundredsStart:    [''],
      tooniesEnd:          [''],
      tooniesStart:        [''],
    })

    return fb
  }

  notify(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
