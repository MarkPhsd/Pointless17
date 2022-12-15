import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { EMPTY, of, Subscription, Observable } from 'rxjs';
import { ISetting, ISite } from 'src/app/_interfaces';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { MenuService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { DatePipe } from '@angular/common';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { catchError, switchMap,  } from 'rxjs/operators';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';

@Component({
  selector: 'app-receipt-layout',
  templateUrl: './receipt-layout.component.html',
  styleUrls: ['./receipt-layout.component.scss']
})
export class ReceiptLayoutComponent implements OnInit, OnDestroy {

  @Output() outPutPrintReady = new EventEmitter()
  //we use these because it makes formating easier
  //during design process. so don't use saved seettings.
  action$ : Observable<any>;
  @Input() index  : number;
  @Input() templateInit: boolean;
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

  autoPrinted = false;
  setPrinterWidthClass = "receipt-width-80"
  gridReceiptClass     = 'receipt-width-85'
  _order: Subscription;

  _printOrder          : Subscription;

  printOrder$: Observable<any>;
  printOrder: IPrintOrders;

  initSubscriptions() {
    this.site = this.siteService.getAssignedSite();
    return this.orderService.currentOrder$.pipe(
      switchMap(
        data => {
          if (!data)  {
            return of(null);
          }
          this.order      = data
          this.items      = this.order.posOrderItems
          if (!this.payments) {
            this.payments   = this.order.posPayments
          }
          console.log('payments', this.payments)
          this.orders     = []
          if (this.order) { this.orders.push(this.order)};
          const datepipe: DatePipe = new DatePipe('en-US');
          if (data.orderDate) { this.order.orderTime = datepipe.transform( data.orderDate, 'HH:mm')     }
          if (this.items)     { this.items           = this.items.filter( item => item.quantity != 0  );     }
          if ( this.payments) { this.payments        = this.payments.filter(item => item.amountPaid != 0 ); }
           return this.serviceTypeService.getTypeCached(this.site, data.serviceTypeID)
        }
      )
     ).pipe(
      switchMap(data   => {
        if (!data) { return of(this.order) }
        this.orderType = data
        this.orderTypes = []
        this.orderTypes.push(this.orderType)
        if (this.subFooterText) {
          this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.subFooterText, this.orderTypes, 'ordertypes')
        }
        this.getInterpolatedData()
        this.printingService.updatePrintReady({ready: true, index: this.index})
        if (this.order?.service?.defaultProductID1) {
          return this.menuService.getMenuItemByID(this.site,this.order.service.defaultProductID1)
        }
        return of(this.order)
      }
    )).pipe(switchMap(data => {
      if (data && data.name) {
        this.order.service.menuItem1 = data;
      }

      return of(data)
    }))
  }

  initTemlplateSubscription() {
    this._printOrder = this.orderService.printOrder$.subscribe(
      data => {
        if (data) {
          this.printOrder    = data;
          this.order = data.order
          console.log('template Subscription', data.order.posOrderItems.length)
          this.action$ = this.initTemplateData(data.order)
        }
      }
    )
  }

  initTemplateData(order) {

    if (!order) {
      console.log('initTemplateData order update null')
      return null
    }

    this.items      = order.posOrderItems;
    if (!this.payments) {
      this.payments   = order.posPayments
    }

    this.orders     = [];
    if (this.order) { this.orders.push(order) }

    const datepipe: DatePipe = new DatePipe('en-US');
    if (order.orderDate) { order.orderTime = datepipe.transform( order.orderDate, 'HH:mm')     }
    if (this.items)      { this.items           = this.items.filter( item => item.quantity != 0  );     }
    if ( this.payments)  { this.payments        = this.payments.filter(item => item.amountPaid != 0 ); }

    const site = this.siteService.getAssignedSite();
    return this.serviceTypeService.getTypeCached(site, order.serviceTypeID).pipe(
      switchMap(data   => {
        if (!data)  {
          console.log('no data', this.index, order)
        }

        this.orderType = data
        this.orderTypes = []
        this.orderTypes.push(this.orderType)
        if (this.subFooterText) {
          this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.subFooterText,
                                                                                         this.orderTypes, 'ordertypes')
        }
        this.getInterpolatedData()
        this.outputPrint();
        return of(order)
      }
    ))

  }

  outputPrint() {
    // if (this.autoPrinted) { return }
    // this.autoPrinted = true;

    setTimeout(() => {
      const prtContent     = document.getElementById('printsection');
      if (!prtContent) {
        console.log('no prtContent', this.index)
        return
      }
      const content        = `${prtContent.innerHTML}`
      if (!content) {
        console.log('not out put in content', this.index)
        return
      }

      console.log('content output', this.index, content.length)
      this.outPutPrintReady.emit(content)
    }, 500)
  }

  constructor(
    private settingService  : SettingsService,
    private serviceTypeService: ServiceTypeService,
    private siteService     : SitesService,
    private printingService : PrintingService,
    private renderingService: RenderingService,
    private orderService    : OrdersService,
    private menuService:     MenuService,
    private fakeDataService : FakeDataService) { }

  ngOnInit() {
    if (this.templateInit) {
      // this.action$ = this.initTemplateData(this.order)
      this.initTemlplateSubscription();
      return ;
    }

    this.getReceiptWidth();
    this.action$ = this.initSubscriptions().pipe(
        switchMap(data => {
            return of(data)
          }
        )
      ).pipe(
        switchMap( data => {
           return this.getStyles()
          }
        )
      ).pipe(
        switchMap(data => {
          this.refreshData();
          return of(data)
        }
      )
    )
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if ( this._order) {  this._order.unsubscribe()}
  }

 refreshData() {
    this.site = this.siteService.getAssignedSite();
    this.initSubscriptions();
    if (!this.order) {  this.getTestData();  }
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

  getInterpolatedData() {
    if (!this.orders || !this.orders[0]) { return }
    this.scrubOrders(this.orders[0])

    // if (this.items) {
    //   this.items = this.items.filter(data => {
    //     const item = data as IPOSOrderItem;
    //     if (data?.productName.trim() === 'Gratuity') {
    //       const order = this.order as IPOSOrder;
    //       order.gratuity = +(item.unitPrice * item.quantity).toFixed(2)
    //     }
    //     return data?.productName.trim() != 'Gratuity'
    //   })
    // }

    try {

      if (this.orders && this.headerText) {
        this.interpolatedHeaderTexts    = this.renderingService.refreshStringArrayData(this.headerText, this.orders, 'header')
        this.interpolatedFooterTexts    = this.renderingService.refreshStringArrayData(this.footerText, this.orders, 'footer')
      }

      if (this.items && this.itemText) {
        this.interpolatedItemTexts      = this.renderingService.refreshStringArrayData(this.itemText, this.items, 'items')
      }

      if (this.payments && this.paymentsText) {
        this.interpolatedPaymentsTexts  = this.renderingService.refreshStringArrayData(this.paymentsText, this.payments, 'payments')
      }

      if (this.payments && this.paymentsCreditText) {
        this.interpolatedCreditPaymentsTexts  = this.renderingService.refreshStringArrayData(this.paymentsCreditText, this.payments, 'payments')
      }

      if (this.payments && this.paymentsWICEBTText) {
        this.interpolatedWICEBTPaymentsTexts  = this.renderingService.refreshStringArrayData(this.paymentsWICEBTText, this.payments, 'payments')
      }

      if (this.orders && this.orders[0].serviceTypeID) {

      } else {
        // console.log('you knew this was going to happen')
      }
    } catch (error) {
      // console.log(error)
    }
  }

  getOrderTypeInfo(serviceTypeID: number) {
    return this.serviceTypeService.getTypeCached(this.site, this.orders[0].serviceTypeID).pipe(
      switchMap(data => {
      if (data) {
        this.orderType = data
        this.orderTypes = []
        this.orderTypes.push(this.orderType)
        this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.subFooterText, this.orderTypes, 'ordertypes')
      }
      return of(data)
    }));
  }

  getTestData() {
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

  getStyles() {
    const site                = this.siteService.getAssignedSite();
    const receiptStyle$       = this.settingService.getSettingByNameCached(site, 'ReceiptStyles')
    return receiptStyle$.pipe(
      switchMap( receiptStyles => {
          if (receiptStyles) {
            const styles    = this.renderingService.interporlateFromDB(receiptStyles.text)
            const style     = document.createElement('style');
            style.innerHTML = styles;
            document.head.appendChild(style);
          }
          return of(receiptStyles)
        }
      ),
      catchError(err => {
        this.orderService.notificationEvent('Error getting styles for receipt', 'Error')
        return of(null)
      })
    )
  }

}


