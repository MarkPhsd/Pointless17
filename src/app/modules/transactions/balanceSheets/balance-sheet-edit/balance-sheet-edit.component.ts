import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IItemBasic } from 'src/app/_services/menu/menu.service';
import { concatMap, Observable, of, Subscription, switchMap, switchMapTo } from 'rxjs';
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
import { PlatformService } from 'src/app/_services/system/platform.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { CoachMarksClass, CoachMarksService } from 'src/app/shared/widgets/coach-marks/coach-marks.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'app-balance-sheet-edit',
  templateUrl: './balance-sheet-edit.component.html',
  styleUrls: ['./balance-sheet-edit.component.scss']
})
export class BalanceSheetEditComponent implements OnInit, OnDestroy  {
  selectedIndex: number;

  get halfDollarEnd()     { return this.inputForm.get('halfDollarEnd') as UntypedFormControl; }
  get dollarEnd()     { return this.inputForm.get('dollarEnd') as UntypedFormControl; }
  get dollarsEnd()     { return this.inputForm.get('dollarsEnd') as UntypedFormControl; }


  get quarterEnd()        { return this.inputForm.get('quarterEnd') as UntypedFormControl; }
  get dimeEnd()           { return this.inputForm.get('dimeEnd') as UntypedFormControl; }
  get nickelEnd()         { return this.inputForm.get('nickelEnd') as UntypedFormControl; }
  get pennyEnd()          { return this.inputForm.get('pennyEnd') as UntypedFormControl; }
  get hundredsEnd()       { return this.inputForm.get('hundredsEnd') as UntypedFormControl; }
  get fiftiesEnd()        { return this.inputForm.get('fiftiesEnd') as UntypedFormControl; }
  get twentiesEnd()       { return this.inputForm.get('twentiesEnd') as UntypedFormControl; }
  get tensEnd()           { return this.inputForm.get('tensEnd') as UntypedFormControl; }
  get fivesEnd()          { return this.inputForm.get('fivesEnd') as UntypedFormControl; }
  get onesEnd()           { return this.inputForm.get('onesEnd') as UntypedFormControl; }

  get halfDollarStart()   { return this.inputForm.get('halfDollarStart') as UntypedFormControl; }
  get quarterStart()      { return this.inputForm.get('quarterStart') as UntypedFormControl; }
  get dimeStart()         { return this.inputForm.get('dimeStart') as UntypedFormControl; }
  get nickelStart()       { return this.inputForm.get('nickelStart') as UntypedFormControl; }
  get pennyStart()        { return this.inputForm.get('pennyStart') as UntypedFormControl; }
  get hundredsStart()     { return this.inputForm.get('hundredsStart') as UntypedFormControl; }
  get fiftiesStart()      { return this.inputForm.get('fiftiesStart') as UntypedFormControl; }
  get twentiesStart()     { return this.inputForm.get('twentiesStart') as UntypedFormControl; }
  get tensStart()         { return this.inputForm.get('tensStart') as UntypedFormControl; }
  get dollarsStart()      { return this.inputForm.get('dollarsStart') as UntypedFormControl; }
  get dollarStart()      { return this.inputForm.get('dollarStart') as UntypedFormControl; }
  get fivesStart()        { return this.inputForm.get('fivesStart') as UntypedFormControl; }

  get platForm()          { return Capacitor.getPlatform(); }

  @ViewChild('coachingInfo', {read: ElementRef}) coachingInfo: ElementRef;
  @ViewChild('coachingClosedOrders', {read: ElementRef}) coachingClosedOrders: ElementRef;
  @ViewChild('coachingOpenOrders', {read: ElementRef}) coachingOpenOrders: ElementRef;
  @ViewChild('coachingStartShift', {read: ElementRef}) coachingStartShift: ElementRef;
  @ViewChild('coachingCloseShift', {read: ElementRef}) coachingCloseShift: ElementRef;

  // this.coachMarksService.add(new CoachMarksClass(this.coachingStartShift.nativeElement,  list[3]));
  //     this.coachMarksService.add(new CoachMarksClass(this.coachingCoseShift.nativeElement,  list[4]));

  balanceSheet$:   Observable<any>;
  searchForm      : UntypedFormGroup;
  depositAmountForm: UntypedFormGroup;
  dropAmountForm   : UntypedFormGroup;
  inputForm       : UntypedFormGroup;
  urlPath         : string;

  id              : number;
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

