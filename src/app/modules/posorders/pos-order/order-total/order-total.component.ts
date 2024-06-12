import { Component, OnInit,Input, HostListener, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';


@Component({
  selector: 'app-order-total',
  templateUrl: './order-total.component.html',
  styleUrls: ['./order-total.component.scss']
})
export class OrderTotalComponent implements OnInit, OnDestroy {
  smallDevice = false;

  @ViewChild('inventoryView') inventoryView : TemplateRef<any>;
  cost: number;
  @Input() qrOrder: boolean
  @Input() order: IPOSOrder
  @Input() mainPanel = false;
  @Input() disableActions: boolean;
  @Input() refreshTime = 1;
  @Input() ui : TransactionUISettings;
  ui$: Observable<TransactionUISettings>;
  _uiSettings : Subscription;
  uiSettings  : UIHomePageSettings;
  transactionDataClass ="transaction-data"
  _order: Subscription;

  @Input()  purchaseOrderEnabled: boolean;

  roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

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

  get isInventoryView() {
    if (this.order && this.order.service && this.order.service.filterType == 2) {
      return this.inventoryView
    }
    return null;
  }

  orderSubscriber() {
    this._order = this.orderMethodsService.currentOrder$.subscribe(data => {
      this.cost = 0;
      if (data) {
        this.order = data;
        this.purchaseOrderEnabled = false;
        if (this.order.serviceType && (this.order.serviceType.toLowerCase() == 'purchase order' || this.order.serviceType.toLowerCase() === 'conversion')) {
          this.purchaseOrderEnabled = true;
        }
      }
    })
  }

  get cashDiscount() {
    const ui = this.ui;

    if (ui?.dcapSurchargeOption == 3) {
      return this.roundToPrecision( this.order.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 2) {
      return this.roundToPrecision( this.order.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 1 ) {
      return this.roundToPrecision( this.order.total * (1 + +ui.dcapDualPriceValue) , 5)
    }

    return null
  }


  constructor(
      private uiSettingsService   : UISettingsService,
      private orderMethodsService : OrderMethodsService,
      private uISettingsService   : UISettingsService,
      public  route               : ActivatedRoute) {
    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    if (outPut) {
      this.mainPanel = true
    }
  }

  ngOnInit(): void {
    this.initTransactionUISettings();
    this.updateScreenSize();
    this.homePageSubscriber();
    this.orderSubscriber();
  }

  initTransactionUISettings() {
    this.ui$ = this.uISettingsService.transactionUISettings$.pipe(switchMap(data => {
        this.ui = data
        if (!data) {
          return this.uiSettingsService.getUITransactionSetting().pipe(switchMap(data => {return of(data)}))
        }
        return of(data)
      }
    ));
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

