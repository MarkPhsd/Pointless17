import { Component,  Input, TemplateRef, ViewChild} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ResizedEvent } from 'angular-resize-event';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrderTotalComponent } from '../pos-order/order-total/order-total.component';
import { POSOrderScheduleCardComponent } from '../posorder-schedule/posorder-schedule-card/posorder-schedule-card.component';
import { OrderHeaderComponent } from '../pos-order/order-header/order-header.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'pos-order-transaction-data',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    OrderTotalComponent,POSOrderScheduleCardComponent,OrderHeaderComponent
  ],
  templateUrl: './pos-order-transaction-data.component.html',
  styleUrls: ['./pos-order-transaction-data.component.scss']
})
export class PosOrderTransactionDataComponent{

  @ViewChild('scheduleInfoView')    scheduleInfoView: TemplateRef<any>;
  @Input() uiTransactionSettings : TransactionUISettings;
  @Input() order    : IPOSOrder;
  @Input() mainPanel: boolean;
  @Input() purchaseOrderEnabled: boolean;
  isAuthorized      : boolean;
  isUserStaff       : boolean;
  orderPanelHeight  = 'height:200px'

  onResizedOrderPanel(event: ResizedEvent) {
    this.orderPanelHeight = `height:${event.newRect.height}px`
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

  get scheduleInfo() {
    if (this.order.preferredScheduleDate || this.order.shipAddress) {
      return this.scheduleInfoView
    }
    return null
  }


}
