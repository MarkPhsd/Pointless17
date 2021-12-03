import { Component, Input, OnInit } from '@angular/core';
import { IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'balance-sheet-calculations-view',
  templateUrl: './balance-sheet-calculations-view.component.html',
  styleUrls: ['./balance-sheet-calculations-view.component.scss']
})
export class BalanceSheetCalculationsViewComponent implements OnInit {

  @Input() sheet: IBalanceSheet;
  @Input() currentBalance: number;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
