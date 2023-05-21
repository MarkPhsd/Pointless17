import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'price-category-price-fields',
  templateUrl: './price-category-price-fields.component.html',
  styleUrls: ['./price-category-price-fields.component.scss']
})
export class PriceCategoryPriceFieldsComponent  {

  @Input() showMore = false;
  @Input() inputForm: UntypedFormGroup;
  @Input() formGroupName: any;
  @Input() formArrayName: UntypedFormArray;
  @Input() index: number;
  @Input() item: any;

  get productPrices() : UntypedFormArray {
    return this.inputForm.get('productPrices') as UntypedFormArray;
  }

  constructor() { }



}
