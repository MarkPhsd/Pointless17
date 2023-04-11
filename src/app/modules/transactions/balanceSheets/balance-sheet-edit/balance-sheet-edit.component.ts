import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IItemBasic } from 'src/app/_services/menu/menu.service';
import { Observable, of, Subscription, switchMap, switchMapTo } from 'rxjs';
import { Capacitor, } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BalanceSheetSearchModel, BalanceSheetService, CashDrop, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { Location } from '@angular/common';
import { AuthenticationService } from 'src/app/_services';
import { IUser } from 'src/app/_interfaces';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { PrintingService } from 'src/app/_services/system/printing.service';

@Component({
  selector: 'app-balance-sheet-edit',
  templateUrl: './balance-sheet-edit.component.html',
  styleUrls: ['./balance-sheet-edit.component.scss']
})
export class BalanceSheetEditComponent implements OnInit, OnDestroy  {
  selectedIndex: number;

  get halfDollarEnd()     { return this.inputForm.get('halfDollarEnd') as FormControl; }
  get quarterEnd()        { return this.inputForm.get('quarterEnd') as FormControl; }
  get dimeEnd()           { return this.inputForm.get('dimeEnd') as FormControl; }
  get nickelEnd()         { return this.inputForm.get('nickelEnd') as FormControl; }
  get pennyEnd()          { return this.inputForm.get('pennyEnd') as FormControl; }
  get hundredsEnd()       { return this.inputForm.get('hundredsEnd') as FormControl; }
  get fiftiesEnd()        { return this.inputForm.get('fiftiesEnd') as FormControl; }
  get twentiesEnd()       { return this.inputForm.get('twentiesEnd') as FormControl; }
  get tensEnd()           { return this.inputForm.get('tensEnd') as FormControl; }
  get fivesEnd()          { return this.inputForm.get('fivesEnd') as FormControl; }
  get onesEnd()           { return this.inputForm.get('onesEnd') as FormControl; }

  get halfDollarStart()   { return this.inputForm.get('halfDollarStart') as FormControl; }
  get quarterStart()      { return this.inputForm.get('quarterStart') as FormControl; }
  get dimeStart()         { return this.inputForm.get('dimeStart') as FormControl; }
  get nickelStart()       { return this.inputForm.get('nickelStart') as FormControl; }
  get pennyStart()        { return this.inputForm.get('pennyStart') as FormControl; }
  get hundredsStart()     { return this.inputForm.get('hundredsStart') as FormControl; }
  get fiftiesStart()      { return this.inputForm.get('fiftiesStart') as FormControl; }
  get twentiesStart()     { return this.inputForm.get('twentiesStart') as FormControl; }
  get tensStart()         { return this.inputForm.get('tensStart') as FormControl; }
  get dollarsStart()      { return this.inputForm.get('dollarsStart') as FormControl; }
  get fivesStart()        { return this.inputForm.get('fivesStart') as FormControl; }

  get platForm()          { return Capacitor.getPlatform(); }


  balanceSheet$:   Observable<any>;
  searchForm      : FormGroup;
  depositAmountForm: FormGroup;
  dropAmountForm   : FormGroup;
  inputForm       : FormGroup;
  urlPath         : string;

  id              : string;
  sheet           : IBalanceSheet;
  _sheet          : Subscription;

  user            : IUser;
  _user           : Subscription;

  action$         : Observable<any>;
  employees$      : Observable<IItemBasic[]>;
  paymentMethod$  : Observable<IBalanceSheet[]>;

  _searchModel    : Subscription;
  searchModel     : BalanceSheetSearchModel;
  isAuthorized    : boolean;
  isStaff         : boolean;
  _showStart      : boolean;
  sheetType       : string;

  startingCashForm = 0;
  endingCashForm   = 0;
  startingCashSaved= 0;
  endingCashSaved  = 0;
  loading          = true;
  startShiftInt    : number;
  balance          = 0;
  newBalance       = 0;

