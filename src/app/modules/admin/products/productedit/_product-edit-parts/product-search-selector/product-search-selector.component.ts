import { Component, OnInit, Input , EventEmitter,
  Output, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
  import { IProduct, ISite }  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { MenuService } from 'src/app/_services';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector: 'product-search-selector2',
  templateUrl: './product-search-selector.component.html',
  styleUrls: ['./product-search-selector.component.scss']
})
export class ProductSearchSelector2Component implements OnInit, AfterViewInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  itemNameInput: string; //for clear button
  @Input() formFieldClass     = 'formFieldClass-standard'
  @Input() inputForm:         UntypedFormGroup;
  @Input() searchForm:        UntypedFormGroup;
  @Input() id                : any;
  @Input() productLookupField: string;
  @Input() description       : string;

  searchPhrase:               Subject<any> = new Subject();
  item:                       IProduct;
  site:                       ISite;
  menuItem: IMenuItem;

  get productLookupControl()   { return this.inputForm.get(this.productLookupField) as UntypedFormControl};

  products$                   : Observable<ProductSearchModel>;
  products                    : IProduct[]

  results$ = this.searchPhrase.pipe(
    debounceTime(225),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
      this.searchList(searchPhrase)
    )
  )

  searchList(searchPhrase):  Observable<any> {
    const site  = this.siteService.getAssignedSite();
    const model = this.initSearchModel(searchPhrase)
    return this.menuService.getProductsBySearch(site, model)
  }

  ngAfterViewInit() {
    if (!this.input) { return  }
    fromEvent(this.input.nativeElement,'keyup')
      .pipe(
          filter(Boolean),
          debounceTime(225),
          distinctUntilChanged(),
          tap((event:KeyboardEvent) => {
            const search  = this.input.nativeElement.value
            this.refreshSearch(search);
          })
      )
    .subscribe();
  }

  constructor(  private menuService : MenuService,
                private fb             : UntypedFormBuilder,
                private siteService    : SitesService,
               ) {
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.site = this.siteService.getAssignedSite();
    if (this.inputForm) {
      if (this.id != 0) {
        this.id = this.inputForm.controls[this.productLookupField].value;
      }
    }
    this.initForm();
    this.getName(this.id)
  }

  initForm(){
    this.searchForm = this.fb.group({
      itemLookup: [],
    })
  }

  getName(id: number) {
    if (!id)             {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      this.menuService.getMenuItemByID(site, this.id).subscribe( data => {
        this.menuItem = data;
        if (data) {
          const item =  { itemLookup: data.name  }
          this.searchForm.patchValue( item )
        }
      })
    }
  }


  refreshSearch(search: any){
    if (search) {
      this.searchPhrase.next( search )
    }
  }

  searchItems(name: string) {
    if (!name) { return }
    this.searchPhrase.next(name);
  }

  selectItem(item: IProduct){

    if (!item) { return }
    this.itemSelect.emit(item)

    const prod =  { itemLookup: item.name }
    this.searchForm.patchValue( prod )

    if (this.productLookupField === 'defaultProductID1') {
      const prod =  { defaultProductID1: item.id }
      this.inputForm.patchValue( prod )
      return;
    }

    if (this.productLookupField === 'defaultProductID2') {
      const prod =  { defaultProductID2: item.id }
      this.inputForm.patchValue( prod )
      return;
    }

    if (this.productLookupField === 'productID') {
      const prod = { productID : item.id }
      this.inputForm.patchValue( prod )
      return;
    }
  }

  onChange(selected: any) {
    const item = selected.option.value as IProduct;

    if (item) {
      this.selectItem(item)

      this.item = item
      if (!item || !item.name){
        return ''
      }  else {
        return item.name;
      }
    }
  }

  initSearchModel(searchPhrase: string): ProductSearchModel {
    const model = {} as ProductSearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.name        = searchPhrase;
    return model;
  }

  initModel(id: number): ProductSearchModel {
    const model = {} as ProductSearchModel
    model.pageSize    = 100;
    model.currentPage = 1;
    model.productID   = id;
    return model;
  }

}


