import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'mat-date-range',
  templateUrl: './mat-date-range.component.html',
  styleUrls: ['./mat-date-range.component.scss']
})
export class MatDateRangeComponent {

  @Input() inputForm: FormGroup;
  @Output() outputDateRange  = new EventEmitter();

  constructor() { }

  emitDatePickerData() {
    this.outputDateRange.emit(true)
  }

}
