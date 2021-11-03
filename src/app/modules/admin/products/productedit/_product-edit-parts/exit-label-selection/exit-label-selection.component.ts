import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'exit-label-selection',
  templateUrl: './exit-label-selection.component.html',
  styleUrls: ['./exit-label-selection.component.scss']
})
export class ExitLabelSelectionComponent  {

  @Input()  inputForm: FormGroup;
  @Input()  fieldName: string;
  @Input()  list$    : Observable<any>;
  @Output() outputItem = new EventEmitter<any>();

  constructor() { }


}
