import { Component, OnInit , Input} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'cannabis-item-edit',
  templateUrl: './cannabis-item-edit.component.html',
  styleUrls: ['./cannabis-item-edit.component.scss']
})
export class CannabisItemEditComponent   {

  @Input() inputForm: FormGroup
  constructor() { }


}
