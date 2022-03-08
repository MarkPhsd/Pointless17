import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IClientTable, IUserProfile } from 'src/app/_interfaces';

@Component({
  selector: 'app-profile-demographics',
  templateUrl: './demographics.component.html',
  styleUrls: ['./demographics.component.scss']
})
export class ProfileDemographicsComponent implements OnInit {

  @Input() inputForm    : FormGroup;
  @Input() isAuthorized : boolean;
  @Input() isStaff      : boolean;
  @Input() client       : IClientTable;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
