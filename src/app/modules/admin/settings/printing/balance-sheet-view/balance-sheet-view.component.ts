
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription, switchMap,of } from 'rxjs';
import { IPaymentSearchModel, IPOSPaymentsOptimzed } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
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
  balance   : any;
  auths$ : Observable<IUserAuth_Properties>;
  list$  : Observable<IPOSPaymentsOptimzed>;
  @Output() renderComplete = new EventEmitter<any>();
  //maybe set setup a chain of items that needs to be rendered.
  printReadList = []
  sheet$: Observable<any>;

  initSubscriptions() {
    this._sheet = this.sheetMethodsService.balanceSheet$.subscribe(
       data => {
        console.log('balance sheet view subscriber', data)
        if (data) {
          this.sheet     = data;
          this.sheetType = this.sheetService.getSheetType(this.sheet);

          const site  = this.siteService.getAssignedSite();
          const search = {} as IPaymentSearchModel;
          search.pageSize = 500;

          search.reportRunID = this.sheet.id
          this.list$ = this.paymentService.searchPayments(site, search).pipe(
            switchMap(data => {
              return of(data)
            }
          ))

          try {
            const balance  = this.sheet.cashDeposit - this.sheet.cashIn - this.sheet.cashDropTotal
            this.balance   = balance
          } catch (error) {
          }
        }
    })

  }

  constructor(  private userAuth: AuthenticationService,
                private sheetService  : BalanceSheetService,
                private paymentService: POSPaymentService,
                private siteService   : SitesService,
                private sheetMethodsService: BalanceSheetMethodsService,
              )
  {   }

  ngOnInit() {
    this.initSubscriptions()
    this.cashDrop = this.sheetMethodsService.cashDrop;
    this.auths$ =  this.userAuth.userAuths$.pipe(switchMap(data => {
      return of(data)
    }))
  }

  renderCompleted(event) {
    if (!this.printReadList)  {
      this.printReadList = []
    }
    this.printReadList.push(event)
    if (this.printReadList.length>0) {
    }
    if (this.printReadList.length == 3) {
      this.renderComplete.emit(event)
    }
  }

}
