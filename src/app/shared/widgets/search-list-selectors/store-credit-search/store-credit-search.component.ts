import { Component,Output,OnInit,
  ViewChild ,ElementRef,
   EventEmitter,OnDestroy,
   } from '@angular/core';
import { OrdersService } from 'src/app/_services';
import { IProductSearchResults } from 'src/app/_services/menu/menu.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap, map } from 'rxjs/operators';
import { Subject ,fromEvent, Subscription } from 'rxjs';
import { IPOSOrder,  } from 'src/app/_interfaces';
import { Capacitor, Plugins } from '@capacitor/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IStoreCreditSearchModel, StoreCreditMethodsService, StoreCreditResultsPaged } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'store-credit-search',
  templateUrl: './store-credit-search.component.html',
  styleUrls: ['./store-credit-search.component.scss']
})

export class StoreCreditSearchComponent implements OnInit,OnDestroy {

  get platForm() {  return Capacitor.getPlatform(); }
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  @Output() outPutResults  = new EventEmitter();

  searchPhrase:  Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  searchForm          : FormGroup;
  keyboardOption      = false;
  keyboardDisplayOn   = false;
  toggleButton        = 'toggle-buttons-wide';

  _order              :   Subscription;
  order               :   IPOSOrder;

  searchItems$  : Subject<StoreCreditResultsPaged> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        {
          console.log(searchPhrase)
          this.refreshSearch(searchPhrase)
          return null
        }
    )
  )

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private fb                       : FormBuilder,
    private orderService             : OrdersService,
    private storeCreditService       : StoreCreditService,
    private sitesService             : SitesService,
    private storeCreditMethodsService: StoreCreditMethodsService,
  )
  {   }

  ngOnInit(): void {
    this.initForm();
    if (!this.input ) { return }
    this.hideKeyboardTimeOut();
    if ( this.platForm != 'android' ) {return}
    this.keyboardDisplayOn = true
    if (this.platForm != 'android') {
      // Keyboard.hide()
    }
  }

  ngOnDestroy(): void {
    if (this._order) { this._order.unsubscribe()}
  }


  initSearchSubscription() {
    if (!this.searchForm) { return }
    if (!this.input ) { return }
    console.log('init search subscription')
    fromEvent(this.input.nativeElement,'keyup')
    .pipe(
      filter(Boolean),
      debounceTime(500),
      distinctUntilChanged(),
      tap((event:KeyboardEvent) => {
        const search  = this.input.nativeElement.value
        console.log('search', search)
        this.refreshSearch(search);
      })
    ).subscribe();
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      itemName : ['']
    })
    this.initSearchSubscription()
  }

  hideKeyboardTimeOut() {
    if ( this.platForm != 'android' ) {return}
    if (this.platForm != 'android') {
      setTimeout(()=> {
          this.input.nativeElement.focus();
      }, 200 )
    }
  }

  async refreshSearch(searchPhrase) {
    if (!searchPhrase) { return }
    try {
      const search = this.getResults(searchPhrase);
      this.outPutResults.emit(search)
    } catch (error) {
      console.log(error)
    }
    this.searchForm.patchValue({itemName: ''})
  }

  getResults(scan: string) {
    if (!scan) {
      const searchModel = {} as IStoreCreditSearchModel;
      searchModel.cardNumber = scan;
      return searchModel
    }
    const site = this.sitesService.getAssignedSite()
    const searchModel = {} as IStoreCreditSearchModel;
    searchModel.cardNumber = scan;
    this.storeCreditMethodsService.updateSearchModel(searchModel)
    return searchModel
    //
  }

}
