
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, switchMap,of } from 'rxjs';
import { IPaymentSearchModel, IPOSPaymentsOptimzed } from 'src/app/_interfaces';
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
  sheet : IBalanceSheet;
  _sheet: Subscription;
  cashDrop: CashDrop;
  sheetType = 'other';
  balance   : any;

  list$: Observable<IPOSPaymentsOptimzed>;

  initSubscriptions() {
    this._sheet      = this.sheetMethodsService.balanceSheet$.subscribe( data => {
      if (data) {
        this.sheet     = data;
        this.sheetType = this.sheetService.getSheetType(this.sheet);

        const site  = this.siteService.getAssignedSite();
        const search = {} as IPaymentSearchModel;
        search.pageSize = 500;

        search.reportRunID = this.sheet.id
        this.list$ = this.paymentService.searchPayments(site, search).pipe(
          switchMap(data => {
            // data = data.results.sort()
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

  constructor(
                private sheetService  : BalanceSheetService,
                private paymentService: POSPaymentService,
                private siteService   : SitesService,
                private sheetMethodsService: BalanceSheetMethodsService,
              )
  {   }

  async ngOnInit() {
    this.initSubscriptions()
    this.cashDrop = this.sheetMethodsService.cashDrop;
    // const styles = await this.httpClient.get('assets/htmlTemplates/balancesheetStyles.txt', {responseType: 'text'}).pipe().toPromise()
    // const style = document.createElement('style');
    // style.innerHTML = styles;
    // document.head.appendChild(style);
  }


}
