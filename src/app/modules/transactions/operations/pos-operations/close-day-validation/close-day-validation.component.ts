import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ICanCloseOrder } from 'src/app/_interfaces/transactions/transferData';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { BalanceSheetService,  IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { BalanceSheetQuickViewComponent } from '../../../balanceSheets/balance-sheet-quick-view/balance-sheet-quick-view.component';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'close-day-validation',
  templateUrl: './close-day-validation.component.html',
  styleUrls: ['./close-day-validation.component.scss']
})
export class CloseDayValidationComponent implements OnInit {

  @Input() closeDayValidation: ICanCloseOrder;
  action$: Observable<any>;
  actionOn: boolean;
  @Output() refreshCloseCheck = new EventEmitter();

  constructor(
    private _snackBar               : MatSnackBar,
    private balanceSheetService     : BalanceSheetService,
    private _bottomSheet            : MatBottomSheet,
    private siteService             : SitesService,
    private sheetMethodsService     : BalanceSheetMethodsService,
    private orderService            : OrdersService,
    public orderMethodsService: OrderMethodsService,
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

  deleteUnPrinted() {
    const site = this.siteService.getAssignedSite();
    this.actionOn = true
    this.action$ = this.orderService.deleteUnClosedUnPrintedOrders(site).pipe(switchMap(data => {
      this.actionOn = false
      this.refreshCloseCheck.emit(true)
      return of(data)
    }))
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
        this.orderMethodsService.setActiveOrder(data)
        }
      )
    }
  }


}
