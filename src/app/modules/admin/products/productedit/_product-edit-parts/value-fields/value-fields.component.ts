import { Component, Input } from '@angular/core';
import { FormArrayName, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-value-fields',
  templateUrl: './value-fields.component.html',
  styleUrls: ['./value-fields.component.scss']
})

export class ValueFieldsComponent  {
  @Input() inputForm: FormGroup
  @Input() formArray: FormArrayName
  @Input() fieldName: string;
  @Input() fieldDescription: string;
  @Input() fieldType   = 'text';
  @Input() passwordMask: boolean;
  @Input() fieldsClass = "fields"
  @Input() type        = 'input'
  @Input() enabled  = true;


}
