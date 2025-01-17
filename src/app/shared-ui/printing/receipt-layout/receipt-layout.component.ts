import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, SimpleChanges,OnChanges } from '@angular/core';
import { of, Subscription, Observable } from 'rxjs';
import { ISetting, ISite } from 'src/app/_interfaces';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { MenuService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { catchError, switchMap,  } from 'rxjs/operators';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-receipt-layout',
  standalone: true,
  imports: [CommonModule,MatDividerModule],
  templateUrl: './receipt-layout.component.html',
  styleUrls: ['./receipt-layout.component.scss']
})
export class ReceiptLayoutComponent implements OnInit, OnDestroy, OnChanges {

  private appendedStyleElement: HTMLStyleElement | null = null;
  nonIndentedIndex: number = 1;
  // {item: data, id: this.items[i].id, idRef: this.items[i].idRef}
  itemsText = [] as any[];
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
  @Input() displayFeeInFooter = false;

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
  @Output() printReady = new EventEmitter()

  autoPrinted = false;
  setPrinterWidthClass = "receipt-width-80"
  gridReceiptClass     = 'receipt-width-85'
  _order: Subscription;
  _printOrder          : Subscription;
  printOrder$: Observable<any>;
  printOrder: IPrintOrders;
  enabledPrintReady: boolean;

  initSubscriptions() {
    this.site = this.siteService.getAssignedSite();

    let printOrder$  = of(this.printingService.printOrder);
    if (!this.printingService.printOrder) {
     printOrder$ = this.orderMethodsService.currentOrder$
    }

    return  printOrder$.pipe(
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
          if (this.payments) {
            this.payments = this.payments.filter(data => data.tranType != 'incrementalAuthorizationResponse' )
          }
          this.orders     = []
          if (this.order) { this.orders.push(this.order)};
          const datepipe: DatePipe = new DatePipe('en-US');
          if (data.orderDate) { this.order.orderTime = datepipe.transform( data.orderDate, 'HH:mm')     }
          if (this.items)     { this.items           = this.items.filter( item => item.quantity != 0  );     }
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
          this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.subFooterText, this.orderTypes, 'ordertypes');
        }
        this.getInterpolatedData();

