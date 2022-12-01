import { Component, OnInit, Input } from '@angular/core';
import { CheckboxRequiredValidator, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule,  DiscountInfo } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { IItemType, ItemTypeService, ItemType_Categories_Reference, IItemTypesList} from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { IUserProfile } from 'src/app/_interfaces';
import { trigger, transition,  animate, animation, style, state, keyframes, query, stagger,animateChild } from '@angular/animations';

@Component({
  selector: 'app-reward-type-filter',
  templateUrl: './reward-type-filter.component.html',
  styleUrls: ['./reward-type-filter.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(50, [
            animate('.25s ease-out', keyframes([
              style({
                offset:0.5,
                marginLeft:'10px',
                opacity:1
              }),
              style({
                offset:1,
                marginLeft:'-100%',
                opacity:0
              }),
            ]))
          ])
        ], { optional: true } ),
        query(':enter', [

          style({ opacity: 0 }),

          stagger(115, [
              animate('.25s ease-in',
                style({ marginLeft:'50%x', opacity: 0 , transform: "rotateY(-90deg)" }),
              ),
              animate('.25s ease-in-out',
                style({marginLeft:'0%', opacity: 1 , transform: "none" }),
              ),
            ]
          )
        ], { optional: true } ),
      ])
    ])
  ]

})

export class RewardTypeFilterComponent  implements OnInit {

  @Input() inputForm : FormGroup;
  @Input() item      : IPriceSchedule;

  itemTypes$         : Observable<IItemTypesList[]>;
  itemTypes          : IItemType[];
  iItemTypeID        : number;
  assignedCategories$: Observable<ItemType_Categories_Reference[]>

  // export interface RequiredOption {
  id:                 number;
  priceScheduleID:    number;
  itemTypeDiscounts:  DiscountInfo[] = []; //what is a main type? This is itemType
  brandsDiscounts:    DiscountInfo[] = [];
  categoriesDiscounts:DiscountInfo[] = [];
  itemDiscounts:      DiscountInfo[] = [];

