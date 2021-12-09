import { Component, Input,OnDestroy,OnInit  } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IServiceType } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { IPaymentSearchModel, POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'balance-sheet-header-view',
  templateUrl: './balance-sheet-header-view.component.html',
  styleUrls: ['./balance-sheet-header-view.component.scss']
})
export class BalanceSheetHeaderViewComponent implements OnInit,OnDestroy  {

  @Input() sheet: any;
  @Input() sheetType = '';

  employees$      :   Observable<IItemBasic[]>;
  paymentMethod$  :   Observable<IPaymentMethod[]>;
  serviceTypes$   :   Observable<IServiceType[]>;
  _searchModel    :   Subscription;
  searchModel     :   IPaymentSearchModel;
  isAuthorized    :   boolean;
  currentPage     :   number;

  _ordersCount    :   Subscription;
  _openOrders     :   Subscription;

  ordersOpen      : any =   '...'
  ordersCount     : any =   '...';

  initSubscriptions() {
    this._ordersCount = this.balanceSheetMethodsService.ordersOpen$.subscribe( data => {
      if (!data) { return }
      this.ordersCount = data
    })
    this._openOrders  =  this.balanceSheetMethodsService.ordersOpen$.subscribe( data => {
      if (!data) { return }
      this.ordersOpen       = data
    })
  }

  constructor(
    private router                    : Router ,
    private _bottomSheet              : MatBottomSheet,
    private posOrderService           : OrdersService,
    private sitesService              : SitesService,
    private balanceSheetMethodsService: BalanceSheetMethodsService,
    private pOSPaymentService         : POSPaymentService)
  {
  }

  ngOnInit(): void {
    this.initValues()
    this.initSubscriptions();
  }

  initValues() {
    this.balanceSheetMethodsService.getOrdersOpen( this.sheet.id ).subscribe( data => {
      this.ordersOpen = (data.count).toString()
      this.balanceSheetMethodsService.updateOpenOrders(data.count)
    })
    this.balanceSheetMethodsService.getOrderCount( this.sheet ).subscribe( data => {
      this.ordersCount = (data.count).toString();
      this.balanceSheetMethodsService.updateOrderCount(data.count)
    })
  }

  ngOnDestroy() {
    this._ordersCount.unsubscribe()
    this._openOrders.unsubscribe()
  }

  getOrderCount() {
    if (this.sheet) {
      const site = this.sitesService.getAssignedSite();
      const open$ = this.posOrderService.getOrderCountCompletedInBalanceSheet(site, this.sheet)
      open$.subscribe(data => {
        if (data) {
          this.ordersCount = data.count;
        }
      })
    }
  }

  getOrdersOpen() {
    if (this.sheet) {
      const site = this.sitesService.getAssignedSite();
      const open$ = this.posOrderService.getPendingInBalanceSheet(site, this.sheet.id)
      open$.subscribe(data => {
        if (data && data.results) {
          this.ordersOpen = data.results.length;
        }
      })
    }
  }

  auditPayments() {
    if (this.sheet) {
      const searchModel       = {} as IPaymentSearchModel;
      this.currentPage        = 1
      searchModel.pageNumber  = 1;
      searchModel.pageSize    = 25;
      this.searchModel        = searchModel
      searchModel.reportRunID = this.sheet.id;
      this.pOSPaymentService.updateSearchModel(searchModel)
      this.router.navigate(['/pos-payments'])
      this._bottomSheet.dismiss()
    }
  }

}
