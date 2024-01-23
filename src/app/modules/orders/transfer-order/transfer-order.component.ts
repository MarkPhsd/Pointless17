import { Component,Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { IPOSOrder, IPOSPayment,IServiceType } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { IPaymentMethod } from 'src/app/_services/transactions/payment-methods.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { BalanceSheetService } from 'src/app/_services/transactions/balance-sheet.service';
import { IItemBasic } from 'src/app/_services/menuPrompt/prompt-group.service';
import { ItemBasic } from '../../admin/report-designer/interfaces/reports';

@Component({
  selector: 'app-transfer-order',
  templateUrl: './transfer-order.component.html',
  styleUrls: ['./transfer-order.component.scss']
})
export class TransferOrderComponent implements OnInit {

  process$: Observable<any>;
  message: string;
  @Input() paymentMethod: IPaymentMethod;
  @Input() order: IPOSOrder;
  @Input() payment: IPOSPayment;
  @Input() showCancel = true;

  updateItems = false;
  serviceType  : IServiceType;
  sheets$: Observable<ItemBasic[]>;
  action$: Observable<any>;

  constructor(private siteService               : SitesService,
    private serviceTypeService        : ServiceTypeService,
    public  orderMethodsService       :  OrderMethodsService,
    public  orderService: OrdersService,
    private snackBar                  : MatSnackBar,
    private _bottomSheet              : MatBottomSheet,
    private userAuthorizationService  : UserAuthorizationService,
    private authService               : AuthenticationService,
    private balanceSheetService       : BalanceSheetService,
    @Optional() private dialogRef     : MatDialogRef<TransferOrderComponent>,
    )
  {
    const site = this.siteService.getAssignedSite()
    this.sheets$ = this.balanceSheetService.getOpenBalanceSheets(site)
  }

  ngOnInit(): void {

  }

  transferOrder(event) {
    const site = this.siteService.getAssignedSite();
    const item$ = this.orderService.transferOrder(site, this.orderMethodsService.currentOrder?.id, event?.id)
    this.action$ = item$.pipe(
      switchMap(data => {
        this.message = 'Processed';
        this.orderMethodsService.updateOrderSubscription(data)
        this.orderMethodsService.toggleChangeOrderType = false
        try {
          this.close()
        } catch (error) {

        }
        try {
          this.onCancel();
        } catch (error) {

        }
        return of(data)
      })
    )
    return
  }

  onCancel() {
    try {
      this.orderMethodsService.toggleChangeOrderType = false;
      this._bottomSheet.dismiss();
    } catch (error) {
      console.log('cancel', error)
    }
  }

  close() {
    try {
      this.orderMethodsService.toggleChangeOrderType = false;
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    } catch (error) {
    }
    this.onCancel();
  }


}
