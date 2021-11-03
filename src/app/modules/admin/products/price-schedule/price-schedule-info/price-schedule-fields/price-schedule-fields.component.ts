import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormArray,  FormBuilder,  FormGroup, FormGroupName } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';

@Component({
  selector: 'app-price-schedule-fields',
  templateUrl: './price-schedule-fields.component.html',
  styleUrls: ['./price-schedule-fields.component.scss']
})
export class PriceScheduleFieldsComponent implements OnInit, OnChanges {

  @Input() inputForm        : FormGroup;
  @Input() arrayTypeName    : string;
  @Input() andOrOption      = true;
  @Input() data             : any;
  @Input() formArray        : FormArray;
  @Input() hideDelete       : boolean;

  constructor(
    private priceScheduleDataService: PriceScheduleDataService,
    private fb:   FormBuilder,
    private fbPriceSchedule: FbPriceScheduleService,
  ) { }

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  ngOnInit(): void {
    this.initFormValue();
    console.log('arrayTypeName ngOnInit', this.arrayTypeName)
  }

  ngOnChanges() {
    this.initFormValue()
    // console.log('arrayTypeName ngOnChanges', this.arrayTypeName)
  }

  // ngAfterViewInit() {
  //   this.initFormValue();
  //   console.log('arrayTypeName ngAfterViewInit', this.arrayTypeName)
  // }

  initFormValue() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
        this.priceScheduleTracking = data
        const inputForm = this.inputForm;
        this.fbPriceSchedule.updateDiscountInfos(inputForm, data)
        // console.log('initFormValue', this.arrayTypeName )
      }
    )
  }

  get arrayType() : FormArray {
    if (this.arrayTypeName) {
      return this.inputForm.get(this.arrayTypeName) as FormArray;
    }
  }

  removeItem(index) {
    this.arrayType.removeAt(index)
    const pt = this.priceScheduleTracking
    const value =this.arrayType.value

    switch(this.arrayTypeName) {
      case ('requiredItemTypes'): {
        pt.requiredItemTypes = value
        break;
      }
      case 'requiredCategories': {
        pt.requiredCategories = value
        break;
      }
      case 'requiredBrands': {
        pt.requiredBrands = value
        break;
      }
      case 'requiredItems': {
        pt.requiredItems = value
        break;
      }

      case ('itemTypeDiscounts'): {
        pt.itemTypeDiscounts = value
        break;
      }
      case 'categoryDiscounts': {
        pt.categoryDiscounts = value
        break;
      }
      case 'itemDiscounts': {
        pt.itemDiscounts = value
        break;
      }
      case 'brandDiscounts': {
        pt.brandDiscounts = value
        break;
      }
    }

    this.priceScheduleDataService.updatePriceSchedule(pt);
  }

}
