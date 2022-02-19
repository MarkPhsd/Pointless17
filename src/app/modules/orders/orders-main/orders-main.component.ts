import {Component,  OnInit, OnDestroy, AfterViewInit, HostListener,
  }  from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { OrderFilterPanelComponent } from '../order-filter-panel/order-filter-panel.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrdersService } from 'src/app/_services';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-orders-main',
  templateUrl: './orders-main.component.html',
  styleUrls: ['./orders-main.component.scss'],
})

export class OrdersMainComponent  {

  smallDevice  : boolean;
  viewType     = 1;
  isAuthorized : boolean;
  isStaff     : boolean;
  isUser      : boolean;
  listHeight = '84vh'

  constructor (
    public route             : ActivatedRoute,
    private _bottomSheet     : MatBottomSheet,
    private siteService      : SitesService,
    private userAuthorization: UserAuthorizationService,
    private orderService     : OrdersService)
  {
    this.initAuthorization();
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin, manager, employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {
      this.viewType = 2;
    }
  }

  @HostListener("window:resize", [])
  adjustWindow(){
    this.smallDevice = false
    this.listHeight = '70vh'
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.listHeight = '68vh'
    }
  }

  filterBottomSheet() {
    this._bottomSheet.open(OrderFilterPanelComponent);
  }

  async newOrder(){
    const site = this.siteService.getAssignedSite();
    await this.orderService.newDefaultOrder(site);
  }

  newOrderOptions() {
    this._bottomSheet.open(NewOrderTypeComponent)
  }

  changeView() {
    if (this.viewType == 1) {
      this.viewType = 0
      return
    }
    if (this.viewType == 0) {
      this.viewType = 1
      return
    }
  }

}
