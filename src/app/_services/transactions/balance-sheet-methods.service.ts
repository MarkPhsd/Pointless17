import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BalanceSheetHeaderViewComponent } from 'src/app/modules/transactions/balanceSheets/balance-sheet-header-view/balance-sheet-header-view.component';
import { IOrdersPaged } from 'src/app/_interfaces';
import { OrdersService } from '..';
import { SitesService } from '../reporting/sites.service';
import { BalanceSheetService, IBalanceSheet } from './balance-sheet.service';

@Injectable({
  providedIn: 'root'
})
export class BalanceSheetMethodsService {

  private _orderCount         = new BehaviorSubject<number>(null);
  public orderCount$           = this._orderCount.asObservable();

  private _ordersOpen         = new BehaviorSubject<number>(null);
  public ordersOpen$           = this._ordersOpen.asObservable();

  constructor(
    private posOrderService                : OrdersService,
    private sitesService                   : SitesService,

  ) { }

  updateOrderCount(value: number) {
    this._orderCount.next(value)
  }

  updateOpenOrders(value: number)  {
    this._ordersOpen.next(value)
  }

  getOrderCount(sheet: IBalanceSheet): Observable<IOrdersPaged> {
    if (sheet) {
      const site = this.sitesService.getAssignedSite();
      return this.posOrderService.getOrderCountCompletedInBalanceSheet(site, sheet);
    }
  }

  getOrdersOpen(id: number): Observable<IOrdersPaged>   {
    if (id) {
      const site = this.sitesService.getAssignedSite();
      return this.posOrderService.getPendingInBalanceSheet(site, id)
    }
  }

}
