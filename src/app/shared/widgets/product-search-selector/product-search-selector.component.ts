import { Component,  Input, Output, OnInit,  ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup,  UntypedFormControl} from '@angular/forms';
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

  @Input()  searchForm:       UntypedFormGroup;
  @Input()  itemType:         number; //removed default 1
  @Input()  metrcCategoryName : string;
  @Input()  searchField:      UntypedFormControl;
  @Input()  productName:      string;
  @Input()  doNotPassName     :string;
  @Input()  formControlName = 'productName';
  @Input() filter: ProductSearchModel; //productsearchModel;

  searchPhrase:               Subject<any> = new Subject();
  searchModel                 =  {} as ProductSearchModel;
  item:                       IItemBasic;
  site:                       ISite;

  results$ = this.searchPhrase.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase => {
      if (this.filter) { this.searchModel = this.filter }
      this.searchModel.name = searchPhrase;
      return this.menuService.getItemBasicBySearch(this.site,  this.searchModel)
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

  constructor(
    public route: ActivatedRoute,
    private menuService: MenuService,
    private fb: UntypedFormBuilder,
    private siteService: SitesService,
    )
  {
    this.site = this.siteService.getAssignedSite();
  }

  ngOnInit() {
    if (this.doNotPassName) { return }
    this.searchForm = this.fb.group({
        productName : ['']
    })
  }

  refreshSearch(search: any){
    if (search) {this.searchPhrase.next( search )}
  }

  searchItems(name: string) {
    this.searchPhrase.next(name);
  }

  selectItem(item: IItemBasic) {
    this.itemSelect.emit(item)
  }

  onChange(item: any) {
    const menuItem = item.option.value as IItemBasic;
    const menuItemName =`${menuItem.name}`;
    if (item) {
      this.selectItem(menuItem)
      this.item = item
      if (!item || !item.name){
        return ''
      }  else {
        return menuItemName
      }
    }
  }

}
