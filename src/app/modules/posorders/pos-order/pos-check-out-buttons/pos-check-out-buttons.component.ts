import { Component, OnInit,Input } from '@angular/core';
import { Router } from '@angular/router';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

@Component({
  selector: 'pos-check-out-buttons',
  templateUrl: './pos-check-out-buttons.component.html',
  styleUrls: ['./pos-check-out-buttons.component.scss']
})
export class PosCheckOutButtonsComponent  {

  @Input() phoneDevice: boolean;
  @Input() openOrderBar: boolean;
  @Input() smallDevice: boolean;
  @Input() isStaff: boolean;
  @Input() order: IPOSOrder;
  @Input() deviceWidthPercentage: string;
  @Input() uiSettings: UIHomePageSettings;
  @Input() mainPanel: boolean;

  constructor(
    private toolbarUIService: ToolBarUIService,
    private router: Router,
    private orderService: OrdersService,
    private navigationService : NavigationService, ) { }

  makePayment() {
    this.navigationService.makePaymentFromSidePanel(this.openOrderBar, this.smallDevice,
      this.isStaff, this.order)
  }

  toggleOpenOrderBar() {
    this.openOrderBar= false
    // this.navigationService.toggleOpenOrderBar(this.isStaff)

    this.toolbarUIService.updateOrderBar(false)
    this.toolbarUIService.resetOrderBar(true)
    this.router.navigate(["/currentorder/", {mainPanel:true}]);
    this.orderService.setScanner()
  }

}
