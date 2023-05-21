import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'activity-toggles-metrc',
  templateUrl: './activity-toggles-metrc.component.html',
  styleUrls: ['./activity-toggles-metrc.component.scss']
})
export class ActivityTogglesMetrcComponent  {
  @Input()  inputForm:      UntypedFormGroup;
  constructor() { }


}
