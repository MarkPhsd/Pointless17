import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'price-category-conversions',
  templateUrl: './price-category-conversions.component.html',
  styleUrls: ['./price-category-conversions.component.scss']
})
export class PriceCategoryConversionsComponent  {
  @Input() showMore = false;
  @Input() inputForm: FormGroup;
  @Input() formGroupName: any;
  constructor() { }


}
