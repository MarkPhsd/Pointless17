import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'price-category-time-filters',
  templateUrl: './price-category-time-filters.component.html',
  styleUrls: ['./price-category-time-filters.component.scss']
})
export class PriceCategoryTimeFiltersComponent {

  @Input() showTime : boolean;;
  @Input() inputForm: UntypedFormGroup;
  @Input() formGroupName: any;

  constructor() { }



}
