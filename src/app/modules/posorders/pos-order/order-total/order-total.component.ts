import { Component, OnInit,Input, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-order-total',
  templateUrl: './order-total.component.html',
  styleUrls: ['./order-total.component.scss']
})
export class OrderTotalComponent implements OnInit, OnDestroy {
  smallDevice = false;
  cost: number;
  @Input() qrOrder: boolean
  @Input() order: IPOSOrder
  @Input() mainPanel = false;
  @Input() disableActions: boolean;
  @Input() refreshTime = 1;
  
  _uiSettings : Subscription;
  uiSettings  : UIHomePageSettings;
  transactionDataClass ="transaction-data"
  _order: Subscription;

  @Input()  purchaseOrderEnabled: boolean;

  homePageSubscriber(){
    
    try {
      this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe ( data => {
        this.uiSettings = data;

        if(this.smallDevice && this.mainPanel)    {
          this.transactionDataClass = 'main-panel-small'
          return}

        if (this.smallDevice && !this.mainPanel)  {
          this.transactionDataClass = 'side-panel-small'
          return
        }

        if (!this.mainPanel) {
          this.transactionDataClass ="transaction-data-side-panel"
          return;
        }

        if (!data?.wideOrderBar) {
          this.transactionDataClass = 'side-panel-small';
          return;
        }
      })
    } catch (error) {
    }
  }

  orderSubscriber() {
    this._order = this.orderService.currentOrder$.subscribe(data => {
      this.cost = 0;
      if (data) {
        this.order = data;
      }
    })
  }

  constructor(
      private uiSettingsService   : UISettingsService,
      private orderService        : OrdersService,
      public  route               : ActivatedRoute) {
    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    if (outPut) {
      this.mainPanel = true
    }
  }

  ngOnInit(): void {
    this.updateScreenSize();
    this.homePageSubscriber();
    this.orderSubscriber();
  }

  ngOnDestroy() {
    if (this._uiSettings) { this._uiSettings.unsubscribe()}
    if (this._order) { this._order.unsubscribe()}
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    if ( window.innerWidth < 850 ) {
      this.smallDevice = true
    }
  }

}

