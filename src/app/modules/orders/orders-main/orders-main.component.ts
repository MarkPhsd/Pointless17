import {Component,  OnInit, OnDestroy, AfterViewInit, HostListener,
  }  from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { OrderFilterPanelComponent } from '../order-filter-panel/order-filter-panel.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrdersService } from 'src/app/_services';

@Component({
  selector: 'app-orders-main',
  templateUrl: './orders-main.component.html',
  styleUrls: ['./orders-main.component.scss'],
})

export class OrdersMainComponent  {

  smallDevice: boolean;
  viewType   = 0;

  constructor (
    public route        : ActivatedRoute,
    private _bottomSheet: MatBottomSheet,
    private siteService : SitesService,
    private orderService: OrdersService)
  {
  }

  @HostListener("window:resize", [])
  adjustWindow(){
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
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
    if (this.viewType ==1) {
      this.viewType = 0
      return
    }
    if (this.viewType ==0) {
      this.viewType = 1
      return
    }

  }
}
