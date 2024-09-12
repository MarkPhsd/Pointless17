import { Component, Input, OnInit,OnDestroy,EventEmitter, Output } from '@angular/core';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { CashDrop, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'balance-sheet-calculations-view',
  templateUrl: './balance-sheet-calculations-view.component.html',
  styleUrls: ['./balance-sheet-calculations-view.component.scss']
})
export class BalanceSheetCalculationsViewComponent implements OnInit,OnDestroy {
  @Input() autoPrint: boolean;
  @Input() sheet: IBalanceSheet;
  @Input() currentBalance: number;
  _openOrders: Subscription;
  _ordersCount : Subscription;

  drops: CashDrop[];
  dropTotal: number;
  auths$ : Observable<IUserAuth_Properties>;
  @Output() renderComplete = new EventEmitter<any>()
  cashDepositCalc: number;

  _sheet          : Subscription;
  depositDescription: string;
  endingInDrawer: number;
  // (renderComplete)="renderCompleted($event)"
  initSubscriptions() {
    const site = this.siteService.getAssignedSite()
    const sheet$ = this.sheetMethodsService.balanceSheet$.pipe(switchMap( data => {
      this.sheet = data;
      this.dropTotal = 0
      this.getDropsValue(data)
      return this.paymentService.getCreditTipTotals(site,this.sheet.id)
    })).pipe(switchMap(data => {
      /// now we can calculate the amount of cash a server cashier should deposit.
      //CashDeposit = CashSales - CreditTips
      // console.log('credit Tips', data)
      const creditTips = +data;
      this.cashDepositCalc =  this.sheet?.cashIn - this.sheet?.creditTips
      this.depositDescription = 'Cash - Credit Tip'

      if (this.userAuth._userAuths.value) {
        const auths = this.userAuth._userAuths.value
        if (auths.userAssignedBalanceSheet)  {
          if (auths.balanceSheetDisableBank) {
            this.depositDescription = 'Cash - Credit Tip'
            this.cashDepositCalc = +this.sheet?.cashIn -  this.sheet?.creditTips
            this.endingInDrawer = +this.cashDepositCalc - +this.sheet?.endedWith;
          }
        }
      }

      this.renderComplete.emit('balance-sheet-calcuations-view')
      return of(data)
    }))
    this._sheet = sheet$.subscribe()
  }

  getDropsValue(sheet: IBalanceSheet) {
  // console.log('sheet data', data)
    try {
      if (sheet && sheet.cashDrops) {
        this.drops = sheet.cashDrops;
        this.drops.forEach(data => {
          this.dropTotal = +data.amount + this.dropTotal
        })
      }
    } catch (error) {

    }
  }

  constructor(
    private userAuth: AuthenticationService,
    private paymentService: POSPaymentService,
    private siteService: SitesService,
    private sheetMethodsService     : BalanceSheetMethodsService,
    ) { }

  ngOnInit(): void {
    this.initSubscriptions();
    this.auths$ =  this.userAuth.userAuths$
  }
  ngOnDestroy() {
    if (this._sheet) {
      this._sheet.unsubscribe()
    }
  }
}

function switchmap(arg0: (data: any) => void): any {
  throw new Error('Function not implemented.');
}

