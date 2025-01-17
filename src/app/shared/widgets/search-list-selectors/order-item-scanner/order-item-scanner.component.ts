import { Component,Output,OnInit,
  ViewChild ,ElementRef,
   EventEmitter,OnDestroy, AfterViewInit,
   Input,
   } from '@angular/core';
import { MenuService, OrdersService } from 'src/app/_services';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
// https://github.com/rednez/angular-user-idle
const { Keyboard } = Plugins;

@Component({
  selector: 'order-item-scanner',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,
  SharedPipesModule],
  templateUrl: './order-item-scanner.component.html',
  styleUrls: ['./order-item-scanner.component.scss']
})
export class OrderItemScannerComponent implements  OnDestroy, OnInit {

  @Input() scanMode: boolean

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

  scan(barcode: string){
    this.orderMethodService.addObservable(this.addItemToOrder(barcode))
  }

  addItemToOrder(barcode: string): Observable<unknown> {
    console.log('barcode' , barcode)
    this.initForm()
    if (!this.order) {return}
    if (!barcode) { return }
    if (!this.scanMode) {
      this.siteService.notify('Select Driver or Prep', 'close',4000)
      return
    }
    return this.orderMethodService.scanCheckInItem(barcode,  this.scanMode, this.order.id).pipe(switchMap(data => {
      this.orderMethodService.updateOrder(data)
      return of(data)
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
