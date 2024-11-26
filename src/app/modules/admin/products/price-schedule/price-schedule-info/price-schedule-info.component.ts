import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { Subscription } from 'rxjs';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { trigger, transition, query, style, animate, group } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ScheduledMenuHeaderComponent } from 'src/app/modules/menu/scheduleMenus/scheduled-menu-container/scheduled-menu-header/scheduled-menu-header.component';
import { ScheduledMenuImageComponent } from 'src/app/modules/menu/scheduleMenus/scheduled-menu-container/scheduled-menu-image/scheduled-menu-image.component';
import { ItemSortComponent } from '../item-selections/item-sort/item-sort.component';
import { PriceScheduleFieldsComponent } from './price-schedule-fields/price-schedule-fields.component';

// | date: 'shortDate'
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
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
  ScheduledMenuHeaderComponent,
  ScheduledMenuImageComponent,
  ItemSortComponent,
  PriceScheduleFieldsComponent,

  SharedPipesModule],
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
  @Input()  inputForm:           UntypedFormGroup;
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

  get requiredCategories() : UntypedFormArray {
    return this.inputForm.get('requiredCategories') as UntypedFormArray;
  }

  get requiredItems() : UntypedFormArray {
    return this.inputForm.get('requiredItems') as UntypedFormArray;
  }

  get requiredItemTypes() : UntypedFormArray {
    return this.inputForm.get('requiredItemTypes') as UntypedFormArray;
  }

  get requiredBrands() : UntypedFormArray {
    return this.inputForm.get('requiredBrands') as UntypedFormArray;
  }

  get categoryDiscounts() : UntypedFormArray {
    return this.inputForm.get('categoryDiscounts') as UntypedFormArray;
  }

  get itemDiscounts() : UntypedFormArray {
    return this.inputForm.get('itemDiscounts') as UntypedFormArray;
  }

  get itemTypeDiscounts() : UntypedFormArray {
    return this.inputForm.get('itemTypeDiscounts') as UntypedFormArray;
  }

  get brandDiscounts() : UntypedFormArray {
    return this.inputForm.get('brandDiscounts') as UntypedFormArray;
  }

  get timeFrames() : UntypedFormArray {
    return this.inputForm.get('timeFrames') as UntypedFormArray;
  }

  get orderTypes() : UntypedFormArray {
    return this.inputForm.get('orderTypes') as UntypedFormArray;
  }

  get clientTypes() : UntypedFormArray {
    return this.inputForm.get('clientTypes') as UntypedFormArray;
  }

  constructor(
    private priceScheduleDataService  : PriceScheduleDataService,
  )
  { }

  ngOnInit(): void {
    // this.priceScheduleDataService.updatePriceSchedule(this.priceSchedule);
    this.initSubscriptions();
  }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.initSubscriptions();
    // const item = "hello"()
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
