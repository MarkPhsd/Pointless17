import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'mat-date-range',
  templateUrl: './mat-date-range.component.html',
  styleUrls: ['./mat-date-range.component.scss']
})
export class MatDateRangeComponent {

  @Input() inputForm: UntypedFormGroup;
  @Output() outputDateRange  = new EventEmitter();

  constructor() { }

  emitDatePickerData() {
    this.outputDateRange.emit(true)
  }

}
