import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'form-select-list',
  templateUrl: './form-select-list.component.html',
  styleUrls: ['./form-select-list.component.scss']
})
export class FormSelectListComponent {

  @Input()  list$           : Observable<any>;
  @Input()  formFieldName   : string;
  @Input()  searchForm      : FormGroup;
  @Output() selectionChange = new EventEmitter();

  constructor() { }

  updateResults(event) {
    this.selectionChange.emit(event.value)
  }

}

