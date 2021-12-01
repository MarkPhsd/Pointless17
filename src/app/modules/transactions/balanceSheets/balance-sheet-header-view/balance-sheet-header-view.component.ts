import { Component, Input,OnInit  } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IServiceType } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { IPaymentSearchModel, POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'balance-sheet-header-view',
  templateUrl: './balance-sheet-header-view.component.html',
  styleUrls: ['./balance-sheet-header-view.component.scss']
})
export class BalanceSheetHeaderViewComponent implements OnInit  {

  @Input() sheet: any;
  @Input() sheetType = '';

  employees$      :   Observable<IItemBasic[]>;
  paymentMethod$  :   Observable<IPaymentMethod[]>;
  serviceTypes$   :   Observable<IServiceType[]>;
  _searchModel    :   Subscription;
  searchModel     :   IPaymentSearchModel;
  isAuthorized    :   boolean;
  currentPage     :   number;
  ordersOpen      =   '...';
  ordersCount     :   any;

  constructor(
    private router           : Router ,
    private _bottomSheet     : MatBottomSheet,
    private posOrderService  : OrdersService,
    private sitesService     : SitesService,
    private pOSPaymentService: POSPaymentService) {
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.ordersCount     =   '...';
    this.getOrdersOpen();
    this.getOrderCount();
  }

  getOrderCount() {
    //GetOrderCountCompletedInBalanceSheet
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
