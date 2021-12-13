import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { Subscription } from 'rxjs';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { trigger, transition, query, style, animate, group } from '@angular/animations';

const left = [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':enter', [style({ transform: 'translateX(-100%)' }), animate('.3s ease-out', style({ transform: 'translateX(0%)' }))], {
      optional: true,
    }),
    query(':leave', [style({ transform: 'translateX(0%)' }), animate('.3s ease-out', style({ transform: 'translateX(100%)' }))], {
      optional: true,
    }),
  ]),
];

const right = [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':enter', [style({ transform: 'translateX(100%)' }), animate('.3s ease-out', style({ transform: 'translateX(0%)' }))], {
      optional: true,
    }),
    query(':leave', [style({ transform: 'translateX(0%)' }), animate('.3s ease-out', style({ transform: 'translateX(-100%)' }))], {
      optional: true,
    }),
  ]),
];

@Component({
  selector: 'app-price-schedule-info',
  templateUrl: './price-schedule-info.component.html',
  styleUrls: ['./price-schedule-info.component.scss'],
  // animations: [slideInOutAnimation]
  animations: [
    trigger('slider', [
      transition(':increment', right),
      transition(':decrement', left),
    ]),
  ],
})
export class PriceScheduleInfoComponent implements OnInit, OnChanges, AfterViewInit {
  //animation
  animationCounter: number;

  @Input()  item:                IPriceSchedule;
  @Input()  inputForm:           FormGroup;
  @Input()  hideDelete:          boolean;

  _priceSchedule      : Subscription;
  priceSchedule       : IPriceSchedule;
  isMenuList          : boolean;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceSchedule = data
      if (data) {

        this.isMenuList = false
        if ( data.type === 'Menu List') {
          this.isMenuList = true
        }
      }

    })
  }

  get requiredCategories() : FormArray {
    return this.inputForm.get('requiredCategories') as FormArray;
  }

  get requiredItems() : FormArray {
    return this.inputForm.get('requiredItems') as FormArray;
  }

  get requiredItemTypes() : FormArray {
    return this.inputForm.get('requiredItemTypes') as FormArray;
  }

  get requiredBrands() : FormArray {
    return this.inputForm.get('requiredBrands') as FormArray;
  }

  get categoryDiscounts() : FormArray {
    return this.inputForm.get('categoryDiscounts') as FormArray;
  }

  get itemDiscounts() : FormArray {
    return this.inputForm.get('itemDiscounts') as FormArray;
  }

  get itemTypeDiscounts() : FormArray {
    return this.inputForm.get('itemTypeDiscounts') as FormArray;
  }

  get brandDiscounts() : FormArray {
    return this.inputForm.get('brandDiscounts') as FormArray;
  }

  get timeFrames() : FormArray {
    return this.inputForm.get('timeFrames') as FormArray;
  }

  get orderTypes() : FormArray {
    return this.inputForm.get('orderTypes') as FormArray;
  }

  get clientTypes() : FormArray {
    return this.inputForm.get('clientTypes') as FormArray;
  }

  constructor(
    private priceScheduleDataService  : PriceScheduleDataService,
  )
  { }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    this.initSubscriptions();
  }

  getCounter() {
    this.animationCounter = this.animationCounter + 1
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initSubscriptions();
  }

  removeRequiredItem(i) {
    this.requiredItemTypes.removeAt(i)
  }
  removeRequiredCategories(i) {
    this.requiredCategories.removeAt(i)
  }
  removeRequiredItems(i) {
    this.requiredItems.removeAt(i)
  }
  removeDiscountItemTypes(i) {
    this.itemTypeDiscounts.removeAt(i)
  }
  removeCategoryDiscounts(i) {
    this.categoryDiscounts.removeAt(i)
  }
  removeItemDiscounts(i){
    this.itemDiscounts.removeAt(i)
  }


}
