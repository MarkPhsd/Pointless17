import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { BalanceSheetHeaderViewComponent } from '../balance-sheet-header-view/balance-sheet-header-view.component';
import { BalanceSheetCalculationsViewComponent } from '../balance-sheet-calculations-view/balance-sheet-calculations-view.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'balance-sheet-quick-view',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    BalanceSheetHeaderViewComponent,
    BalanceSheetCalculationsViewComponent,
  SharedPipesModule],
  templateUrl: './balance-sheet-quick-view.component.html',
  styleUrls: ['./balance-sheet-quick-view.component.scss']
})
export class BalanceSheetQuickViewComponent implements OnInit, OnDestroy {

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

  ngOnDestroy(): void {
    if (this._sheet) { this._sheet.unsubscribe()}
  }

  view() {
    if (this.sheet) {
      this.router.navigate(['/balance-sheet-edit', {id: this.sheet.id}]);
      this._bottomSheet.dismiss();
    }
  }

  dismiss() {
    this._bottomSheet.dismiss();
  }

}
