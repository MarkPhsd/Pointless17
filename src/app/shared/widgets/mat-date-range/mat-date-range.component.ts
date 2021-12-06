import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'mat-date-range',
  templateUrl: './mat-date-range.component.html',
  styleUrls: ['./mat-date-range.component.scss']
})
export class MatDateRangeComponent implements OnInit {

  @Input() inputForm: FormGroup;
  @Output() outputDateRange  = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

  emitDatePickerData() {
    this.outputDateRange.emit(true)
  }

}
