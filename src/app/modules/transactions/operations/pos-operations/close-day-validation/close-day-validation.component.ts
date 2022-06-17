import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICanCloseOrder } from 'src/app/_interfaces/transactions/transferData';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { BalanceSheetService,  IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { BalanceSheetQuickViewComponent } from '../../../balanceSheets/balance-sheet-quick-view/balance-sheet-quick-view.component';

@Component({
  selector: 'close-day-validation',
  templateUrl: './close-day-validation.component.html',
  styleUrls: ['./close-day-validation.component.scss']
})
export class CloseDayValidationComponent implements OnInit {

  @Input()   closeDayValidation: ICanCloseOrder;

  constructor(
    private _snackBar               : MatSnackBar,
    private balanceSheetService     : BalanceSheetService,
    private _bottomSheet            : MatBottomSheet,
    private siteService             : SitesService,
    private sheetMethodsService     : BalanceSheetMethodsService,
    private orderService            : OrdersService,
  ) { }

  ngOnInit(): void {

    if (this.closeDayValidation) {
      
    }
    const i = 0;
  }

  openBalanceSheet(id: number) {
    this.getItem(id)
  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.balanceSheetService.getSheet(site,  id).subscribe(data => {
         this.quickView(data);
        }
      )
    }
  }

  quickView(sheet: IBalanceSheet) {
    if (sheet) {
      this.sheetMethodsService.updateBalanceSheet(sheet)
      this._bottomSheet.open(BalanceSheetQuickViewComponent)
    }
  }
  
  setOrder(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.orderService.getOrder(site, id.toString(), false).subscribe(data => {
        this.orderService.setActiveOrder(site, data)
        }
      )
    }
  }


}
