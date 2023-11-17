import { HttpClient } from '@angular/common/http';
import { Component, Input , OnChanges, OnInit, TemplateRef, ViewChild, OnDestroy, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { of, switchMap, Observable, Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { PrinterLocationsService } from 'src/app/_services/menu/printer-locations.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IAppConfig } from 'src/app/_services/system/app-init.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrepPrintingServiceService } from 'src/app/_services/system/prep-printing-service.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { CoachMarksClass, CoachMarksService } from 'src/app/shared/widgets/coach-marks/coach-marks.service';

@Component({
  selector: 'app-order-header',
  templateUrl: './order-header.component.html',
  styleUrls: ['./order-header.component.scss']
})
export class OrderHeaderComponent implements OnInit , OnChanges, OnDestroy {

  printLabels$: Observable<any>;
  @Input() hideButtonOptions: boolean;
  @Input() qrOrder: boolean;
  @Input() uiTransactionSettings  = {} as TransactionUISettings;
  @Input() mainPanel : boolean;
  @Input() order: IPOSOrder
  @Input() isUserStaff = false

  @ViewChild('coachingSplit', {read: ElementRef}) coachingSplit: ElementRef;
  @ViewChild('coachingFire', {read: ElementRef}) coachingFire: ElementRef;
  @ViewChild('coachingLabel', {read: ElementRef}) coachingLabel: ElementRef;
  @ViewChild('coachingRefresh', {read: ElementRef}) coachingRefresh: ElementRef;

  @ViewChild('qrCodeToggle') qrCodeToggle: TemplateRef<any>;
  qrCode$ : Observable<any>;

  _posDevice: Subscription;
  _uiTransactionSettings: Subscription;
  user          : any;
  _user: Subscription;

  posDevice       :  ITerminalSettings;
  devicename = localStorage.getItem('devicename')
  qrDisplayOn: boolean;
  orderqrCode: string;
  isOrderClaimed: boolean;
  href: string;
  hidePrint = false;
  action$: Observable<any>;
  isApp = this.platFormService.isApp()

  site = this.siteService.getAssignedSite();
  locations$ = this.locationsService.getLocationsCached();

  userSubscriber() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })
  }
  transactionUISettingsSubscriber() {
    try {
      this._uiTransactionSettings = this.uiSettingsService.transactionUISettings$.subscribe( data => {
        if (data) {
          this.uiTransactionSettings = data;
        }
      });
    } catch (error) {

    }

    try {
      this._posDevice = this.uiSettingsService.posDevice$.subscribe(data => {
        this.posDevice = data;
        // data?.labelPrinter
      })
    } catch (error) {

    }
  }

  constructor(
             private ordersService:   OrdersService,
             public  router: Router,
             public  printingService: PrintingService,
             public  platFormService: PlatformService,
             private orderMethodsService: OrderMethodsService,
             private paymentsMethodsProcessService: PaymentsMethodsProcessService,
             private siteService : SitesService,
             private locationsService: PrinterLocationsService,
             private uiSettingsService: UISettingsService,
             public  authenticationService: AuthenticationService,
             private coachMarksService: CoachMarksService,
             public  prepPrintingService: PrepPrintingServiceService,
             private httpClient : HttpClient,
    ) {

    this.orderMethodsService.currentOrder$.subscribe(data => {
      this.isOrderClaimed = this.orderMethodsService.IsOrderClaimed
    })
    this.transactionUISettingsSubscriber();
    this.userSubscriber()

  }

  ngOnInit() {
    this.href = this.router.url;
    this. refreshPrintOption()
  }

  ngOnDestroy() {
    if (this._uiTransactionSettings) { this._uiTransactionSettings.unsubscribe()}
    if (this._posDevice) { this._posDevice.unsubscribe()}
    if (this._user) { this._user.unsubscribe()}
  }

  ngOnChanges() {
    this.refreshPrintOption()
  }

  printReceipt(){
    const order = this.order;

    console.log('preview')
    this.printingService.previewReceipt(this.uiTransactionSettings?.singlePrintReceipt,order)
  }

  refreshPrintOption() {
    this.hidePrint = false;
    if (this.router.url.substring(0, '/currentorder'.length ) === '/currentorder') {
      this.hidePrint = true;
      return;
    }
  }

  qrCodeDisplayToggle() {
    this.qrDisplayOn = !this.qrDisplayOn;
    const orderCode = this.order.orderCode;
    const config$ =  this.httpClient.get('assets/app-config.json').pipe(switchMap(data => {
      const config = data as unknown as IAppConfig;
      const path = `${config.appUrl}qr-receipt;orderCode=${orderCode}`
      return of(path)
    }))
    this.qrCode$ = config$;
  }

  get qrCodeDisplayView()   {
    if (this.qrDisplayOn) { return this.qrCodeToggle}
    return null;
  }

  get isSale() {
    if (this.order && this.order.service && (this.order.service.filterType == 1 ||
                                             (this.order.service.name && this.order.service.name.toLowerCase() === 'purchase order'))) {
      return false
    }
    return true
  }

  reSendOrder() {
    let extiOnFire : boolean
    if (this.posDevice) {
      if (this.posDevice.exitOrderOnFire) {
        extiOnFire = this.posDevice.exitOrderOnFire
      }
    }
    this.action$ = this.paymentsMethodsProcessService.sendToPrep(this.order, true, this.uiTransactionSettings).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  sendOrder() {
    // const expo$ = this.paymentsMethodsProcessService.sendToPrep
    let extiOnFire : boolean
    if (this.posDevice) {
      // this.posDevice.
      if (this.posDevice.exitOrderOnFire) {
        extiOnFire = this.posDevice.exitOrderOnFire
      }
    }
    this.action$ = this.paymentsMethodsProcessService.sendToPrep(this.order, true, this.uiTransactionSettings  ).pipe(
      switchMap(data => {
        if (extiOnFire) {
          this.clearOrder()
        }
        return of(data)
      })
    )
  }

  printLabels() {
    this.printLabels$ = this.printingService.printLabels(this.order , true).pipe(
      switchMap(data => {
          this.printingService.printJoinedLabels();
          return of(data)
        }
      )
    ).pipe(switchMap(data => {
      return  this._refreshOrder()
    }))
  }

  clearOrder() {
    this.orderMethodsService.clearOrder()
  }

  refreshOrder() {
    this.action$ = this._refreshOrder()
  }

  _refreshOrder() {
    const site = this.siteService.getAssignedSite()
    return this.ordersService.getOrder(site, this.order.id.toString(), this.order.history).pipe(switchMap(data => {
      this.orderMethodsService.updateOrder(data)
      return of(data)
    }))
  }

  assignPriceColumn(value: number){
    const site = this.siteService.getAssignedSite()
    if (this.order) {
      this.order.priceColumn = value
      // console.log(this.order.id,value)
      this.action$ = this.ordersService.setOrderPriceColumn(this.order.id, value).pipe(
        switchMap(data => {
          // this.siteService.notify(`Price Column Set: ${value}`, 'Result', 2000)
          this.order.priceColumn = data;
          this.orderMethodsService.updateOrder(this.order)
          return of(data)
        })
      )
    }
  }

  initPopOver() {
    if (this.user?.userPreferences?.enableCoachMarks ) {
      this.coachMarksService.clear()
      this.addCoachingList()
      this.coachMarksService.showCurrentPopover();
    }
  }

  addCoachingList() {
    this.coachMarksService.add(new CoachMarksClass(this.coachingSplit.nativeElement, "Split Check: If you see the split button, then you may assign items to an individual group. This is good for dining when you need to assign items to a person or number of persons in a large group. Later when you want to close the order, the split will be ready to use for closing the sale."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingFire.nativeElement, "Fire: Sends the order to kitchen or prep area."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingLabel.nativeElement, "Label: Prints the items that should print to labels."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingRefresh.nativeElement, "Refresh: Sometimes a manager will void from another device, this will update your screen."));
  }
}