  autoPrint: boolean; //print previewenabled
  startingCashForm = 0;
  endingCashForm   = 0;
  startingCashSaved= 0;
  endingCashSaved  = 0;
  loading          = true;
  startShiftInt    : number;
  balance          = 0;
  newBalance       = 0;
  auths$: Observable<IUserAuth_Properties>;
  auths: IUserAuth_Properties
  endOptionsDisabled   = false;
  startOptionsDisabled = false;
  ordersCount      = 0;
  ordersOpen       = 0;
  cashDropActive: number;
  _openOrders: Subscription;
  _ordersCount : Subscription;
  deposit$: Observable<any>;
  posDevice : ITerminalSettings;
  posDevice$: Subscription;

  initSubscriptions() {
    this.loading = true

    this.posDevice$ = this.settingsService.terminalSettings$.subscribe(data => {
      this.posDevice = data;
    })

    this._sheet = this.sheetMethodsService.balanceSheet$.subscribe( data => {
      this.sheet = data;
      if (data) {
        this.getSheetType(data)
      }

      this.loading = false;
      this.inputForm       = this.sheetMethodsService.initForm(this.inputForm);

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
                private fb                      : UntypedFormBuilder,
                private toolbarUIService        : ToolBarUIService,
                private sheetMethodsService     : BalanceSheetMethodsService,
                private sendGridService         :  SendGridService,
                private printingService         : PrintingService,
                public  platFormService     : PlatformService,
                public  coachMarksService  : CoachMarksService,
                private siteService       : SitesService,
                private settingsService   : SettingsService,
              )
  {

    this.auths$ = this.authenticationService.userAuths$.pipe(switchMap(data =>{
      this.auths = data
      return of(data)
    }))

    this.cashDropActive  = +this.route.snapshot.paramMap.get('cashdrop');
    if (this.cashDropActive) {   this.selectedIndex = 1;  }
  }

  ngOnInit() {
    this.hideToolbars();
    this.initSubscriptions()
    this.isAuthorized  = this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff       = this.userAuthorization.isUserAuthorized('admin, manager, employee')
    this.id            = +this.route.snapshot.paramMap.get('id');

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
    // this.sheetMethodsService.updateBalanceSheet(null)
    if (this._openOrders)  { this._openOrders.unsubscribe()}
    if (this._ordersCount) { this._ordersCount.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
    if (this._user)        { this._user.unsubscribe()}
    if (this.posDevice$)  { this.posDevice$.unsubscribe()}
  }

  //we have to initialize the balance sheet.
  //we should just be sending maybe the device, and the user.
  newBalanceSheet() {
    this.balanceSheet$ = this.sheetMethodsService.getCurrentBalanceSheet().pipe(
      switchMap(data => {
        this.getSheetType(data)
        this.initForm(data)
        return of(data)
    }))
  }

  getSheet(id: number) {
    this.balanceSheet$ = this._getSheet(id)
  }

  _getSheet(id:number) {
    return  this.sheetMethodsService.getSheetObservable(id.toString()).pipe(switchMap(data => {
      this.getSheetType(data);
      this.sheetMethodsService.updateBalanceSheet(data)
      this.initForm(this.sheet);
      return of(data)
    }))
  }

  _updateItem() {
    let sheet = this.inputForm.value as IBalanceSheet;
    sheet.overUnderTotal = this.getCurrentBalance();
    return this.sheetMethodsService.updateSheet(sheet, this.startShiftInt).pipe(switchMap(data => {
      return this._getSheet(data.id)
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
        this.printDropValues(drop)
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
       {
        console.log('form not initiated')
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
      return of(data)
    }))
  }

  updateItemExit(event){
    this.balanceSheet$ = this._updateItem().pipe(switchMap(data => {
      this.router.navigate(['app-main-menu'])
      return of(data)
    }))
  }

  startShift() {
    this.startShiftInt = 1;
    this.updateItem(null)
  }

  closeSheet(navigateUrl: string) {
    this.balanceSheet$ = this._updateItem()
    this.action$ = this.balanceSheet$.pipe(concatMap(data => {
      return  this.sheetMethodsService.closeSheet(data, null)
    })).pipe(
      concatMap( data => {
        return this._print(true);
    })).pipe(
      concatMap(data => {
        this.router.navigateByUrl(navigateUrl)
        return of(data)
      }
    ))
  }

  setEnabledFeatures() {
    let allowUpdate = false;
    allowUpdate = this.isAuthorized
    if (allowUpdate) {
      // this.setStartEnabled()
      // this.setCloseEnabled()
      return
    }
    if (!allowUpdate) { allowUpdate = this.isStaff }
    if (this.sheet) {
      if (this.isStaff ) {
        if (this.sheet.shiftStarted != 1 ) {
          // this.setStartEnabled()
          // this.setCloseDisabled()
          return
        }
        if (this.sheet.shiftStarted == 1 && !this.sheet.endTime ) {
          // this.setStartDisabled()
          // this.setCloseEnabled()
          return
        }
        if (this.sheet.endTime) {
          // this.setStartDisabled()
          // this.setCloseDisabled()
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
    this.dollarsEnd.enable()
    this.dollarEnd.enable()
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
    this.dollarStart.enable()
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
    this.dollarEnd.disable()
    this.onesEnd.disable()
    this.dollarsEnd.disable()
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
    this.dollarStart.disable()
    this.fivesStart.disable()
  }

  deleteItem(event){
    this.sheetMethodsService.deleteItem(this.auths?.accessAdmins, this.sheet)
  }

  print(event){
    this.autoPrint = false
    this.balanceSheet$ = this._print(true)
  }

  printPreview(event){
    this.autoPrint = false
    this.balanceSheet$ = this._print(false)
  }

  _print(autoPrint: boolean): Observable<any> {
    let printerName = ''
    if (this.posDevice) {  printerName = this.posDevice.receiptPrinter;  }
    const sheet = this.inputForm.value as IBalanceSheet;
    sheet.overUnderTotal = this.getCurrentBalance()
    return this.sheetMethodsService.updateSheet(sheet, this.startShiftInt).pipe(
      switchMap(result => {
        if (!result) {
          this.siteService.notify('Balance Sheet not assigned for print out.', 'close', 2000, 'red')
          return of(null)
        }
        this.printingService.updatePrintView(2);
        return this.printingService.previewReceipt(autoPrint, null, printerName)
    }));
  }

  // previewSheet() {
  //   this.printingService.updatePrintView(2);
  //   const sheet = this.inputForm.value as IBalanceSheet
  //   sheet.overUnderTotal = this.getCurrentBalance()
  //   this.balanceSheet$ = this.printingService.previewReceipt(false)
  // }

  printEndingValues(event){
    this.printingService.updatePrintView(3);
    let sheet = this.inputForm.value as IBalanceSheet
    sheet.overUnderTotal = this.getCurrentBalance()
    this.balanceSheet$ = this.sheetMethodsService.updateSheet(sheet, this.startShiftInt).pipe(
      switchMap(data => {
        this.printingService.previewReceipt(true)
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
    total      =   (this.dollarsEnd.value * 1) + total
    return total
  }

  getCurrentBalance() {
    const cashEnd    = this.getSummaryOfCashEnd();
    const cashStart  = this.getSummaryOfCashStart();
    if (this.sheet) {
      const balance =  cashEnd + this.sheet.cashDropTotal  - cashStart - this.sheet.cashIn
      this.balance  = balance
    }
    return this.balance
  }

    async openCashDrawer(value: number) {
      await this.sheetMethodsService.openDrawerOne()
    }

    initPopOver() {
      if (this.user?.userPreferences?.enableCoachMarks ) {
        this.coachMarksService.clear()
        this.addCoachingList()
        this.coachMarksService.showCurrentPopover();
      }
    }


    addCoachingList() {
      const list =['Balance Sheets: This is where you count your money at the beginging of the shift, and end. This will help management determine the balance of the drawer.' ,
                  'Open Orders: This is where you see the number of orders you have closed. ',
                  'Closed Orders: If you have any Open Orders you may not close your shift. If you are unable to close your shift, remember to check this area. ',
                  'Start Sheet: You should be taken to this screen when the drawer or your balance sheet have not yet been counted. Once you input the values below, you would press Start Sheet',
                  'Close Sheet: At the end of the shift you would return to this screen. To get here, go to POS from the side menu, then balance sheet. Instead of Start Sheet, you would see Close Sheet.',
                ]
      this.coachMarksService.add(new CoachMarksClass(this.coachingInfo.nativeElement,  list[0]));
      this.coachMarksService.add(new CoachMarksClass(this.coachingOpenOrders.nativeElement, list[1]));
      this.coachMarksService.add(new CoachMarksClass(this.coachingClosedOrders.nativeElement,  list[2]));
      this.coachMarksService.add(new CoachMarksClass(this.coachingStartShift.nativeElement,  list[3]));
      this.coachMarksService.add(new CoachMarksClass(this.coachingCloseShift.nativeElement,  list[4]));
    }
}


