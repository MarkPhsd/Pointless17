import { Component, OnInit , Input} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'retail-product-edit',
  templateUrl: './retail-product-edit.component.html',
  styleUrls: ['./retail-product-edit.component.scss']
})
export class RetailProductEditComponent  {

  @Input() inputForm: FormGroup
  constructor() { }


}
