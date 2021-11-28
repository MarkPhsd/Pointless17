import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'price-category-time-filters',
  templateUrl: './price-category-time-filters.component.html',
  styleUrls: ['./price-category-time-filters.component.scss']
})
export class PriceCategoryTimeFiltersComponent {

  @Input() showTime = false;
  @Input() inputForm: FormGroup;
  @Input() formGroupName: any;

  constructor() { }



}