  brands$           : Observable<IUserProfile[]>
  @Input() lastSelectedBrand:     DiscountInfo;
  @Input() lastSelectedItem:     DiscountInfo;//this item will be assigned to the search selector.
  @Input() lastSelectedCategory: DiscountInfo;//this item will be assigned to the search selector.
  lastSelectedItemType: DiscountInfo

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
      this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
        this.priceScheduleTracking = data
        this.itemTypeDiscounts     = data.itemTypeDiscounts;
        this.brandsDiscounts       = data.brandDiscounts;
        this.categoriesDiscounts   = data.categoryDiscounts;
        this.itemDiscounts         = data.itemDiscounts;
      }
    )
  }

  constructor(
    private siteService              : SitesService,
    private itemTypeService          : ItemTypeService,
    private priceScheduleDataService : PriceScheduleDataService,
  ) { }

  ngOnInit(): void {
    this.initSubscriptions();
    const site = this.siteService.getAssignedSite();
    this.itemTypes$ = this.itemTypeService.getItemTypeCategoriesReadOnlyList(site);
  }
  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  isItemToggled(item) {

    if (item.id == undefined || !this.lastSelectedItemType)  { return false}

    if (this.lastSelectedBrand) {
      if (this.lastSelectedBrand.itemID == undefined )  {
        return false
      }
    }

    if (this.lastSelectedItem) {
      if (this.lastSelectedItem.itemID != item.id) {
        return false
      }
    }

    if (this.lastSelectedCategory) {
      if (this.lastSelectedCategory.itemID  == item.id) {
        return true
      }
    }

    if (this.lastSelectedItemType) {
      if (this.lastSelectedItemType.itemID == item.id) {
        return true
      }
    }

  }

  getIndex(item) { 
    if (!this.itemTypeDiscounts) { 
      this.itemTypeDiscounts = []
      return 0
    }
    return this.itemTypeDiscounts.findIndex(data => data.itemID == item.id)
  }
  addItemType(item) {
    console.log(item)
    if (!item) { return } 

    console.log('this happened')
    const index = this.getIndex(item)
    console.log(item , index)

    if (!this.itemTypeDiscounts) { this.itemTypeDiscounts = [] }
    if (index == -1){
      const mainType            = {} as DiscountInfo;
      mainType.itemID           =  item.id;
      mainType.name             =  item.name;
      mainType.quantity         =  1;
      mainType.andOr            =  "OR";
      
      this.itemTypeDiscounts.push(mainType);
      this.updateItems();
      this.lastSelectedItemType = mainType;
    } else {
      this.itemTypeDiscounts.splice(index, 1);
      this.updateItems();
      this.lastSelectedItemType  = null
    }
   
  }

  addCategory(sub) {

    this.lastSelectedCategory = null
    if (sub) {
      let categoryID = '';
      if (sub.categoryID == undefined) { categoryID = sub.itemID}
      if (sub.categoryID != undefined) { categoryID = sub.categoryID}
      if (!this.categoriesDiscounts) { this.categoriesDiscounts = []}
      const array = this.categoriesDiscounts
      
      const index = array.findIndex( data =>   data.itemID === parseInt( categoryID ))

      if (index == -1){
        const item    = {} as DiscountInfo;
        item.itemID   = parseInt( categoryID );
        item.name     = sub.name;
        item.quantity = 1;
        item.andOr            =  "OR";
        this.categoriesDiscounts.push(item)
        this.updateItems()
        this.lastSelectedCategory = item
      }

      if (index != -1){
        this.categoriesDiscounts.splice(index, 1)
        this.updateItems()
        this.lastSelectedCategory = null
      }
    }
  }

  addBrand(sub) {
    this.lastSelectedBrand = null
    if (sub) {
      const brandID = sub.id
      if (!this.brandsDiscounts) { this.brandsDiscounts = []}
      const array = this.brandsDiscounts
      const index = array.findIndex( data =>   data.itemID === parseInt( brandID ))

      if (index == -1){
        const item    = {} as DiscountInfo;
        item.itemID   = parseInt( brandID );
        item.name     = sub.name;
        item.quantity = 1;
        item.andOr     =  "OR";
        this.brandsDiscounts.push(item)
        this.updateItems()
        this.lastSelectedBrand = item
      }

      if (index != -1){
        this.brandsDiscounts.splice(index, 1)
        this.updateItems()
        this.lastSelectedBrand = null
      }
    }
  }

  updateItems() {

    if (!this.itemTypeDiscounts)   { this.itemTypeDiscounts = []}
    this.priceScheduleTracking.itemTypeDiscounts  = this.itemTypeDiscounts

    if (!this.brandsDiscounts)     { this.brandsDiscounts = []}
    this.priceScheduleTracking.brandDiscounts     = this.brandsDiscounts

    if (!this.categoriesDiscounts) { this.categoriesDiscounts = []}
    this.priceScheduleTracking.categoryDiscounts = this.categoriesDiscounts

    if (!this.itemDiscounts) { this.itemDiscounts = []}
    this.priceScheduleTracking.itemDiscounts = this.itemDiscounts

    this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking)
  }

  toggleItemTypeSelected(item: IItemType) {

    // console.log('toggleItemTypeSelected')
    this.lastSelectedItemType = null

    if (!item) {return}
    if (item.id == undefined)  { return }

    // //check the array of the form.
    const array = this.itemTypeDiscounts;
    const index = array.findIndex( data => data.itemID == item.id );

    if (index == -1){
      const item       = {} as DiscountInfo;
      item.itemID      =  item.id;
      item.name        =  item.name;
      item.quantity    =  1
      item.andOr       = "OR"
      this.itemTypeDiscounts.push(item);
      this.lastSelectedItemType = item;
    } else {
      this.lastSelectedItemType = null
      // this.requiredItemTypes.splice(index, 1);
    }

    //make sure only unique items are being added. no dupes.
    const unique           = [...new Map(this.itemTypeDiscounts.map(item => [item['itemID'], item])).values()]
    this.itemTypeDiscounts = unique;
  }

  toggleCategory(item) {
    this.lastSelectedBrand = null;
    this.lastSelectedCategory = item;
  }

  toggleBrand(item)    {
    this.lastSelectedCategory = null;
    this.lastSelectedBrand = item;
    console.log('item', item)
  }

  refreshAssignedCategories(id: number) {
    const site = this.siteService.getAssignedSite()
    const productTypeID = id
    try {
      this.assignedCategories$  = this.itemTypeService.getItemTypeCategories(site, id)
    } catch (error) {
      console.log('error', error)
    }
  }
}


