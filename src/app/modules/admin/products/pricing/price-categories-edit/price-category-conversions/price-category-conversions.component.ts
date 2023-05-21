import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'price-category-conversions',
  templateUrl: './price-category-conversions.component.html',
  styleUrls: ['./price-category-conversions.component.scss']
})
export class PriceCategoryConversionsComponent  {
  @Input() showMore = false;
  @Input() inputForm: UntypedFormGroup;
  @Input() formGroupName: any;
  constructor() { }


}
