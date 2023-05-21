import { Component, Input, OnInit} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-activity-toggles',
  templateUrl: './activity-toggles.component.html',
  styleUrls: ['./activity-toggles.component.scss']
})
export class ActivityTogglesComponent implements OnInit {
  @Input()  inputForm:      UntypedFormGroup;
  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
