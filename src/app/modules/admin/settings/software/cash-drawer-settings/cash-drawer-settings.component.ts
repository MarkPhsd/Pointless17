import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';

import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-cash-drawer-settings',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
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
