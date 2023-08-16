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
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
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

  private observablesArraySubject = new BehaviorSubject<Observable<any>[]>([]);
  public observablesArray$ = this.observablesArraySubject.asObservable();

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

  addObservable(newObservable: Observable<any>): void {
    const currentObservables = this.observablesArraySubject.getValue();
    newObservable = newObservable.pipe(
      take(1),
      finalize(() => this.removeObservable(newObservable))
    );
    this.observablesArraySubject.next([...currentObservables, newObservable]);
  }

  removeObservable(observableToRemove: Observable<any>): void {
    const currentObservables = this.observablesArraySubject.getValue();
    const updatedObservables = currentObservables.filter(
      observable => observable !== observableToRemove
    );
    this.observablesArraySubject.next(updatedObservables);
  }

  initSubscriptions() {
    this.orderMethodsService.scanner$.subscribe(data =>  {
      this.input.nativeElement.focus();
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
    })
  }

  constructor(
    private fb             :        UntypedFormBuilder,
    private menuItemService :       MenuService,
    private orderMethodService    : OrderMethodsService,
    private settingService        : SettingsService,
    private siteService           : SitesService,
    private uiSettingService      : UISettingsService,
    public orderMethodsService: OrderMethodsService,
  )
  {   }

  ngOnInit() {
    const site = this.siteService.getAssignedSite()
    this.initForm();
    this.initSubscriptions();

    if (this.searchForm)  {
      try {
        this.settingService.getSettingByName(site, 'UITransactionSetting').subscribe( data => {

          if (data && data.text) {
              this.transactionUISettings =  JSON.parse(data.text) as  TransactionUISettings;
              this.requireEnter = this.transactionUISettings.requireEnterTabBarcodeLookup;
              if (!this.requireEnter) {   this.initSearchSubscription() }

              this.hideKeyboardTimeOut();
              if ( this.platForm != 'android') {return}
              this.keyboardDisplayOn = true
              if (this.platForm != 'android') {  }
            }
          }
        )

      } catch (error) {
        console.log('search Items', error)
      }
    }
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
  }

  scan(barcode: string){
    this.addObservable(this.addItemToOrder(barcode))
  }

  addItemToOrder(barcode: string): Observable<unknown> {
    const site = this.siteService.getAssignedSite();
    this.initForm()
    const item$ = this.menuItemService.getMenuItemByBarcode(site, barcode, this.order?.clientID);

    return   item$.pipe(switchMap( data => {
        if ( !data ) {
          return this.orderMethodService.processItemPOSObservable( this.order, barcode, null, 1, this.input, 0, 0,
                                                                   this.assignedItem, this.orderMethodService.assignPOSItems)
        } else
        {
          if (data.length == 1 || data.length == 0) {
            return this.orderMethodService.processItemPOSObservable(this.order, barcode, data[0], 1,
                                                                    this.input, 0, 0, this.assignedItem,
                                                                    this.orderMethodService.assignPOSItems);
          } else {
            this.listBarcodeItems(data, this.order)
          }
        }
        return of(data);
      })
    )
  }

  hideKeyboardTimeOut() {
    // if ( this.platForm != 'android' ) {return}
    if (this.platForm  != 'android') {
      setTimeout(()=> {
          // console.log('focus')
          this.input.nativeElement.focus();
          if (this.platForm != 'android' || this.platForm.toLowerCase() == 'electron') {
            console.log(this.platForm)
            try {
              // Keyboard.hide()
            } catch (error) {

            }
          }
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
      assignedItems =this.orderMethodService.assignPOSItems[0]
    }
    return assignedItems
  }

  listBarcodeItems(items: IMenuItem[], order: IPOSOrder) {
    if (items.length == 0) { return }
    this.orderMethodService.openProductsByBarcodeList(items, order)
  }

}
