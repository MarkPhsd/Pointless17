import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
@Component({
  selector: 'app-profile-roles',
  templateUrl: './profile-roles.component.html',
  styleUrls: ['./profile-roles.component.scss']
})
export class ProfileRolesComponent  {

  @Input() isAuthorized: boolean;
  @Input() inputForm   : UntypedFormGroup;
  constructor() { }



}
