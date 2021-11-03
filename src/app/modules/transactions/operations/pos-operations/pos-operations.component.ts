import { Component, Input, OnInit } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransferDataService } from 'src/app/_services/transactions/transfer-data.service';
import { BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ITaxReport} from 'src/app/_services/reporting/reporting-items-sales.service';
import { Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';

@Component({
  selector: 'pos-operations',
  templateUrl: './pos-operations.component.html',
  styleUrls: ['./pos-operations.component.scss']
})
export class PosOperationsComponent implements OnInit {

  @Input() site    : ISite;
  @Input() notifier: Subject<boolean>
  localSite: ISite;
  dateFrom: any;
  dateTo  : any;

  closeResult     = '';
  runningClose :  boolean;
  balanceSheets:  IBalanceSheet[]

  balanceSheetsClosed    = '';
  canCloseOrderResults: any;
  sale: ITaxReport;

  iBalanceSheet: IBalanceSheet;
  zrunID: any;

  constructor(
    private siteService        : SitesService,
    private transferDataService: TransferDataService,
    private balanceSheetService: BalanceSheetService,
    private router             : Router,
  ) {

    if (!this.site) {
      this.site = this.siteService.getAssignedSite();
    }

  }

  ngOnInit(): void {
    this.getUser();
    this.refreshSales();
  }

  refreshInfo(){
    this.localSite = {} as ISite;
    this.getUser();
    this.refreshSales();
  }

  addDates(StartDate: any, NumberOfDays : number): Date{
    StartDate = StartDate
    StartDate.setDate(StartDate.getDate() + NumberOfDays);
    return StartDate;
  }

  refreshSales() {
    const site = this.siteService.getAssignedSite();
    this.site = site
    this.balanceSheetService.getZRUNBalanceSheet(site).subscribe( data => {
      this.iBalanceSheet = data;
      this.zrunID = data.id;
    })
  }

  getUser() {
    this.localSite = this.siteService.getAssignedSite();

  }

  closeDay() {

    const result = window.confirm('Are you sure you want to close the day.');
    if (!result) {return}

    const site = this.siteService.getAssignedSite();
    this.runningClose = true;

    //run through checks. do all the closing checks on theWebapi.
    //return a can or not and reason why.
    const closingCheck$ = this.transferDataService.canCloseDay(site)
    this.balanceSheetsClosed = ''
    closingCheck$.pipe(
      switchMap( data => {
        console.log(data)
        //determine if the day can be closed.
        //if it can't then return what is told from the webapi
        if (data){
          if (!data.allowClose) {
            this.canCloseOrderResults = data
            this.runningClose = false
            return
          }
        }
        return this.transferDataService.closeAll(site);
      })).pipe(
        switchMap(
          data => {
            this.closeResult = 'Day closed.'
            this.runningClose = false;
            return this.balanceSheetService.closeAllSheets(site)
          }
      )).subscribe(data => {
        this.balanceSheetsClosed = 'All balance sheets closed'
        this.runningClose = false;
    })

  }

  ordersWindow() {
    this.router.navigateByUrl('/pos-orders')
  }

  closeAllSheets() {
    const site = this.siteService.getAssignedSite();
    this.runningClose = true;
    this.balanceSheetService.closeAllSheets(site).subscribe(data => {
      this.balanceSheets = data;
      this.runningClose = false;
     }, err => {
      this.closeResult = err
      this.runningClose = false;
     }
    )
  }


}
