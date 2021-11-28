import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'price-category-price-fields',
  templateUrl: './price-category-price-fields.component.html',
  styleUrls: ['./price-category-price-fields.component.scss']
})
export class PriceCategoryPriceFieldsComponent  {

  @Input() showMore = false;
  @Input() inputForm: FormGroup;
  @Input() formGroupName: any;
  @Input() formArrayName: FormArray;
  @Input() index: number;
  @Input() item: any;

  get productPrices() : FormArray {
    return this.inputForm.get('productPrices') as FormArray;
  }

  constructor() { }



}
