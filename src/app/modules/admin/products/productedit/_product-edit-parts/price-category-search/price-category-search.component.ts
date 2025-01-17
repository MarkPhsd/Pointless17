import { Component, OnInit, Input , EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, OnChanges} from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISite } from 'src/app/_interfaces';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { PriceCategories } from 'src/app/_interfaces/menu/price-categories';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Subject ,fromEvent } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-price-category-search',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    FormsModule,ReactiveFormsModule,
  ],
  templateUrl: './price-category-search.component.html',
  styleUrls: ['./price-category-search.component.scss'],
})
export class PriceCategorySearchComponent implements OnInit,  AfterViewInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect       = new EventEmitter();
  @Input() isInventory      : boolean;
  @Input() inputForm        : UntypedFormGroup;
  @Input() searchForm:        UntypedFormGroup;
  @Input() searchField:       UntypedFormControl;
  @Input() id               : number;
  @Input() name:              string;
  @Input() doNotPassName      :string;
  searchPhrase:               Subject<any> = new Subject();
  item:                       PriceCategories;
  site:                       ISite;

  results$ = this.searchPhrase.pipe(
    debounceTime(225),
    distinctUntilChanged(),
    switchMap(searchPhrase => {
        return this.priceCategories.searchPriceCategories(this.site,  searchPhrase)
      }
    )
  )

  ngAfterViewInit() {
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

  get priceCategoryControl()  {
    const field = this.getField()
    return this.inputForm.get(field) as UntypedFormControl
  };

  getField() {
    let field = ""
    if (this.isInventory) { field ="priceCategoryID"  }
    if (!this.isInventory) { field ="priceCategory"  }
    return field;
  }

  constructor(
    public route           : ActivatedRoute,
    private priceCategories: PriceCategoriesService,
    private fb             : UntypedFormBuilder,
    private siteService    : SitesService,
    )
  {
    this.site = this.siteService.getAssignedSite()
  }

  init() {
    if (this.inputForm) {
      const field = this.getField()
      this.id = this.inputForm.controls[field].value;
    }
  }

  initForm() {
    this.searchForm = this.fb.group({
      priceCategoryLookup: [],
    })
  }

  ngOnInit() {
    this.initForm();
    this.init();
    if (this.id) { this.getName(this.id)  }
  }

  refreshSearch(search: any){
    if (search) {  this.searchPhrase.next( search ) }
  }

  searchItems(name: string) {
    this.searchPhrase.next(name);
  }

  onChange(selected: any) {
    const item = selected.option.value;
    if (item) {
      this.selectItem(item)
      this.item = item
      if (!item || !item.name){
        return ''
      }  else {
        return item.name
      }
    }
  }

  clearInput() {
    let price = {} as any;
    price = { priceCategory : 0 }
    this.inputForm.patchValue(  price  )
    const priceCat =  { priceCategoryLookup: '' }
    this.searchForm.patchValue( priceCat )
  }

  //{{priceCategoryLookup}}
  get searchValueAssigned() {
    try {
      if (this.searchForm && this.searchForm.controls['priceCategoryLookup'].value) {
        return true
      }
    } catch (error) {

    }
    return false
  }

  selectItem(item){
    if (!item) {return}
    this.itemSelect.emit(item)

    let price = {} as any;
    if (this.isInventory) {
       price = { priceCategoryID : item.id }
    }
    if (!this.isInventory) {
       price = { priceCategory : item.id }
    }

    this.inputForm.patchValue(  price  )

    const priceCat =  { priceCategoryLookup: item.name  }
    this.searchForm.patchValue( priceCat )
  }

  getName(id: number) {
    if (!id)             {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      this.priceCategories.getPriceCategory(site, id).subscribe(data => {
        this.item = data;
        const price =  { priceCategoryLookup: data.name  }
        this.searchForm.patchValue( price )
      })
    }
  }

}
