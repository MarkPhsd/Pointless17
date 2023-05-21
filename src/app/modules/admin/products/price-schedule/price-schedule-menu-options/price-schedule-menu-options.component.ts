import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'price-schedule-menu-options',
  templateUrl: './price-schedule-menu-options.component.html',
  styleUrls: ['./price-schedule-menu-options.component.scss']
})
export class PriceScheduleMenuOptionsComponent implements OnInit {

  @Input() inputForm: UntypedFormGroup;
  constructor() { }

  ngOnInit(): void {
    const  i = 0
  }

}
