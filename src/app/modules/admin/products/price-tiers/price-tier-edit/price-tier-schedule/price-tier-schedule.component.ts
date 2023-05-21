import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'price-tier-schedule',
  templateUrl: './price-tier-schedule.component.html',
  styleUrls: ['./price-tier-schedule.component.scss']
})
export class PriceTierScheduleComponent implements OnInit {

  @Input() showTime = false;
  @Input() inputForm: UntypedFormGroup;
  @Input() formGroupName: any;

  childForm: UntypedFormGroup;

  constructor(
    private _fb: UntypedFormBuilder,
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
