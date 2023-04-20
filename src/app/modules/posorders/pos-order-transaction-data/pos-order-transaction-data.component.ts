import { Component,  Input} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResizedEvent } from 'angular-resize-event';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-order-transaction-data',
  templateUrl: './pos-order-transaction-data.component.html',
  styleUrls: ['./pos-order-transaction-data.component.scss']
})
export class PosOrderTransactionDataComponent{
  @Input() uiTransactionSettings : TransactionUISettings;
  @Input() order    : IPOSOrder;
  @Input() mainPanel: boolean;
  @Input() purchaseOrderEnabled: boolean;
  isAuthorized      : boolean;
  isUserStaff       : boolean;
  orderPanelHeight  = 'height:200px'

  onResizedOrderPanel(event: ResizedEvent) {
    // this.uiSettingsService.updateLimitOrderHeight(event.newRect.height, this.windowHeight) //(this.orderLimitsPanel.nativeElement.offsetHeight)
    this.orderPanelHeight = `height:${event.newRect.height}px` 
    // this.resizePanel()
  }

  constructor(
    private userAuthorization   : UserAuthorizationService,
    private matSnackBar   : MatSnackBar,
    public orderService: OrdersService,
    public orderMethodsService: OrderMethodsService,
    private uiSettingsService: UISettingsService,
  ) {
    this.isUserStaff = this.userAuthorization.isCurrentUserStaff()
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin');
  }

   notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 3000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }


}
