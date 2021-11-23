import { Component,  OnInit,
         OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import {  FormControl, FormGroup } from '@angular/forms';
import { IItemBasic } from 'src/app/_services/menu/menu.service';
import {  Observable, Subscription } from 'rxjs';
import { Capacitor, } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BalanceSheetSearchModel, BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/_services';
import { IUser } from 'src/app/_interfaces';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

@Component({
  selector: 'app-balance-sheet-edit',
  templateUrl: './balance-sheet-edit.component.html',
  styleUrls: ['./balance-sheet-edit.component.scss']
})
export class BalanceSheetEditComponent implements OnInit, OnDestroy  {

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

  value           : any;
  searchForm      : FormGroup;
  inputForm       : FormGroup;
  urlPath         : string;

  id              : string;
  sheet           : IBalanceSheet;
  _sheet          : Subscription;

  user            : IUser;
  _user           : Subscription;

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

  //init subscriptions
  //requires user
  //requires balance sheet

  initSubscriptions() {
    this.loading = true
    this._sheet = this.sheetService.balanceSheet$.subscribe( data => {
      this.sheet = data;
      this.loading = false;
      if (this.inputForm) {
        // console.log('patching value', data)
        this.inputForm.patchValue(this.sheet)
      }
      this.getSheetType(this.sheet)
    })

    this._user = this.authenticationService.user$.subscribe( data => {
      this.user = data;
    })

  }

  constructor(  private _snackBar               : MatSnackBar,
                private sheetService            : BalanceSheetService,
                private siteService             : SitesService,
                private userAuthorization       : UserAuthorizationService,
                private location                : Location,
                private route                   : ActivatedRoute,
                private authenticationService   : AuthenticationService,
                private router                  : Router,
                private toolbarUIService        : ToolBarUIService,
              )
  {
    // this.initForm(this.sheet);
    this.inputForm = this.sheetService.initForm(this.inputForm);
  }

  async ngOnInit() {
    this.hideToolbars();
    this.initSubscriptions()
    this.isAuthorized  = this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff       = this.userAuthorization.isUserAuthorized('admin, manager, employee')
    this.id            = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      await  this.getSheet(this.id)
    }
    if(!this.id) {
      this.updateToCurrentSheet();
    }
  };

  newBalanceSheet() {
    //we have to initialize the balance sheet.
    //we should just be sending maybe the device, and the user.
    if (!this.id) {
      this.updateToCurrentSheet();
    }
  }

  hideToolbars() {
    this.toolbarUIService.hidetoolBars()
  }

  toggleSearchMenu() {
    this.toolbarUIService.switchSearchBarSideBar()
  }

  ngOnDestroy() {
    this.sheetService.updateBalanceSheet(null)
  }

  updateToCurrentSheet() {
    // console.log('update to current sheet', this.sheet)
    let deviceName = localStorage.getItem('devicename');
    // console.log('devicename', deviceName)
    if (!deviceName || deviceName.length == 0 || deviceName == undefined || deviceName === '' ){
      deviceName = 'nada'
    }

    if (!this.sheet)  {
      const site = this.siteService.getAssignedSite()
      if (!deviceName) { deviceName = 'nada' }
      this.sheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(
        switchMap(sheet => {
          this.loading = false;
          this.sheetService.updateBalanceSheet(sheet)
          return  this.sheetService.getSheetCalculations(site, sheet)
      })).subscribe( sheet => {
        this.sheetService.updateBalanceSheet(sheet)

      })
    }

  }

  async getSheet(sheetID: string) {

    if(!sheetID) { return }
    this.loading = true
    const id = parseInt(sheetID)
    const site = this.siteService.getAssignedSite()
    this.sheetService.getSheet(site, id).pipe(
      switchMap(sheet => {
      this.loading = false;
      this.sheetService.updateBalanceSheet(sheet)
      return this.sheetService.getSheetCalculations(site, sheet)
    })).subscribe( sheet => {
      this.sheetService.updateBalanceSheet(sheet)
    })

  }

  getSheetType(sheet: IBalanceSheet) {
    this.sheetType = this.sheetService.getSheetType(sheet)
  }

  initForm(sheet: IBalanceSheet) {
    try {
      const form = this.inputForm // this.sheetService.initForm(this.inputForm);

      if (!form) { console.log('form not initiated')
        return
      }
      if (!sheet) { console.log('form not initiated')
        return
      }

      if (this.sheet) {  this.inputForm.patchValue(this.sheet) }
      this.setEnabledFeatures()
    } catch (error) {
    }
  }

  updateItem(event) {
    const site = this.siteService.getAssignedSite();
    if (this.inputForm.valid) {
      const sheet  = this.inputForm.value
      if (sheet.shiftStarted  != 1) {
        sheet.shiftStarted = this.startShiftInt;
      }
      this.sheetService.putSheet(site, sheet).subscribe(data => {
        this.sheet = data;
        this.notify('Sheet saved.', 'Succes')
      }, (err) => {
        this.notify('Sheet note deleted.' + err, 'Failure')
      })
    }
  }

  startShift() {
    this.startShiftInt = 1;
    this.updateItem(null)
    this.router.navigateByUrl('/app-main-menu')
  }

  closeSheet() {
    if (this.sheet) {
      const site = this.siteService.getAssignedSite();
      this.sheetService.closeShift(site, this.sheet).subscribe(data=> {
        this.sheet = data;
        this.router.navigateByUrl('/app-main-menu')
        this.notify('Sheet is closed.', 'Succes')
      })
    }
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
    this.updateItem(event)
    this.location.back()
  }

  deleteItem(event){
    if (this.isAuthorized) {
      const result = window.confirm('Are you sure you need to remove this?')
      if (result && this.sheet.id) {
        const site = this.siteService.getAssignedSite();
        this.sheetService.deleteSheet(site, this.sheet.id).subscribe( data => {
          this.notify('Sheet is deleted.', 'Succes')
          this.onCancel(null);
        }, (err) => {
          this.notify('Sheet note deleted.' + err, 'Failure')
        })
      }
    }
  }

  print(event){
    //print
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
    if (this.sheet) {
      const balance = cashEnd - cashStart - this.sheet.cashIn - this.sheet.cashDropTotal
      this.balance  = balance
    }
    return this.balance
  }
}
