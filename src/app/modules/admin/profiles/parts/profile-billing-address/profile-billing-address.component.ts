import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile-billing-address',
  templateUrl: './profile-billing-address.component.html',
  styleUrls: ['./profile-billing-address.component.scss']
})
export class ProfileBillingAddressComponent  {

  @Input() inputForm: UntypedFormGroup
  constructor() { }

}
