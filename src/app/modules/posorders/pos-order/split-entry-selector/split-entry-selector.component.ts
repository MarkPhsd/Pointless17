import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
@Component({
  selector: 'split-entry-selector',
  templateUrl: './split-entry-selector.component.html',
  styleUrls: ['./split-entry-selector.component.scss']
})
export class SplitEntrySelectorComponent implements OnInit {
  @Input() uiTransactionSettings       = {} as TransactionUISettings;
  currentValue: any;
  @Input() isUserStaff = false;
  @Input() order : IPOSOrder ;
  values = [0,1,2,3,5,6,7,8,9]
  constructor(public orderMethodsService: OrderMethodsService) { }

  ngOnInit(): void {
    const i = 0
  }

  assignVaue(value) {
    this.orderMethodsService.splitEntryValue = value;
  }

}