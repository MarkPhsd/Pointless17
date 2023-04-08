import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IOrdersPaged, IUser } from 'src/app/_interfaces';
import { OrdersService } from '..';
import { SitesService } from '../reporting/sites.service';
import { BalanceSheetSearchModel, BalanceSheetService, CashDrop, IBalanceSheet } from './balance-sheet.service';
import { Capacitor } from '@capacitor/core';
import { catchError, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      return this.sheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(
        switchMap( data => {
          if (data && data.errorMessage) {
            this.sitesService.notify(`Balance sheet error. ${data.errorMessage}`, 'Close', 3000, 'red')
            return of({sheet: null, user: user})
          }
          if (data.id == 0 )  {
             return of({sheet: null, user: user})
          }
          return of({sheet: data, user: user})
        }),
        catchError( e => {
          this.sitesService.notify('Balance sheet error. User may not have employee assigned.', 'Close', 3000, 'red')
          return of({sheet: null, user: user, err: e})
        })
      )

      return of('false')
    }
  }

  openBalanceSheet(id) {
    this.router.navigate(['/balance-sheet', {id: id}]);
  }

  getCurrentBalanceSheet(): Observable<IBalanceSheet> {
    const deviceName = this.getDeviceName();
    const site = this.sitesService.getAssignedSite()
    return   this.sheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(
      switchMap(sheet => {
        this.updateBalanceSheet(sheet)
        return  this.sheetService.getSheetCalculations(site, sheet)
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

    if(!sheetID) { return }
    const deviceName = this.getDeviceName()
    const id = parseInt(sheetID)
    const site = this.sitesService.getAssignedSite()
    return this.sheetService.getSheet(site, id).pipe(
      switchMap(sheet => {
        this.updateBalanceSheet(sheet)
        return this.sheetService.getSheetCalculations(site, sheet)
      })
    )
  }

  getDeviceName() {
    let deviceName = localStorage.getItem('devicename');
    if (!deviceName || deviceName.length == 0 || deviceName == undefined || deviceName === '' ){
      deviceName = 'nada'
    }
    return deviceName;
  }

  updateSheet(inputForm: FormGroup, startShiftInt: number): Observable<any> {
    const site = this.sitesService.getAssignedSite();
    if (inputForm.valid) {

      const sheet  = inputForm.value
      if (sheet.shiftStarted  != 1) {
        sheet.shiftStarted = startShiftInt;
      }
      // console.table (sheet)
      return this.sheetService.putSheet(site, sheet).pipe(
        switchMap(
          data => {
            this.updateBalanceSheet(data)

            return of(data)
          }),
          catchError(err => {
            this.notify('Sheet not saved.' + err, 'Failure')
            return of(err)
          }
        )
      )
    }
  }

  closeSheet(sheet: IBalanceSheet): Observable<any> {
    if (sheet) {
      const site = this.sitesService.getAssignedSite();
      return  this.sheetService.closeShift(site, sheet).pipe(
        switchMap( data => {
          this.updateBalanceSheet(data)
          this.router.navigateByUrl('/login')
          return of(data)
          // this.notify('Sheet is closed.', 'Succes')
      }))
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
          this.notify('Sheet not deleted.' + err, 'Failure')
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
