import { Component,Output,OnInit,
         ViewChild ,ElementRef,
          EventEmitter,OnDestroy, AfterViewInit,
          } from '@angular/core';
import { MenuService, OrdersService } from 'src/app/_services';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap, map } from 'rxjs/operators';
import { Subject ,fromEvent, Subscription } from 'rxjs';
import { IPOSOrder,  } from 'src/app/_interfaces';
import { Capacitor, Plugins } from '@capacitor/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
// https://github.com/rednez/angular-user-idle
const { Keyboard } = Plugins;

@Component({
  selector: 'list-product-search-input',
  templateUrl: './list-product-search-input.component.html',
  styleUrls: ['./list-product-search-input.component.scss']
})
export class ListProductSearchInputComponent implements  OnDestroy, OnInit {

  get platForm() {  return Capacitor.getPlatform(); }
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();


  searchPhrase:  Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  searchForm          : FormGroup;
  keyboardOption      = false;
  keyboardDisplayOn   = false;
  toggleButton        = 'toggle-buttons-wide';
  _order              :   Subscription;
  order               :   IPOSOrder;

  transactionUISettings:TransactionUISettings;

  requireEnter: boolean;

  // searchItems$  : Subject<IProductSearchResults[]> = new Subject();
  // _searchItems$ = this.searchPhrase.pipe(
  //   debounceTime(250),
  //     distinctUntilChanged(),
  //     switchMap(searchPhrase =>
  //       {
  //         if (this.requireEnter) {return}
  //         this.refreshSearch()
  //         return null;
  //       }
  //   )
  // )

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
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
    private fb             :        FormBuilder,
    private orderService   :        OrdersService,
    private menuItemService :       MenuService,
    private orderMethodService    : OrderMethodsService,
    private settingService        : SettingsService,
    private siteService           : SitesService,
    private uiSettingService      : UISettingsService,
  )
  {   }

  ngOnInit() {

    const site = this.siteService.getAssignedSite()
    this.initForm();
    this.initSubscriptions()
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
      console.log('initSearchSubscription', error)
    }
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      itemName          : ['']
    })
  }

  hideKeyboardTimeOut() {
    if ( this.platForm != 'android' ) {return}
    if (this.platForm != 'android') {
      setTimeout(()=> {
          this.input.nativeElement.focus();
          Keyboard.hide()
      }, 200 )
    }
  }

  async refreshSearch() {
    const barcode =  this.input.nativeElement.value
    await this.addItemToOrder(barcode)
  }

  async onUpdate() {
    if (this.requireEnter) {
      const barcode =  this.input.nativeElement.value
      await this.addItemToOrder(barcode)
    }
  }

  async addItemToOrder(barcode: string) {

    const site = this.siteService.getAssignedSite();

    const item$ = this.menuItemService.getMenuItemByBarcode(site, barcode);

    item$.subscribe(data => {
      console.log('data from scan', data)
      if ( !data ) {
        this.orderMethodService.scanBarcodeAddItem(barcode, 1, this.input)
      } else
      {
        if (data.length == 1 || data.length == 0) {
          this.orderMethodService.scanBarcodeAddItem(barcode, 1, this.input)
        } else {
          this.listBarcodeItems(data, this.order)
        }
      }
    })

    this.initForm()
  }

  //this.orderMethodService.processAddItem
  listBarcodeItems(items: IMenuItem[], order: IPOSOrder) {
    if (items.length == 0) { return }
    this.orderMethodService.openProductsByBarcodeList(items, order)
  }

}
