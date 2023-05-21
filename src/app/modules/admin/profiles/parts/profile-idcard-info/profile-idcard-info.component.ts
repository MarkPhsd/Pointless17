import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile-idcard-info',
  templateUrl: './profile-idcard-info.component.html',
  styleUrls: ['./profile-idcard-info.component.scss']
})
export class ProfileIDCardInfoComponent implements OnInit {
  @Input() inputForm : UntypedFormGroup;
  @Input() isAuthorized: boolean;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
