import { Component, OnInit, Input , EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, OnChanges} from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISite } from 'src/app/_interfaces';
import { IItemBasic, PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { IPriceCategories } from 'src/app/_interfaces/menu/price-categories';
import { FormBuilder, FormControl, FormGroup,  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Subject ,fromEvent } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-price-category-search',
  templateUrl: './price-category-search.component.html',
  styleUrls: ['./price-category-search.component.scss'],
})
export class PriceCategorySearchComponent implements OnInit,  AfterViewInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect       = new EventEmitter();

  @Input() inputForm        : FormGroup;
  @Input() searchForm:        FormGroup;
  @Input() searchField:       FormControl;
  @Input() id               : number;
  @Input() name:              string;
  @Input() doNotPassName      :string;
  searchPhrase:               Subject<any> = new Subject();
  item:                       IPriceCategories;
  site:                       ISite;

  get priceCategoryControl()  { return this.inputForm.get("priceCategory") as FormControl};

  results$ = this.searchPhrase.pipe(
    debounceTime(225),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.priceCategories.searchPriceCategories(this.site,  searchPhrase)
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

  constructor(
    public route           : ActivatedRoute,
    private priceCategories: PriceCategoriesService,
    private fb             : FormBuilder,
    private siteService    : SitesService,
    )
  {
    this.site = this.siteService.getAssignedSite();
    this.initForm();
  }

  async init() {
    if (this.inputForm) {
      this.id = this.inputForm.controls['priceCategory'].value;
    }
  }

  initForm() {
    this.searchForm = this.fb.group({
      priceCategoryLookup: [],
    })
  }

  ngOnInit() {
    this.init();
    if (this.id) { this.getName(this.id)  }
  }

  refreshSearch(search: any){
    if (search) {  this.searchPhrase.next( search ) }
  }

  searchItems(name: string) {
    this.searchPhrase.next(name);
  }

  selectItem(item){
    if (!item) {return}
    this.itemSelect.emit(item)

    const price = { priceCategory : item.id }
    this.inputForm.patchValue(    price  )

    const priceCat =  { priceCategoryLookup: item.name  }
    this.searchForm.patchValue( priceCat )
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
