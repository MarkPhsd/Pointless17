import { Component,Output,OnInit,
         ViewChild ,ElementRef,
          EventEmitter,OnDestroy, AfterViewInit,
          } from '@angular/core';
import { MenuService, OrdersService } from 'src/app/_services';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap, map, concatMap } from 'rxjs/operators';
import { Subject ,fromEvent, Subscription, of, forkJoin, ReplaySubject } from 'rxjs';
import { IPOSOrder,  } from 'src/app/_interfaces';
import { Capacitor, Plugins } from '@capacitor/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
// https://github.com/rednez/angular-user-idle
const { Keyboard } = Plugins;

@Component({
  selector: 'list-product-search-input',
  templateUrl: './list-product-search-input.component.html',
  styleUrls: ['./list-product-search-input.component.scss']
})
export class ListProductSearchInputComponent implements  OnDestroy, OnInit {

  scans = [] as unknown[];
  obs$ : Observable<unknown>[];
  barcodeScanner$ : Observable<unknown>;
  _scanners = new ReplaySubject <unknown>()
  posDevice       : ITerminalSettings
  _posDevice      : Subscription;

  get platForm() {  return Capacitor.getPlatform(); }
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  action$: Observable<unknown>;

  searchPhrase:  Subject<unknown> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  searchForm          : UntypedFormGroup;
  keyboardOption      = false;
  keyboardDisplayOn   = false;
  toggleButton        = 'toggle-buttons-wide';
  _order              :  Subscription;
  order               : IPOSOrder;

  transactionUISettings : TransactionUISettings;
  requireEnter          : boolean;




  initSubscriptions() {
    this.orderMethodsService.scanner$.subscribe(data =>  {
      this.input.nativeElement.focus();
    })

    this._posDevice = this.uiSettingService.posDevice$.subscribe(data => {
      this.posDevice = data;
    })

    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      if (!data) {
        this.order = null
      }

      if ( data ) {
        if (!this.order) {
          this.input.nativeElement.focus();
          this.order = data
        } else

          if ( (this.order && this.order?.id != data.id) || !this.order ) {
            this.input.nativeElement.focus();
          }
          if (this.order.clientID != data.clientID) {
            this.input.nativeElement.focus();
          }
          if (this.order.customerName != data.customerName) {
            this.input.nativeElement.focus();
          }
      }
      this.order = data
    })
    this.uiSettingService.transactionUISettings$.subscribe(data => {
      if (!data) { return}
      this.requireEnter = data.requireEnterTabBarcodeLookup;
      this.transactionUISettings = data;
      this.initUISettings(data);
    })
  }

  constructor(
    private fb             :        UntypedFormBuilder,
    private orderMethodService    : OrderMethodsService,
    private settingService        : SettingsService,
    private siteService           : SitesService,
    private uiSettingService      : UISettingsService,
    public  orderMethodsService   : OrderMethodsService,
    private serviceTypeService    : ServiceTypeService,
  )
  {   }

  ngOnInit() {
    this.initForm();
    this.initSubscriptions();
    if (this.searchForm)  {
      this.getUISettings()
    }
  }

  getUISettings() {
    try {
      if (this.transactionUISettings) {
        this.initUISettings(this.transactionUISettings)
      }
      const site = this.siteService.getAssignedSite()
      this.settingService.getSettingByName(site, 'UITransactionSetting').subscribe( data => {
        if (data && data.text) {
          this.transactionUISettings =  JSON.parse(data.text) as  TransactionUISettings;
          this.initUISettings(this.transactionUISettings)
          }
        }
      )
    } catch (error) {
      console.log('search Items', error)
    }
  }

  initUISettings(ui: TransactionUISettings) {
    this.requireEnter = ui?.requireEnterTabBarcodeLookup;
    if (!this.requireEnter) {   this.initSearchSubscription() }
    this.hideKeyboardTimeOut();
    if ( this.platForm != 'android') {return}
    this.keyboardDisplayOn = true
    if (this.platForm != 'android') {  }
  }

  ngOnDestroy(): void {
    if (this._order) { this._order.unsubscribe()}
  }

  initSearchSubscription() {
    try {
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          if (this.requireEnter) { return}
          const search  = this.input.nativeElement.value
          this.refreshSearch();
        })
      ).subscribe();
    } catch (error) {
    }
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      itemName          : ['']
    })
  }

  onUpdate() {
    if (this.requireEnter) {
      const barcode  =  this.input.nativeElement.value;
      if (!this.scans) { this.scans = [] };
      this.scan(barcode);
    }
  }

  getOrderObs() {
    if (!this.order) {
      const site = this.siteService.getAssignedSite()
      return this.orderMethodsService.newOrderWithPayloadMethod(site, null).pipe(switchMap(data => {
          this.order = data;
          this.initForm()
          return of(data)
        }
      ))
    }
    return of(this.order)
  }

  addNewOrder() {
    const site = this.siteService.getAssignedSite();
    if (this.posDevice) {
      if (this.posDevice.defaultOrderTypeID  && this.posDevice.defaultOrderTypeID != 0) {
        const serviceType$ = this.serviceTypeService.getType(site, this.posDevice.defaultOrderTypeID)
        return serviceType$.pipe(switchMap(data => {
            return of(data)
        })).pipe(switchMap(data => {
            const order$ = this.getNewOrder(site, data)
            return order$
        }))
      }
    }
    return this.getNewOrder(site, null)
  }

  getNewOrder(site, serviceType) {
    if (this.order) { return of(this.order)}
    return this.orderMethodsService.newOrderWithPayloadMethod(site, serviceType).pipe(
      switchMap(data => {
        return of(data)
    }))
  }

  scan(barcode: string){
    this.orderMethodService.addObservable(this.addItemToOrder(barcode))
  }

  addItemToOrder(barcode: string): Observable<unknown> {
    this.initForm()
    const order$ = this.addNewOrder()
    const newItem$ =  this.orderMethodService.addItemToOrderFromBarcode(barcode, this.input, this.assignedItem)
    return order$.pipe(switchMap(data => {
      return  newItem$
    }))

  }

  hideKeyboardTimeOut() {
    if (this.platForm  != 'android') {
      setTimeout(()=> {
          this.input.nativeElement.focus();
      }, 200 )
    }
  }

  refreshSearch() {
    const barcode =  this.input.nativeElement.value
    this.action$ =  this.addItemToOrder(barcode)
  }

  get assignedItem() {
    let assignedItems
    if (this.orderMethodService.assignPOSItems && this.orderMethodService.assignPOSItems[0]) {
      assignedItems = this.orderMethodService.assignPOSItems[0]
    }
    return assignedItems
  }

}
