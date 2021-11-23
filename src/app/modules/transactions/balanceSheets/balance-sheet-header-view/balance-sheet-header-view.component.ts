import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'balance-sheet-header-view',
  templateUrl: './balance-sheet-header-view.component.html',
  styleUrls: ['./balance-sheet-header-view.component.scss']
})
export class BalanceSheetHeaderViewComponent implements OnInit {

  @Input() sheet: any;
  @Input() sheetType = '';

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
