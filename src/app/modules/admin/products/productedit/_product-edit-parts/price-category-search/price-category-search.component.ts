import { Component, OnInit, Input , EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, OnChanges} from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISite } from 'src/app/_interfaces';
import { IItemBasic, PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { IPriceCategories } from 'src/app/_interfaces/menu/price-categories';
import { FormBuilder, FormControl, FormGroup,  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, NgModule } from "@angular/core";

@Component({
  selector: 'app-price-category-search',
  templateUrl: './price-category-search.component.html',
  styleUrls: ['./price-category-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceCategorySearchComponent implements OnInit,  AfterViewInit, OnChanges{

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  @Input() inputForm        : FormGroup;
  @Input() searchForm:        FormGroup;
  @Input() searchField:       FormControl;
  @Input() id               : number;
  @Input() name:              string;
  searchPhrase:               Subject<any> = new Subject();
  item:                       IPriceCategories;
  site:                       ISite;

  results$ = this.searchPhrase.pipe(
    debounceTime(225),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.priceCategories.searchPriceCategories(this.site,  searchPhrase)
    )
  )

  get priceCategoryControl()  { return this.inputForm.get("priceCategory") as FormControl};

  constructor(
    private router         : Router,
    public route           : ActivatedRoute,
    private priceCategories: PriceCategoriesService,
    private fb             : FormBuilder,
    private siteService    : SitesService,
    )
  {
    this.site = this.siteService.getAssignedSite();
    this.searchForm = this.fb.group({
      priceCategoryLookup: [],
    })
  }

  async init() {
    this.item = await this.getName(this.priceCategoryControl.value)
    let name = ''
    if (this.item) {
      this.refreshSearch(this.item.name)
      this.searchForm = this.fb.group({
        priceCategoryLookup: [this.item],
      })

    }
  }

  async ngOnInit() {
    this.init()
  }

  async ngOnChanges() {
    this.init()
  }

  ngAfterViewInit() {
    if (this.searchForm && this.input) {
      try {
        fromEvent(this.input.nativeElement,'keyup')
        .pipe(
            filter(Boolean),
            debounceTime(250),
            distinctUntilChanged(),
            tap((event:KeyboardEvent) => {
              const search  = this.input.nativeElement.value
              this.refreshSearch(search);
            })
        )
        .subscribe();
      } catch (error) {
        console.log(error)
      }
    }

  }

  refreshSearch(search: any){
    if (search) {
      this.searchPhrase.next( search )
    }
  }

  searchItems(name: string) {
    this.searchPhrase.next(name);
  }

  selectItem(item: IItemBasic){
    if (!item) {return}
    this.itemSelect.emit(item)
    this.priceCategoryControl.setValue(item.id)
  }

  displayFn(item) {
    this.selectItem(item)
    this.item = item
    return item ? item.name : '';
  }

  async  getName(id: number): Promise<any> {
    console.log('getName ', id)
    if (!id) {return null}
    if (id == 0) {return null}
    if (id == undefined) {return null}
    const site  = this.siteService.getAssignedSite();
    if(site) {
      const  price =  await this.priceCategories.getPriceCategory(site, id).pipe().toPromise();
      return price
    }
  }

}
