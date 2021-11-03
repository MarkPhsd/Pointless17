import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-web-enabled',
  templateUrl: './web-enabled.component.html',
  styleUrls: ['./web-enabled.component.scss']
})
export class WebEnabledComponent implements OnInit {

  @Input() inputForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
