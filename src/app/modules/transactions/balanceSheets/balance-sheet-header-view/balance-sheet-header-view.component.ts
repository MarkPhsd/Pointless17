import { Component, EventEmitter, Input,OnDestroy,OnInit, Output  } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IPOSOrderSearchModel, IPaymentSearchModel, IServiceType } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'balance-sheet-header-view',
  templateUrl: './balance-sheet-header-view.component.html',
  styleUrls: ['./balance-sheet-header-view.component.scss']
})
export class BalanceSheetHeaderViewComponent implements OnInit,OnDestroy  {
  @Input() autoPrint : boolean;
  @Input() sheet: IBalanceSheet;
  @Input() sheetType = '';
  @Input() disableAuditButton: boolean;
  @Output() renderComplete = new EventEmitter<any>();

  employees$      :   Observable<IItemBasic[]>;
  paymentMethod$  :   Observable<IPaymentMethod[]>;
  serviceTypes$   :   Observable<IServiceType[]>;
  _searchModel    :   Subscription;
  searchModel     :   IPaymentSearchModel;
  isAuthorized    :   boolean;
  currentPage     :   number;

  _ordersCount    :   Subscription;
  _openOrders     :   Subscription;
  _sheet          :   Subscription;

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

    this._sheet = this.balanceSheetMethodsService.balanceSheet$.subscribe(data => {
      this.sheet = data;
      console.log('sheet updated',data?.id, data?.balanceSheetEmployee?.lastName)
    })
  }

  constructor(
    private router                    : Router ,
    private _bottomSheet              : MatBottomSheet,
    private posOrderService           : OrdersService,
    private orderMethodsService: OrderMethodsService,
    private sitesService              : SitesService,
    private balanceSheetMethodsService: BalanceSheetMethodsService,
    private pOSPaymentService         : POSPaymentService)
  {
  }

  ngOnInit(): void {
    this.initValues();
    this.initSubscriptions();

  }

  initValues() {

    if (this.sheet && this.sheet.id) {
      this.balanceSheetMethodsService.getOrdersOpen( this.sheet.id ).subscribe( data => {
        if (data) {
          this.ordersOpen = (data.count).toString()
          this.balanceSheetMethodsService.updateOpenOrders(data.count)
        }
      })

      this.balanceSheetMethodsService.getOrderCount( this.sheet ).subscribe( data => {
        if (data)  {
          this.ordersCount = (data.count).toString();
          this.balanceSheetMethodsService.updateOrderCount(data.count)
        }
      })
    }

  }

  ngOnDestroy() {
    if (this._ordersCount) {this._ordersCount.unsubscribe()}
    if (this._openOrders)  {this._openOrders.unsubscribe() }
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
      searchModel.pageSize    = 100;
      this.searchModel        = searchModel
      searchModel.reportRunID = this.sheet.id;
      this.pOSPaymentService.updateSearchModel(searchModel)
      this.router.navigate(['/pos-payments'])
      this._bottomSheet.dismiss()
    }
  }

  auditOrders() {
    if (this.sheet) {
      const searchModel       = {} as IPOSOrderSearchModel;
      this.currentPage        = 1
      searchModel.pageNumber  = 1;
      searchModel.pageSize    = 100;
      searchModel.reportRunID = this.sheet.id;
      this.router.navigate(['/pos-orders', {searchModel:true} ])
      try {
        this._bottomSheet.dismiss()
      } catch (error) {
      }
      this.orderMethodsService.updateOrderSearchModel(searchModel)
      this.orderMethodsService.updateViewOrderType(1)
    }
  }

  renderCompleted(event) {
    console.log('sheet',this.autoPrint, this.sheet)

    this.renderComplete.emit('balance-sheet-header-view')
  }

}
