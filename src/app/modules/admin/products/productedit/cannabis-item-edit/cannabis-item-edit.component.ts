import { Component,  Input} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { IProduct } from 'src/app/_interfaces';

@Component({
  selector: 'cannabis-item-edit',
  templateUrl: './cannabis-item-edit.component.html',
  styleUrls: ['./cannabis-item-edit.component.scss']
})

export class CannabisItemEditComponent   {
  @Input() product: IProduct
  @Input() inputForm: UntypedFormGroup
  constructor() { }

}
