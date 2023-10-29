import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mat-select',
  templateUrl: './mat-select.component.html',
  styleUrls: ['./mat-select.component.scss']
})
export class MatSelectComponent {

  @ViewChild('formView')      formView: TemplateRef<any>;

  @Input()  style      = ''
  @Input()  class      = 'mat-form-field'
  @Input()  inputForm  : UntypedFormGroup;
  @Input()  fieldName  : string;
  @Input()  list$      : Observable<any>;
  @Input()  list       : any[]
  @Output() outputItem = new EventEmitter<any>();
  @Input()  hideClear  : boolean;
  @Input() placeHolder: string;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    if (!this.inputForm)  {
      this.inputForm = this.fb.group({
        fieldName: 'field'
      })
    }
  }

  get isFormView() {
    if (this.inputForm) {
      return this.formView
    }
    return null;
  }

  setOutPut(event) {
    this.outputItem.emit(event)
  }

  setItemOutPut(item) {
    this.outputItem.emit(item)
  }
}
