import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IUserProfile } from 'src/app/_interfaces';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { ContactsService } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';

export interface IItemBasic{
  name: string;
  id  : number;
  icon?: string;
  image?: string;
}

@Component({
  selector: 'options-select-filter',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule],
  templateUrl: './options-select-filter.component.html',
  styleUrls: ['./options-select-filter.component.scss']
})
export class OptionsSelectFilterComponent implements OnInit {

  @Output() selected    : EventEmitter<any> = new EventEmitter();
  @Input()  inputForm   : UntypedFormGroup;
  @Input()  type        : string;

  list$  : Observable<any[]>;
  array  : unknown[];
  list   =   [];
  basicList = [] as IItemBasic[]
  savedItem   : IItemBasic;
  _searchModel: Subscription;
  searchModel : ProductSearchModel;

  initialized: boolean;
  initSubscription() {
    this._searchModel = this.menuService.searchFilter$.subscribe(data => {
      if (!data) { data = this.menuService.initSearchModel() }
      this.searchModel = data;
      if (!this.initialized) {
        this.initialized = true
        this.initForm(data);
      }
    })
  }

  constructor(
    private siteService: SitesService,
    private menuService: MenuService,
    ) { }

  ngOnInit(): void {
    this.initSubscription();
  }

  initSearchModel() {
    if (!this.menuService.searchModel) {
      this.menuService.updateSearchModel(this.searchModel)
    }
  }

  initForm(model: ProductSearchModel) {
    const site = this.siteService.getAssignedSite();
    if (this.type === 'species') {
      this.list$ = of(this.menuService.getSpeciesType()).pipe(switchMap(list => {
          list.forEach(item => {  this.basicList.push({name: item.name, id: item.id} ) })
          this.setSavedList(model)
          return of(list)
      }))
    }
  }

  setSavedList(model: ProductSearchModel) {
    //should loop and look up items in the basic list
    //then assign the basic list as the saved list.
    let list: number[]
    if ( this.type === 'species') {
      const item = this.searchModel.species    // this.searchModel.listSubCategoryID = []
      const selected = this.basicList.filter(data => {  item == data.name })
      if (!selected) {return}
      this.savedItem = selected[0];
    }
  }

  setItem(event) {
    if (event.value) {
      this.searchModel.pageNumber =1
      this.searchModel.species = event?.value?.name;
      this.menuService.updateSearchModel(this.searchModel)
    }
  }

  clearOption() {
    this.savedItem = null;
    if (this.type == 'species') {
      this.searchModel.pageNumber =1
      this.searchModel.species = null;
      this.menuService.updateSearchModel(this.searchModel)
    }
  }

}
