import { Component,  Inject,  OnInit,
  ViewChild ,ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService, AWSBucketService, ContactsService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IItemBasic } from 'src/app/_services/menu/menu.service';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { Capacitor, Plugins } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BalanceSheetSearchModel, BalanceSheetService, IBalanceSheet, IBalanceSheetPagedResults } from 'src/app/_services/transactions/balance-sheet.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Route } from '@angular/compiler/src/core';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';

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

  get platForm()       {  return Capacitor.getPlatform(); }

  value             : any;
  // //This is for the filter Section//
  //search form filters
  searchForm      : FormGroup;
  inputForm       : FormGroup;
  urlPath         : string;

  id              : string;
  sheet           : IBalanceSheet;
  _sheet          : Subscription;

  employees$      :   Observable<IItemBasic[]>;
  paymentMethod$  :   Observable<IBalanceSheet[]>;

  _searchModel    :   Subscription;
  searchModel     :   BalanceSheetSearchModel;
  isAuthorized    :   boolean;
  isStaff         :   boolean;
  _showStart       :   boolean;
  sheetType       : string;

  startingCashForm = 0;
  endingCashForm   = 0;
  startingCashSaved = 0;
  endingCashSaved   = 0;
  loading          = true;
  startShiftInt    : number;
  balance          = 0;
  newBalance       = 0;

  endOptionsDisabled   = false;
  startOptionsDisabled = false;

  constructor(  private _snackBar               : MatSnackBar,
                private sheetService            : BalanceSheetService,
                private fb                      : FormBuilder,
                private siteService             : SitesService,
                private productEditButtonService: ProductEditButtonService,
                private userAuthorization       : UserAuthorizationService,
                private userService             : AuthenticationService,
                private _bottomSheet            : MatBottomSheet,
                private location                : Location,
                private route                   : ActivatedRoute,
                private router: Router,
              )
  {

  }

  async ngOnInit() {
    this.initClasses()
     this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff       = this.userAuthorization.isUserAuthorized('admin, manager, employee')
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      await  this.getSheet(this.id)
    }
    if(!this.id) {
      this.updateToCurrentSheet();
    }
    this.initSubscription()
  };

  ngOnDestroy() {
    this.sheetService.updateBalanceSheet(null)
  }

  initSubscription() {
    this.loading = true
    this._sheet = this.sheetService.balanceSheet$.subscribe( data => {
      this.sheet = data;
      this.loading = false;
      this.initForm();
      this.getSheetType(this.sheet)
    })
  }

  updateToCurrentSheet() {
    console.log('update to current sheet', this.sheet)
    let deviceName = localStorage.getItem('devicename');
    console.log('devicename', deviceName)
    if (!deviceName || deviceName.length == 0 || deviceName == undefined || deviceName === '' ){
      deviceName = 'nada'
    }

    if (!this.sheet)  {
      // console.log('updateToCurrentSheet')

      const site = this.siteService.getAssignedSite()
      if (!deviceName) { deviceName = 'nada' }
      // console.log('deviceName', deviceName)
      this.sheetService.getCurrentUserBalanceSheet(site, deviceName).pipe(
        switchMap(sheet => {
        this.loading = false;
        this.sheetService.updateBalanceSheet(sheet)
        return this.sheetService.getSheetCalculations(site, sheet)
      })).subscribe( sheet => {
        this.sheet = sheet
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
      this.sheet = sheet
      this.sheetService.updateBalanceSheet(sheet)
    })

  }

  getSheetType(sheet: IBalanceSheet) {
    if (sheet) {
      if (sheet.type == 3) {
        this.sheetType = "Cashier"
      }
      if (sheet.type == 4) {
        this.sheetType = "Server"
      }
      if (sheet.type != 4 && sheet.type != 3) {
        this.sheetType = "other"
      }
    }
  }



  initForm() {
    this.inputForm =  this.sheetService.initForm(this.inputForm);
    if (this.sheet) {
      this.inputForm.patchValue(this.sheet)
    }
    this.setEnabledFeatures()
  }

  initClasses()  {
    const platForm  = this.platForm;
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
    // this._bottomSheet.dismiss();
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
    // this.startingCashForm = this.getSummaryOfCashStart();
    // this.endingCashForm   = this.getSummaryOfCashEnd();
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
    try {
      total      =   (this.dollarsStart.value * 1) + total
    } catch (error) {
      // console.log('err', error)
    }

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

    //new balance
    if (this.sheet) {
      const balance = cashEnd - cashStart - this.sheet.cashIn - this.sheet.cashDropTotal
      this.balance  = balance
    }
    // console.log(this.balance)
    return this.balance

  }
}
