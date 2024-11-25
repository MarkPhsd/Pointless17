import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IItemBasic } from '../category-select-list-filter/category-select-list-filter.component';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, fromEvent, filter, tap, of } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'unit-type-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    FormsModule,ReactiveFormsModule],
  templateUrl: './unit-type-selector.component.html',
  styleUrls: ['./unit-type-selector.component.scss']
})
export class UnitTypeSelectorComponent implements OnInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  @Input()  searchForm        : UntypedFormGroup;
  @Input()  itemType          : number; //removed default 1
  @Input()  metrcCategoryName : string;
  @Input()  searchField       : UntypedFormControl;
  @Input()  fieldName         : string;
  @Input()  doNotPassName     : string;
  @Input()  formControlName = 'unitTypeSelections';
  @Input() filter: ProductSearchModel; //productsearchModel;

  searchPhrase:               Subject<any> = new Subject();
  searchModel                 =  {} as SearchModel;
  item:                       IItemBasic;
  site:                       ISite;

  results$ = this.searchPhrase.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase => {
      this.searchModel = {} as SearchModel;
      this.searchModel.name = searchPhrase;
      return this.menuService.getUnitTypesSearch(this.site,  this.searchModel).pipe(switchMap(data => {
        return of(data.results)
      }))
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
    public route        : ActivatedRoute,
    private menuService : UnitTypesService,
    private fb          : UntypedFormBuilder,
    private siteService : SitesService,
    )
  { this.site = this.siteService.getAssignedSite();  }

  ngOnInit() {
    // if (this.doNotPassName) { return }
    if (!this.searchForm) { return }
    this.searchForm = this.fb.group({
      unitTypeSelections : ['']
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

  clearInput() {
    let item = {} as IItemBasic;
    this.itemSelect.emit(item);
  }

  get searchValueAssigned() {
    try {
      if (this.searchForm.controls['unitTypeSelections'].value) {
        return true
      }
    } catch (error) {

    }
    return false
  }

}

