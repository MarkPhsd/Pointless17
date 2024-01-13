import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'value-from-list-selector',
  templateUrl: './value-from-list-selector.component.html',
  styleUrls: ['./value-from-list-selector.component.scss']
})
export class ValueFromListSelectorComponent  {
  @Input()  value
  @Input()  values = [0,1,2,3,5,6,7,8,9];
  @Output() assignValue = new EventEmitter();

  constructor() { }

  assignValueEvent(value) {
    this.assignValue.emit(value);
  }
}
