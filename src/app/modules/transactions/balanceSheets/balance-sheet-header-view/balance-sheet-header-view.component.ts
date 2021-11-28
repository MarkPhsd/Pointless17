import { Component, Input,  } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IServiceType } from 'src/app/_interfaces';
import { IItemBasic } from 'src/app/_services';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { IPaymentSearchModel, POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'balance-sheet-header-view',
  templateUrl: './balance-sheet-header-view.component.html',
  styleUrls: ['./balance-sheet-header-view.component.scss']
})
export class BalanceSheetHeaderViewComponent  {

  @Input() sheet: any;
  @Input() sheetType = '';

  employees$      :   Observable<IItemBasic[]>;
  paymentMethod$  :   Observable<IPaymentMethod[]>;
  serviceTypes$   :   Observable<IServiceType[]>;
  _searchModel    :   Subscription;
  searchModel     :   IPaymentSearchModel;
  isAuthorized    :   boolean;
  currentPage     :   number;

  constructor(
    private router: Router ,
    private _bottomSheet: MatBottomSheet,
    private pOSPaymentService: POSPaymentService) { }

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
