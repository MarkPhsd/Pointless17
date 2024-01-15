
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription, switchMap,of } from 'rxjs';
import { IPaymentSearchModel, IPOSOrder, IPOSPaymentsOptimzed, ISetting } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { BalanceSheetService, CashDrop, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
//printType balanceSheetValues balanceSheetFinal cashDrop
@Component({
  selector: 'balance-sheet-view',
  templateUrl: './balance-sheet-view.component.html',
  styleUrls: ['./balance-sheet-view.component.scss']
})
export class BalanceSheetViewComponent implements OnInit {
  @Input() disableAuditButton: boolean;
  @Input() printType = 'balanceSheetFinal';
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() autoPrint : boolean = false;
  sheet : IBalanceSheet;
  _sheet: Subscription;
  cashDrop: CashDrop;
  sheetType = 'other';
  zRun$ : Observable<IBalanceSheet>;
  balance   : any;
  auths$ : Observable<IUserAuth_Properties>;
  auths  : IUserAuth_Properties;
  list$  : Observable<IPOSPaymentsOptimzed>;
  paymentGroups$  : Observable<IPOSPaymentsOptimzed>;
  @Output() renderComplete = new EventEmitter<any>();
  gratuitySummary$: Observable<IPOSOrder>;
  //maybe set setup a chain of items that needs to be rendered.
  printReadList = []
  sheet$: Observable<any>;
  serviceFeeProcessed: boolean;
  site = this.siteService.getAssignedSite()
  setPrinterWidthClass = "receipt-width-80"
  //max possible items to render. each necessary feature is removed from check below.
  maxCount = 6
  @Input() styles: ISetting;

  initSubscriptions() {
    this._sheet = this.sheetMethodsService.balanceSheet$.subscribe(
       data => {
        if (data) {
          this.sheet     = data;
          this.sheetType = this.sheetService.getSheetType(this.sheet);
          this.getBalanceCalculations(data.id);
          try {
            const balance  = this.sheet.cashDeposit - this.sheet.cashIn - this.sheet.cashDropTotal
            this.balance   = balance
          } catch (error) {
          }
      }
    })

  }

  setStyles() {
    return;
    if (this.styles) { 
      const styles    = this.renderingService.interporlateFromDB(this.styles?.text)
      const style     = document.createElement('style');
      style.innerHTML = styles;
      document.head.appendChild(style);
      console.log('set styles', this.styles.text)
    }
  }

  getBalanceCalculations(sheetID : number) {
    const site  = this.siteService.getAssignedSite();
    this.zRun$ = this.balanceSheetService.getZRUNBalanceSheet(site).pipe(switchMap(zRun => {
      const site  = this.siteService.getAssignedSite();

      if (zRun) {
        let history: boolean;
        history = false
        if (zRun.endTime) {
          history = true
        }

        const search = {} as IPaymentSearchModel;
        search.pageSize = 500;
        search.reportRunID = sheetID

        this.list$ = this.paymentService.searchPayments(site, search).pipe(
          switchMap(data => {
            return of(data)
          }
        ))

        this. paymentGroups$ = this.paymentService.getPaymentSummaryByGroups(site, sheetID, history).pipe(
          switchMap(data => {
            return of(data)
          }
        ))

        this.gratuitySummary$ = this.ordersService.getBalanceSheetGratuityTotal(site, sheetID, history).pipe(
          switchMap(data => {
            if (!this.printReadList)  {    this.printReadList = []   }
            this.printReadList.push(true)
            return of(data)
          }
        ))

      }
      return of(zRun)
    }))
  }

  constructor(  private userAuth: AuthenticationService,
                private sheetService  : BalanceSheetService,
                private paymentService: POSPaymentService,
                private siteService   : SitesService,
                private ordersService : OrdersService,
                private sheetMethodsService: BalanceSheetMethodsService,
                private balanceSheetService : BalanceSheetService,
                private printingService: PrintingService,
                private renderingService: RenderingService,
              )
  {   }

  ngOnInit() {
    this.initSubscriptions();
    this.setStyles()
    this.cashDrop = this.sheetMethodsService.cashDrop;
    this.auths$ =  this.userAuth.userAuths$.pipe(switchMap(data => {
      this.auths = data;
      this.initMaxCount()
      return of(data)
    }))
  }

  //determines the number of components to render before sending to print.
  initMaxCount() { 
    if (this.auths) { 
      if (!this.auths.blindBalanceSheet) { 
        this.maxCount = this.maxCount - 1
      }
      if (!this.auths.balanceSheetDetails) { 
        this.maxCount = this.maxCount - 1
      }
      if (!this.auths.balanceSheetViewTypeSales) { 
        this.maxCount = this.maxCount - 1
      }
    }
  }

  renderCompleted(event) {
    // console.log('renderCompleted', event)
    if (!this.printReadList)  {  this.printReadList = []  }

    this.printReadList.push(event)

    if (this.printReadList.length>0) {
    }

    if (this.printReadList.length == this.maxCount) {
      // console.log('max count reached emiting view render complete for print.')
      this.renderComplete.emit('true')
      const item = {read: true, balanceSheet: true}
      if (this.autoPrint) { 
        // console.log('Attempt auto print')
        this.printingService.updatePrintReady(item)
      }
    }
  }

}
