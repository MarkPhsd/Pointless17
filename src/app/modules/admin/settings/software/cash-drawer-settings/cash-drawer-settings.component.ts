import { Component} from '@angular/core';

import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';

@Component({
  selector: 'app-cash-drawer-settings',
  templateUrl: './cash-drawer-settings.component.html',
  styleUrls: ['./cash-drawer-settings.component.scss']
})
export class CashDrawerSettingsComponent  {

  constructor(
              private balanceSheetService: BalanceSheetMethodsService) { }

  async  openDrawerOne() {
    const response        = await this.balanceSheetService.openDrawerOne()
  }

  async  openDrawerTwo() {
    const response        = await this.balanceSheetService.openDrawerOne()
  }
}
