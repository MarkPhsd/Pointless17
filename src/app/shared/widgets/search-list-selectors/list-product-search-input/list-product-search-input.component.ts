import { Component,  Inject,  Input, Output, OnInit, Optional,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter,OnDestroy, ChangeDetectorRef,ViewChildren, QueryList } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IProductSearchResults } from 'src/app/_services/menu/menu.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap, map } from 'rxjs/operators';
import { Subject ,fromEvent, Subscription } from 'rxjs';
import { IPOSOrder,  } from 'src/app/_interfaces';
import { Capacitor, Plugins, KeyboardInfo } from '@capacitor/core';
import {  POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { ScaleService } from 'src/app/_services/system/scale-service.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { C } from '@angular/cdk/keycodes';

const { Keyboard } = Plugins;

@Component({
  selector: 'app-list-product-search-input',
  templateUrl: './list-product-search-input.component.html',
  styleUrls: ['./list-product-search-input.component.scss']
})
export class ListProductSearchInputComponent implements  OnDestroy, AfterViewInit {

  get platForm() {  return Capacitor.getPlatform(); }
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchPhrase:  Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  searchItems$  : Subject<IProductSearchResults[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        {
          this.refreshSearch()
          return null
        }
    )
  )

  searchForm          : FormGroup;
  keyboardOption      = false;
  keyboardDisplayOn   = false;
  toggleButton        = 'toggle-buttons-wide';
  _order              :   Subscription;
  order               :   IPOSOrder;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private fb             :        FormBuilder,
    private orderService   :        OrdersService,
    private orderMethodService    : OrderMethodsService,
  )
  {
    this.initForm();
    this.initSubscriptions();
    if (this.platForm != 'web') {
      this.keyboardDisplayOn = true
      Keyboard.hide()
    }
  }

 async initForm() {
    this.searchForm   = this.fb.group( {
      itemName          : ['']
    })
  }

  async ngAfterViewInit() {
    await  this.initForm();
    if (!this.input ) { console.log('input undefined')
      return
    }
    // console.log('initialized listproductSearch')
    this.initSearchSubscription()
    this.hideKeyboardTimeOut();
  }

  initSearchSubscription() {
    fromEvent(this.input.nativeElement,'keyup')
    .pipe(
      filter(Boolean),
      debounceTime(500),
      distinctUntilChanged(),
      tap((event:KeyboardEvent) => {
        const search  = this.input.nativeElement.value
        this.refreshSearch();
      })
    ).subscribe();
  }

  hideKeyboardTimeOut() {
    if (this.platForm != 'web') {
      setTimeout(()=> {
          this.input.nativeElement.focus();
          Keyboard.hide()
      }, 200 )
    }
  }

  ngOnDestroy() {
    console.log('destroyed')
    this._order.unsubscribe();
  }

  //this is called from subject rxjs obversablve above constructor.
  async refreshSearch() {
    const barcode =  this.input.nativeElement.value
    console.log('barcode', barcode)
    await this.addItemToOrder(barcode)
  }

  addItemToOrder(barcode: string) {
    this.orderMethodService.scanBarcodeAddItem(barcode, 1, this.input)
  }
}
// this.outPutMethod.emit(search);

