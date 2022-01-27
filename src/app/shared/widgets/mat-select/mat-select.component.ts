import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mat-select',
  templateUrl: './mat-select.component.html',
  styleUrls: ['./mat-select.component.scss']
})
export class MatSelectComponent {

  @Input()  class='mat-form-field'
  @Input()  inputForm: FormGroup;
  @Input()  fieldName: string;
  @Input()  list$    : Observable<any>;
  @Input()  list     : any[]
  @Output() outputItem = new EventEmitter<any>();
  @Input() hideClear: boolean;

  constructor() { }

  setOutPut(event) {
    console.log('item output', event)
    this.outputItem.emit(event)
  }

  setItemOutPut(item) {
    console.log('item output', item)
    this.outputItem.emit(item)
  }
}
