import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { BalanceSheetService } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'app-cash-drawer-settings',
  templateUrl: './cash-drawer-settings.component.html',
  styleUrls: ['./cash-drawer-settings.component.scss']
})
export class CashDrawerSettingsComponent  {

  constructor( 
              private balanceSheetService: BalanceSheetService) { }

  async  openDrawerOne() { 
    const response        = await this.balanceSheetService.openDrawerOne()
  }
  
  async  openDrawerTwo() { 
    const response        = await this.balanceSheetService.openDrawerOne()
  }
}
