import { Component,Output,OnInit,
  ViewChild ,ElementRef,
   EventEmitter,OnDestroy,
   } from '@angular/core';
import { OrdersService } from 'src/app/_services';
import { IProductSearchResults } from 'src/app/_services/menu/menu.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap, map } from 'rxjs/operators';
import { Subject ,fromEvent, Subscription } from 'rxjs';
import { IPOSOrder,  } from 'src/app/_interfaces';
import { Capacitor, Plugins } from '@capacitor/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IStoreCreditSearchModel, StoreCreditMethodsService, StoreCreditResultsPaged } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'store-credit-search',
  standalone: true,

  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './store-credit-search.component.html',
  styleUrls: ['./store-credit-search.component.scss']
})

export class StoreCreditSearchComponent implements OnInit,OnDestroy {

  get platForm() {  return Capacitor.getPlatform(); }
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  @Output() outPutResults  = new EventEmitter();

  searchPhrase:  Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  searchForm          : UntypedFormGroup;
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
          this.refreshSearch(searchPhrase)
          return null
        }
    )
  )

  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private fb                       : UntypedFormBuilder,
    private sitesService             : SitesService,
    public orderMethodsService       : OrderMethodsService,
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
    }
  }

  ngOnDestroy(): void {
    if (this._order) { this._order.unsubscribe()}
  }

  initSearchSubscription() {
    if (!this.searchForm) { return }
    if (!this.input ) { return }
    fromEvent(this.input.nativeElement,'keyup')
    .pipe(
      filter(Boolean),
      debounceTime(500),
      distinctUntilChanged(),
      tap((event:KeyboardEvent) => {
        const search  = this.input.nativeElement.value
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

  refreshSearch(searchPhrase) {
    if (!searchPhrase) { return }
    try {
      const search = this.getResults(searchPhrase);
      this.outPutResults.emit(search)
    } catch (error) {
      console.log(error)
    }
    return;
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
  }

}
