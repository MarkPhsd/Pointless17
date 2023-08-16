import { Component, OnInit,Input, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { split } from 'lodash';
import { Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-check-out-buttons',
  templateUrl: './pos-check-out-buttons.component.html',
  styleUrls: ['./pos-check-out-buttons.component.scss']
})
export class PosCheckOutButtonsComponent implements OnInit, OnDestroy {

  @Input() phoneDevice: boolean;
  @Input() openOrderBar: boolean;
  @Input() smallDevice: boolean;
  @Input() isStaff: boolean;
  @Input() order: IPOSOrder;
  @Input() deviceWidthPercentage: string;
  @Input() uiSettings: UIHomePageSettings;
  @Input() mainPanel: boolean;

  disableCheckOut: boolean;
  disableViewCart: boolean;

  _router: Subscription;
  constructor(
    private toolbarUIService: ToolBarUIService,
    private router: Router,
    private orderService: OrdersService,
    public orderMethodsService: OrderMethodsService,
    private navigationService : NavigationService, ) { }

  makePayment() {
    this.navigationService.makePaymentFromSidePanel(this.openOrderBar, this.smallDevice,
      this.isStaff, this.order)
  }

  ngOnInit() {
    this.disableCheckOut = false;
    this.disableViewCart = false;
    this._router = this.router.events.subscribe(data => {
      this.disableCheckOut = false;
      this.disableViewCart = false;

      if(data instanceof NavigationEnd) {
      // console.log('data.url', data.url)
       if ( data.url.substring(0, 'pos-payment'.length + 1) === '/pos-payment') {
        this.disableCheckOut = true;
       }

       if ( data.url.substring(0, 'currentorder'.length + 1) === '/currentorder') {
        this.disableViewCart = true;
       }

      }

    })
  }
  ngOnDestroy() {
    if (this._router) { this._router.unsubscribe()}
  }

  toggleOpenOrderBar() {
    this.openOrderBar= false
    // this.navigationService.toggleOpenOrderBar(this.isStaff)

    this.toolbarUIService.updateOrderBar(false)
    this.toolbarUIService.resetOrderBar(true)
    this.router.navigate(["/currentorder/", {mainPanel:true}]);
    this.orderMethodsService.setScanner()
  }

}
