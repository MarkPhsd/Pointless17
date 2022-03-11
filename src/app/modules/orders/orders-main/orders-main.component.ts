import {Component,  OnInit, OnDestroy, AfterViewInit, HostListener,
  }  from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { OrderFilterPanelComponent } from '../order-filter-panel/order-filter-panel.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/_interfaces';

@Component({
  selector: 'app-orders-main',
  templateUrl: './orders-main.component.html',
  styleUrls: ['./orders-main.component.scss'],
})

export class OrdersMainComponent implements OnInit, OnDestroy {

  smallDevice  : boolean;
  viewType     = 1;
  isAuthorized : boolean;
  isStaff     : boolean;
  isUser      : boolean;
  listHeight = '84vh'

  isMenuOpen = false;
  _user: Subscription;
  user: IUser;

  constructor (
    public route             : ActivatedRoute,
    private _bottomSheet     : MatBottomSheet,
    private siteService      : SitesService,
    public userAuthorization : UserAuthorizationService,
    private authenticationService: AuthenticationService,
    private orderService     : OrdersService)
  {
    this.initAuthorization();
  }


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._user) {this._user.unsubscribe()}

  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isManagement;
    this.isStaff      = this.userAuthorization.isStaff;
    this.isUser       = this.userAuthorization.isUser;
    if (!this.isStaff) { this.viewType = 2; }
  }

  @HostListener("window:resize", [])
  adjustWindow(){
    this.smallDevice = false
    this.listHeight = '84vh'
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.listHeight = '79vh'
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
