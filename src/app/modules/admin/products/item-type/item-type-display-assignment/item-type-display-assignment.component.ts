import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { moveItemInArray, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { IListBoxItem, IItemsMovedEvent } from 'src/app/_interfaces/dual-lists';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { of } from 'rxjs';
import { IItemBasic, IItemBasicB, IProductSearchResults, MenuService } from 'src/app/_services/menu/menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IItemType, ItemTypeService, itemType_Categories, ItemType_Categories_Reference } from 'src/app/_services/menu/item-type.service';
import { IProductCategory } from 'src/app/_interfaces';
import { AutoWidthCalculator } from 'ag-grid-community';
import { IDisplayAssignment, ItemTypeDisplayAssignmentService } from 'src/app/_services/menu/item-type-display-assignment.service';

@Component({
  selector: 'app-item-type-display-assignment',
  templateUrl: './item-type-display-assignment.component.html',
  styleUrls: ['./item-type-display-assignment.component.scss']
})
export class ItemTypeDisplayAssignmentComponent implements OnInit {


  itemTypes$       : Observable<IItemType[]>;
  itemTypeStatic   : IItemBasicB[];
  itemType         : IItemType;
  itemTypesSelected: IDisplayAssignment[]
  itemTypeID:      number;
  assignedStatic   : any;
  allAssigned      : any;

  // array of items to display in left box
  @Input() set availables(items: Array<{}>) {
    this.availableItems = [...(items || []).map((item: {}, index: number) => ({
      value: item[this.valueField].toString(),
      text: item[this.textField],
    }))];
  }
  // array of items to display in right box
  @Input() set selects(items: Array<{}>) {
    this.selectedItems = [...(items || []).map((item: {}, index: number) => ({
      value: item[this.valueField].toString(),
      text: item[this.textField],
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
  listBoxForm   : FormGroup;

  constructor(
    private itemTypeService: ItemTypeService,
    private siteService: SitesService,
    private itemTypeDisplayService: ItemTypeDisplayAssignmentService,
    public fb: FormBuilder) {
    this.listBoxForm = this.fb.group({
      availableSearchInput: [''],
      selectedSearchInput: [''],
    });
  }

  async ngOnInit() {
    const site = this.siteService.getAssignedSite()
    this.itemTypes$ = this.itemTypeService.getItemTypes(site);
    this.availableItems =  await this.initCategoryList();
  }

  async initCategoryList(): Promise<IListBoxItem[]> {

    //initialize list of categories.
    //init list of assigned categeogires
    //remove assigned categories from list of categories.
    //use list repeatedly without re fetching.

    const site             =  this.siteService.getAssignedSite()
    const itemTypeBasic    =  await this.itemTypeService.getBasicTypes(site).pipe().toPromise();
    const assigned         =  await this.itemTypeDisplayService.getSortedList(site).pipe().toPromise();
    const availableItems   =  this.removeSelectedFromAvailable(itemTypeBasic, assigned)
    this.itemTypeStatic    =  itemTypeBasic
    return availableItems;

  }

  removeSelectedFromAvailable( itemTypeBasic: IItemBasicB[], allAssignedCategories: IDisplayAssignment[]): IListBoxItem[]   {
    let allIemTypes          = itemTypeBasic.map( item => ({ value: item.id.toString(), text: item.name }));
    let assignedItems        = allAssignedCategories.map( item =>  ({ value: item.itemTypeID.toString(), text: item.name }));

    assignedItems.forEach(item => {
      const value = allIemTypes.find( x => x.value.toLowerCase() === item.value.toLowerCase() )
      if (value) {
        allIemTypes = allIemTypes.filter(item => item !== value)
      }
    })
    allIemTypes =  allIemTypes.filter(item => !assignedItems.includes(item));
    return allIemTypes;
  }

  convertToIlistBoxItem(listSource: any[]): IListBoxItem[] {
    var result = listSource.map(item => ({ value: item.id.toString(), text: item.name }));
    return result
  }

  async refreshAssignedCategories(id: number) {
    const site = this.siteService.getAssignedSite()
    try {
      // getItemTypeCategories
      const AssignedCategories$  = this.itemTypeDisplayService.getSortedList(site)
      AssignedCategories$.subscribe( data => {
        if (data) {
          this.selectedItems = []
          data.forEach(data => {
            this.selectedItems.push({value: data.itemTypeID.toString(), text: data.name})
            //then we remove items from avalible categories that exist in Selected items.
            //this.removeSelectedFromAvailable( this.availables , this.selectedItems)
          })
        }
      })
    } catch (error) {
      console.log('error', error)
    }

  }

  //we are saving the Whole List of assigned or
  //we are saving the added.
  // i feel like it's easier to push the whole list,
  //and keep a reference to the selecteditems, then push the whole list.
  saveAssignedCategories() {
    const site = this.siteService.getAssignedSite()
    if (this.itemTypesSelected) {
      const itemType$ = this.itemTypeDisplayService.saveItemList(site,  this.itemTypesSelected)
      itemType$.subscribe( data => {
      })
    }
  }

  setItemType(event) {
    this.itemType = event
    this.refreshAssignedCategories(this.itemType.id)
  }

  assignArrayToItemType(selected: IListBoxItem[]) {
    let i = 0
    this.itemTypesSelected = [];
    selected.forEach( data => {
      this.itemTypesSelected.push({ itemTypeID: parseInt( data.value ) , id: 0, name: data.text, sort: i +=i })
    })
    this.saveAssignedCategories()
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
    console.log(this.selectedItems)

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