        if (this.order?.service?.defaultProductID1 && this.displayFeeInFooter) {
          return this.menuService.getMenuItemByID(this.site,this.order.service.defaultProductID1)
        }
        return of(this.order)
      }
    )).pipe(switchMap(data => {
      if (data && data.name) {
        this.order.service.menuItem1 = data;
      }
      this.outputPrint();
      return of(data)
    }))
  }

  initTemlplateSubscription() {
    this._printOrder = this.printingService.printOrder$.subscribe(
      data => {
        if (data) {
          this.printOrder    = data;
          this.order = data.order
          this.action$ = this.initTemplateData(data.order)
        }
      }
    )
  }

  initTemplateData(order) {
    if (!order) {  return null   }

    this.items      = order.posOrderItems;
    if (!this.payments) {
      this.payments   = order.posPayments
    }

    this.orders     = [];
    if (this.order) { this.orders.push(order) }

    const datepipe: DatePipe = new DatePipe('en-US');
    if (order.orderDate) { order.orderTime = datepipe.transform( order.orderDate, 'HH:mm')     }
    if (this.items)      { this.items      = this.items.filter( item => item.quantity != 0  );     }
    if ( this.payments)  { this.payments   = this.payments.filter(item => item.amountPaid != 0 ); }

    // const item = order as IPOSOrder;
    // item.posOrderItems[0].idRef
    const site = this.siteService.getAssignedSite();
    return this.serviceTypeService.getTypeCached(site, order.serviceTypeID).pipe(
      switchMap(data   => {
        if (!data)  {
          // console.log('no data', this.index, order)
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
    // console.log('outputPrint')
    setTimeout(() => {
      const prtContent     = document.getElementById('printsection');

      if (!prtContent) {
        return
      }
      const content        = `${prtContent.innerHTML}`

      if (!content) {
        return
      }

      this.printingService.updatePrintReady({ready: true, index: this.index});
      this.printReady.emit(true)
      this.outPutPrintReady.emit({ready: true, index: this.index})
    }, 500)
  }

  constructor(
    private settingService  : SettingsService,
    private serviceTypeService: ServiceTypeService,
    private siteService     : SitesService,
    private printingService : PrintingService,
    private renderingService: RenderingService,
    private orderService    : OrdersService,
    public orderMethodsService: OrderMethodsService,
    private menuService:     MenuService,
    private fakeDataService : FakeDataService) { }

  ngOnDestroy() {
    // console.log('on dstroy')
    if (this.appendedStyleElement) {
      // console.log('remove style element', this.appendedStyleElement)
      document.head.removeChild(this.appendedStyleElement);
      this.appendedStyleElement = null;
    }
    this.nonIndentedIndex = 1;
    this.enabledPrintReady = false;
    if ( this._order) {  this._order.unsubscribe()}
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items || changes.itemText) {
      this.nonIndentedIndex = 1;
    }
  }

  getNonIndentedIndex(): number {
    return this.nonIndentedIndex++;
  }

  ngOnInit() {
    if (this.templateInit) {
      this.initTemlplateSubscription();
      return ;
    }

    this.getReceiptWidth();
    this.action$ = this.initSubscriptions().pipe(
        switchMap(data => {  return of(data)  }
        )
      ).pipe(
        switchMap( data => {  return this.getStyles()  }
        )
      ).pipe(
        switchMap(data => {
          this.refreshData();
          return of(data)
        }
      )
    )
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

  isLastIndented(index: number): string | undefined {
    // Filter all indented items from the list
    const indentedItems = this.itemsText.filter(item => item.idRef && item.id !== item.idRef && item.idRef !== 0);

    // Identify the current item
    const currentItem = this.itemsText[index];

    // Check if the current item is indented
    const isIndented = currentItem.idRef && currentItem.id !== currentItem.idRef && currentItem.idRef !== 0;

    if (isIndented) {
      // Find the next indented item, if it exists
      const nextIndentedIndex = indentedItems.indexOf(currentItem) + 1;
      const nextItem = indentedItems[nextIndentedIndex];

      // Check if the next item is indented and if it is within the same group
      if (!nextItem || nextItem.idRef !== currentItem.idRef) {
        return 'section-bottom';
      }
    }

    // Return undefined if the current item is not the last indented item
    return undefined;
  }

  getInterpolatedData() {

    if (!this.orders || !this.orders[0]) { return }
    this.scrubOrders(this.orders[0])

    try {

      if (this.orders && this.headerText) {
        this.interpolatedHeaderTexts    = this.renderingService.refreshStringArrayData(this.headerText, this.orders, 'header')
        this.interpolatedFooterTexts    = this.renderingService.refreshStringArrayData(this.footerText, this.orders, 'footer')
      }

      if (this.items && this.itemText) {
        this.interpolatedItemTexts      = this.renderingService.refreshStringArrayData(this.itemText, this.items, 'items')
        let itemTexts = [] as any[]
        this.interpolatedItemTexts.forEach((data, i) => {
          itemTexts.push({item: data, id: this.items[i].id, idRef: this.items[i].idRef})
        })
        this.itemsText = itemTexts;
      }

      if (this.payments && this.paymentsText) {
        this.interpolatedPaymentsTexts  = this.renderingService.refreshStringArrayData(this.paymentsText, this.payments, 'payments')
      }

      if (this.payments && this.paymentsCreditText) {
        this.payments = this.setPaymentData(this.payments)
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

  setPaymentData(payments) {
    payments.forEach(data => {
      if (data?.tipAmount ==0) {
        data.tipAmount = null
      }
    })
    return payments
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

  // getStyles() {
  //   const site                = this.siteService.getAssignedSite();
  //   const receiptStyle$       = this.settingService.getSettingByNameCached(site, 'ReceiptStyles')
  //   return receiptStyle$.pipe(
  //     switchMap( receiptStyles => {
  //         if (receiptStyles) {
  //           const styles    = this.renderingService.interporlateFromDB(receiptStyles.text)
  //           const style     = document.createElement('style');
  //           style.innerHTML = styles;
  //           document.head.appendChild(style);
  //         }
  //         return of(receiptStyles)
  //       }
  //     ),
  //     catchError(err => {
  //       this.orderService.notificationEvent('Error getting styles for receipt', 'Error')
  //       return of(null)
  //     })
  //   )
  // }

  getStyles() {
    const site = this.siteService.getAssignedSite();

    const receiptStyle$ = this.settingService.getSettingByNameCached(site, 'ReceiptStyles');
    return receiptStyle$.pipe(
      switchMap(receiptStyles => {
        if (receiptStyles) {
          const styles = this.renderingService.interporlateFromDB(receiptStyles.text);
          const style = document.createElement('style');
          style.innerHTML = styles;
          document.head.appendChild(style);

          // Store the reference to the appended style element
          this.appendedStyleElement = style;
        }
        return of(receiptStyles);
      }),
      catchError(err => {
        this.orderService.notificationEvent('Error getting styles for receipt', 'Error');
        return of(null);
      })
    );
  }

}


