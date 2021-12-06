import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mat-select',
  templateUrl: './mat-select.component.html',
  styleUrls: ['./mat-select.component.scss']
})
export class MatSelectComponent {

  @Input()  inputForm: FormGroup;
  @Input()  fieldName: string;
  @Input()  list$    : Observable<any>;
  @Output() outputItem = new EventEmitter<any>();
  constructor() { }

  setOutPut(event) {
    this.outputItem.emit(event)
  }
}
