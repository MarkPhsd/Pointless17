import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'balance-sheet-view',
  templateUrl: './balance-sheet-view.component.html',
  styleUrls: ['./balance-sheet-view.component.scss']
})
export class BalanceSheetViewComponent implements OnInit {
  @Input() disableAuditButton: boolean;

  sheet : IBalanceSheet;
  _sheet: Subscription;

  sheetType = 'other';
  balance   : any;

  initSubscriptions() {
    this._sheet      = this.sheetMethodsService.balanceSheet$.subscribe( data => {
      this.sheet     = data;
      this.sheetType = this.sheetService.getSheetType(this.sheet)
      try {
        const balance  = this.sheet.cashDeposit - this.sheet.cashIn - this.sheet.cashDropTotal
        this.balance   = balance
      } catch (error) {
      }
    })
  }

  constructor(
                private sheetService  : BalanceSheetService,
                private router        : Router,
                private _bottomSheet  : MatBottomSheet,
                private sheetMethodsService: BalanceSheetMethodsService

              )
  {   }

  async ngOnInit() {
    this.initSubscriptions()
  }


}
