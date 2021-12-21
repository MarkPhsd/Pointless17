import { Component,  Input, Output, OnInit,  ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup,  FormControl} from '@angular/forms';
import { ISite } from 'src/app/_interfaces/site';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Subject, fromEvent } from 'rxjs';
import { MenuService,  IItemBasic } from 'src/app/_services';

@Component({
  selector: 'app-product-search-selector',
  templateUrl: './product-search-selector.component.html',
  styleUrls: ['./product-search-selector.component.scss']
})
export class ProductSearchSelectorComponent implements OnInit, AfterViewInit  {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  @Input()  searchForm:       FormGroup;
  @Input()  itemType:         number; //removed default 1
  @Input()  searchField:      FormControl;
  @Input()  productName:      string;
  searchPhrase:               Subject<any> = new Subject();
  productSearchModel =  {} as ProductSearchModel;
  item:                       IItemBasic;
  site:                       ISite;

  results$ = this.searchPhrase.pipe(
    debounceTime(150),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.menuService.getItemsNameBySearch(this.site,  searchPhrase, this.itemType)
    )
  )

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private menuService: MenuService,
    private fb: FormBuilder,
    private siteService: SitesService,
    )
  {
    this.getItemType()
    this.site = this.siteService.getAssignedSite();
  }

  ngOnInit() {
    if (this.searchForm){
      this.searchForm = this.fb.group({
        productName: this.productName,
      })
    }
  }

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

  refreshSearch(search: any){
    if (search) {
      this.searchPhrase.next( search )
    }
  }

  searchItems(name: string) {
    this.searchPhrase.next(name);
  }

  selectItem(item: IItemBasic){
    this.itemSelect.emit(item)
  }

  displayFn(item) {
    this.selectItem(item)
    this.item = item
    return item.name;
  }

  getItemType(): number {
    if ( this.itemType) {this.itemType = 1}
    return this.itemType
  }

}
