import { Component, OnInit, Input } from '@angular/core';
import {  UntypedFormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule,  DiscountInfo} from 'src/app/_interfaces/menu/price-schedule';
import { Observable, Subscription } from 'rxjs';
import { IItemType, ItemTypeService, ItemType_Categories_Reference, IItemTypesList} from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { IUserProfile } from 'src/app/_interfaces';
import { trigger, transition,  animate, animation, style, state, keyframes, query, stagger,animateChild } from '@angular/animations';

@Component({
  selector: 'app-type-filter',
  templateUrl: './type-filter.component.html',
  styleUrls: ['./type-filter.component.scss'],
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
export class TypeFilterComponent implements OnInit {

  @Input() inputForm : UntypedFormGroup;
  @Input() item      : IPriceSchedule;

  itemTypes$         : Observable<IItemTypesList[]>;
  itemTypes          : IItemType[];
  iItemTypeID        : number;
  assignedCategories$: Observable<ItemType_Categories_Reference[]>

  // export interface RequiredOption {
  id:                 number;
  priceScheduleID:    number;
  requiredItemTypes:  DiscountInfo[] = []; //what is a main type? This is itemType
  requiredBrands:     DiscountInfo[] = [];
  requiredCategories: DiscountInfo[] = [];
  requiredItems:      DiscountInfo[] = [];

  brands$           : Observable<IUserProfile[]>
  @Input() lastSelectedItem: DiscountInfo;//this item will be assigned to the search selector.
  @Input() lastSelectedCategory: DiscountInfo;//this item will be assigned to the search selector.
  @Input() lastSelectedBrand   : DiscountInfo;
  lastSelectedItemType: DiscountInfo

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
      this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
        this.priceScheduleTracking = data
        this.requiredItemTypes     = data.requiredItemTypes;
        this.requiredBrands        = data.requiredBrands;
        this.requiredCategories    = data.requiredCategories;
        this.requiredItems         = data.requiredItems;
      }
    )
  }
  constructor(
    private siteService              : SitesService,
    private itemTypeService          : ItemTypeService,
    private priceScheduleDataService : PriceScheduleDataService,
    private fbPriceScheduleService   : FbPriceScheduleService,

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

  addItemType(item) {

    if (!this.requiredItemTypes) {
      this.requiredItemTypes = []
    }

    if (item && item.id != undefined) {
      const index = this.requiredItemTypes.findIndex(data => data.itemID == item.id)
      if (index == -1){
        const mainType            = {} as DiscountInfo;
        mainType.itemID           =  item.id;
        mainType.name             =  item.name;
        mainType.quantity         =  1;
        mainType.andOr            = 'And';
        this.requiredItemTypes.push(mainType);
        this.updateItems();
        this.lastSelectedItemType = mainType;
      } else {
        this.requiredItemTypes.splice(index, 1);
        this.updateItems();
        this.lastSelectedItemType  = null
      }
    }
  }

  addCategory(sub) {
    this.lastSelectedCategory = null
    if (sub) {
      let categoryID = '';
      if (sub.categoryID == undefined) { categoryID = sub.itemID}
      if (sub.categoryID != undefined) { categoryID = sub.categoryID}

      if (!this.requiredCategories) {
        this.requiredCategories = []
      }
      const array = this.requiredCategories
      const index = array.findIndex( data =>   data.itemID === parseInt( categoryID ))

      if (index == -1){
        const cat    = {} as DiscountInfo;
        cat.itemID   = parseInt( categoryID );
        cat.name     = sub.name;
        cat.quantity = 1;
        cat.andOr    = 'And';
        this.requiredCategories.push(cat)
        this.updateItems()
        this.lastSelectedCategory = cat
      }

      if (index != -1){
        this.requiredCategories.splice(index, 1)
        this.updateItems()
        this.lastSelectedCategory = null
      }
    }
  }

  addBrand(sub) {
    this.lastSelectedBrand = null
    if (sub) {
      const brandID = sub.id
      const array = this.requiredBrands

      if (!this.requiredBrands) {
        this.requiredBrands = []
      }

      const index = array.findIndex( data =>   data.itemID === parseInt( brandID ))

      if (index == -1){
        const item    = {} as DiscountInfo;
        item.itemID   = parseInt( brandID );
        item.name     = sub.name;
        item.quantity = 1;
        item.andOr    = 'And';
        this.requiredBrands.push(item)
        this.updateItems()
        this.lastSelectedBrand = item
      }

      if (index != -1){
        this.requiredBrands.splice(index, 1)
        this.updateItems()
        this.lastSelectedBrand = null
      }
    }

  }

  updateItems() {

    if (!this.requiredItemTypes)   { this.requiredItemTypes = []}
    this.priceScheduleTracking.requiredItemTypes  = this.requiredItemTypes

    if (!this.requiredBrands)     { this.requiredBrands = []}
    this.priceScheduleTracking.requiredBrands     = this.requiredBrands

    if (!this.requiredItems)       { this.requiredItems = []}
    this.priceScheduleTracking.requiredItems      = this.requiredItems

    if (!this.requiredCategories) { this.requiredCategories = []}
    this.priceScheduleTracking.requiredCategories = this.requiredCategories

    this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking)
  }

  toggleItemTypeSelected(item: IItemType) {
    this.lastSelectedItemType = null

    if (!item) {return}
    if (item.id == undefined)  { return }

    if (!this.requiredItemTypes) {
      this.requiredItemTypes = []
    }

    // //check the array of the form.
    const array = this.requiredItemTypes;
    const index = array.findIndex( data => data.itemID == item.id );

    if (index == -1){
      const mainType       = {} as DiscountInfo;
      mainType.itemID      =  item.id;
      mainType.name        =  item.name;
      mainType.quantity    =  1
      // this.requiredItemTypes.push(mainType);
      this.lastSelectedItemType = mainType;
    } else {
      this.lastSelectedItemType = null
      // this.requiredItemTypes.splice(index, 1);
    }

    //make sure only unique items are being added. no dupes.
    const unique           = [...new Map(this.requiredItemTypes.map(item => [item['itemID'], item])).values()]
    this.requiredItemTypes = unique;
  }

  toggleCategory(item) {
    this.lastSelectedBrand = null;
    this.lastSelectedCategory = item;
  }

  toggleBrand(item)    {
    this.lastSelectedCategory = null;
    this.lastSelectedBrand = item;
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

