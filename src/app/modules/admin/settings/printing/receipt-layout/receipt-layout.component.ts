import { Component, Input, OnInit, AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import { lte } from 'lodash';
import { EMPTY, Subscription } from 'rxjs';
import { ISetting, ISite } from 'src/app/_interfaces';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { DatePipe } from '@angular/common';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-receipt-layout',
  templateUrl: './receipt-layout.component.html',
  styleUrls: ['./receipt-layout.component.scss']
})
export class ReceiptLayoutComponent implements OnInit,OnDestroy {

  //we use these because it makes formating easier
  //during design process. so don't use saved seettings.

  @Input() headerText  : string;
  @Input() itemText    : string;
  @Input() footerText  : string;
  @Input() paymentsText: string;
  @Input() paymentsCreditText: string;
  @Input() paymentsWICEBTText: string;
    // [paymentsWICEBTText]="setting.option10"
    // [paymentsCreditText]="setting.option11"

  @Input() subFooterText: string;
  @Input() testdata    : boolean
  @Input() printerWidth: number;
  @Input() styles      : ISetting;
  @Input() liveEdit    : boolean;
  @Input() orders      : any[];
  @Input() order       : any;
  @Input() items       : any[];
  @Input() payments    : any[];
  @Input() orderType   : any;
  @Input() orderTypes  : any[];
  sites                = [] as ISite[];
  site                 : ISite;
  @Input() isLabel: boolean;

  interpolatedHeaderText  :  string;
  interpolatedFooterText  :  string;
  interpolatedSubFooterText: string;
  interpolatedPaymentsText: string;
  interpolatedCreditPaymentsText: string;
  interpolatedWICEBTPaymentsText: string;

  @Input() interpolatedItemTexts      = [] as string[];
  @Input() interpolatedHeaderTexts    = [] as string[];
  @Input() interpolatedFooterTexts    = [] as string[];
  @Input() interpolatedSubFooterTexts = [] as string[];
  @Input() interpolatedPaymentsTexts  = [] as string[];
  @Input() interpolatedCreditPaymentsTexts = [] as string[];
  @Input() interpolatedWICEBTPaymentsTexts = [] as string[];

      // [interpolatedCreditPaymentsTexts] ="interpolatedCreditPaymentsTexts"
      //                           [interpolatedWICEBTPaymentsTexts] ="interpolatedWICEBTPaymentsTexts"
      //                           [interpolatedSubFooterTexts] ="interpolatedSubFooterTexts"

  setPrinterWidthClass = "receipt-width-80"
  gridReceiptClass     = 'receipt-width-85'

  _order: Subscription;

