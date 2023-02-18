import { Component, OnInit,Input } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';

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

  constructor(  private navigationService : NavigationService, ) { }

  makePayment() {
    // this.openOrderBar = false
    // this.toolbarUIService.updateOrderBar(false);
    // this.toolbarUIService.updateSideBar(false)
    // this.toolbarUIService.updateToolBarSideBar(false)
    // let path = ''
    // if (this.order) {
    //   if (this.order.tableName && this.order.tableName.length>0) {
    //     path = 'pos-payment'
    //   }
    // }
    // this.navigationService.makePayment(this.openOrderBar, this.smallDevice,
    //                                   this.isStaff, this.order.completionDate, path )

    this.navigationService.makePaymentFromSidePanel(this.openOrderBar, this.smallDevice,
      this.isStaff, this.order)
  }

  toggleOpenOrderBar() {
    this.openOrderBar= false
    this.navigationService.toggleOpenOrderBar(this.isStaff)
  }

}