  endOptionsDisabled   = false;
  startOptionsDisabled = false;
  ordersCount      = 0;
  ordersOpen       = 0;
  cashDropActive: number;
  _openOrders: Subscription;
  _ordersCount : Subscription;
  deposit$: Observable<any>;

  initSubscriptions() {
    this.loading = true
    this._sheet = this.sheetMethodsService.balanceSheet$.subscribe( data => {
      this.sheet = data;
      if (data) {
        this.getSheetType(data)
      }
      this.loading = false;
      if (this.inputForm) {
        this.inputForm.patchValue(this.sheet)
      }
    })
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user = data;
    })
    this._ordersCount = this.sheetMethodsService.ordersOpen$.subscribe( data => {
      if (!data) { return }
      this.ordersCount = data
    })
    this._openOrders  =  this.sheetMethodsService.ordersOpen$.subscribe( data => {
      if (!data) { return }
      this.ordersOpen       = data
    })
  }

  constructor(  private _snackBar               : MatSnackBar,
                private sheetService            : BalanceSheetService,
                private userAuthorization       : UserAuthorizationService,
                private location                : Location,
                private route                   : ActivatedRoute,
                private authenticationService   : AuthenticationService,
                private router                  : Router,
                private fb                      : FormBuilder,
                private toolbarUIService        : ToolBarUIService,
                private sheetMethodsService     : BalanceSheetMethodsService,
                private sendGridService         :  SendGridService,
                private printingService         : PrintingService,
                private siteService: SitesService,
              )
  {
    this.cashDropActive  = +this.route.snapshot.paramMap.get('cashdrop');
    if (this.cashDropActive) {
      this.selectedIndex = 1;
    }
    this.inputForm       = this.sheetMethodsService.initForm(this.inputForm);
  }

  ngOnInit() {
    this.hideToolbars();
    this.initSubscriptions()
    this.isAuthorized  = this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff       = this.userAuthorization.isUserAuthorized('admin, manager, employee')
    this.id            = this.route.snapshot.paramMap.get('id');

    if(!this.id) {
      this.newBalanceSheet();
    }
    if (this.id) {
      this.getSheet(this.id)
    }
  };

  initDepositForms() {
    this.depositAmountForm = this.fb.group({
      value: []
    })
    this.dropAmountForm = this.fb.group({
      value: []
    })
  }

  ngOnDestroy() {
    this.sheetMethodsService.updateBalanceSheet(null)
    if (this._openOrders)  { this._openOrders.unsubscribe()}
    if (this._ordersCount) { this._ordersCount.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
    if (this._user)        { this._user.unsubscribe()}
    if (this._sheet)       { this._sheet.unsubscribe()}
  }

  newBalanceSheet() {
    //we have to initialize the balance sheet.
    //we should just be sending maybe the device, and the user.
    this.balanceSheet$ = this.sheetMethodsService.getCurrentBalanceSheet().pipe(
      switchMap(data => {
        this.sheet = data;
        this.getSheetType(data)
        return of(data)
    }))
  }

  getSheet(id: string) {
    this.balanceSheet$ = this.sheetMethodsService.getSheetObservable(id).pipe(switchMap(data => {
      this.getSheetType(data);
      this.sheet = data;
      return of(data)
    }))
  }

  selectChange() {

  }

  applyDropAmount(amount) {
    this.applyDropPOST(amount)
  }

  applyDeposit(amount) {
    this.applyDropPOST(-amount)
  }

  applyDropPOST(amount) {
    this.initDepositForms();
    const site = this.siteService.getAssignedSite()
    const deposit$ = this.sheetService.postDrop(site, this.sheet.id, amount);

    this.deposit$ = deposit$.pipe(switchMap(data => {
      this.sheet = data;
      if ( data.cashDrops) {
        data.cashDrops = data.cashDrops.sort((a, b) => (a.id > b.id ? 1 : -1));
        this.sheetMethodsService.cashDrop = data.cashDrops[data.cashDrops.length-1];
        const drop = this.sheetMethodsService.cashDrop;
        this.printDropValues(drop )
      }
      return this._updateItem()
    })).pipe(switchMap(data => {
      return of(data)
    }))

  }

  getSheetType(sheet: IBalanceSheet) {
    this.sheetType = this.sheetService.getSheetType(sheet)
  }

  getCurrentSheet() {
    this.getSheet(this.id)
  }

  hideToolbars() {
    this.toolbarUIService.hidetoolBars()
  }

  toggleSearchMenu() {
    this.toolbarUIService.switchSearchBarSideBar()
  }

  initForm(sheet: IBalanceSheet) {
    try {
      const form = this.inputForm // this.sheetService.initForm(this.inputForm);
      if (!form)
        { console.log('form not initiated')
        return
      }
      if (!sheet)
       { console.log('form not initiated')
        return
      }

      if (this.sheet) {  this.inputForm.patchValue(this.sheet) }
      this.setEnabledFeatures()

      this.inputForm.valueChanges.subscribe(data => {
        this.getCurrentBalance();
      })
    } catch (error) {
    }
  }

  updateItem(event) {
    this.balanceSheet$ = this._updateItem().pipe(switchMap(data => {
      this.router.navigate(['app-main-menu'])
      return of(data)
    }))
  }

  _updateItem() {
    return this.sheetMethodsService.updateSheet(this.inputForm, this.startShiftInt).pipe(switchMap(data => {
      this.sheet = data;
      return of(data)
    }))
  }

  startShift() {
    this.startShiftInt = 1;
    this.updateItem(null)
  }

  closeSheet() {
    this.printingService.updatePrintView(2);
    this.action$ = this.sendGridService.sendBalanceSheet(this.sheet.id).pipe(
      switchMap( data => {
        if (!data) { return of(null) }
        return  this.sheetMethodsService.closeSheet(this.sheet)
    })).pipe(switchMap( data => {
      return of (data)
    }))
  }

  setEnabledFeatures() {
    let allowUpdate = false;
    allowUpdate = this.isAuthorized
    if (allowUpdate) {
      this.setStartEnabled()
      this.setCloseEnabled()
      return
    }
    if (!allowUpdate) { allowUpdate = this.isStaff }
    if (this.sheet) {
      if (this.isStaff ) {
        if (this.sheet.shiftStarted != 1 ) {
          this.setStartEnabled()
          this.setCloseDisabled()
          return
        }
        if (this.sheet.shiftStarted == 1 && !this.sheet.endTime ) {
          this.setStartDisabled()
          this.setCloseEnabled()
          return
        }
        if (this.sheet.endTime) {
          this.setStartDisabled()
          this.setCloseDisabled()
          return
        }
      }
    }
  }

  setCloseEnabled() {
    this.halfDollarEnd.enable()
    this.quarterEnd.enable()
    this.dimeEnd.enable()
    this.nickelEnd.enable()
    this.pennyEnd.enable()
    this.hundredsEnd.enable()
    this.fiftiesEnd.enable()
    this.twentiesEnd.enable()
    this.tensEnd.enable()
    this.fivesEnd.enable()
    this.onesEnd.enable()
  }

  setStartEnabled() {
    this.halfDollarStart.enable()
    this.quarterStart.enable()
    this.dimeStart.enable()
    this.nickelStart.enable()
    this.pennyStart.enable()
    this.hundredsStart.enable()
    this.fiftiesStart.enable()
    this.twentiesStart.enable()
    this.tensStart.enable()
    this.dollarsStart.enable()
    this.fivesStart.enable()
  }

  setCloseDisabled() {
    this.halfDollarEnd.disable()
    this.quarterEnd.disable()
    this.dimeEnd.disable()
    this.nickelEnd.disable()
    this.pennyEnd.disable()
    this.hundredsEnd.disable()
    this.fiftiesEnd.disable()
    this.twentiesEnd.disable()
    this.tensEnd.disable()
    this.fivesEnd.disable()
    this.onesEnd.disable()
  }

  setStartDisabled() {
    this.halfDollarStart.disable()
    this.quarterStart.disable()
    this.dimeStart.disable()
    this.nickelStart.disable()
    this.pennyStart.disable()
    this.hundredsStart.disable()
    this.fiftiesStart.disable()
    this.twentiesStart.disable()
    this.tensStart.disable()
    this.dollarsStart.disable()
    this.fivesStart.disable()
  }

  updateItemExit(event){
    this._updateItem().pipe(switchMap(data => {
      // this.router.navigate(['pos-orders'])
      this.onCancel(null);
      return of(data)
    }))
    this.location.back()
  }

  deleteItem(event){
    this.sheetMethodsService.deleteItem(this.isAuthorized, this.sheet)
  }

  print(event){
    this.printingService.updatePrintView(2);
    this.balanceSheet$ = this.sheetMethodsService.updateSheet(this.inputForm, this.startShiftInt).pipe(
      switchMap(data => {
        this.printingService.previewReceipt()
        return of(data)
      }
    ))
  }

  printEndingValues(event){
    this.printingService.updatePrintView(3);
    this.balanceSheet$ = this.sheetMethodsService.updateSheet(this.inputForm, this.startShiftInt).pipe(
      switchMap(data => {
        this.printingService.previewReceipt()
        return of(data)
      }
    ))
  }

  printDropValues(cashDrop: CashDrop){
    this.sheetMethodsService.cashDrop = cashDrop
    this.printingService.printDropValues()
  }

  email(event) {
    this.sendGridService.sendBalanceSheet(this.sheet.id).subscribe( data => {
      // console.log(data)
      if (data.toString() === 'Success') {
        this.sendGridService.notify('Email Sent', 'Success')
        return;
      }
      if (data && data.isSuccessStatusCode || data.toString() === 'Success') {
        this.sendGridService.notify('Email Sent', 'Success')
        return;
      }
      if (!data || !data.isSuccessStatusCode) {
        this.sendGridService.notify('Email Not Sent', 'Failed')
        return;
      }
    })
  }

  onCancel(event){
    this.location.back()
  }

  showStart() {
    if (this.isAuthorized) {
      this._showStart = !this._showStart;
    }
  }

  notify(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  getCashInCalculation() {
    return  this.sheet.cashIn // + cashDropCalculation
  }

  getSummaryOfCashCounted() {
    this.getCurrentBalance();
  }

  getSummaryOfCashStart() {
    if (!this.inputForm) { return }
    let total  =   (this.halfDollarStart.value * .25)
    total      =   (this.quarterStart.value * .25)
    total      =   (this.dimeStart.value * .10) + total
    total      =   (this.nickelStart.value * .05) + total
    total      =   (this.pennyStart.value * .01) + total
    total      =   (this.hundredsStart.value * 100) + total
    total      =   (this.fiftiesStart.value * 50) + total
    total      =   (this.twentiesStart.value * 20) + total
    total      =   (this.tensStart.value * 10) + total
    total      =   (this.fivesStart.value * 5) + total
    total      =   (this.dollarsStart.value * 1) + total
    return total
  }

  getSummaryOfCashEnd() {
    if (!this.inputForm) { return }
    let total  =   (this.halfDollarEnd.value * .50)
    total      =   (this.quarterEnd.value * .25) + total
    total      =   (this.dimeEnd.value * .10) + total
    total      =   (this.nickelEnd.value * .05) + total
    total      =   (this.pennyEnd.value * .01) + total
    total      =   (this.hundredsEnd.value * 100) + total
    total      =   (this.fiftiesEnd.value * 50) + total
    total      =   (this.twentiesEnd.value * 20) + total
    total      =   (this.tensEnd.value * 10) + total
    total      =   (this.fivesEnd.value * 5) + total
    total      =   (this.onesEnd.value * 1) + total
    return total
  }

  getCurrentBalance() {
    const cashEnd    = this.getSummaryOfCashEnd();
    const cashStart  = this.getSummaryOfCashStart();
    // console.log('cash start', cashEnd,cashStart)
    if (this.sheet) {
      const balance =  cashEnd + this.sheet.cashDropTotal  - cashStart - this.sheet.cashIn
      this.balance  = balance
    }
    return this.balance
  }
}