  async initSubscriptions() {

    this.site = this.siteService.getAssignedSite();
    this._order = this.orderService.currentOrder$.pipe(
      switchMap(
        data => {
          if (!data)  {return EMPTY   }
          this.order      = data
          this.items      = this.order.posOrderItems
          this.payments   = this.order.posPayments
          this.orders     = []
          if (this.order) { this.orders.push(this.order)}
          const datepipe: DatePipe = new DatePipe('en-US')
          if (data.orderDate) { this.order.orderTime = datepipe.transform( data.orderDate, 'HH:mm')     }
          if (this.items)     { this.items           = this.items.filter( item => item.quantity != 0  );     }
          if ( this.payments) { this.payments        = this.payments.filter(item => item.amountPaid != 0 ); }
          return this.serviceTypeService.getType(this.site, data.serviceTypeID)
        }
      )
    ).subscribe(data   => {
        if (!data) { return }
        this.orderType = data
        this.orderTypes = []
        this.orderTypes.push(this.orderType)
        if (this.subFooterText) {
          this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.subFooterText, this.orderTypes)
        }
        this.printingService.updatePrintReady(true)
        return this.order
      }
    )
  }

  constructor(
    private settingService  : SettingsService,
    private serviceTypeService: ServiceTypeService,
    private siteService     : SitesService,
    private printingService : PrintingService,
    private renderingService: RenderingService,
    private orderService    : OrdersService,
    private fakeDataService : FakeDataService) { }

  async ngOnInit() {
    this.initSubscriptions();
    this.getReceiptWidth()
    await this.applyStyles();
    await this.refreshData();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if ( this._order) {    this._order.unsubscribe()}

  }
  async refreshData() {
    this.site = this.siteService.getAssignedSite();
    await this.initSubscriptions();

    if (!this.order) {  await this.getTestData();  }
    this.getInterpolatedData()
    return
  }

  getReceiptWidth() {
    if (this.printerWidth == 58) {
      this.setPrinterWidthClass = "receipt-width-58"
      this.gridReceiptClass = 'grid-receipt-58'
    }
    if (this.printerWidth == 80) {
      this.setPrinterWidthClass = "receipt-width-80"
      this.gridReceiptClass = 'grid-receipt-80'
    }
    if (this.printerWidth == 85) {
      this.setPrinterWidthClass = "receipt-width-85"
      this.gridReceiptClass = 'grid-receipt-85'
    }
  }

  scrubOrders(order: IPOSOrder) {
    if (order) {
      if (!order.preferredScheduleDate) {
        const dt = new Date()
        order.preferredScheduleDate = '     '
      }
      this.orders[0] = order;
    }
  }

  async getInterpolatedData() {
    this.scrubOrders(this.orders[0])

    try {

      if (this.orders && this.headerText) {
        this.interpolatedHeaderTexts    = this.renderingService.refreshStringArrayData(this.headerText, this.orders)
        this.interpolatedFooterTexts    = this.renderingService.refreshStringArrayData(this.footerText, this.orders)
      }

      if (this.items && this.itemText) {
        this.interpolatedItemTexts      = this.renderingService.refreshStringArrayData(this.itemText, this.items)
      }

      if (this.payments && this.paymentsText) {
        this.interpolatedPaymentsTexts  = this.renderingService.refreshStringArrayData(this.paymentsText, this.payments)
      }

      if (this.payments && this.paymentsCreditText) {
        this.interpolatedCreditPaymentsTexts  = this.renderingService.refreshStringArrayData(this.paymentsCreditText, this.payments)
      }

      if (this.payments && this.paymentsWICEBTText) {
        this.interpolatedWICEBTPaymentsTexts  = this.renderingService.refreshStringArrayData(this.paymentsWICEBTText, this.payments)
      }

      if (this.orders && this.orders[0].serviceTypeID) {
          this.serviceTypeService.getType(this.site, this.orders[0].serviceTypeID).subscribe(data => {
            if (data) {
              this.orderType = data
              this.orderTypes = []
              this.orderTypes.push(this.orderType)
              this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.subFooterText, this.orderTypes)
            }
          }
        )
      } else {
        // console.log('you knew this was going to happen')
      }

    } catch (error) {
      // console.log(error)
    }
  }

  async getTestData() {
    if (!this.order) {
      this.orders      = this.fakeDataService.getOrder();
      this.items       = this.fakeDataService.getItemData();
      this.payments    = this.fakeDataService.getPayments();
      this.orderTypes  = this.fakeDataService.getOrderType();
    }
  }

  getInterpolatedHTMLNoItem(html) {
    if (!html) { return }
    return  this.renderingService.interpolateText('', html)
  }

  getInterpolatedHTML(html: any, item: any) {
    if (!item || !html) { return}
     return  this.renderingService.interpolateText(item, html)
  }

  async applyStyles() {
    const site                = this.siteService.getAssignedSite();
    const receiptStyle$       = this.settingService.getSettingByName(site, 'ReceiptStyles')
    receiptStyle$.subscribe( receiptStyles => {
      if (receiptStyles) {
        const styles = this.renderingService.interporlateFromDB(receiptStyles.text)
        const style = document.createElement('style');
        style.innerHTML = styles;
        document.head.appendChild(style);
      }}
    )
  }
}


