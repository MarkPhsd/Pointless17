import { Component, OnInit , Input} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'liquor-product-edit',
  templateUrl: './liquor-product-edit.component.html',
  styleUrls: ['./liquor-product-edit.component.scss']
})
export class LiquorProductEditComponent {

  @Input() inputForm: UntypedFormGroup
  constructor() { }



}
