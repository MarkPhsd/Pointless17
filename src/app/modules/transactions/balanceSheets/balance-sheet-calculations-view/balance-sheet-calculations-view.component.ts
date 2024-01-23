import { Component, Input, OnInit,OnDestroy,EventEmitter, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { CashDrop, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';

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
  _sheet          : Subscription;
  drops: CashDrop[];
  dropTotal: number;
  auths$ : Observable<IUserAuth_Properties>;
  @Output() renderComplete = new EventEmitter<any>()

  // (renderComplete)="renderCompleted($event)"
  initSubscriptions() {
    this._sheet = this.sheetMethodsService.balanceSheet$.subscribe( data => {
      this.sheet = data;
      this.dropTotal = 0

      // console.log('sheet data', data)
      try {
        if (this.sheet && this.sheet.cashDrops) {
          this.drops = this.sheet.cashDrops;
          this.drops.forEach(data => {
            this.dropTotal = +data.amount + this.dropTotal
          })
          this.renderComplete.emit('balance-sheet-calcuations-view')
        }
      } catch (error) {

      }
    })
  }
  constructor(
    private userAuth: AuthenticationService,
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
