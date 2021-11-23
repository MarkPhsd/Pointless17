import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'balance-sheet-calculations-view',
  templateUrl: './balance-sheet-calculations-view.component.html',
  styleUrls: ['./balance-sheet-calculations-view.component.scss']
})
export class BalanceSheetCalculationsViewComponent implements OnInit {

  @Input() sheet: any;
  @Input() currentBalance: number;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
