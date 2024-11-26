import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { moveItemInArray, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { IListBoxItem, IItemsMovedEvent } from 'src/app/_interfaces/dual-lists';
import { Observable, switchMap,  } from 'rxjs';
import { of } from 'rxjs';
import { IItemBasic, IItemBasicB, MenuService } from 'src/app/_services/menu/menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IItemType, ItemTypeService,ItemType_Categories_Reference,ItemCounts } from 'src/app/_services/menu/item-type.service';
import { IProductCategory } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-item-type-category-assignment',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './item-type-category-assignment.component.html',
  styleUrls: ['./item-type-category-assignment.component.scss']
})
export class ItemTypeCategoryAssignmentComponent implements OnInit {

    productTypes$    : Observable<IItemBasicB[]>;
    itemTypes$       : Observable<IItemType[]>;
    categoriesStatic : IProductCategory[];
    itemType         : IItemType;
    productTypes     : IItemBasic[];
    productTypeSearch: number;
    productTypeID    : number;
    typeID           : number;
    assignedStatic   : any;
    allAssigned      : any;

    tempCategoryList: any;
    assignedList$ : Observable<any>
    // array of items to display in left box
    @Input() set availables(items: Array<{}>) {
      this.availableItems = [...(items || []).map((item: {}, index: number) => ({
        value: item[this.valueField].toString(),
        text: item[this.textField],
        groupID: 0,
      }))];
    }
    // array of items to display in right box
    @Input() set selects(items: Array<{}>) {
      this.selectedItems = [...(items || []).map((item: {}, index: number) => ({
        value: item[this.valueField].toString(),
        text: item[this.textField],
        groupID: 0,
      }))];
    }

    // field to use for value of option
    @Input() valueField = 'id';
    // field to use for displaying option text
    @Input() textField = 'name';
    // text displayed over the available items list box
    @Input() availableText = 'Available items';
    // text displayed over the selected items list box
    @Input() selectedText = 'Selected items';
    // set placeholder text in available items list box
    @Input() availableFilterPlaceholder = 'Filter...';
    // set placeholder text in selected items list box
    @Input() selectedFilterPlaceholder = 'Filter...';
    // event called when items are moved between boxes, returns state of both boxes and item moved
    @Output() itemsMoved: EventEmitter<IItemsMovedEvent> = new EventEmitter<IItemsMovedEvent>();

    availableItems: Array<IListBoxItem> = [];
    selectedItems : Array<IListBoxItem> = [];
    listBoxForm   : UntypedFormGroup;

    constructor(
      private itemTypeService: ItemTypeService,
      private siteService: SitesService,
      private menuService: MenuService,
      public fb: UntypedFormBuilder) {
      this.listBoxForm = this.fb.group({
        availableSearchInput: [''],
        selectedSearchInput: [''],
      });
    }

    async ngOnInit() {
      const site = this.siteService.getAssignedSite()
      this.productTypes$ = this.itemTypeService.getBasicTypes(site);
      this.itemTypes$    = this.refreshItemTypesAssociation()
      this.assignedList$ = this.initCategoryList();
    }

    initCategoryList() {

      //initialize list of categories.
      //init list of assigned categeogires
      //remove assigned categories from list of categories.
      //use list repeatedly without re fetching.
      const site            =  this.siteService.getAssignedSite();

      const categories$ = this.menuService.getCategoryListNoChildren(site)
      const assigned$ = this.menuService.getCategoryListNoChildren(site)

      return categories$.pipe(switchMap(categories => {
        this.categoriesStatic =  categories
        return this.itemTypeService.getItemTypeCategoriesAll(site)
      })).pipe(switchMap(assigned => {
        this.availableItems  =  this.removeSelectedFromAvailable(this.categoriesStatic, assigned)
        return of(assigned)
      }))

    }

