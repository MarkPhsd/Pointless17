import { Component, OnInit , Input} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'food-product-edit',
  templateUrl: './food-product-edit.component.html',
  styleUrls: ['./food-product-edit.component.scss']
})
export class FoodProductEditComponent {

  @Input() inputForm: UntypedFormGroup
  constructor() { }



}
