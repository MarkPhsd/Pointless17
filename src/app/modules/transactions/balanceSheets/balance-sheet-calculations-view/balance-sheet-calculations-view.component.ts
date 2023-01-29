import { Component, Input, OnInit,OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { BalanceSheetService, CashDrop, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'balance-sheet-calculations-view',
  templateUrl: './balance-sheet-calculations-view.component.html',
  styleUrls: ['./balance-sheet-calculations-view.component.scss']
})
export class BalanceSheetCalculationsViewComponent implements OnInit,OnDestroy {

  @Input() sheet: IBalanceSheet;
  @Input() currentBalance: number;
  _openOrders: Subscription;
  _ordersCount : Subscription;
  _sheet          : Subscription;
  drops: CashDrop[];
  dropTotal: number;

  initSubscriptions() {
    this._sheet = this.sheetMethodsService.balanceSheet$.subscribe( data => {
      this.sheet = data;
      this.drops = this.sheet.cashDrops;
      this.dropTotal = 0
      console.log(this.drops)
      this.drops.forEach(data => { 
        this.dropTotal = +data.amount + this.dropTotal
      })
      console.log(this.drops)
    })
  }
  constructor( 
    private siteService: SitesService,
    private sheetMethodsService     : BalanceSheetMethodsService,
    private sheetService            : BalanceSheetService,
    ) { }

  ngOnInit(): void {
    this.initSubscriptions();
    console.log('')
  }
  ngOnDestroy() { 
    if (this._sheet) { 
      this._sheet.unsubscribe()
    }
  }
}