    removeSelectedFromAvailable( categories: IProductCategory[], allAssignedCategories: ItemType_Categories_Reference[]): IListBoxItem[]   {
      let allCategories        = categories.map( item => ({ groupID: 0,  value: item.id.toString(), text: item.name }));
      let assignedCategories   = allAssignedCategories.map( item =>  ({ groupID: 0,value: item.categoryID.toString(), text: item.name }));

      assignedCategories.forEach(item => {
        const value = allCategories.find( x => x.value.toLowerCase() === item.value.toLowerCase() )
        if (value) {
          allCategories = allCategories.filter(item => item !== value)
        }
      })
      allCategories =  allCategories.filter(item => !assignedCategories.includes(item));
      return allCategories;
    }

    convertToIlistBoxItem(listSource: any[]): IListBoxItem[] {
      var result = listSource.map(item => ({ groupID: 0, value: item.id.toString(), text: item.name }));
      return result
    }


    async refreshAssignedCategories(id: number) {
      const site = this.siteService.getAssignedSite()
      this.productTypeID = id

      try {
        // getItemTypeCategories
        const AssignedCategories$  = this.itemTypeService.getItemTypeCategories(site, this.productTypeID)
        AssignedCategories$.subscribe( data => {
          if (data) {
            this.selectedItems = []

            data.forEach(data => {
              this.selectedItems.push({groupID: 0, value: data.categoryID.toString(), text: data.name})
              //then we remove items from avalible categories that exist in Selected items.
              //this.removeSelectedFromAvailable( this.availables , this.selectedItems)
            })
          }
        })
      } catch (error) {
        console.log('error', error)
      }

    }

    refreshItemTypesAssociation() {
      const site = this.siteService.getAssignedSite()
      this.itemTypes$    = this.itemTypeService.getItemTypes(site).pipe(switchMap(data => {
        data =  data.sort((a, b) => (a.name > b.name) ? 1 : -1)
        return of(data)
      }))
      return this.itemTypes$
    }

    //we are saving the Whole List of assigned or
    //we are saving the added.
    // i feel like it's easier to push the whole list,
    //and keep a reference to the selecteditems, then push the whole list.
    saveAssignedCategories() {

      if (this.itemType) {
        const site = this.siteService.getAssignedSite()
        if (this.itemType.itemType_Categories) {
          this.itemType.itemType_Categories.forEach( data => {
            data.itemTypeID = this.itemType.id
          })
        }


        const categories = this.itemType.itemType_Categories
        console.log('categories', categories)
        if (categories) {
          const itemType$ = this.itemTypeService.saveCategories(site, this.itemType.id, categories)
          itemType$.subscribe( data => {
            console.log('saved')
          })
        }
      }

    }

    setItemType(event) {
      this.itemType = event
      this.refreshAssignedCategories(this.itemType.id)
    }

    assignArrayToItemType(selected: IListBoxItem[]) {
      console.log('selected', selected)
      if (this.itemType) {
        this.itemType.itemType_Categories = [];
        const itemCounts = {} as ItemCounts;
        selected.forEach( data => {
          this.itemType.itemType_Categories.push({itemTypeID: this.itemType.id, id: 0, categoryID: parseInt(data.value), itemCounts: itemCounts })
        })
        this.saveAssignedCategories()
      }
    }

    drop(event: CdkDragDrop<IListBoxItem[]>) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      }
      // clear marked available items and emit event

        //assign the selected items to the current itemType selected.
      this.assignArrayToItemType(this.selectedItems)

      this.itemsMoved.emit({
        available: this.availableItems,
        selected: this.selectedItems,
        movedItems: event.container.data.filter((v, i) => i === event.currentIndex),
        from: 'available',
        to  : 'selected',
      });
    }

    searchItemsReset() {
      // this.pageSize = 1
      // const site = this.siteService.getAssignedSite()
      // const productSearchModel = this.initProductSearchModel(this.search);
      // this.menuItems$ = this.menuService.getProductsBySearchForLists(site, productSearchModel)
    }


}


