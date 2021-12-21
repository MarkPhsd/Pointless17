import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'price-tier-schedule',
  templateUrl: './price-tier-schedule.component.html',
  styleUrls: ['./price-tier-schedule.component.scss']
})
export class PriceTierScheduleComponent implements OnInit {

  @Input() showTime = false;
  @Input() inputForm: FormGroup;
  @Input() formGroupName: any;

  childForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private parentF: FormGroupDirective) { }

  ngOnInit() {

    this.childForm = this.parentF.form;
    this.childForm = this._fb.group({
      startTime:      [],
      endTime:        [],
      specialPrice:   [],
      weekDays:       []
    })
    console.log('')
  }

}
